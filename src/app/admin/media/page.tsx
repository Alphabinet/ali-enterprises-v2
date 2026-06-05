"use client";

import React, { useState, useEffect, useMemo } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, query, serverTimestamp, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  UploadCloud, Trash2, Image as ImageIcon, Video as VideoIcon,
  Plus, CheckCircle2, AlertCircle, X, Filter, Maximize2,
  FileText, Clock, Save, Loader2, Play
} from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";

type MediaType = "image" | "video";
type ActiveTab = "gallery" | "demos";

interface GalleryItem {
  id: string; type: MediaType; src: string; storagePath: string;
  thumbnail?: string; thumbStoragePath?: string; title: string;
  category: string; fileSize: string; createdAt?: Timestamp;
}
interface DemoVideo {
  id: string; title: string; description: string;
  videoUrl: string; storagePath?: string; createdAt?: Timestamp;
}

const GALLERY_CATS = ["Achievements", "Factory", "Events", "Machinery"];

const formatBytes = (b: number) => {
  if (!+b) return "0 B";
  const k = 1024, s = ["B","KB","MB","GB"], i = Math.floor(Math.log(b)/Math.log(k));
  return `${parseFloat((b/Math.pow(k,i)).toFixed(0))} ${s[i]}`;
};
const timeAgo = (d: Date) => {
  const s = Math.floor((Date.now()-d.getTime())/1000);
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

export default function UnifiedMediaPage() {
  const router = useRouter();
  const [user, setUser] = useState<User|null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("gallery");
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [gTitle, setGTitle] = useState("");
  const [gCategory, setGCategory] = useState(GALLERY_CATS[0]);
  const [mainFile, setMainFile] = useState<File|null>(null);
  const [thumbFile, setThumbFile] = useState<File|null>(null);
  const [previewMain, setPreviewMain] = useState<string|null>(null);
  const [previewThumb, setPreviewThumb] = useState<string|null>(null);
  const [gSortBy, setGSortBy] = useState<"newest"|"oldest"|"name">("newest");
  const [deleteGallery, setDeleteGallery] = useState<GalleryItem|null>(null);
  const [isDeletingG, setIsDeletingG] = useState(false);

  // Demo state
  const [demoVideos, setDemoVideos] = useState<DemoVideo[]>([]);
  const [demoLoading, setDemoLoading] = useState(true);
  const [dTitle, setDTitle] = useState("");
  const [dDesc, setDDesc] = useState("");
  const [videoFile, setVideoFile] = useState<File|null>(null);
  const [deleteDemo, setDeleteDemo] = useState<DemoVideo|null>(null);
  const [isDeletingD, setIsDeletingD] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/admin/login");
      else { setUser(u); fetchGallery(); fetchDemos(); }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (mainFile) { const u=URL.createObjectURL(mainFile); setPreviewMain(u); return ()=>URL.revokeObjectURL(u); }
    setPreviewMain(null);
  }, [mainFile]);
  useEffect(() => {
    if (thumbFile) { const u=URL.createObjectURL(thumbFile); setPreviewThumb(u); return ()=>URL.revokeObjectURL(u); }
    setPreviewThumb(null);
  }, [thumbFile]);

  const showToast = (msg:string, type:"success"|"error") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  const fetchGallery = async () => {
    try {
      const snap = await getDocs(query(collection(db,"gallery_items")));
      setGalleryItems(snap.docs.map(d=>({id:d.id,...d.data()} as GalleryItem)));
    } catch(e){ showToast("Failed to load gallery","error"); }
    finally { setGalleryLoading(false); }
  };

  const fetchDemos = async () => {
    try {
      const snap = await getDocs(query(collection(db,"product_demos"),orderBy("createdAt","desc")));
      setDemoVideos(snap.docs.map(d=>({id:d.id,...d.data()} as DemoVideo)));
    } catch(e){ showToast("Failed to load demos","error"); }
    finally { setDemoLoading(false); }
  };

  const uploadFile = (file:File, path:string, isMain=false): Promise<string> => new Promise((res,rej)=>{
    const task = uploadBytesResumable(ref(storage,path), file);
    if (isMain) task.on("state_changed",(s)=>setProgress((s.bytesTransferred/s.totalBytes)*100));
    task.then(async(snap)=>res(await getDownloadURL(snap.ref))).catch(rej);
  });

  const resetGalleryForm = () => {
    setGTitle(""); setMainFile(null); setThumbFile(null); setGCategory(GALLERY_CATS[0]); setMediaType("image");
  };

  const handleGalleryUpload = async () => {
    if (!mainFile||!gTitle) return showToast("Title and file required","error");
    if (mediaType==="video"&&!thumbFile) return showToast("Thumbnail required for video","error");
    setUploading(true); setProgress(0);
    try {
      const ts = Date.now();
      const [downloadURL, thumbURL=""] = await Promise.all([
        uploadFile(mainFile,`gallery/${ts}_${mainFile.name}`,true),
        thumbFile ? uploadFile(thumbFile,`gallery/thumbs/${ts}_${thumbFile.name}`) : Promise.resolve(""),
      ]);
      await addDoc(collection(db,"gallery_items"),{
        type:mediaType, src:downloadURL, storagePath:`gallery/${ts}_${mainFile.name}`,
        thumbnail:thumbURL, thumbStoragePath:thumbFile?`gallery/thumbs/${ts}_${thumbFile.name}`:"",
        title:gTitle, category:gCategory, fileSize:formatBytes(mainFile.size), createdAt:serverTimestamp(),
      });
      showToast("Published!","success");
      resetGalleryForm(); setIsFormOpen(false); fetchGallery();
    } catch(e){ showToast("Upload failed","error"); }
    finally { setUploading(false); }
  };

  const confirmDeleteGallery = async () => {
    if (!deleteGallery) return;
    setIsDeletingG(true);
    try {
      if (deleteGallery.storagePath) await deleteObject(ref(storage,deleteGallery.storagePath)).catch(()=>{});
      if (deleteGallery.thumbStoragePath) await deleteObject(ref(storage,deleteGallery.thumbStoragePath)).catch(()=>{});
      await deleteDoc(doc(db,"gallery_items",deleteGallery.id));
      setGalleryItems(p=>p.filter(i=>i.id!==deleteGallery.id));
      showToast("Deleted","success");
    } catch(e){ showToast("Delete failed","error"); }
    finally { setIsDeletingG(false); setDeleteGallery(null); }
  };

  const handleDemoUpload = async () => {
    if (!videoFile||!dTitle) return showToast("Title and video required","error");
    setUploading(true); setProgress(0);
    try {
      const storagePath = `demos/${Date.now()}_${videoFile.name}`;
      const task = uploadBytesResumable(ref(storage,storagePath), videoFile);
      task.on("state_changed",(s)=>setProgress((s.bytesTransferred/s.totalBytes)*100));
      await new Promise<void>((res,rej)=>{ task.then(()=>res()).catch(rej); });
      const url = await getDownloadURL(task.snapshot.ref);
      await addDoc(collection(db,"product_demos"),{
        title:dTitle, description:dDesc, videoUrl:url, storagePath, createdAt:serverTimestamp(),
      });
      showToast("Demo published!","success");
      setDTitle(""); setDDesc(""); setVideoFile(null); setIsFormOpen(false); fetchDemos();
    } catch(e){ showToast("Upload failed","error"); }
    finally { setUploading(false); }
  };

  const confirmDeleteDemo = async () => {
    if (!deleteDemo) return;
    setIsDeletingD(true);
    try {
      if (deleteDemo.storagePath) await deleteObject(ref(storage,deleteDemo.storagePath)).catch(()=>{});
      await deleteDoc(doc(db,"product_demos",deleteDemo.id));
      setDemoVideos(p=>p.filter(v=>v.id!==deleteDemo.id));
      showToast("Deleted","success");
    } catch(e){ showToast("Delete failed","error"); }
    finally { setIsDeletingD(false); setDeleteDemo(null); }
  };

  const sortedGallery = useMemo(()=>[...galleryItems].sort((a,b)=>{
    if(gSortBy==="newest") return (b.createdAt?.toMillis()||0)-(a.createdAt?.toMillis()||0);
    if(gSortBy==="oldest") return (a.createdAt?.toMillis()||0)-(b.createdAt?.toMillis()||0);
    return a.title.localeCompare(b.title);
  }),[galleryItems,gSortBy]);

  return (
    <div className="pb-16">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      {uploading && <UploadOverlay progress={progress}/>}
      <DeleteModal isOpen={!!deleteGallery} onClose={()=>setDeleteGallery(null)} onConfirm={confirmDeleteGallery} title="Delete item?" message={`Delete "${deleteGallery?.title}"?`} isDeleting={isDeletingG}/>
      <DeleteModal isOpen={!!deleteDemo} onClose={()=>setDeleteDemo(null)} onConfirm={confirmDeleteDemo} title="Delete video?" message={`Delete "${deleteDemo?.title}"?`} isDeleting={isDeletingD}/>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Library</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gallery & demo videos</p>
        </div>
        <button onClick={()=>{setIsFormOpen(!isFormOpen); resetGalleryForm(); setVideoFile(null);}}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${isFormOpen?"bg-slate-700 text-white":"bg-teal-600 hover:bg-teal-500 text-white"}`}>
          {isFormOpen?<X size={16}/>:<Plus size={16}/>} {isFormOpen?"Cancel":"Upload"}
        </button>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl mb-6 w-fit">
        {(["gallery","demos"] as ActiveTab[]).map(tab=>(
          <button key={tab} onClick={()=>{setActiveTab(tab); setIsFormOpen(false);}}
            className={`px-5 py-2 text-sm font-bold rounded-lg capitalize transition-all ${activeTab===tab?"bg-slate-700 text-white shadow":"text-slate-500 hover:text-slate-300"}`}>
            {tab==="gallery"?<span className="flex items-center gap-2"><ImageIcon size={14}/> Gallery ({galleryItems.length})</span>
                           :<span className="flex items-center gap-2"><VideoIcon size={14}/> Demos ({demoVideos.length})</span>}
          </button>
        ))}
      </div>

      {/* Upload Form */}
      {isFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 animate-in slide-in-from-top-2 duration-200">
          {activeTab==="gallery" ? (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">Upload to Gallery</h3>
              <div className="flex bg-slate-800 p-1 rounded-lg w-fit gap-1">
                {(["image","video"] as MediaType[]).map(t=>(
                  <button key={t} onClick={()=>setMediaType(t)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${mediaType===t?"bg-slate-600 text-white":"text-slate-400 hover:text-white"}`}>
                    {t==="image"?<ImageIcon size={12}/>:<VideoIcon size={12}/>}{t}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={gTitle} onChange={e=>setGTitle(e.target.value)} placeholder="Title" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"/>
                <select value={gCategory} onChange={e=>setGCategory(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500">
                  {GALLERY_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative border-2 border-dashed border-slate-700 rounded-lg h-10 flex items-center justify-center cursor-pointer hover:border-teal-500 transition-colors overflow-hidden">
                  <input type="file" accept={mediaType==="video"?"video/*":"image/*"} onChange={e=>setMainFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                  {mainFile?<span className="text-xs text-teal-400 font-medium truncate px-2">{mainFile.name}</span>:<span className="text-xs text-slate-500 flex items-center gap-1"><UploadCloud size={12}/> {mediaType==="video"?"Video":"Image"} file</span>}
                </div>
              </div>
              {mediaType==="video" && (
                <div className="relative border-2 border-dashed border-slate-700 rounded-lg h-10 flex items-center justify-center cursor-pointer hover:border-teal-500 transition-colors overflow-hidden w-full">
                  <input type="file" accept="image/*" onChange={e=>setThumbFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                  {thumbFile?<span className="text-xs text-teal-400 font-medium">{thumbFile.name}</span>:<span className="text-xs text-slate-500 flex items-center gap-1"><ImageIcon size={12}/> Thumbnail image</span>}
                </div>
              )}
              <div className="flex justify-end">
                <button onClick={handleGalleryUpload} disabled={uploading} className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 disabled:opacity-50">
                  <Save size={14}/> Publish
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">Upload Demo Video</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={dTitle} onChange={e=>setDTitle(e.target.value)} placeholder="Video Title" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"/>
                <input value={dDesc} onChange={e=>setDDesc(e.target.value)} placeholder="Description (optional)" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"/>
              </div>
              <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-teal-500 transition-colors">
                <input type="file" accept="video/*" onChange={e=>setVideoFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                <UploadCloud size={24} className="text-teal-500 mb-2"/>
                {videoFile?<span className="text-sm font-bold text-teal-400">{videoFile.name}</span>:<span className="text-sm text-slate-500">Select video file (MP4, WebM)</span>}
              </div>
              <div className="flex justify-end">
                <button onClick={handleDemoUpload} disabled={uploading} className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 disabled:opacity-50">
                  <Save size={14}/> Upload
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab==="gallery" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-sm">{galleryItems.length} items</p>
            <select value={gSortBy} onChange={e=>setGSortBy(e.target.value as any)} className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 outline-none">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">A-Z</option>
            </select>
          </div>
          {galleryLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-500" size={32}/></div> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedGallery.map(item=>(
                <div key={item.id} className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
                  <div className="relative aspect-video bg-slate-800">
                    <Image src={item.type==="image"?item.src:(item.thumbnail||"/placeholder.jpg")} alt={item.title} fill sizes="33vw" className="object-cover"/>
                    <div className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${item.type==="video"?"bg-amber-500 text-white":"bg-slate-900/80 text-slate-200"}`}>{item.category}</div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={item.src} target="_blank" className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30"><Maximize2 size={16} className="text-white"/></a>
                      <button onClick={()=>setDeleteGallery(item)} className="p-2 bg-red-500/80 backdrop-blur rounded-lg hover:bg-red-500"><Trash2 size={16} className="text-white"/></button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.fileSize} · {item.createdAt?timeAgo(item.createdAt.toDate()):"Just now"}</p>
                  </div>
                </div>
              ))}
              {galleryItems.length===0 && <div className="col-span-full py-20 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl"><ImageIcon className="mx-auto mb-2 opacity-30" size={32}/><p className="text-sm">No gallery items yet</p></div>}
            </div>
          )}
        </>
      )}

      {/* Demos Tab */}
      {activeTab==="demos" && (
        <>
          {demoLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-500" size={32}/></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {demoVideos.map(video=>(
                <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all group">
                  <div className="relative aspect-video bg-slate-800">
                    <video src={video.videoUrl} className="w-full h-full object-cover" controls preload="metadata"/>
                  </div>
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{video.title}</p>
                      {video.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{video.description}</p>}
                    </div>
                    <button onClick={()=>setDeleteDemo(video)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
              {demoVideos.length===0 && <div className="col-span-full py-20 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl"><VideoIcon className="mx-auto mb-2 opacity-30" size={32}/><p className="text-sm">No demo videos yet</p></div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}