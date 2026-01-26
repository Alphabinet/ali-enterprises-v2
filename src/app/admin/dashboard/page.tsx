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
// --- FIXED IMPORTS BELOW (Added 'Save') ---
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  X,
  FileText,
  BarChart3,
  MonitorPlay,
  Maximize2,
  Filter,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  Save // Added missing import
} from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";

// --- Types ---
type SlideData = {
  id: string;
  type: "video" | "image";
  src: string;
  storagePath: string;
  thumbnail?: string;
  thumbStoragePath?: string;
  alt: string;
  uploadedBy?: string;
  fileSize?: string;
  createdAt?: Timestamp;
};

// --- Toast Component ---
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
  <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 max-w-[90vw] ${type === "success" ? "bg-teal-900 text-white border border-teal-700" : "bg-red-600 text-white border border-red-500"}`}>
    {type === "success" ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
    <p className="font-medium text-sm">{message}</p>
    <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100 transition-opacity p-1"><X size={16} /></button>
  </div>
);

// --- Progress Bar Component ---
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
      <h3 className="text-lg font-bold text-slate-800">Uploading Slide...</h3>
      <p className="text-slate-500 text-xs mt-1">Please wait while we process your files.</p>
    </div>
  </div>
);

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
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  return "Just now";
};

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  // Sort & Form
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [type, setType] = useState<"image" | "video">("image");
  const [title, setTitle] = useState("");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);

  // Delete Modal
  const [deleteItem, setDeleteItem] = useState<SlideData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Auth & Data ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/admin/login");
      else { setUser(u); fetchSlides(); }
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

  const fetchSlides = async () => {
    try {
      const q = query(collection(db, "hero_slides"));
      const s = await getDocs(q);
      setSlides(s.docs.map(d => ({ id: d.id, ...d.data() } as SlideData)));
    } catch (e) { console.error(e); showToast("Failed to load slides", "error"); } finally { setLoading(false); }
  };

  const sortedSlides = useMemo(() => {
    return [...slides].sort((a, b) => {
      if (sortBy === "newest") return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      if (sortBy === "oldest") return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
      return a.alt.localeCompare(b.alt);
    });
  }, [slides, sortBy]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Optimized Upload Logic ---
  const uploadFile = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Track progress mainly for the main file
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
    if (!mainFile || !title) return showToast("Title and Main File are required", "error");
    if (type === "video" && !thumbFile) return showToast("Thumbnail is required for video", "error");
    if (!user) return;

    setUploading(true);
    setProgress(0);

    try {
      const ts = Date.now();
      const mainPath = `hero_assets/${ts}_${mainFile.name}`;
      
      // Parallel Uploads
      const uploadPromises: Promise<string>[] = [uploadFile(mainFile, mainPath)];
      let thumbPath = "";

      if (type === "video" && thumbFile) {
        thumbPath = `hero_assets/thumb_${ts}_${thumbFile.name}`;
        uploadPromises.push(uploadFile(thumbFile, thumbPath));
      }

      const [downloadURL, thumbURL] = await Promise.all(uploadPromises);

      await addDoc(collection(db, "hero_slides"), {
        type, src: downloadURL, storagePath: mainPath, thumbnail: thumbURL || "", thumbStoragePath: thumbPath,
        alt: title, uploadedBy: user.email, fileName: mainFile.name, fileSize: formatBytes(mainFile.size),
        createdAt: serverTimestamp(),
      });

      showToast("Published successfully", "success");
      setMainFile(null); setThumbFile(null); setTitle(""); setUploading(false); setIsFormOpen(false);
      fetchSlides();

    } catch (e) { 
        console.error(e); 
        setUploading(false); 
        showToast("Upload failed", "error"); 
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      if (deleteItem.storagePath) await deleteObject(ref(storage, deleteItem.storagePath)).catch(e => console.warn(e));
      if (deleteItem.thumbStoragePath) await deleteObject(ref(storage, deleteItem.thumbStoragePath)).catch(e => console.warn(e));
      await deleteDoc(doc(db, "hero_slides", deleteItem.id));
      showToast("Deleted successfully", "success");
      fetchSlides();
    } catch (e) { showToast("Delete failed", "error"); }
    finally { setIsDeleting(false); setDeleteItem(null); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-teal-600" size={40} /></div>;

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-900">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {uploading && <ProgressBar progress={progress} />}

      <DeleteModal 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        onConfirm={confirmDelete} 
        title="Delete Content?" 
        message={`Are you sure you want to delete "${deleteItem?.alt}"?`} 
        isDeleting={isDeleting}
      />

      {/* --- Top Bar: Stats & Controls --- */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-16 md:top-0 z-20 px-4 py-3 -mx-4 md:mx-0 md:rounded-xl md:border md:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
        
        {/* Stats Scroller */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar mask-gradient-r">
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200 shrink-0">
              <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
          </div>
          <div className="flex gap-2 text-xs font-medium text-slate-600 whitespace-nowrap">
              <span className="bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-center gap-1.5"><BarChart3 size={14} className="text-slate-400"/> <b>{slides.length}</b> Items</span>
              <span className="bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-center gap-1.5"><ImageIcon size={14} className="text-teal-500"/> <b>{slides.filter(s=>s.type==='image').length}</b></span>
              <span className="bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-center gap-1.5"><MonitorPlay size={14} className="text-amber-500"/> <b>{slides.filter(s=>s.type==='video').length}</b></span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)} 
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 ${isFormOpen ? "bg-slate-800" : "bg-teal-600 hover:bg-teal-700"}`}
          >
            {isFormOpen ? <ChevronUp size={16} /> : <Plus size={16} />} 
            <span className="md:hidden">Add New</span><span className="hidden md:inline">{isFormOpen ? "Close Form" : "Upload"}</span>
          </button>
          
          <div className="relative group">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)} 
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase rounded-lg pl-3 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">A-Z</option>
            </select>
            <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-teal-600 transition-colors" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT: Upload Form --- */}
        <div className={`lg:col-span-4 space-y-6 ${isFormOpen ? "block animate-in slide-in-from-top-4 duration-300" : "hidden lg:block"}`}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24 md:top-24">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-md shadow-sm text-teal-600"><UploadCloud size={16}/></div> 
                Upload Content
              </div>
              
              <div className="p-5 space-y-4">
                {/* Type Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setType("image")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${type === "image" ? "bg-white shadow text-teal-700" : "text-slate-500 hover:text-slate-700"}`}>
                     <ImageIcon size={14} /> Image
                  </button>
                  <button onClick={() => setType("video")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${type === "video" ? "bg-white shadow text-teal-700" : "text-slate-500 hover:text-slate-700"}`}>
                     <VideoIcon size={14} /> Video
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 block">Title / Caption</label>
                  <input type="text" placeholder="e.g. Factory Tour 2024" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                
                {/* Main File */}
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 block">Main File</label>
                   <div className={`relative group cursor-pointer border-2 border-dashed rounded-xl h-36 flex flex-col items-center justify-center transition-all overflow-hidden ${mainFile ? "border-teal-400 bg-teal-50/10" : "border-slate-200 hover:bg-slate-50 hover:border-teal-300"}`}>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept={type === "video" ? "video/*" : "image/*"} onChange={(e) => setMainFile(e.target.files?.[0] || null)} />
                      {previewMain ? (
                          type === "video" 
                            ? <video src={previewMain} className="h-full w-full object-cover" /> 
                            : <Image src={previewMain} alt="Preview" fill className="object-contain p-2" />
                      ) : (
                          <div className="text-center text-slate-400 transition-transform group-hover:scale-105">
                             <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-2 text-teal-500"><UploadCloud size={20}/></div>
                             <span className="text-xs font-bold text-slate-500">Click to Select</span>
                             <p className="text-[10px] text-slate-400 mt-1">Max 10MB</p>
                          </div>
                      )}
                   </div>
                </div>

                {/* Thumbnail */}
                {type === "video" && (
                   <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 block">Thumbnail</label>
                      <div className={`relative group cursor-pointer border-2 border-dashed rounded-xl h-16 flex items-center justify-center transition-all overflow-hidden ${thumbFile ? "border-teal-400" : "border-slate-200 hover:bg-slate-50"}`}>
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
                         {previewThumb ? <Image src={previewThumb} alt="Thumb" fill className="object-cover" /> : <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><ImageIcon size={12}/> Cover Image</span>}
                      </div>
                   </div>
                )}

                {uploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[10px] font-bold text-teal-700 uppercase"><span>Uploading...</span><span>{Math.round(progress)}%</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className="bg-teal-500 h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div></div>
                  </div>
                )}

                <button onClick={handleUpload} disabled={uploading} className="w-full py-3 bg-teal-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                   {uploading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {uploading ? "Processing..." : "Publish Content"}
                </button>
             </div>
          </div>
        </div>

        {/* --- RIGHT: Content Grid --- */}
        <div className="lg:col-span-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
             {sortedSlides.length === 0 ? (
                <div className="col-span-full py-24 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><ImageIcon className="text-slate-300" size={32} /></div>
                   <h3 className="text-sm font-bold text-slate-900">No content found</h3>
                   <p className="text-xs text-slate-400 mt-1">Upload your first slide to get started.</p>
                </div>
             ) : (
                sortedSlides.map((slide) => (
                  <div key={slide.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
                    
                    {/* Thumbnail Area (16:9) */}
                    <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
                      <Image 
                        src={slide.type === "image" ? slide.src : (slide.thumbnail || "/placeholder.jpg")} 
                        alt={slide.alt} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      
                      {/* Badge */}
                      <div className={`absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md ${slide.type === 'video' ? 'bg-amber-500 text-white' : 'bg-black/60 text-white'}`}>
                        {slide.type === 'video' ? 'VIDEO' : 'IMG'}
                      </div>

                      {/* View Button */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                          <a href={slide.src} target="_blank" className="p-2.5 bg-white rounded-full hover:scale-110 transition-transform shadow-lg text-slate-900"><Maximize2 size={18} /></a>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-3.5 flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${slide.type === 'video' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-teal-50 border-teal-100 text-teal-600'}`}>
                           {slide.type === 'video' ? <VideoIcon size={14}/> : <ImageIcon size={14}/>}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <h3 className="text-sm font-bold text-slate-800 leading-tight truncate mb-1" title={slide.alt}>{slide.alt}</h3>
                           <div className="text-[11px] text-slate-400 flex flex-col gap-0.5">
                              <span className="flex items-center gap-1"><FileText size={10}/> {slide.fileSize || "N/A"}</span>
                              <span className="flex items-center gap-1"><Clock size={10}/> {slide.createdAt ? timeAgo(slide.createdAt.toDate()) : "Just now"}</span>
                           </div>
                        </div>

                        <div className="shrink-0 flex flex-col justify-between items-end">
                           <button 
                             onClick={() => setDeleteItem(slide)}
                             className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                             title="Delete"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                    </div>
                  </div>
                ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
}