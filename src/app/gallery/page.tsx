"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Loader2, 
  Play, 
  X, 
  Trophy, 
  Factory, 
  Calendar, 
  Image as ImageIcon,
  ZoomIn,
  Cpu
} from "lucide-react";

// --- Types ---
interface GalleryItem {
  id: string;
  type: "image" | "video";
  src: string;
  thumbnail?: string;
  title: string;
  category: string;
}

const CATEGORIES = [
  { id: "All", label: "All", icon: ImageIcon },
  { id: "Achievements", label: "Awards", icon: Trophy },
  { id: "Factory", label: "Factory", icon: Factory },
  { id: "Events", label: "Events", icon: Calendar },
  { id: "Machinery", label: "Machinery", icon: Cpu },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, "gallery_items"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
        setItems(data);
      } catch (error) {
        console.error("Error loading gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredItems = filter === "All" 
    ? items 
    : items.filter(item => item.category === filter);

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20 lg:pt-32 lg:pb-24">
      
      {/* --- Header Section --- */}
      <div className="container mx-auto px-4 mb-8 lg:mb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-2 lg:mb-4">
            Our <span className="text-teal-600">Gallery</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            A glimpse into our manufacturing excellence and company culture.
          </p>
        </motion.div>

        {/* --- Filters --- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 lg:mt-8"
        >
          <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 pb-2 -mx-4 lg:mx-0 justify-start lg:justify-center snap-x">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`snap-center shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border whitespace-nowrap ${
                  filter === cat.id
                    ? "bg-teal-600 text-white border-teal-600 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50"
                }`}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* --- Gallery Grid --- */}
      <div className="container mx-auto px-4 max-w-7xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-teal-600 w-8 h-8" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 mx-auto max-w-md">
            <ImageIcon className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No items found</h3>
            <p className="text-slate-400 text-xs">Try a different category.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-[4/3] relative bg-slate-100">
                    <Image
                      src={item.type === "video" ? (item.thumbnail || "/placeholder.jpg") : item.src}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="hidden lg:flex absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                      <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                        {item.type === "video" ? <Play fill="currentColor" size={16} /> : <ZoomIn size={16} />}
                      </div>
                    </div>
                    
                    {/* Mobile Indicators */}
                    {item.type === "video" && (
                        <div className="lg:hidden absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-teal-700 shadow-sm">
                             <Play fill="currentColor" size={12} className="ml-0.5" />
                          </div>
                        </div>
                    )}

                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                       {item.type === "video" ? "Video" : "Image"}
                    </div>
                  </div>
                  
                  <div className="p-2.5 lg:p-3">
                    <p className="text-[9px] font-bold text-teal-600 uppercase tracking-wider mb-0.5">{item.category}</p>
                    <h3 className="font-semibold text-slate-800 text-xs lg:text-sm line-clamp-1 leading-tight">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* --- Lightbox Modal (Fixed for Original Dimensions) --- */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors z-50"
              onClick={() => setSelectedItem(null)}
            >
              <X size={20} />
            </button>

            <div 
              className="relative max-h-[90vh] max-w-[95vw] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media Container - No fixed aspect ratio here, lets content dictate size */}
              <div className="relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 flex justify-center items-center">
                {selectedItem.type === "video" ? (
                  <video 
                    src={selectedItem.src} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-[80vh] object-contain" 
                  />
                ) : (
                  /* Using "width: auto" and "height: auto" with next/image requires
                     width/height props to calculate aspect ratio, OR "fill" with a parent container.
                     Here we use a regular img tag for true original dimension flexibility in a modal 
                     OR next/image with "0" width/height and "sizes" for optimization.
                  */
                  <Image 
                    src={selectedItem.src} 
                    alt={selectedItem.title} 
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="max-w-full max-h-[80vh] w-auto h-auto object-contain" 
                  />
                )}
              </div>
              
              <div className="mt-4 text-center">
                <h3 className="text-lg font-bold text-white">{selectedItem.title}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold rounded-full">
                  {selectedItem.category}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}