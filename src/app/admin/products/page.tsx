"use client";

import React, { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, setDoc, getDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2, Plus, Trash2, Edit2, Save, X, UploadCloud,
  ArrowLeft, Search, Filter, ChevronRight, CheckCircle2,
  AlertCircle, Package, FileText, Scale, Image as ImageIcon
} from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";

type PageView = "list" | "form";
type ActiveTab = "products" | "comparison";

// Types
interface ProductForm {
  id?: string; name: string; category: string; price: string;
  description: string; features: string[]; specs: { key: string; value: string }[];
  thumbnail: string | null; gallery: string[];
}
interface MetricRow { name: string; old: string; new: string; }
interface ComparisonData {
  headerTitle: string; headerDesc: string;
  oldImage: string; oldTitle: string; oldDesc: string; oldPoints: string[];
  newImage: string; newTitle: string; newDesc: string; newPoints: string[];
  metrics: MetricRow[];
}

const INITIAL_FORM: ProductForm = {
  name:"", category:"Industrial", price:"", description:"",
  features:[""], specs:[{key:"",value:""}], thumbnail:null, gallery:[],
};
const INITIAL_CMP: ComparisonData = {
  headerTitle:"Traditional vs. Modern Technology", headerDesc:"See how switching saves you money.",
  oldImage:"", oldTitle:"Manual / Old Method", oldDesc:"Labor intensive, slow.", oldPoints:["High manual labor","Inconsistent quality"],
  newImage:"", newTitle:"Ali Enterprises", newDesc:"Automated, fast, high-profit.", newPoints:["10x Production Speed","Operates 24/7"],
  metrics:[{name:"Daily Production",old:"1,500 Bricks",new:"15,000+ Bricks"},{name:"Labor Required",old:"10-12 Workers",new:"3-4 Workers"}],
};
const CATEGORIES = ["Industrial","Construction","Agriculture","Automatic","Manual","Hydraulic","Spares"];

const Toast = ({message,type,onClose}: {message:string;type:"success"|"error";onClose:()=>void}) => (
  <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 max-w-sm ${type==="success"?"bg-teal-900 border border-teal-700 text-white":"bg-red-900 border border-red-700 text-white"}`}>
    {type==="success"?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}
    <p className="text-sm font-medium flex-1">{message}</p>
    <button onClick={onClose}><X size={16}/></button>
  </div>
);

const UploadOverlay = ({progress}: {progress:number}) => (
  <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl text-center w-72">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"/>
          <path className="text-teal-500 transition-all" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-teal-400 text-sm">{Math.round(progress)}%</div>
      </div>
      <p className="font-bold text-white">Saving...</p>
    </div>
  </div>
);

export default function UnifiedProductsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("products");
  const [view, setView] = useState<PageView>("list");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [formData, setFormData] = useState<ProductForm>(INITIAL_FORM);
  const [thumbFile, setThumbFile] = useState<File|null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [deleteItem, setDeleteItem] = useState<any|null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Comparison
  const [cmpData, setCmpData] = useState<ComparisonData>(INITIAL_CMP);
  const [cmpSaving, setCmpSaving] = useState(false);
  const [oldFile, setOldFile] = useState<File|null>(null);
  const [newFile, setNewFile] = useState<File|null>(null);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (u)=>{
      if (!u) router.push("/admin/login");
      else { fetchProducts(); fetchComparison(); }
    });
    return ()=>unsub();
  },[router]);

  const showToast = (msg:string, type:"success"|"error") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(query(collection(db,"products"),orderBy("createdAt","desc")));
      setProducts(snap.docs.map(d=>({id:d.id,...d.data()})));
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  const fetchComparison = async () => {
    try {
      const snap = await getDoc(doc(db,"site_content","comparison_page"));
      if (snap.exists()) setCmpData(snap.data() as ComparisonData);
    } catch(e){ console.error(e); }
  };

  const uploadFile = (file:File, path:string): Promise<string> => new Promise((res,rej)=>{
    const task = uploadBytesResumable(ref(storage,path), file);
    task.on("state_changed",(s)=>setProgress((s.bytesTransferred/s.totalBytes)*100));
    task.then(async(snap)=>res(await getDownloadURL(snap.ref))).catch(rej);
  });

  const handleProductSubmit = async () => {
    if (!formData.name) return showToast("Product name required","error");
    setUploading(true); setProgress(0);
    try {
      let thumbUrl = formData.thumbnail;
      if (thumbFile) thumbUrl = await uploadFile(thumbFile,`products/thumbs/${Date.now()}_${thumbFile.name}`);
      let galleryUrls = [...formData.gallery];
      if (galleryFiles.length>0) {
        const urls = await Promise.all(galleryFiles.map(f=>uploadFile(f,`products/gallery/${Date.now()}_${f.name}`)));
        galleryUrls = [...galleryUrls,...urls];
      }
      const specsObj = formData.specs.reduce((a,c)=>{
        if (c.key) { const lines=c.value.split("\n").map(l=>l.trim()).filter(Boolean); a[c.key]=lines.length>1?lines:lines[0]||""; }
        return a;
      },{} as Record<string,string|string[]>);
      const payload = {
        name:formData.name, category:formData.category, price:formData.price||"Price on Request",
        description:formData.description, features:formData.features.filter(f=>f.trim()),
        specs:specsObj, thumbnail:thumbUrl, images:galleryUrls, updatedAt:serverTimestamp(),
      };
      if (editMode&&formData.id) await updateDoc(doc(db,"products",formData.id),payload);
      else await addDoc(collection(db,"products"),{...payload,createdAt:serverTimestamp()});
      showToast(editMode?"Product updated!":"Product added!","success");
      setTimeout(()=>{ resetForm(); fetchProducts(); setView("list"); setUploading(false); },500);
    } catch(e){ showToast("Failed to save","error"); setUploading(false); }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db,"products",deleteItem.id));
      setProducts(p=>p.filter(x=>x.id!==deleteItem.id));
      showToast("Deleted","success");
    } catch(e){ showToast("Delete failed","error"); }
    finally { setIsDeleting(false); setDeleteItem(null); }
  };

  const handleEdit = (p:any) => {
    setFormData({
      id:p.id, name:p.name, category:p.category, price:p.price, description:p.description,
      features:p.features||[""], gallery:p.images||[], thumbnail:p.thumbnail,
      specs:p.specs ? Object.entries(p.specs).map(([key,value])=>({key,value:Array.isArray(value)?value.join("\n"):String(value)})) : [{key:"",value:""}],
    });
    setEditMode(true); setView("form");
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM); setThumbFile(null); setGalleryFiles([]); setEditMode(false);
  };

  const handleSaveComparison = async () => {
    setCmpSaving(true);
    try {
      let finalOld = cmpData.oldImage, finalNew = cmpData.newImage;
      const ups: Promise<void>[] = [];
      if (oldFile) ups.push(uploadFile(oldFile,`comparison/old_${Date.now()}`).then(u=>{ finalOld=u; }));
      if (newFile) ups.push(uploadFile(newFile,`comparison/new_${Date.now()}`).then(u=>{ finalNew=u; }));
      await Promise.all(ups);
      const payload = {...cmpData, oldImage:finalOld, newImage:finalNew};
      await setDoc(doc(db,"site_content","comparison_page"),payload);
      setCmpData(payload); setOldFile(null); setNewFile(null);
      showToast("Comparison saved!","success");
    } catch(e){ showToast("Save failed","error"); }
    finally { setCmpSaving(false); }
  };

  const filtered = products.filter(p=>{
    const m = `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase());
    return m && (catFilter==="All"||p.category===catFilter);
  });

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-teal-500" size={32}/></div>;

  return (
    <div className="pb-16">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      {uploading && <UploadOverlay progress={progress}/>}
      <DeleteModal isOpen={!!deleteItem} onClose={()=>setDeleteItem(null)} onConfirm={confirmDelete} title="Delete Product?" message={`Delete "${deleteItem?.name}"?`} isDeleting={isDeleting}/>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {view==="form" && <button onClick={()=>setView("list")} className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-colors"><ArrowLeft size={18} className="text-white"/></button>}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{view==="form"?(editMode?"Edit Product":"New Product"):"Products & Comparison"}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{view==="list"?`${products.length} products in catalogue`:""}</p>
        </div>
        {view==="list" && activeTab==="products" && (
          <button onClick={()=>{resetForm();setView("form");}} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold transition-all shadow-sm">
            <Plus size={16}/> Add Product
          </button>
        )}
        {view==="list" && activeTab==="comparison" && (
          <button onClick={handleSaveComparison} disabled={cmpSaving} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
            {cmpSaving?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>} Save Changes
          </button>
        )}
        {view==="form" && (
          <div className="flex gap-2">
            <button onClick={()=>setView("list")} className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-700">Cancel</button>
            <button onClick={handleProductSubmit} disabled={uploading} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
              {uploading?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>}{uploading?"Saving...":"Save"}
            </button>
          </div>
        )}
      </div>

      {/* Tabs (only on list view) */}
      {view==="list" && (
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl mb-6 w-fit">
          {([["products","Products",Package],["comparison","Comparison",Scale]] as [ActiveTab,string,any][]).map(([tab,label,Icon])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab===tab?"bg-slate-700 text-white shadow":"text-slate-500 hover:text-slate-300"}`}>
              <Icon size={14}/>{label}
            </button>
          ))}
        </div>
      )}

      {/* Products List */}
      {view==="list" && activeTab==="products" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 placeholder:text-slate-600"/>
            </div>
            <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-xl px-3 py-2.5 outline-none">
              <option value="All">All Categories</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {filtered.length===0 ? (
              <div className="py-20 text-center"><Package className="mx-auto text-slate-700 mb-3" size={32}/><p className="text-slate-500">No products found</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500 tracking-wider">
                    <th className="px-5 py-3">Image</th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-800">
                    {filtered.map(p=>(
                      <tr key={p.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 relative overflow-hidden">
                            {p.thumbnail?<Image src={p.thumbnail} alt="" fill className="object-cover" sizes="40px"/>
                              :<div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-600"/></div>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-white truncate max-w-[200px]">{p.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{p.description}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold rounded-md">{p.category}</span>
                        </td>
                        <td className="px-5 py-3.5"><span className="text-sm text-white">{p.price}</span></td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={()=>handleEdit(p)} className="p-2 text-slate-500 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"><Edit2 size={16}/></button>
                            <button onClick={()=>setDeleteItem(p)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Comparison Editor */}
      {view==="list" && activeTab==="comparison" && (
        <div className="space-y-6">
          {/* Header fields */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Page Header</p>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={cmpData.headerTitle} onChange={e=>setCmpData({...cmpData,headerTitle:e.target.value})} placeholder="Main Title" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"/>
              <input value={cmpData.headerDesc} onChange={e=>setCmpData({...cmpData,headerDesc:e.target.value})} placeholder="Subtitle" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"/>
            </div>
          </div>

          {/* Cards side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Old Card */}
            <div className="bg-slate-900 border border-red-900/40 rounded-xl p-5">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">❌ Old Method</p>
              <div className="space-y-3">
                <input value={cmpData.oldTitle} onChange={e=>setCmpData({...cmpData,oldTitle:e.target.value})} placeholder="Title" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"/>
                <input value={cmpData.oldDesc} onChange={e=>setCmpData({...cmpData,oldDesc:e.target.value})} placeholder="Description" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"/>
                <div className="relative border-2 border-dashed border-slate-700 rounded-lg h-10 flex items-center justify-center cursor-pointer hover:border-red-500/50 transition-colors overflow-hidden">
                  <input type="file" accept="image/*" onChange={e=>setOldFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                  {oldFile?<span className="text-xs text-red-400 font-medium truncate px-2">{oldFile.name}</span>
                    :cmpData.oldImage?<span className="text-xs text-slate-400 flex items-center gap-1"><ImageIcon size={12}/> Image set</span>
                    :<span className="text-xs text-slate-500 flex items-center gap-1"><UploadCloud size={12}/> Upload image</span>}
                </div>
                <div className="space-y-2">
                  {cmpData.oldPoints.map((p,i)=>(
                    <div key={i} className="flex gap-2">
                      <input value={p} onChange={e=>{const pts=[...cmpData.oldPoints];pts[i]=e.target.value;setCmpData({...cmpData,oldPoints:pts});}} className="flex-1 bg-slate-800 border border-red-900/30 rounded-lg px-3 py-1.5 text-xs text-white outline-none"/>
                      <button onClick={()=>setCmpData({...cmpData,oldPoints:cmpData.oldPoints.filter((_,j)=>j!==i)})} className="text-slate-600 hover:text-red-400"><X size={14}/></button>
                    </div>
                  ))}
                  <button onClick={()=>setCmpData({...cmpData,oldPoints:[...cmpData.oldPoints,""]})} className="text-xs text-red-400 hover:underline">+ Add Point</button>
                </div>
              </div>
            </div>
            {/* New Card */}
            <div className="bg-slate-900 border border-teal-900/40 rounded-xl p-5">
              <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">✅ New Method</p>
              <div className="space-y-3">
                <input value={cmpData.newTitle} onChange={e=>setCmpData({...cmpData,newTitle:e.target.value})} placeholder="Title" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"/>
                <input value={cmpData.newDesc} onChange={e=>setCmpData({...cmpData,newDesc:e.target.value})} placeholder="Description" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"/>
                <div className="relative border-2 border-dashed border-slate-700 rounded-lg h-10 flex items-center justify-center cursor-pointer hover:border-teal-500/50 transition-colors overflow-hidden">
                  <input type="file" accept="image/*" onChange={e=>setNewFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                  {newFile?<span className="text-xs text-teal-400 font-medium truncate px-2">{newFile.name}</span>
                    :cmpData.newImage?<span className="text-xs text-slate-400 flex items-center gap-1"><ImageIcon size={12}/> Image set</span>
                    :<span className="text-xs text-slate-500 flex items-center gap-1"><UploadCloud size={12}/> Upload image</span>}
                </div>
                <div className="space-y-2">
                  {cmpData.newPoints.map((p,i)=>(
                    <div key={i} className="flex gap-2">
                      <input value={p} onChange={e=>{const pts=[...cmpData.newPoints];pts[i]=e.target.value;setCmpData({...cmpData,newPoints:pts});}} className="flex-1 bg-slate-800 border border-teal-900/30 rounded-lg px-3 py-1.5 text-xs text-white outline-none"/>
                      <button onClick={()=>setCmpData({...cmpData,newPoints:cmpData.newPoints.filter((_,j)=>j!==i)})} className="text-slate-600 hover:text-red-400"><X size={14}/></button>
                    </div>
                  ))}
                  <button onClick={()=>setCmpData({...cmpData,newPoints:[...cmpData.newPoints,""]})} className="text-xs text-teal-400 hover:underline">+ Add Point</button>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comparison Table</p>
              <button onClick={()=>setCmpData({...cmpData,metrics:[...cmpData.metrics,{name:"",old:"",new:""}]})} className="text-xs text-teal-400 hover:underline flex items-center gap-1"><Plus size={12}/> Add Row</button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
                <div className="col-span-4">Feature</div><div className="col-span-3">Old Value</div><div className="col-span-4">New Value</div>
              </div>
              {cmpData.metrics.map((row,i)=>(
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4"><input value={row.name} onChange={e=>{const m=[...cmpData.metrics];m[i]={...m[i],name:e.target.value};setCmpData({...cmpData,metrics:m});}} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none" placeholder="Feature"/></div>
                  <div className="col-span-3"><input value={row.old} onChange={e=>{const m=[...cmpData.metrics];m[i]={...m[i],old:e.target.value};setCmpData({...cmpData,metrics:m});}} className="w-full bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-1.5 text-xs text-red-300 outline-none" placeholder="Old"/></div>
                  <div className="col-span-4"><input value={row.new} onChange={e=>{const m=[...cmpData.metrics];m[i]={...m[i],new:e.target.value};setCmpData({...cmpData,metrics:m});}} className="w-full bg-teal-950/30 border border-teal-900/30 rounded-lg px-3 py-1.5 text-xs text-teal-300 outline-none" placeholder="New"/></div>
                  <div className="col-span-1 text-center"><button onClick={()=>setCmpData({...cmpData,metrics:cmpData.metrics.filter((_,j)=>j!==i)})} className="text-slate-600 hover:text-red-400"><Trash2 size={14}/></button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Form */}
      {view==="form" && (
        <div className="space-y-5">
          {/* Basic Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Basic Info</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="Product Name *" className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"/>
              <input name="price" value={formData.price} onChange={e=>setFormData({...formData,price:e.target.value})} placeholder="Price (e.g. ₹45,000)" className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500"/>
              <select value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500">
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} placeholder="Description" rows={1} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 resize-none"/>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Features */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Key Features</p>
                <button onClick={()=>setFormData({...formData,features:[...formData.features,""]})} className="text-xs text-teal-400 hover:underline">+ Add</button>
              </div>
              <div className="space-y-2">
                {formData.features.map((f,i)=>(
                  <div key={i} className="flex gap-2 group">
                    <input value={f} onChange={e=>{const fs=[...formData.features];fs[i]=e.target.value;setFormData({...formData,features:fs});}} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500" placeholder={`Feature ${i+1}`}/>
                    <button onClick={()=>setFormData({...formData,features:formData.features.filter((_,j)=>j!==i)})} className="text-slate-600 hover:text-red-400 px-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Specs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specifications</p>
                <button onClick={()=>setFormData({...formData,specs:[...formData.specs,{key:"",value:""}]})} className="text-xs text-teal-400 hover:underline">+ Add</button>
              </div>
              <div className="space-y-2">
                {formData.specs.map((s,i)=>(
                  <div key={i} className="flex gap-2 group">
                    <input value={s.key} onChange={e=>{const sp=[...formData.specs];sp[i]={...sp[i],key:e.target.value};setFormData({...formData,specs:sp});}} className="w-1/3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none font-bold" placeholder="Label"/>
                    <input value={s.value} onChange={e=>{const sp=[...formData.specs];sp[i]={...sp[i],value:e.target.value};setFormData({...formData,specs:sp});}} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none" placeholder="Value"/>
                    <button onClick={()=>setFormData({...formData,specs:formData.specs.filter((_,j)=>j!==i)})} className="text-slate-600 hover:text-red-400 px-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Media</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-slate-500 mb-2">Thumbnail</p>
                <div className="relative aspect-video border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-teal-500 transition-colors bg-slate-800">
                  <input type="file" accept="image/*" onChange={e=>setThumbFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                  {thumbFile?<Image src={URL.createObjectURL(thumbFile)} alt="" fill className="object-cover"/>
                    :formData.thumbnail?<Image src={formData.thumbnail} alt="" fill className="object-cover"/>
                    :<div className="text-center text-slate-600"><UploadCloud className="mx-auto mb-1" size={24}/><p className="text-xs">Upload thumbnail</p></div>}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Gallery ({formData.gallery.length+galleryFiles.length} images)</p>
                <div className="grid grid-cols-4 gap-2">
                  {formData.gallery.map((url,i)=>(
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 group">
                      <Image src={url} alt="" fill className="object-cover"/>
                      <button onClick={()=>setFormData({...formData,gallery:formData.gallery.filter((_,j)=>j!==i)})} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"><Trash2 size={14} className="text-white"/></button>
                    </div>
                  ))}
                  {galleryFiles.map((f,i)=>(
                    <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-teal-800 opacity-70">
                      <Image src={URL.createObjectURL(f)} alt="" fill className="object-cover"/>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed border-slate-700 rounded-lg hover:border-teal-500 flex items-center justify-center relative cursor-pointer transition-colors bg-slate-800 text-slate-600 hover:text-teal-400">
                    <input type="file" multiple accept="image/*" onChange={e=>setGalleryFiles([...galleryFiles,...Array.from(e.target.files||[])])} className="absolute inset-0 opacity-0 cursor-pointer"/>
                    <Plus size={20}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}