"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase"; 
import { collection, getDocs } from "firebase/firestore";
import { 
  Search, 
  ArrowRight, 
  Factory,
  XCircle,
  PackageOpen,
  ImageIcon
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

// A tiny 1x1 transparent PNG base64 to use as an instant placeholder
const PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO88OjRf/QA1wM2Hk7/EwAAAABJRU5ErkJggg==";

export default function CorporateProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState("All");

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedModel("All");
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-800">
      
      {/* --- HEADER & SEARCH SECTION --- */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 shadow-sm">
        <div className="container mx-auto px-4 lg:max-w-7xl">
           <div className="mb-4">
             <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
               Machines <span className="text-teal-600">Catalog</span>
             </h1>
           </div>
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
      {/* min-h-[70vh] prevents layout shift by forcing content area to take up most of the viewport while loading */}
      <div className="container mx-auto px-4 lg:max-w-7xl py-10 min-h-[70vh]">
         
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
           <div className="flex flex-col items-center justify-center py-20 text-center h-full">
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
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                />
              ))}
           </div>
         )}

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// PRODUCT CARD - STRIPPED OF ANIMATIONS FOR RAW SPEED
// ----------------------------------------------------------------------
function ProductCard({ product, index }: { product: Product, index: number }) {
  const previewFeatures = product.features?.slice(0, 3) || [];

  return (
    // Card is now the clickable link, reducing DOM complexity
    <Link href={`/products/${product.id}`} className="group relative bg-white rounded-[2rem] border border-slate-200 hover:border-teal-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full cursor-pointer">
      
      {/* 1. Image Area */}
      <div className="relative h-60 p-6 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center overflow-hidden">
         
         <div className="absolute top-5 left-5 z-20">
            <span className="bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest text-slate-800 px-3 py-1 rounded-md shadow-sm border border-slate-100">
               {product.modelSeries}
            </span>
         </div>

         {/* Highly Optimized Next.js Image */}
         <Image 
           src={product.thumbnail} 
           alt={product.name}
           fill
           priority={index < 6} 
           quality={60} 
           decoding="async"
           placeholder="blur"
           blurDataURL={PLACEHOLDER_IMAGE}
           className="object-contain z-10 transition-transform duration-500 group-hover:scale-105 drop-shadow-sm p-4"
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
         />
      </div>

      {/* 2. Content Area */}
      <div className="p-6 pt-2 flex flex-col flex-1 relative z-30 bg-white border-t border-slate-50">
         <div className="mb-4">
            <h3 className="text-xl font-extrabold text-slate-900 line-clamp-1 group-hover:text-teal-600 transition-colors" title={product.name}>
              {product.name}
            </h3>
            <p className="text-sm text-slate-500 mt-2 line-clamp-2 h-10">
               {product.description}
            </p>
         </div>

         <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="space-y-1.5 flex-1 pr-4">
               {previewFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                      <Factory size={10} className="text-teal-500 shrink-0" />
                      <span className="truncate">{feature}</span>
                  </div>
               ))}
            </div>
            
            {/* Desktop visual indicator */}
            <div className="hidden md:flex w-8 h-8 rounded-full bg-slate-50 items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0">
               <ArrowRight size={16} />
            </div>
         </div>
         
         <div className="mt-5 md:hidden">
            <div className="w-full text-center py-3 bg-slate-100 text-teal-700 rounded-xl font-bold text-sm group-hover:bg-teal-600 group-hover:text-white transition-colors">
               View Specifications
            </div>
         </div>

      </div>
    </Link>
  );
}