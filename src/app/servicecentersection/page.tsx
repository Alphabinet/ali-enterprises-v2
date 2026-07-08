"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic"; // Crucial for performance
import { motion } from "framer-motion";
import { MapPin, Loader2, Phone } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// --- Dynamic Imports for Map (Saves ~100KB on initial load) ---
// We import the map logic only when the user actually sees/needs it.
const MapWithNoSSR = dynamic(() => import("@/components/ServiceMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
      <Loader2 className="animate-spin" />
    </div>
  )
});

// --- Types ---
export interface ServiceCenter {
  id: string;
  city: string;
  address: string;
  coordinates: [number, number];
  phone: string;
}

const ServiceCentersSection = () => {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const q = query(collection(db, "service_centers"), orderBy("city"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        })) as ServiceCenter[];
        
        setCenters(data);
      } catch (e) {
        console.error("Error fetching map data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  const handleCityClick = useCallback((center: ServiceCenter) => {
    setSelectedCenter(center);
  }, []);

  return (
    <section id="service-centers" className="py-12 lg:py-16 relative overflow-hidden">
      
      {/* Background Decor (Simplified for Performance) */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-100/30 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10 lg:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-teal-600 mb-2"
          >
            <span className="w-6 h-0.5 bg-teal-600 rounded-full"></span>
            <span className="text-xs font-bold uppercase tracking-widest">Pan India Support</span>
            <span className="w-6 h-0.5 bg-teal-600 rounded-full"></span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-3"
          >
            Service <span className="text-teal-600">Centers</span>
          </motion.h2>
          
          <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
            Authorized maintenance and spare parts available at strategic locations across India.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left: City List (Compact Grid) */}
          <div className="lg:col-span-4 order-2 lg:order-1">
             {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-teal-600" /></div>
             ) : (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 lg:p-6"
                >
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Select Location</h3>
                   
                   <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[300px] lg:max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                      {centers.map((center) => (
                        <button
                          key={center.id}
                          onClick={() => handleCityClick(center)}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                            selectedCenter?.id === center.id
                              ? "bg-teal-50 border-teal-200 ring-1 ring-teal-200"
                              : "bg-slate-50 border-transparent hover:bg-white hover:shadow-sm border hover:border-slate-200"
                          }`}
                          aria-label={`View service center in ${center.city}`}
                        >
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              selectedCenter?.id === center.id ? "bg-teal-600 text-white" : "bg-white text-teal-600 border border-teal-100 group-hover:border-teal-300"
                           }`}>
                              <MapPin size={14} />
                           </div>
                           <div className="min-w-0">
                              <p className={`text-sm font-bold truncate ${selectedCenter?.id === center.id ? "text-teal-900" : "text-slate-700"}`}>
                                {center.city}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">{center.phone}</p>
                           </div>
                        </button>
                      ))}
                   </div>
                </motion.div>
             )}
          </div>

          {/* Right: Map (Optimized) */}
          <motion.div 
            className="lg:col-span-8 order-1 lg:order-2 h-[350px] lg:h-[500px] w-full relative z-0"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
             <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-slate-200">
                <MapWithNoSSR centers={centers} selectedCoordinates={selectedCenter ? selectedCenter.coordinates : null} />
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ServiceCentersSection;