"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Search, Loader2, Navigation } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// --- Dynamic Map Import ---
const ServiceMap = dynamic(() => import("@/components/ServiceMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] lg:h-[600px] bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 font-bold">
      Loading Map...
    </div>
  ),
});

interface ServiceCenter {
  id: string;
  city: string;
  address: string;
  coordinates: [number, number];
  phone: string;
}

export default function ServiceCentersPage() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch from Firestore
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const q = query(collection(db, "service_centers"), orderBy("city"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceCenter[];
        setCenters(data);
      } catch (e) {
        console.error("Error fetching map data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  const filteredCenters = centers.filter(c => 
    c.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
         <Loader2 className="animate-spin text-teal-600 mb-4" size={40} />
         <p className="text-slate-500 font-medium">Locating Centers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10 lg:pt-24 lg:pb-20">
      
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-200/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-6xl font-extrabold text-slate-900 mb-3 lg:mb-6"
          >
            Service <span className="text-teal-600">Centers</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm lg:text-lg text-slate-600"
          >
            Find authorized support near you.
          </motion.p>
        </div>

        {/* Layout: Flex Reverse on Mobile (Map Top, List Bottom) */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* --- LEFT (Desktop) / BOTTOM (Mobile): List & Search --- */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:col-span-4 space-y-4"
          >
            {/* Search Bar */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 sticky top-20 z-20">
              <Search className="text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search city..." 
                className="w-full bg-transparent outline-none text-slate-700 text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[50vh] lg:max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredCenters.map((center) => (
                <div
                  key={center.id}
                  className={`w-full bg-white p-4 rounded-xl transition-all duration-300 border-2 group relative overflow-hidden ${
                    selectedCenter?.city === center.city
                      ? "border-teal-600 shadow-md"
                      : "border-transparent hover:border-teal-100 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    {/* Click to Select on Map */}
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setSelectedCenter(center);
                        // Scroll to map on mobile
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <h3 className="font-bold text-slate-800 text-base mb-1">
                        {center.city}
                      </h3>
                      <p className="text-xs text-slate-500 mb-2 leading-relaxed line-clamp-2">
                        {center.address}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={10} /> 9AM - 7PM</span>
                      </div>
                    </div>

                    {/* Direct Call Button */}
                    <a 
                      href={`tel:${center.phone}`}
                      className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center shadow-sm"
                      title="Call Now"
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                </div>
              ))}
              
              {filteredCenters.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No centers found</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* --- RIGHT (Desktop) / TOP (Mobile): Map --- */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:col-span-8 lg:sticky lg:top-24"
          >
            <div className="bg-white p-2 rounded-2xl lg:rounded-[2rem] shadow-xl shadow-slate-200/50">
              {/* FIXED: Passing selectedCoordinates instead of selectedCenter */}
              <ServiceMap 
                centers={centers} 
                selectedCoordinates={selectedCenter ? selectedCenter.coordinates : null} 
              />
            </div>
            
            {/* Info Card Overlay (Visible when a center is selected) */}
            {selectedCenter && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-teal-900 text-white p-4 lg:p-6 rounded-xl shadow-lg flex flex-row items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-sm lg:text-xl flex items-center gap-2">
                    <Navigation size={16} className="text-teal-400"/> 
                    {selectedCenter.city}
                  </h4>
                  <p className="text-teal-200 text-xs hidden lg:block">Authorized Service Center</p>
                </div>
                <a 
                  href={`tel:${selectedCenter.phone}`} 
                  className="px-4 py-2 lg:px-6 lg:py-3 bg-white text-teal-900 font-bold text-xs lg:text-sm rounded-lg hover:bg-teal-50 transition-colors flex items-center gap-2"
                >
                  <Phone size={14} className="lg:w-4 lg:h-4" /> 
                  <span className="hidden lg:inline">Call Now: {selectedCenter.phone}</span>
                  <span className="lg:hidden">Call</span>
                </a>
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}