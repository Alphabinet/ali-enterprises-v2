"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  UploadCloud,
  ArrowLeft,
  Search,
  Filter,
  ChevronRight,
  LayoutList,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  FileText
} from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";

// --- Types ---
interface ProductForm {
  id?: string;
  name: string;
  category: string;
  price: string;
  description: string;
  features: string[];
  specs: { key: string; value: string }[];
  thumbnail: string | null;
  gallery: string[];
}

const INITIAL_FORM: ProductForm = {
  name: "",
  category: "Industrial",
  price: "",
  description: "",
  features: [""],
  specs: [{ key: "", value: "" }],
  thumbnail: null,
  gallery: [],
};

const CATEGORIES = ["Industrial", "Construction", "Agriculture", "Automatic", "Manual", "Hydraulic", "Spares"];

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
  <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 max-w-[90vw] ${type === "success" ? "bg-teal-900 text-white border border-teal-700" : "bg-red-600 text-white border border-red-500"}`}>
    {type === "success" ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
    <p className="font-medium text-sm">{message}</p>
    <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100 transition-opacity p-1"><X size={16} /></button>
  </div>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
         <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
            <path className="text-teal-600 transition-all duration-300 ease-out" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
         </svg>
         <div className="absolute inset-0 flex items-center justify-center font-bold text-teal-700 text-sm">{Math.round(progress)}%</div>
      </div>
      <h3 className="text-lg font-bold text-slate-800">Uploading Assets...</h3>
      <p className="text-slate-500 text-xs mt-1">Please wait while we secure your files.</p>
    </div>
  </div>
);

export default function AdminProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<ProductForm>(INITIAL_FORM);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // Delete Modal
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth Check & Fetch
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/admin/login");
      else fetchProducts();
    });
    return () => unsub();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Feature Handlers
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };
  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ""] });
  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  // Spec Handlers
  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[index][field] = val;
    setFormData({ ...formData, specs: newSpecs });
  };
  const addSpec = () => setFormData({ ...formData, specs: [...formData.specs, { key: "", value: "" }] });
  const removeSpec = (index: number) => {
    const newSpecs = formData.specs.filter((_, i) => i !== index);
    setFormData({ ...formData, specs: newSpecs });
  };

  // --- Optimized Upload Logic ---
  const uploadFile = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          // You could track individual file progress here if needed
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSubmit = async () => {
    if (!formData.name) return showToast("Product Name is required", "error");
    
    setUploading(true);
    setUploadProgress(0);

    try {
      let thumbUrl = formData.thumbnail;
      let galleryUrls = [...formData.gallery];

      // Calculate total operations for progress bar simulation
      const totalUploads = (thumbnailFile ? 1 : 0) + galleryFiles.length;
      let completedUploads = 0;

      const updateProgress = () => {
        completedUploads++;
        setUploadProgress((completedUploads / (totalUploads + 1)) * 100); // +1 for Firestore save
      };

      // 1. Upload Thumbnail
      if (thumbnailFile) {
        thumbUrl = await uploadFile(thumbnailFile, `products/thumbs/${Date.now()}_${thumbnailFile.name}`);
        updateProgress();
      }

      // 2. Upload Gallery (Parallel Execution for Speed)
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(async (file) => {
          const url = await uploadFile(file, `products/gallery/${Date.now()}_${file.name}`);
          updateProgress();
          return url;
        });
        const newUrls = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...newUrls];
      }

      // 3. Prepare Data
      const specsObject = formData.specs.reduce((acc, curr) => {
        if (curr.key) {
             const lines = curr.value.split('\n').map(l => l.trim()).filter(l => l !== "");
             acc[curr.key] = lines.length > 1 ? lines : lines[0] || ""; 
        }
        return acc;
      }, {} as Record<string, string | string[]>);

      const cleanFeatures = formData.features.filter(f => f.trim() !== "");
      const finalPrice = formData.price || "Price on Request";

      const payload = {
        name: formData.name,
        category: formData.category,
        price: finalPrice,
        description: formData.description,
        features: cleanFeatures,
        specs: specsObject,
        thumbnail: thumbUrl,
        images: galleryUrls,
        updatedAt: serverTimestamp(),
      };

      // 4. Save to Firestore
      if (editMode && formData.id) {
        await updateDoc(doc(db, "products", formData.id), payload);
        showToast("Product updated successfully", "success");
      } else {
        await addDoc(collection(db, "products"), { ...payload, createdAt: serverTimestamp() });
        showToast("Product added successfully", "success");
      }
      setUploadProgress(100);

      // Cleanup
      setTimeout(() => {
        resetForm();
        fetchProducts();
        setView("list");
        setUploading(false);
      }, 500);

    } catch (error) {
      console.error("Error saving product:", error);
      showToast("Failed to save product.", "error");
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "products", deleteItem.id));
      setProducts(prev => prev.filter(p => p.id !== deleteItem.id));
      showToast("Product deleted.", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to delete.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  const handleEdit = (product: any) => {
    const specsArray = product.specs 
      ? Object.entries(product.specs).map(([key, value]) => ({ 
          key, 
          value: Array.isArray(value) ? value.join('\n') : String(value) 
        }))
      : [{ key: "", value: "" }];

    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      features: product.features || [""],
      specs: specsArray,
      thumbnail: product.thumbnail,
      gallery: product.images || [],
    });
    setEditMode(true);
    setView("form");
  };

  const removeGalleryImage = (index: number) => {
      const newGallery = formData.gallery.filter((_, i) => i !== index);
      setFormData({ ...formData, gallery: newGallery });
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setThumbnailFile(null);
    setGalleryFiles([]);
    setEditMode(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-teal-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 pb-20">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {uploading && <ProgressBar progress={uploadProgress} />}

      <DeleteModal 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        onConfirm={confirmDelete} 
        title="Delete Product?" 
        message={`Are you sure you want to delete "${deleteItem?.name}"?`} 
        isDeleting={isDeleting}
      />

      {/* --- Sticky Top Navbar --- */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-16 md:top-0 z-20 px-4 lg:px-8 py-4 shadow-sm transition-all">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
             {view === "form" && (
                <button onClick={() => setView("list")} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors border border-slate-200">
                   <ArrowLeft size={18} />
                </button>
             )}
             <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">Products</h1>
                {view === "list" && <p className="text-xs text-slate-500 font-medium mt-1">{products.length} Items</p>}
             </div>
          </div>
          
          {view === "list" && (
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
               <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search inventory..." 
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all shadow-sm" 
                  />
               </div>
               
               <div className="relative">
                  <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="appearance-none w-full sm:w-40 pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium cursor-pointer outline-none hover:border-slate-300 focus:border-teal-500 shadow-sm"
                  >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               </div>

               <button 
                 onClick={() => { resetForm(); setView("form"); }} 
                 className="px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 active:scale-95"
               >
                 <Plus size={18} /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-[1920px] mx-auto">
        
        {/* --- LIST VIEW --- */}
        {view === "list" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {filteredProducts.length === 0 ? (
                <div className="text-center py-24 px-6 flex flex-col items-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                        <Package className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-base font-bold text-slate-700">No products found</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs">Adjust your search or filters, or add a new item to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500 tracking-wider font-bold">
                        <th className="px-6 py-4 w-20">Image</th>
                        <th className="px-6 py-4">Product Info</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 relative overflow-hidden shrink-0">
                                {product.thumbnail ? (
                                   <Image src={product.thumbnail} alt="" fill className="object-cover" sizes="48px" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{product.name}</p>
                             <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">{product.description}</p>
                          </td>
                          <td className="px-6 py-4">
                             <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {product.category}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm font-semibold text-slate-700">{product.price}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                                   <Edit2 size={18} />
                                </button>
                                <button onClick={() => setDeleteItem(product)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                   <Trash2 size={18} />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        )}

        {/* --- FORM VIEW --- */}
        {view === "form" && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              
             {/* Sticky Form Header for Actions */}
             <div className="flex items-center justify-between mb-6 sticky top-28 md:static z-10 bg-gray-50/95 py-2 backdrop-blur">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   {editMode ? "Edit Product" : "New Product"}
                </h2>
                <div className="flex gap-3">
                   <button onClick={() => setView("list")} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
                   <button onClick={handleSubmit} disabled={uploading} className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {uploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {uploading ? "Saving..." : "Save Product"}
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: Inputs */}
                <div className="lg:col-span-2 space-y-6">
                   {/* Basic Info Card */}
                   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={20}/></div>
                         <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h3>
                      </div>
                      
                      <div className="space-y-5">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Product Name <span className="text-red-500">*</span></label>
                               <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium" placeholder="e.g. Hydraulic Press 50T" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Price</label>
                               <input name="price" value={formData.price} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium" placeholder="e.g. ₹ 45,000" />
                            </div>
                         </div>
                         
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all resize-y" placeholder="Describe the product details, usage, and benefits..." />
                         </div>
                      </div>
                   </div>

                   {/* Features Card */}
                   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-2">
                             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><CheckCircle2 size={20}/></div>
                             <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Key Features</h3>
                          </div>
                          <button onClick={addFeature} className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors border border-teal-100">+ Add Feature</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {formData.features.map((feature, idx) => (
                             <div key={idx} className="flex gap-2 group">
                                <input value={feature} onChange={(e) => updateFeature(idx, e.target.value)} className="flex-1 p-3 border border-slate-200 rounded-xl text-sm focus:border-teal-500 outline-none transition-all" placeholder={`Feature ${idx + 1}`} />
                                <button onClick={() => removeFeature(idx)} className="text-slate-300 hover:text-red-500 px-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"><X size={18} /></button>
                             </div>
                          ))}
                      </div>
                   </div>

                   {/* Specs Card */}
                   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-2">
                             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FileText size={20}/></div>
                             <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Technical Specifications</h3>
                          </div>
                          <button onClick={addSpec} className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors border border-teal-100">+ Add Spec</button>
                      </div>
                      <div className="space-y-3">
                        {formData.specs.map((spec, idx) => (
                          <div key={idx} className="flex gap-3 items-start group">
                             <input value={spec.key} onChange={(e) => updateSpec(idx, 'key', e.target.value)} className="w-1/3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-500 outline-none font-bold text-slate-700 transition-all" placeholder="Label (e.g. Weight)" />
                             <textarea value={spec.value} onChange={(e) => updateSpec(idx, 'value', e.target.value)} rows={1} className="flex-1 p-3 border border-slate-200 rounded-xl text-sm focus:border-teal-500 outline-none min-h-[46px] resize-y transition-all" placeholder="Value (e.g. 500 KG)" />
                             <button onClick={() => removeSpec(idx)} className="text-slate-300 hover:text-red-500 p-3 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"><X size={18} /></button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                {/* RIGHT: Sidebar (Media & Category) */}
                <div className="space-y-6">
                   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Categorization</h3>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Category</label>
                          <div className="relative">
                            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-teal-500 outline-none appearance-none cursor-pointer font-medium hover:bg-slate-100 transition-colors">
                               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                          </div>
                       </div>
                   </div>

                   <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                       <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                          <div className="p-1.5 bg-pink-50 text-pink-600 rounded-md"><ImageIcon size={16}/></div>
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Media Assets</h3>
                       </div>
                       
                       <div className="mb-6">
                          <label className="block text-xs font-bold text-slate-500 mb-2">Thumbnail (Main Image)</label>
                          <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex items-center justify-center overflow-hidden cursor-pointer group bg-slate-50">
                             <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                             {thumbnailFile ? (
                                 <Image src={URL.createObjectURL(thumbnailFile)} alt="" fill className="object-cover" />
                             ) : formData.thumbnail ? (
                                 <Image src={formData.thumbnail} alt="" fill className="object-cover" />
                             ) : (
                                 <div className="text-center text-slate-400 group-hover:text-teal-600 transition-colors">
                                    <UploadCloud className="mx-auto mb-2" size={24}/>
                                    <span className="text-xs font-bold">Click to Upload</span>
                                 </div>
                             )}
                          </div>
                       </div>

                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">Product Gallery</label>
                          <div className="grid grid-cols-3 gap-2">
                             {formData.gallery.map((url, idx) => (
                                 <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden group shadow-sm">
                                     <Image src={url} alt="" fill className="object-cover" />
                                     <button onClick={() => removeGalleryImage(idx)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                 </div>
                             ))}
                             {galleryFiles.map((file, idx) => (
                                 <div key={`new-${idx}`} className="relative aspect-square rounded-lg border border-teal-200 overflow-hidden group shadow-sm opacity-70">
                                     <Image src={URL.createObjectURL(file)} alt="" fill className="object-cover" />
                                     <div className="absolute inset-0 flex items-center justify-center bg-white/50"><Loader2 className="animate-spin text-teal-600" size={16}/></div>
                                 </div>
                             ))}
                             
                             <div className="aspect-square rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 flex items-center justify-center relative cursor-pointer transition-colors text-slate-300 hover:text-teal-500">
                                 <input type="file" multiple accept="image/*" onChange={(e) => setGalleryFiles([...galleryFiles, ...Array.from(e.target.files || [])])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 <Plus size={24} />
                             </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 text-center">
                             {formData.gallery.length + galleryFiles.length} images total
                          </p>
                       </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}