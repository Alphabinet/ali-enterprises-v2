"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase"; 
import { collection, getDocs } from "firebase/firestore";
import { 
  Search, 
  ArrowRight, 
  Factory,
  XCircle,
  PackageOpen,
  X,
  PhoneCall
} from "lucide-react";

// --- Types ---
interface Product {
  id: string;
  name: string;
  description: string;
  modelSeries: string; 
  images: string[];
  thumbnail: string;   
  features?: string[];
}

const MODELS = ["All", "ABP-Series (Auto)", "HP-Series (Hydraulic)", "Mixer-Pro", "Paver-X", "Industrial"];

export default function CorporateProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState("All");

  // Exit Intent / Popup State
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);

  // Fetch Data from Firebase
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        
        const fetchedProducts: Product[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description || "Industrial grade machinery designed for high output and reliability.",
            modelSeries: data.category || "Industrial", 
            thumbnail: data.thumbnail || (data.images && data.images.length > 0 ? data.images[0] : "/machines/default.png"),
            images: data.images || [],
            features: data.features || ["High Efficiency", "Low Maintenance", "ISO Certified"],
          };
        });
        
        setProducts(fetchedProducts);
      } catch (e) {
        console.error("Failed to load products from Firebase", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- 1. TIMER LOGIC (Popup after 20 seconds) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show if it hasn't been shown yet (e.g. by exit intent)
      if (!hasShownExitIntent) {
        setShowExitIntent(true);
        setHasShownExitIntent(true);
      }
    }, 20000); // 20000 milliseconds = 20 Seconds

    return () => clearTimeout(timer);
  }, [hasShownExitIntent]);

  // --- 2. EXIT INTENT LOGIC (Triggers when mouse leaves top) ---
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownExitIntent) {
        setShowExitIntent(true);
        setHasShownExitIntent(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShownExitIntent]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModel = selectedModel === "All" || 
                           p.modelSeries.toLowerCase().includes(selectedModel.toLowerCase()) || 
                           selectedModel.toLowerCase().includes(p.modelSeries.toLowerCase());
      return matchesSearch && matchesModel;
    });
  }, [products, searchTerm, selectedModel]);

  // Clear filters handler
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedModel("All");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      {/* --- POPUP MODAL --- */}
      <AnimatePresence>
        {showExitIntent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowExitIntent(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                  <PackageOpen size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Wait! Don't Miss Out</h2>
                <p className="text-slate-600 mb-6">
                  Before you go, would you like to speak with an expert about our customized machinery solutions?
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <a href="/contactus" className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-teal-700 transition flex items-center justify-center gap-2">
                    <PhoneCall size={18} /> Get Free Quote
                  </a>
                  <button 
                    onClick={() => setShowExitIntent(false)}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 px-6 rounded-xl font-bold hover:bg-slate-200 transition"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER & SEARCH SECTION (Scrollable, NOT Sticky) --- */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 shadow-sm">
        <div className="container mx-auto px-4 lg:max-w-7xl">
           
           {/* Title */}
           <div className="mb-4">
             <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
               Machines <span className="text-teal-600">Catalog</span>
             </h1>
           </div>

           {/* Search & Filters Bar (Static) */}
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

             {/* Search Input */}
             <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search machines..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl text-sm font-medium transition-all outline-none shadow-inner focus:shadow-md"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                     <XCircle size={16} fill="currentColor" className="bg-white rounded-full" />
                  </button>
                )}
             </div>
           </div>

        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="container mx-auto px-4 lg:max-w-7xl py-10">
         
         {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="bg-white rounded-3xl h-[450px] animate-pulse border border-slate-100 p-4">
                  <div className="w-full h-48 bg-slate-200 rounded-2xl mb-4"></div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded mb-6"></div>
                  <div className="h-20 bg-slate-100 rounded mb-4"></div>
               </div>
             ))}
           </div>
         ) : filteredProducts.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="bg-slate-100 p-6 rounded-full mb-4">
                <PackageOpen size={48} className="text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-800">No matching machines found</h3>
             <p className="text-slate-500 max-w-md mt-2 mb-6">
               We couldn't find "{searchTerm}" in the {selectedModel} category.
             </p>
             <button 
               onClick={clearFilters}
               className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors shadow-lg"
             >
               Clear All Filters
             </button>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode='popLayout'>
                 {filteredProducts.map((product, index) => (
                   <ProductCard 
                     key={product.id} 
                     product={product} 
                     index={index} 
                   />
                 ))}
              </AnimatePresence>
           </div>
         )}

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// PRODUCT CARD
// ----------------------------------------------------------------------
function ProductCard({ product, index }: { product: Product, index: number }) {
  const previewFeatures = product.features?.slice(0, 3) || [];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-[2rem] border border-slate-200 hover:border-teal-200 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden h-full"
    >
      
      {/* 1. Image Area */}
      <div className="relative h-60 p-6 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center overflow-hidden">
         {/* Category Badge */}
         <div className="absolute top-5 left-5 z-10">
            <span className="bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest text-slate-800 px-3 py-1 rounded-md shadow-sm border border-slate-100">
               {product.modelSeries}
            </span>
         </div>
         
         <Image 
           src={product.thumbnail} 
           alt={product.name}
           fill
           priority={index < 6}
           className="object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
         />

         {/* Overlay Button (Desktop) */}
         <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-300 flex items-center justify-center">
            <Link href={`/products/${product.id}`}>
               <div className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-white text-teal-700 px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 transform hover:scale-105">
                  View Details <ArrowRight size={16} />
               </div>
            </Link>
         </div>
      </div>

      {/* 2. Content Area */}
      <div className="p-6 pt-2 flex flex-col flex-1">
         <div className="mb-4">
            <Link href={`/products/${product.id}`} className="hover:text-teal-600 transition-colors">
               <h3 className="text-xl font-extrabold text-slate-900 line-clamp-1" title={product.name}>
                 {product.name}
               </h3>
            </Link>
            <p className="text-sm text-slate-500 mt-2 line-clamp-2 h-10">
               {product.description}
            </p>
         </div>

         {/* Features List (Compact) */}
         <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="space-y-2">
               {previewFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Factory size={12} className="text-teal-500" />
                      <span className="truncate">{feature}</span>
                  </div>
               ))}
            </div>
         </div>
         
         {/* Mobile Only Button */}
         <div className="mt-4 md:hidden">
            <Link href={`/products/${product.id}`} className="block w-full text-center py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">
               View Specifications
            </Link>
         </div>

      </div>
    </motion.div>
  );
}