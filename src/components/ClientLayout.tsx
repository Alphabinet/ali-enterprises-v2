"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic"; 
import Script from "next/script";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; 
import { Analytics } from "@vercel/analytics/react"; 
import { motion, AnimatePresence, Variants } from "framer-motion"; 
import { Phone, MessageCircle, MessageSquareText, X } from "lucide-react"; 

// --- ChatBot Import ---
const ChatBot = dynamic(() => import("@/components/ChatBot/ChatBot"), {
  ssr: false,
  loading: () => <div className="fixed bottom-24 right-6 bg-white p-3 rounded-2xl shadow-xl z-50">Loading...</div>,
});

// --- Variants (Your existing animations) ---
const stackContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

const fabVariants: Variants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 500, damping: 25 } },
  hover: { scale: 1.1, rotate: -5 },
  tap: { scale: 0.9 },
};

const rippleEffect: Variants = {
  animate: {
    boxShadow: ["0 0 0 0 rgba(20, 184, 166, 0.4)", "0 0 0 10px rgba(20, 184, 166, 0)"],
    transition: { duration: 2, repeat: Infinity, repeatType: "loop" },
  },
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-R6B186WMDW";
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans ${isNavOpen ? 'overflow-hidden' : ''}`}>
      <Navbar onNavToggle={setIsNavOpen} />
      
      {/* Analytics */}
      {measurementId && (
        <>
          <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}

      <main className="flex-grow w-full relative z-0 mt-20 lg:mt-20">
        {isClient ? children : null}
      </main>

      <Footer />
      <Analytics /> 

      {/* FABs */}
      {isClient && !isNavOpen && (
        <div className="fixed bottom-5 right-4 z-[999] flex flex-col items-end gap-3 pointer-events-none">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="pointer-events-auto origin-bottom-right mb-1"
              >
                <Suspense fallback={null}><ChatBot onClose={() => setIsChatOpen(false)} /></Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isChatOpen && (
              <motion.div variants={stackContainerVariants} initial="hidden" animate="visible" exit="exit" className="pointer-events-auto flex flex-col items-end gap-3">
                <motion.a href="tel:+919756300040" variants={fabVariants} whileHover="hover" whileTap="tap" className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center">
                  <Phone size={20} fill="currentColor" className="ml-0.5" />
                </motion.a>
                <motion.a href="https://wa.me/919756300040" target="_blank" rel="noopener noreferrer" variants={fabVariants} whileHover="hover" whileTap="tap" className="w-12 h-12 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center">
                  <MessageCircle size={22} fill="currentColor" />
                </motion.a>
                <div className="relative">
                    <motion.button onClick={() => setIsChatOpen(true)} variants={fabVariants} animate="animate" whileHover="hover" whileTap="tap" className="w-14 h-14 bg-teal-600 text-white rounded-full shadow-xl flex items-center justify-center relative z-10">
                      <motion.div variants={rippleEffect} className="absolute inset-0 rounded-full z-0" />
                      <MessageSquareText size={26} className="relative z-10" />
                    </motion.button>
                </div>
              </motion.div>
            )}
            {isChatOpen && (
              <motion.button initial={{ opacity: 0, scale: 0.5, rotate: -90 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.5, rotate: 90 }} onClick={() => setIsChatOpen(false)} className="pointer-events-auto w-12 h-12 bg-slate-800 text-white rounded-full shadow-xl flex items-center justify-center">
                <X size={24} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}