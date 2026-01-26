"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { motion } from "framer-motion";
import { Loader2, PlayCircle, Video } from "lucide-react";

interface DemoVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  createdAt: any;
}

export default function ProductDemosPage() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 flex justify-center">
        <Loader2 className="animate-spin text-teal-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-12">
      
      {/* Header */}
      <div className="container mx-auto px-4 text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4"
        >
          <Video size={14} /> Live Action
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4"
        >
          Product <span className="text-teal-600">Demos</span>
        </motion.h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-xs">
          Watch our heavy-duty machinery in action.
        </p>
      </div>

      {/* Video Grid */}
      <div className="container mx-auto px-4 max-w-7xl">
        {videos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <PlayCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-600">No Demos Uploaded Yet</h3>
            <p className="text-slate-400">Check back soon for new footage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {videos.map((video, idx) => (
              <motion.div 
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 group"
              >
                {/* Video Player Container */}
                <div className="relative w-full aspect-video bg-black">
                  <video 
                    src={video.videoUrl} 
                    controls 
                    preload="metadata"
                    className="w-full h-full object-contain"
                    controlsList="nodownload" // Optional: prevents easy downloading
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{video.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{video.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}