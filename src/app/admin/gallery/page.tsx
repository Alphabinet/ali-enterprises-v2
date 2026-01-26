"use client";

import React, { useState, useEffect, useMemo } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  BarChart3,
  MonitorPlay,
  Filter,
  Maximize2,
  ChevronDown,
  FileText,
  Clock,
  Save,
  Loader2
} from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";

// --- Types ---
interface GalleryItem {
  id: string;
  type: "image" | "video";
  src: string;
  storagePath: string;
  thumbnail?: string;
  thumbStoragePath?: string;
  title: string;
  category: string;
  fileSize: string;
  createdAt?: Timestamp;
}

const CATEGORIES = ["Achievements", "Factory", "Events", "Machinery"];

// --- Helpers ---
const formatBytes = (bytes: number, decimals = 0) => {
  if (!+bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

const timeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  return "Today";
};

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
      <h3 className="text-lg font-bold text-slate-800">Uploading Media...</h3>
      <p className="text-slate-500 text-xs mt-1">Please wait while we process your files.</p>
    </div>
  </div>
);

export default function AdminGalleryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Sorting & UI
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);

  // Delete State
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Auth & Init ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/admin/login");
      else { setUser(u); fetchItems(); }
    });
    return () => unsub();
  }, [router]);

  // Previews
  useEffect(() => {
    if (mainFile) { const u = URL.createObjectURL(mainFile); setPreviewMain(u); return () => URL.revokeObjectURL(u); } else setPreviewMain(null);
  }, [mainFile]);
  useEffect(() => {
    if (thumbFile) { const u = URL.createObjectURL(thumbFile); setPreviewThumb(u); return () => URL.revokeObjectURL(u); } else setPreviewThumb(null);
  }, [thumbFile]);

  const fetchItems = async () => {
    try {
      const q = query(collection(db, "gallery_items"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
      setItems(data);
    } catch (e) { console.error(e); showToast("Failed to load gallery", "error"); } 
    finally { setLoading(false); }
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Optimized Upload Logic ---
  const uploadFile = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // We mainly track the MAIN file for the progress bar visually
      if (file === mainFile) {
        uploadTask.on("state_changed", (snap) => {
           const p = (snap.bytesTransferred / snap.totalBytes) * 100;
           setProgress(p);
        });
      }

      uploadTask.then(async (snap) => {
         const url = await getDownloadURL(snap.ref);
         resolve(url);
      }).catch(reject);
    });
  };

  const handleUpload = async () => {
    if (!mainFile || !title) return showToast("Title and File required", "error");
    if (mediaType === "video" && !thumbFile) return showToast("Thumbnail required for video", "error");
    if (!user) return;

    setUploading(true);
    setProgress(0);

    try {
      const ts = Date.now();
      const mainPath = `gallery/${ts}_${mainFile.name}`;
      
      // Parallel Uploads for Speed
      const uploadPromises: Promise<string>[] = [uploadFile(mainFile, mainPath)];
      let thumbPath = "";

      if (mediaType === "video" && thumbFile) {
        thumbPath = `gallery/thumbs/${ts}_${thumbFile.name}`;
        uploadPromises.push(uploadFile(thumbFile, thumbPath));
      }

      // Wait for both
      const [downloadURL, thumbURL] = await Promise.all(uploadPromises);

      // Save Metadata
      await addDoc(collection(db, "gallery_items"), {
        type: mediaType, 
        src: downloadURL, 
        storagePath: mainPath, 
        thumbnail: thumbURL || "", 
        thumbStoragePath: thumbPath,
        title, 
        category, 
        fileSize: formatBytes(mainFile.size), 
        createdAt: serverTimestamp(),
      });

      showToast("Item published successfully!", "success");
      
      // Reset
      setMainFile(null); setThumbFile(null); setTitle(""); 
      setUploading(false); setIsFormOpen(false);
      fetchItems();

    } catch (err) { 
        console.error(err); 
        setUploading(false); 
        showToast("Upload failed. Try again.", "error"); 
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      if (deleteItem.storagePath) await deleteObject(ref(storage, deleteItem.storagePath)).catch(() => {});
      if (deleteItem.thumbStoragePath) await deleteObject(ref(storage, deleteItem.thumbStoragePath)).catch(() => {});
      await deleteDoc(doc(db, "gallery_items", deleteItem.id));
      setItems(items.filter(i => i.id !== deleteItem.id));
      showToast("Deleted successfully", "success");
    } catch (e) { showToast("Delete failed", "error"); }
    finally { setIsDeleting(false); setDeleteItem(null); }
  };

  // Sorting
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === "newest") return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      if (sortBy === "oldest") return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
      return a.title.localeCompare(b.title);
    });
  }, [items, sortBy]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-teal-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 pb-20">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {uploading && <ProgressBar progress={progress} />}

      <DeleteModal 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        onConfirm={confirmDelete} 
        title="Delete Item?" 
        message={`Delete "${deleteItem?.title}" from gallery?`} 
        isDeleting={isDeleting}
      />

      {/* --- Sticky Header --- */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-16 md:top-0 z-20 px-4 lg:px-8 py-4 shadow-sm transition-all">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><ImageIcon size={20}/></div>
             <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">Gallery</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">{items.length} Items</p>
             </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
             {/* Stats Pills */}
             <div className="hidden lg:flex items-center gap-2 mr-4 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 px-2 flex items-center gap-1"><ImageIcon size={12}/> {items.filter(i=>i.type==='image').length}</span>
                <div className="w-px h-3 bg-slate-300"></div>
                <span className="text-[10px] font-bold text-slate-500 px-2 flex items-center gap-1"><MonitorPlay size={12}/> {items.filter(i=>i.type==='video').length}</span>
             </div>

             <div className="relative">
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)} 
                    className="appearance-none w-full sm:w-32 pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium cursor-pointer outline-none hover:border-slate-300 focus:border-teal-500 shadow-sm"
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="name">A-Z</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             </div>

             <button 
               onClick={() => setIsFormOpen(!isFormOpen)} 
               className={`px-5 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${isFormOpen ? 'bg-slate-800 text-white' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
             >
               {isFormOpen ? <X size={18}/> : <Plus size={18} />} 
               <span className="hidden sm:inline">{isFormOpen ? "Close Form" : "Upload Media"}</span>
               <span className="sm:hidden">{isFormOpen ? "Close" : "Upload"}</span>
             </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT: Upload Form --- */}
        <div className={`lg:col-span-4 space-y-6 ${isFormOpen ? "block animate-in slide-in-from-top-4 duration-300" : "hidden lg:block"}`}>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Add New Item</h3>
              
              <div className="space-y-5">
                 {/* Type Switcher */}
                 <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button onClick={() => setMediaType("image")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mediaType === "image" ? "bg-white shadow-sm text-teal-700 border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                       <ImageIcon size={14}/> Image
                    </button>
                    <button onClick={() => setMediaType("video")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mediaType === "video" ? "bg-white shadow-sm text-teal-700 border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                       <VideoIcon size={14}/> Video
                    </button>
                 </div>

                 {/* Title */}
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Factory Tour 2024" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 font-medium transition-all" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                    />
                 </div>

                 {/* Category */}
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Category</label>
                    <div className="relative">
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 appearance-none cursor-pointer font-medium">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    </div>
                 </div>

                 {/* Main File Input */}
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{mediaType === 'image' ? 'Image File' : 'Video File'}</label>
                    <div className={`relative group cursor-pointer border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center transition-all overflow-hidden ${mainFile ? "border-teal-400 bg-teal-50/10" : "border-slate-200 hover:bg-slate-50 hover:border-teal-300"}`}>
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept={mediaType === "video" ? "video/*" : "image/*"} onChange={(e) => setMainFile(e.target.files?.[0] || null)} />
                       {previewMain ? (
                          mediaType === "video" 
                            ? <video src={previewMain} className="h-full w-full object-cover" /> 
                            : <Image src={previewMain} alt="Preview" fill className="object-contain p-2" />
                       ) : (
                          <div className="text-center text-slate-400 group-hover:text-teal-600 transition-colors">
                             <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 text-teal-500"><UploadCloud size={24}/></div>
                             <span className="text-xs font-bold">Drag & Drop or Click</span>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Thumbnail Input (Video Only) */}
                 {mediaType === "video" && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                       <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Thumbnail Cover</label>
                       <div className={`relative group cursor-pointer border-2 border-dashed rounded-xl h-20 flex items-center justify-center transition-all overflow-hidden ${thumbFile ? "border-teal-400" : "border-slate-200 hover:bg-slate-50"}`}>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
                          {previewThumb ? <Image src={previewThumb} alt="Thumb" fill className="object-cover" /> : <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><ImageIcon size={14}/> Upload Cover</span>}
                       </div>
                    </div>
                 )}

                 <button onClick={handleUpload} disabled={uploading} className="w-full py-3 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Publish Content
                 </button>
              </div>
           </div>
        </div>

        {/* --- RIGHT: Content Grid --- */}
        <div className="lg:col-span-8">
           {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><ImageIcon size={32} /></div>
                 <h3 className="text-sm font-bold text-slate-700">Gallery Empty</h3>
                 <p className="text-xs text-slate-400 mt-1">Upload your first image or video to showcase it.</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                 {sortedItems.map((item) => (
                    <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
                       {/* Thumbnail */}
                       <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
                          <Image 
                             src={item.type === "image" ? item.src : (item.thumbnail || "/placeholder.jpg")} 
                             alt={item.title} 
                             fill 
                             sizes="(max-width: 768px) 100vw, 33vw"
                             className="object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                          
                          <div className="absolute top-3 left-3">
                             <span className="text-[10px] font-bold bg-white/90 text-slate-800 px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md">{item.category}</span>
                          </div>
                          
                          <div className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm backdrop-blur-md flex items-center gap-1 ${item.type === 'video' ? 'bg-amber-500 text-white' : 'bg-black/60 text-white'}`}>
                             {item.type === 'video' ? <VideoIcon size={10}/> : <ImageIcon size={10}/>}
                             {item.type === 'video' ? 'VIDEO' : 'IMG'}
                          </div>

                          <a href={item.src} target="_blank" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                             <div className="p-3 bg-white rounded-full text-slate-900 shadow-xl hover:scale-110 transition-transform"><Maximize2 size={20} /></div>
                          </a>
                       </div>

                       {/* Details */}
                       <div className="p-4 flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.type === 'video' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-teal-50 border-teal-100 text-teal-600'}`}>
                             {item.type === 'video' ? <Play size={18} fill="currentColor" /> : <ImageIcon size={18}/>}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                             <h3 className="text-sm font-bold text-slate-800 leading-tight truncate mb-1" title={item.title}>{item.title}</h3>
                             <div className="text-[11px] text-slate-400 flex items-center gap-3">
                                <span className="flex items-center gap-1"><FileText size={10}/> {item.fileSize}</span>
                                <span className="flex items-center gap-1"><Clock size={10}/> {item.createdAt ? timeAgo(item.createdAt.toDate()) : "Just now"}</span>
                             </div>
                          </div>

                          <button 
                             onClick={() => setDeleteItem(item)}
                             className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors self-start"
                             title="Delete Item"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>

      </div>
    </div>
  );
}