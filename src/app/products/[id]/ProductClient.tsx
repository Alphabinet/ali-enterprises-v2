"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Factory, Zap, ShieldCheck, CheckCircle2, 
  MessageCircle, FileDown, PhoneCall, FileText, ChevronRight, ChevronLeft, Loader2,
  Hammer, Wrench, Settings, Activity, PlayCircle
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ROICalculator from "@/components/ROICalculator";
import Link from "next/link";

// Types
export interface Product {
  id: string;
  name: string;
  thumbnail: string;
  images: string[];
  description: string;
  category: string;
  features: string[];
  price: string;
  specs: Record<string, string | string[]>;
}

export default function ProductClient({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Mobile Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Combine thumbnail and images for gallery
  const displayImages = [product.thumbnail, ...(product.images || [])].filter(Boolean);

  const isVideo = (url: string) => url?.match(/\.(mp4|webm|ogg)$/i) || url?.includes("video");

  // --- PRELOAD LOGIC (THE FIX) ---
  // Calculate next and previous indices to preload them
  const nextIndex = (activeImage + 1) % displayImages.length;
  const prevIndex = (activeImage - 1 + displayImages.length) % displayImages.length;

  // --- SLIDER CONTROLS ---
  const handleNext = useCallback(() => {
    setActiveImage((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const handlePrev = useCallback(() => {
    setActiveImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  // --- SWIPE HANDLERS ---
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  // --- PDF GENERATOR LOGIC ---
  const getBase64ImageFromUrl = async (imageUrl: string) => {
    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      const blob = await res.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        const startTimeout = setTimeout(() => reject("Timeout"), 5000); // 5s timeout
        reader.onloadend = () => {
            clearTimeout(startTimeout);
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return null;
    }
  };

  const handleDownloadBrochure = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      
      // Branding Header
      doc.setFillColor(13, 148, 136); 
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("ALI ENTERPRISES", margin, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Industrial Machinery Manufacturers & Exporters", margin, 28);
      doc.text("www.alienterprises.in  |  +91 97563 00040", margin, 34);

      // Product Title
      let yPos = 55;
      doc.setTextColor(13, 148, 136);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(product.category.toUpperCase(), margin, yPos);
      
      yPos += 7;
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text(product.name, margin, yPos);

      // Image & Highlights
      yPos += 10;
      const imageWidth = 80;
      const imageHeight = 60;

      if (product.thumbnail) {
        const imgData = await getBase64ImageFromUrl(product.thumbnail);
        if (imgData) {
          doc.addImage(imgData, 'JPEG', margin, yPos, imageWidth, imageHeight, '', 'FAST');
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, yPos, imageWidth, imageHeight);
        }
      }

      const textStartX = margin + imageWidth + 10;
      let textY = yPos + 5;
      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136);
      doc.text("Key Highlights:", textStartX, textY);
      textY += 8;
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      const features = product.features.length > 0 ? product.features : ["High Efficiency", "Durable Build"];
      features.slice(0, 6).forEach((feature) => {
        doc.text(`•  ${feature}`, textStartX, textY);
        textY += 7;
      });

      yPos += imageHeight + 15;

      // Description
      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136);
      doc.setFont("helvetica", "bold");
      doc.text("Product Overview", margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(product.description || "No description.", pageWidth - (margin * 2));
      doc.text(descLines, margin, yPos);
      yPos += (descLines.length * 5) + 10;

      // Specs
      const tableRows = Object.entries(product.specs || {}).map(([key, value]) => {
         const val = Array.isArray(value) ? value.join(", ") : value;
         return [key, val];
      });

      if (tableRows.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Specification', 'Details']],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [13, 148, 136] },
          margin: { left: margin, right: margin }
        });
      }

      // Footer
      const footerY = pageHeight - 20;
      doc.setFillColor(241, 245, 249);
      doc.rect(0, footerY - 5, pageWidth, 25, 'F');
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.setFont("helvetica", "bold");
      doc.text("Contact: +91 97563 00040", margin, footerY + 11);

      doc.save(`${product.name.replace(/\s+/g, '_')}_Brochure.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF. Please check your internet connection.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getWhatsAppLink = (type: 'price' | 'expert') => {
    const link = `https://alienterprises.in/products/${product.id}`;
    const text = type === 'price' 
      ? `Hi Ali Enterprises, I want the *Best Price* for *${product.name}*.\nLink: ${link}`
      : `Hello, I need technical expert advice for *${product.name}*.\nLink: ${link}`;
    return `https://wa.me/919756300040?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-20 font-sans">
      
      {/* --- HIDDEN PRELOADER (Instant Loading Fix) --- */}
      {/* This renders invisible images for Next and Previous slides so the browser fetches them NOW */}
      <div className="hidden">
        {!isVideo(displayImages[nextIndex]) && (
            <Image src={displayImages[nextIndex]} alt="preload-next" width={800} height={800} priority />
        )}
        {!isVideo(displayImages[prevIndex]) && (
            <Image src={displayImages[prevIndex]} alt="preload-prev" width={800} height={800} priority />
        )}
      </div>

      {/* Top Banner */}
      <div className="h-40 lg:h-64 bg-slate-900 absolute top-0 left-0 w-full z-0">
        <div className="absolute inset-0 bg-teal-900/20 opacity-30"></div>
      </div>

      <motion.div
        className="container mx-auto px-4 relative z-10 pt-4 lg:pt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-slate-300 text-[10px] sm:text-xs lg:text-sm mb-4 lg:mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-teal-400 truncate max-w-[150px] sm:max-w-xs font-semibold">{product.name}</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 mb-8 lg:mb-12">
          
          {/* --- LEFT: GALLERY SECTION --- */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            
            {/* Main Image Viewport with Swipe */}
            <div 
              className="rounded-xl shadow-2xl overflow-hidden border bg-white aspect-square lg:aspect-[4/3] relative group select-none touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Changed mode to popLayout for faster transitions */}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }} // Faster transition (was 0.3)
                  className="w-full h-full absolute inset-0"
                >
                  {isVideo(displayImages[activeImage]) ? (
                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                        <video 
                          src={displayImages[activeImage]} 
                          controls className="w-full h-full object-contain" autoPlay muted loop playsInline
                        />
                    </div>
                  ) : (
                    <Image
                      src={displayImages[activeImage]}
                      alt={`${product.name} view ${activeImage + 1}`}
                      fill
                      className="object-contain"
                      priority={true} // Always prioritize the active one
                      sizes="(max-width: 768px) 100vw, 70vw"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Counter Badge */}
              <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm z-10 pointer-events-none">
                 {activeImage + 1} / {displayImages.length}
              </div>

              {/* Mobile Dots Indicator */}
              <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5 z-10 lg:hidden">
                 {displayImages.map((_, idx) => (
                   <div 
                     key={idx} 
                     className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? 'w-5 bg-teal-500' : 'w-1.5 bg-slate-300/80'}`}
                   />
                 ))}
              </div>

              {/* Slide Controls */}
              {displayImages.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-95 lg:opacity-0 lg:group-hover:opacity-100 z-20 hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-95 lg:opacity-0 lg:group-hover:opacity-100 z-20 hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="relative group/thumbs hidden lg:block">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
                <div className="flex gap-2 overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth">
                  {displayImages.map((url, index) => (
                    <button
                      key={index}
                      className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all transform ${
                        activeImage === index 
                          ? 'border-teal-600 ring-2 ring-teal-600/20 scale-105' 
                          : 'border-slate-200 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                      }`}
                      onClick={() => setActiveImage(index)}
                    >
                      {!isVideo(url) ? (
                          <Image src={url} alt="thumbnail" fill className="object-cover" sizes="100px" />
                      ) : (
                          <div className="bg-slate-900 w-full h-full flex items-center justify-center text-white"><PlayCircle size={20} /></div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
              </div>
            )}
          </div>

          {/* --- RIGHT: INFO SECTION --- */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-5 lg:p-8 flex flex-col h-full sticky top-24">
               
               {/* Header Badges */}
               <div className="flex justify-between items-start mb-4">
                 <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] lg:text-xs font-bold uppercase rounded-md tracking-wider">
                   {product.category}
                 </span>
                 <span className="flex items-center gap-1.5 text-green-700 text-[10px] lg:text-xs font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-100 animate-pulse-subtle">
                   <CheckCircle2 size={12} /> In Stock
                 </span>
               </div>
               
               <h1 className="text-xl lg:text-3xl font-extrabold text-slate-900 mb-2 leading-tight bg-slate-50 rounded-xl p-2">{product.name}</h1>

               {/* --- HIGH CONVERSION CTA BUTTON --- */}
               <a href={getWhatsAppLink('price')} target="_blank" className="block group mb-4 relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="absolute inset-0 opacity-10"></div>
                  <div className="relative p-3 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-md lg:text-2xl font-black text-white flex items-center gap-1">
                          Click here to Request Price <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                        </span>
                    </div>
                  </div>
               </a>

               <p className="text-slate-600 text-xs lg:text-sm leading-relaxed mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                 {product.description}
               </p>

               {/* Features (Compact Grid) */}
               <div className="grid grid-cols-4 md:grid-cols-4 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-700 bg-white p-2 rounded">
                    <Factory size={14} className="text-teal-600 shrink-0" /> High Output
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-700 bg-white p-2 rounded">
                    <Zap size={14} className="text-amber-500 shrink-0" /> Power Saver
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-700 bg-white p-2 rounded">
                    <ShieldCheck size={14} className="text-blue-600 shrink-0" /> 1 Year Warranty
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-700 bg-white p-2 rounded">
                    <CheckCircle2 size={14} className="text-green-600 shrink-0" /> ISO Certified
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-700 bg-white p-2 rounded">
                    <Hammer size={14} className="text-slate-600 shrink-0" /> Heavy Duty
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-700 bg-white p-2 rounded">
                    <Wrench size={14} className="text-orange-500 shrink-0" /> Low Maintenance
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-700 bg-white p-2 rounded">
                    <Settings size={14} className="text-indigo-500 shrink-0" /> Easy Operation
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-700 bg-white p-2 rounded">
                    <Activity size={14} className="text-red-500 shrink-0" /> Vibration Tech
                  </div>
               </div>

               {/* Secondary Actions */}
               <div className="grid grid-cols-2 gap-3 mt-auto">
                   <button 
                      onClick={handleDownloadBrochure} 
                      disabled={isGeneratingPdf}
                      className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 hover:text-teal-600 text-xs lg:text-sm transition-all shadow-sm active:scale-95"
                   >
                      {isGeneratingPdf ? <Loader2 className="animate-spin" size={16}/> : <FileDown size={16} />} Brochure
                   </button>
                   <a href={getWhatsAppLink('expert')} target="_blank" className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-lg hover:bg-amber-200 text-xs lg:text-sm transition-all shadow-sm active:scale-95">
                      <PhoneCall size={16} /> Expert Call
                   </a>
               </div>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="max-w-8xl mx-auto mb-10">
           <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
             <div className="bg-slate-900 px-5 py-3 lg:px-6 lg:py-4 border-b-4 border-teal-400 flex justify-between items-center">
                <h3 className="text-sm lg:text-lg font-bold text-white uppercase flex items-center gap-2 tracking-wide">
                   <FileText size={18} className="text-teal-400" /> Technical Data
                </h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-xs lg:text-sm text-left">
                   <tbody className="divide-y divide-gray-100">
                      {Object.entries(product.specs || {}).map(([key, value], idx) => (
                         <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            <td className="w-1/3 px-4 py-3 lg:px-6 lg:py-4 font-bold text-slate-700 uppercase tracking-wide border-r border-slate-100">{key}</td>
                            <td className="px-4 py-3 lg:px-6 lg:py-4 text-slate-600 font-medium">
                               {Array.isArray(value) ? value.join(", ") : value}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           </div>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-4xl mx-auto mb-24">
           <div className="text-center mb-6 lg:mb-8">
             <h2 className="text-xl lg:text-3xl font-extrabold text-slate-900">Profit Calculator</h2>
             <p className="text-slate-500 text-xs lg:text-sm mt-1">Estimate your daily earnings with this machine.</p>
           </div>
           <ROICalculator />
        </div>
      </motion.div>

      {/* STICKY MOBILE CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 z-40 lg:hidden flex gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] pb-safe">
        <a href="tel:+919756300040" className="flex-1 bg-slate-100 text-slate-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-200 active:bg-slate-200 transition-colors text-sm">
            <PhoneCall size={18} /> Call Now
        </a>
        <a href={getWhatsAppLink('price')} className="flex-1 bg-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg active:bg-teal-700 transition-colors text-sm">
            <MessageCircle size={18} /> Get Price
        </a>
      </div>
    </div>
  );
}