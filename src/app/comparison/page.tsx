"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { 
  CheckCircle2, XCircle, ArrowRight, TrendingUp, 
  Users, Zap, Timer, IndianRupee, Factory, Settings, ShieldCheck,
  Loader2, ImageIcon
} from "lucide-react";

// --- Types (Must match Admin) ---
interface MetricRow {
  name: string;
  old: string;
  new: string;
}

interface ComparisonData {
  headerTitle: string;
  headerDesc: string;
  oldImage: string;
  oldTitle: string;
  oldDesc: string;
  oldPoints: string[];
  newImage: string;
  newTitle: string;
  newDesc: string;
  newPoints: string[];
  metrics: MetricRow[];
}

// Default fallback data
const DEFAULT_DATA: ComparisonData = {
  headerTitle: "Traditional vs. Modern Technology",
  headerDesc: "See exactly how switching saves you money and multiplies output.",
  oldImage: "",
  oldTitle: "Manual / Old Method",
  oldDesc: "Labor intensive, slow, and expensive.",
  oldPoints: ["High dependency on manual labor.", "Inconsistent quality.", "Cannot operate during rain."],
  newImage: "",
  newTitle: "Ali Enterprises",
  newDesc: "Automated, fast, and high-profit.",
  newPoints: ["10x Production Speed.", "Hydraulic Pressure.", "Operates 24/7."],
  metrics: [
    { name: "Daily Production", old: "1,500 Bricks", new: "15,000+ Bricks" },
    { name: "Production Cost", old: "High", new: "Low" },
  ]
};

// A tiny 1x1 transparent PNG base64 to use as an instant placeholder
const PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO88OjRf/QA1wM2Hk7/EwAAAABJRU5ErkJggg==";

// --- Smart Icon Helper ---
const getIconForMetric = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("production") || n.includes("output")) return Factory;
  if (n.includes("labor") || n.includes("worker") || n.includes("manpower")) return Users;
  if (n.includes("power") || n.includes("electricity") || n.includes("consumption")) return Zap;
  if (n.includes("cost") || n.includes("price") || n.includes("profit") || n.includes("rupee")) return IndianRupee;
  if (n.includes("time") || n.includes("speed")) return Timer;
  if (n.includes("quality") || n.includes("finish")) return ShieldCheck;
  if (n.includes("maintenance")) return Settings;
  return TrendingUp; 
};

export default function ComparisonPage() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "site_content", "comparison_page");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData(docSnap.data() as ComparisonData);
        } else {
          setData(DEFAULT_DATA); 
        }
      } catch (error) {
        console.error("Error fetching comparison data:", error);
        setData(DEFAULT_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      // Changed to min-h-[80vh] to perfectly match loaded content height, preventing footer jump
      <div className="min-h-[80vh] bg-slate-50 pt-32 pb-20 flex justify-center items-center flex-col gap-4">
         <Loader2 className="animate-spin text-teal-600 w-10 h-10" />
         <p className="text-slate-400 font-medium text-sm">Loading Comparison Data...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-slate-50 pt-16 md:pt-24 pb-12 md:pb-20 overflow-hidden min-h-[80vh]">
      
      {/* --- Header --- */}
      <div className="container mx-auto px-4 text-center mb-10 md:mb-16">
        <motion.span 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-teal-600 font-bold uppercase tracking-widest text-[10px] md:text-xs bg-teal-50 px-3 py-1 rounded-full"
        >
          Why Upgrade?
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl lg:text-5xl font-extrabold text-slate-900 mt-4 mb-4 leading-tight"
        >
          {data.headerTitle}
        </motion.h1>
        <p className="text-slate-500 text-xs md:text-base max-w-2xl mx-auto leading-relaxed">
          {data.headerDesc}
        </p>
      </div>

      {/* --- Visual Battle Cards --- */}
      <div className="container mx-auto px-4 mb-16 md:mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 max-w-6xl mx-auto">
          
          {/* Old Way */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative group"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
            <div className="p-6 md:p-8 pb-0">
               <h3 className="text-lg md:text-2xl font-bold text-slate-700 flex items-center gap-2 mb-1">
                 <XCircle className="text-red-500 shrink-0" size={20} /> {data.oldTitle}
               </h3>
               <p className="text-slate-400 text-xs md:text-sm">{data.oldDesc}</p>
            </div>
            
            <div className="p-6 md:p-8 space-y-5">
               <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden grayscale opacity-90 group-hover:opacity-100 transition-opacity">
                  
                  {/* CSS Loading Skeleton */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-200 animate-pulse z-0">
                      <ImageIcon size={32} className="text-slate-300" />
                  </div>

                  {data.oldImage ? (
                    <Image 
                      src={data.oldImage} 
                      alt="Old Method"
                      fill
                      priority={true} // Start loading immediately
                      unoptimized={true} // Skip slow Next.js server optimization
                      decoding="async" // Decode in background thread
                      placeholder="blur"
                      blurDataURL={PLACEHOLDER_IMAGE}
                      className="object-cover relative z-10"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs z-10">No Image</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                     <span className="bg-black/60 text-white px-3 py-1.5 text-xs md:text-sm rounded-lg font-bold backdrop-blur-sm uppercase tracking-wide">The Past</span>
                  </div>
               </div>

               <ul className="space-y-2 md:space-y-3">
                  {data.oldPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 text-xs md:text-sm">
                      <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
               </ul>
            </div>
          </motion.div>

          {/* New Way (Winner) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-teal-900 rounded-3xl border border-teal-700 shadow-2xl overflow-hidden relative transform md:-translate-y-4 md:scale-105 z-10"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400"></div>
            <div className="p-6 md:p-8 pb-0">
               <h3 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 mb-1">
                 <CheckCircle2 className="text-amber-400 shrink-0" size={20} /> {data.newTitle}
               </h3>
               <p className="text-teal-200 text-xs md:text-sm">{data.newDesc}</p>
            </div>
            
            <div className="p-6 md:p-8 space-y-5">
               <div className="relative aspect-video bg-teal-800 rounded-xl overflow-hidden shadow-inner border border-teal-700/50">
                  
                  {/* CSS Loading Skeleton */}
                  <div className="absolute inset-0 flex items-center justify-center bg-teal-800 animate-pulse z-0">
                      <ImageIcon size={32} className="text-teal-700" />
                  </div>

                  {data.newImage ? (
                    <Image 
                      src={data.newImage} 
                      alt="Modern Machine"
                      fill
                      priority={true} // Start loading immediately
                      unoptimized={true} // Skip slow Next.js server optimization
                      decoding="async" // Decode in background thread
                      placeholder="blur"
                      blurDataURL={PLACEHOLDER_IMAGE}
                      className="object-cover relative z-10"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-teal-600 text-xs z-10">No Image</div>
                  )}
                  <div className="absolute top-3 right-3 z-20">
                     <span className="bg-amber-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">WINNER</span>
                  </div>
               </div>

               <ul className="space-y-2 md:space-y-3">
                  {data.newPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-teal-50 text-xs md:text-sm">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-semibold">{point}</span>
                    </li>
                  ))}
               </ul>
            </div>
          </motion.div>

        </div>
      </div>

      {/* --- Detailed Comparison Table (Optimized for Mobile) --- */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
           <div className="bg-slate-900 p-4 md:p-6 text-center">
              <h3 className="text-lg md:text-xl font-bold text-white">Performance Metrics</h3>
           </div>
           
           <div className="divide-y divide-slate-100">
              {data.metrics.map((feature, idx) => {
                const IconComponent = getIconForMetric(feature.name);
                
                return (
                  <div key={idx} className="hover:bg-slate-50 transition-colors">
                     
                     {/* --- Desktop View (Grid) --- */}
                     <div className="hidden md:grid grid-cols-12 h-full">
                        <div className="col-span-4 p-5 text-right flex flex-col justify-center border-r border-slate-100">
                           <span className="text-sm font-medium text-slate-500">{feature.old}</span>
                        </div>
                        <div className="col-span-4 p-5 flex flex-col items-center justify-center border-r border-slate-100 bg-slate-50/50">
                           <IconComponent className="w-5 h-5 mb-1 text-teal-600" />
                           <span className="text-xs font-bold uppercase text-slate-400 tracking-wider text-center">{feature.name}</span>
                        </div>
                        <div className="col-span-4 p-5 text-left flex flex-col justify-center relative overflow-hidden">
                           <span className="text-base font-bold text-teal-900 relative z-10">{feature.new}</span>
                           <div className="absolute inset-y-0 left-0 w-1 bg-amber-400"></div>
                        </div>
                     </div>

                     {/* --- Mobile View (Stacked) --- */}
                     <div className="md:hidden">
                        {/* Row Header */}
                        <div className="bg-slate-100/50 p-2.5 flex items-center justify-center gap-2 border-b border-slate-100">
                           <IconComponent size={14} className="text-teal-600" />
                           <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">{feature.name}</span>
                        </div>
                        {/* Data Split */}
                        <div className="grid grid-cols-2 divide-x divide-slate-100">
                           <div className="p-3 text-center bg-red-50/20">
                              <p className="text-[9px] text-red-400 font-bold mb-0.5 uppercase tracking-wider">Old Method</p>
                              <p className="text-xs font-medium text-slate-600 leading-tight">{feature.old}</p>
                           </div>
                           <div className="p-3 text-center bg-teal-50/20 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-400"></div>
                              <p className="text-[9px] text-teal-600 font-bold mb-0.5 uppercase tracking-wider">Ali Ent.</p>
                              <p className="text-xs font-bold text-teal-900 leading-tight">{feature.new}</p>
                           </div>
                        </div>
                     </div>

                  </div>
                );
              })}
           </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-8 text-center px-2">
           <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
             <Link href="/products" className="w-full sm:w-auto">
               <button className="w-full sm:w-auto px-6 py-3.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 transition-transform active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base">
                 Explore Machines <ArrowRight size={18} />
               </button>
             </Link>
           </div>
        </div>
      </div>

    </div>
  );
}