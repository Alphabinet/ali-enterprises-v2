"use client";

import React, { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { Loader2, Plus, Trash2, Video, Save, X, UploadCloud } from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";

interface DemoVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  storagePath?: string; // Needed for deleting the file from storage
}

export default function AdminProductDemo() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Form Data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Delete Modal
  const [deleteItem, setDeleteItem] = useState<DemoVideo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const q = query(collection(db, "product_demos"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DemoVideo[];
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !title) return alert("Please select a video and enter a title.");

    setUploading(true);
    try {
      // 1. Upload Video to Storage
      const storagePath = `demos/${Date.now()}_${videoFile.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, videoFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          console.error(error);
          alert("Upload failed");
          setUploading(false);
        },
        async () => {
          // 2. Get URL and Save to Firestore
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, "product_demos"), {
            title,
            description,
            videoUrl: downloadURL,
            storagePath: storagePath,
            createdAt: serverTimestamp(),
          });

          // Reset
          setVideoFile(null); setTitle(""); setDescription(""); setProgress(0);
          setUploading(false); setIsFormOpen(false);
          fetchVideos();
        }
      );
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      // 1. Delete from Storage (if path exists)
      if (deleteItem.storagePath) {
        const fileRef = ref(storage, deleteItem.storagePath);
        await deleteObject(fileRef).catch(err => console.warn("File not found in storage", err));
      }

      // 2. Delete from Firestore
      await deleteDoc(doc(db, "product_demos", deleteItem.id));
      setVideos(prev => prev.filter(v => v.id !== deleteItem.id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete video");
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      <DeleteModal 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        onConfirm={handleDelete} 
        title="Delete Video?" 
        message={`This will permanently delete the video "${deleteItem?.title}".`} 
        isDeleting={isDeleting}
      />

      {/* Upload Progress Overlay */}
      {uploading && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-80">
            <div className="relative w-20 h-20 mx-auto mb-4">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-teal-600 transition-all duration-300 ease-out" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center font-bold text-teal-700 text-sm">{Math.round(progress)}%</div>
            </div>
            <h3 className="font-bold text-slate-800">Uploading Video...</h3>
            <p className="text-xs text-slate-500 mt-1">Please do not close this tab.</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Demo Videos</h1>
            <p className="text-slate-500 text-sm">Manage product demonstration videos.</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
          >
            <Plus size={18} /> Upload Video
          </button>
        </div>

        {/* Upload Form */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800">Upload New Demo</h3>
               <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
               {/* File Input */}
               <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-teal-400 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)} 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <UploadCloud size={32} className="mb-2 text-teal-600" />
                  {videoFile ? (
                    <span className="font-bold text-teal-700">{videoFile.name}</span>
                  ) : (
                    <span>Click to select video file (MP4, WebM)</span>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Video Title</label>
                   <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Fly Ash Machine Demo" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Description (Optional)</label>
                   <input value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Short description..." />
                 </div>
               </div>

               <div className="flex justify-end gap-3 mt-2">
                 <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200">Cancel</button>
                 <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 flex items-center gap-2">
                    <Save size={16} /> Start Upload
                 </button>
               </div>
            </form>
          </div>
        )}

        {/* Video List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
               <div className="relative aspect-video bg-black">
                 <video src={video.videoUrl} className="w-full h-full object-cover" controls />
               </div>
               <div className="p-4 flex justify-between items-start">
                 <div>
                   <h3 className="font-bold text-slate-800 line-clamp-1">{video.title}</h3>
                   <p className="text-xs text-slate-500 line-clamp-2 mt-1">{video.description}</p>
                 </div>
                 <button onClick={() => setDeleteItem(video)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                   <Trash2 size={18} />
                 </button>
               </div>
            </div>
          ))}
          
          {videos.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200">
               <Video className="mx-auto mb-2 opacity-50" size={32} />
               <p>No videos uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}