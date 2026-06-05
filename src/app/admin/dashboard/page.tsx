"use client";

import React, { useState, useEffect, useMemo } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, query, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Trash2, Image as ImageIcon, Video as VideoIcon,
  CheckCircle2, AlertCircle, UploadCloud, X, BarChart3,
  MonitorPlay, Filter, Clock, Loader2, Save, ChevronUp, Maximize2, FileText
} from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";

type SlideType = "video" | "image";

interface SlideData {
  id: string; type: SlideType; src: string; storagePath: string;
  thumbnail?: string; thumbStoragePath?: string; alt: string;
  uploadedBy?: string; fileSize?: string; createdAt?: Timestamp;
}

const formatBytes = (b: number) => {
  if (!+b) return "0 B";
  const k=1024, s=["B","KB","MB","GB"], i=Math.floor(Math.log(b)/Math.log(k));
  return `${parseFloat((b/Math.pow(k,i)).toFixed(0))} ${s[i]}`;
};
const timeAgo = (d: Date) => {
  const s=Math.floor((Date.now()-d.getTime())/1000);
  if (s/86400>1) return Math.floor(s/86400)+"d ago";
  if (s/3600>1) return Math.floor(s/3600)+"h ago";
  return "Just now";
};

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
      <p className="font-bold text-white">Uploading...</p>
      <p className="text-xs text-slate-400 mt-1">Please wait</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [user, setUser] = useState<User|null>(null);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null);
  const router = useRouter();

  const [sortBy, setSortBy] = useState<"newest"|"oldest"|"name">("newest");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [type, setType] = useState<SlideType>("image");
  const [title, setTitle] = useState("");
  const [mainFile, setMainFile] = useState<File|null>(null);
  const [thumbFile, setThumbFile] = useState<File|null>(null);
  const [previewMain, setPreviewMain] = useState<string|null>(null);
  const [previewThumb, setPreviewThumb] = useState<string|null>(null);
  const [deleteItem, setDeleteItem] = useState<SlideData|null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>{
      if (!u) router.push("/admin/login");
      else { setUser(u); fetchSlides(); }
    });
    return ()=>unsub();
  },[router]);

  useEffect(()=>{
    if (mainFile) { const u=URL.createObjectURL(mainFile); setPreviewMain(u); return ()=>URL.revokeObjectURL(u); }
    setPreviewMain(null);
  },[mainFile]);
  useEffect(()=>{
    if (thumbFile) { const u=URL.createObjectURL(thumbFile); setPreviewThumb(u); return ()=>URL.revokeObjectURL(u); }
    setPreviewThumb(null);
  },[thumbFile]);

  const fetchSlides = async () => {
    try {
      const snap = await getDocs(query(collection(db,"hero_slides")));
      setSlides(snap.docs.map(d=>({id:d.id,...d.data()} as SlideData)));
    } catch(e){ showToast("Failed to load slides","error"); }
    finally { setLoading(false); }
  };

  const showToast = (msg:string, type:"success"|"error") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  const uploadFile = (file:File, path:string, isMain=false): Promise<string> => new Promise((res,rej)=>{
    const task = uploadBytesResumable(ref(storage,path), file);
    if (isMain) task.on("state_changed",(s)=>setProgress((s.bytesTransferred/s.totalBytes)*100));
    task.then(async(snap)=>res(await getDownloadURL(snap.ref))).catch(rej);
  });

  const handleUpload = async () => {
    if (!mainFile||!title) return showToast("Title and file required","error");
    if (type==="video"&&!thumbFile) return showToast("Thumbnail required for video","error");
    if (!user) return;
    setUploading(true); setProgress(0);
    try {
      const ts = Date.now();
      const mainPath = `hero_assets/${ts}_${mainFile.name}`;
      const thumbPath = thumbFile ? `hero_assets/thumb_${ts}_${thumbFile.name}` : "";
      const [downloadURL, thumbURL=""] = await Promise.all([
        uploadFile(mainFile,mainPath,true),
        thumbFile ? uploadFile(thumbFile,thumbPath) : Promise.resolve(""),
      ]);
      await addDoc(collection(db,"hero_slides"),{
        type, src:downloadURL, storagePath:mainPath, thumbnail:thumbURL, thumbStoragePath:thumbPath,
        alt:title, uploadedBy:user.email, fileName:mainFile.name, fileSize:formatBytes(mainFile.size),
        createdAt:serverTimestamp(),
      });
      showToast("Published!","success");
      setMainFile(null); setThumbFile(null); setTitle(""); setIsFormOpen(false); fetchSlides();
    } catch(e){ showToast("Upload failed","error"); }
    finally { setUploading(false); }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      if (deleteItem.storagePath) await deleteObject(ref(storage,deleteItem.storagePath)).catch(()=>{});
      if (deleteItem.thumbStoragePath) await deleteObject(ref(storage,deleteItem.thumbStoragePath)).catch(()=>{});
      await deleteDoc(doc(db,"hero_slides",deleteItem.id));
      setSlides(p=>p.filter(s=>s.id!==deleteItem.id));
      showToast("Deleted","success");
    } catch(e){ showToast("Delete failed","error"); }
    finally { setIsDeleting(false); setDeleteItem(null); }
  };

  const sorted = useMemo(()=>[...slides].sort((a,b)=>{
    if (sortBy==="newest") return (b.createdAt?.toMillis()||0)-(a.createdAt?.toMillis()||0);
    if (sortBy==="oldest") return (a.createdAt?.toMillis()||0)-(b.createdAt?.toMillis()||0);
    return a.alt.localeCompare(b.alt);
  }),[slides,sortBy]);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-teal-500" size={32}/></div>;

  return (
    <div className="pb-16">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      {uploading && <UploadOverlay progress={progress}/>}
      <DeleteModal isOpen={!!deleteItem} onClose={()=>setDeleteItem(null)} onConfirm={confirmDelete} title="Delete Slide?" message={`Delete "${deleteItem?.alt}"?`} isDeleting={isDeleting}/>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage hero banner slides</p>
        </div>
        <button onClick={()=>setIsFormOpen(!isFormOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isFormOpen?"bg-slate-800 border border-slate-700 text-white":"bg-teal-600 hover:bg-teal-500 text-white shadow-sm"}`}>
          {isFormOpen?<><X size={16}/> Cancel</>:<><Plus size={16}/> Upload</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {label:"Total Slides",value:slides.length,icon:BarChart3,color:"text-slate-400"},
          {label:"Images",value:slides.filter(s=>s.type==="image").length,icon:ImageIcon,color:"text-teal-400"},
          {label:"Videos",value:slides.filter(s=>s.type==="video").length,icon:MonitorPlay,color:"text-amber-400"},
        ].map(s=>(
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-800 ${s.color}`}><s.icon size={18}/></div>
            <div><p className="text-2xl font-bold text-white">{s.value}</p><p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Upload Form */}
      {isFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white">Upload New Slide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type toggle */}
            <div className="md:col-span-2 flex bg-slate-800 p-1 rounded-lg w-fit gap-1">
              {(["image","video"] as SlideType[]).map(t=>(
                <button key={t} onClick={()=>setType(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize flex items-center gap-1.5 transition-all ${type===t?"bg-slate-600 text-white":"text-slate-400 hover:text-white"}`}>
                  {t==="image"?<ImageIcon size={12}/>:<VideoIcon size={12}/>}{t}
                </button>
              ))}
            </div>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title / Caption" className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 md:col-span-2 placeholder:text-slate-600"/>
            {/* Main file */}
            <div className="relative border-2 border-dashed border-slate-700 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors overflow-hidden bg-slate-800">
              <input type="file" accept={type==="video"?"video/*":"image/*"} onChange={e=>setMainFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
              {previewMain
                ? type==="video"?<video src={previewMain} className="h-full w-full object-cover"/>:<Image src={previewMain} alt="" fill className="object-contain p-2"/>
                : <div className="text-center text-slate-500"><UploadCloud size={20} className="mx-auto mb-1"/><p className="text-xs">{type==="video"?"Video":"Image"} file</p></div>}
            </div>
            {/* Thumb (video only) */}
            {type==="video" ? (
              <div className="relative border-2 border-dashed border-slate-700 rounded-xl h-32 flex items-center justify-center cursor-pointer hover:border-teal-500 transition-colors overflow-hidden bg-slate-800">
                <input type="file" accept="image/*" onChange={e=>setThumbFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                {previewThumb?<Image src={previewThumb} alt="" fill className="object-cover"/>
                  :<div className="text-center text-slate-500"><ImageIcon size={20} className="mx-auto mb-1"/><p className="text-xs">Thumbnail</p></div>}
              </div>
            ) : <div/>}
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleUpload} disabled={uploading} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-xl disabled:opacity-50">
              <Save size={16}/> Publish Slide
            </button>
          </div>
        </div>
      )}

      {/* Slides grid */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm">{slides.length} slides</p>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)} className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 outline-none">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">A-Z</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map(slide=>(
          <div key={slide.id} className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
            <div className="relative aspect-video bg-slate-800">
              <Image src={slide.type==="image"?slide.src:(slide.thumbnail||"/placeholder.jpg")} alt={slide.alt} fill sizes="25vw" className="object-cover"/>
              <div className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${slide.type==="video"?"bg-amber-500 text-white":"bg-slate-900/80 text-slate-300"}`}>
                {slide.type==="video"?"VIDEO":"IMG"}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a href={slide.src} target="_blank" className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30"><Maximize2 size={16} className="text-white"/></a>
                <button onClick={()=>setDeleteItem(slide)} className="p-2 bg-red-500/80 backdrop-blur rounded-lg hover:bg-red-500"><Trash2 size={16} className="text-white"/></button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-white truncate">{slide.alt}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><FileText size={9}/>{slide.fileSize||"N/A"}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Clock size={9}/>{slide.createdAt?timeAgo(slide.createdAt.toDate()):"Now"}</span>
              </div>
            </div>
          </div>
        ))}
        {sorted.length===0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-xl">
            <ImageIcon className="mx-auto text-slate-700 mb-3" size={32}/>
            <p className="text-slate-500 text-sm">No slides yet. Upload your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}