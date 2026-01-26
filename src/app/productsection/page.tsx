"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Loader2,
  PackageSearch,
  LucideCheckCircle2
} from "lucide-react";

// --- Types ---
interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
  features: string[];
  specifications?: Record<string, string>;
}

const ProductSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoSlidingPaused, setIsAutoSlidingPaused] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Mobile Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const swipeThreshold = 50;

  const DEFAULT_FEATURES = ["Durable Construction", "Energy Efficient", "Easy Maintenance"];

  // --- Fetch Data from Firebase ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productsRef = collection(db, "products");
        const q = query(productsRef, orderBy("createdAt", "desc"), limit(10)); 
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
           setProducts([]);
           return;
        }

        const transformedProducts: Product[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          
          const displayImage = data.thumbnail 
            ? data.thumbnail 
            : (data.images && data.images.length > 0 ? data.images[0] : "/machines/default.png");

          const finalFeatures = data.features && data.features.length > 0
            ? data.features
            : DEFAULT_FEATURES;

          return {
            id: doc.id,
            name: data.name || "Unknown Product",
            image: displayImage,
            description: data.description || "High-quality industrial machinery designed for optimal performance.",
            category: data.category || "Industrial",
            features: finalFeatures,
            specifications: data.specs || {},
          };
        });

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Unable to load products. Please check connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Auto Slide Logic ---
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isAutoSlidingPaused && products.length > 0) {
      const timer = setInterval(() => {
        setCurrentProduct((prev) => (prev + 1) % products.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [currentProduct, isAutoSlidingPaused, products.length]);

  const allProducts = products;

  // --- Controls ---
  const handleManualChange = useCallback((index: number) => {
    setCurrentProduct(index);
    setIsAutoSlidingPaused(true);
    setImageLoading(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsAutoSlidingPaused(false), 10000);
  }, []);

  const goToNext = useCallback(() => {
    if (allProducts.length > 0) {
      handleManualChange((currentProduct + 1) % allProducts.length);
    }
  }, [currentProduct, allProducts.length, handleManualChange]);

  const goToPrev = useCallback(() => {
    if (allProducts.length > 0) {
      handleManualChange((currentProduct - 1 + allProducts.length) % allProducts.length);
    }
  }, [currentProduct, allProducts.length, handleManualChange]);

  // --- Swipe Handlers ---
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null) e.preventDefault();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    if (e.changedTouches.length === 1) {
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;
      if (diff > swipeThreshold) goToNext();
      else if (diff < -swipeThreshold) goToPrev();
    }
    setTouchStart(null);
  };

  const handleMouseEnter = () => {
    setIsAutoSlidingPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleMouseLeave = () => {
    resumeTimerRef.current = setTimeout(() => setIsAutoSlidingPaused(false), 4000);
  };

  const currentProductData = allProducts[currentProduct];

  // --- Loading / Error States ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 min-h-[500px] bg-slate-50 relative z-10">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-lg">Loading Catalog...</p>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px] bg-slate-50 relative z-10">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
          <PackageSearch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {error ? "Catalog Unavailable" : "No Products Found"}
          </h3>
          <p className="text-slate-500 mb-6">
            {error || "We are updating our inventory. Please check back soon."}
          </p>
          <div className="flex gap-4 justify-center">
             <button onClick={() => window.location.reload()} className="px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors font-medium">
               Refresh Page
             </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DESKTOP: Left Side (Visuals)
  // ==========================================
  const DesktopMainProductDisplay = () => (
    <div 
      className="w-full h-full"
      ref={sliderRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative rounded-[2rem] shadow-xl overflow-hidden bg-white border border-slate-200 h-full flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProductData?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col h-full"
          >
            {/* Image Area - Changed to bg-white and object-contain */}
            <div className="relative w-full h-[50%] bg-white flex-shrink-0 p-4">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                   <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                </div>
              )}
              <Image
                src={currentProductData?.image || "/machines/default.png"}
                alt={currentProductData?.name}
                className="object-contain" // Ensures image is original size within container
                fill
                quality={100}
                priority
                onLoad={() => setImageLoading(false)}
              />

              {/* Tag */}
              <div className="absolute top-6 left-6 z-20">
                <span className="bg-white/95 backdrop-blur-md text-teal-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-teal-100">
                  {currentProductData?.category}
                </span>
              </div>

              {/* Controls */}
              <div className="absolute bottom-6 right-6 flex gap-3 z-20">
                 <button onClick={goToPrev} className="p-3 bg-white/90 hover:bg-white text-teal-800 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 border border-slate-100">
                    <ChevronLeft size={24} />
                 </button>
                 <button onClick={goToNext} className="p-3 bg-white/90 hover:bg-white text-teal-800 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 border border-slate-100">
                    <ChevronRight size={24} />
                 </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8 bg-white flex flex-col h-[50%] justify-between overflow-y-auto">
              <div>
                <motion.h3 
                  className="text-3xl font-bold text-slate-900 mb-2 leading-tight bg-slate-100 p-2 rounded-t-xl"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {currentProductData?.name}
                </motion.h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 lg:line-clamp-4 bg-slate-100 rounded-b-xl p-2">
                  {currentProductData?.description}
                </p>

                {/* Desktop Features Grid */}
                {currentProductData?.features && (
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    {currentProductData.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <span className="text-slate-700 font-medium text-sm truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link href={`/products/${currentProductData?.id}`} passHref className="w-fit mt-4">
                <button className="px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                  Click Here to View Full Details of Product <CheckCircle2 size={18} />
                </button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  // ==========================================
  // DESKTOP: Right Side (Catalog List)
  // ==========================================
  const DesktopProductCatalog = () => (
    <div className="bg-white rounded-[2rem] shadow-lg border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 flex-shrink-0">
        <h3 className="text-xl font-bold text-slate-800">Product List</h3>
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
          {allProducts.length} items
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto flex-grow pr-2 custom-scrollbar">
        {allProducts.map((product, index) => (
          <button
            key={product.id}
            onClick={() => handleManualChange(index)}
            className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between group flex-shrink-0 ${
              currentProduct === index
                ? "bg-teal-600 text-white shadow-md transform scale-[1.02]"
                : "bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-700 border border-transparent hover:border-teal-100"
            }`}
          >
            <span className="font-semibold text-sm lg:text-base truncate pr-4">
              {product.name}
            </span>
            {currentProduct === index && (
              <ChevronRight size={18} className="text-teal-200" />
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
          <Link href="/products" className="block text-center text-teal-600 font-bold hover:underline text-sm">
            View Entire Catalog
          </Link>
      </div>
    </div>
  );

  const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );

  return (
    <>
      <Head>
        <title>Industrial Solutions | Ali Enterprises</title>
        <meta name="description" content="Premium industrial machinery and solutions." />
      </Head>

      <section className="bg-slate-50 py-12 lg:py-20 relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          
          <div className="text-center mb-4 lg:mb-16">
            <span className="text-teal-500 font-bold uppercase tracking-widest text-xs block">Our Machinery</span>
            <h2 className="text-2xl lg:text-5xl font-bold text-slate-900">
              Product <span className="text-teal-600">Catalog</span>
            </h2>
          </div>

          <div className="hidden lg:grid grid-cols-12 gap-8 h-[800px]">
            <div className="col-span-8 h-full">
              <DesktopMainProductDisplay />
            </div>
            <div className="col-span-4 h-full">
              <DesktopProductCatalog />
            </div>
          </div>

          {/* ==========================================
              MOBILE VIEW
              ========================================== */}
          <div className="lg:hidden w-full max-w-md mx-auto">
              <div 
               className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200"
               onTouchStart={onTouchStart}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEnd}
              >
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentProductData?.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Mobile Image - Changed to bg-white and object-contain */}
                      <div className="relative h-[280px] bg-white p-2">
                        {imageLoading && <div className="absolute inset-0 bg-white z-10 animate-pulse" />}
                        <Image
                          src={currentProductData?.image || "/machines/default.png"}
                          alt={currentProductData?.name}
                          className="object-contain" // Ensures image is original size
                          fill
                          priority
                          onLoad={() => setImageLoading(false)}
                        />
                        {/* Gradient slightly darker for text contrast if needed, but keeping image clean */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                        {/* Mobile Controls */}
                        <button 
                          onClick={goToPrev}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-2 rounded-full text-teal-800 border border-white/40 active:scale-95"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button 
                          onClick={goToNext}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-2 rounded-full text-teal-800 border border-white/40 active:scale-95"
                        >
                          <ChevronRight size={24} />
                        </button>

                        <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5">
                           {allProducts.map((_, idx) => (
                             <div key={idx} className={`h-1.5 rounded-full transition-all ${currentProduct === idx ? 'w-6 bg-teal-600' : 'w-1.5 bg-slate-300'}`} />
                           ))}
                        </div>
                      </div>

                      {/* Mobile Content */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                            {currentProductData?.name}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                           {currentProductData?.features.slice(0, 2).map((feature, i) => (
                             <span key={i} className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1 rounded-md border border-teal-100">
                               {feature}
                             </span>
                           ))}
                        </div>

                        <p className="text-slate-500 text-xs line-clamp-2 mb-4">
                          {currentProductData?.description}
                        </p>

                        <Link href={`/products/${currentProductData?.id}`} passHref>
                          <button className="w-full py-3.5 bg-teal-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2">
                             View Details <ArrowRightIcon />
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
             </div>
             
             <div className="mt-3 text-center">
                <Link href="/products" className="inline-block px-8 py-3 text-teal-600 font-semibold underline underline-offset-4">
                  View All Machinery ({allProducts.length})
                </Link>
             </div>
          </div>

        </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
};

export default ProductSection;