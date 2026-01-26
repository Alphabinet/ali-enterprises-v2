"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic"; 
import Head from "next/head";
import Script from "next/script";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; 
import { Analytics } from "@vercel/analytics/react"; 
import { motion, AnimatePresence, Variants } from "framer-motion"; 
import { Phone, MessageCircle, MessageSquareText, X } from "lucide-react"; 
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

// --- Dynamic ChatBot Import ---
const ChatBot = dynamic(() => import("@/components/ChatBot/ChatBot"), {
  ssr: false,
  loading: () => (
    <div className="fixed bottom-24 right-6 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs text-teal-600 font-bold animate-pulse z-50 border border-teal-100">
      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" />
      Loading Assistant...
    </div>
  ),
});

// --- Animation Variants (Typed to fix TS Error) ---
const stackContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.5 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const fabVariants: Variants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: { 
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 500, damping: 25 }
  },
  hover: { scale: 1.1, rotate: -5 },
  tap: { scale: 0.9 },
};

const rippleEffect: Variants = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(20, 184, 166, 0.4)",
      "0 0 0 10px rgba(20, 184, 166, 0)",
    ],
    transition: { duration: 2, repeat: Infinity, repeatType: "loop" },
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-R6B186WMDW";

  // --- FLOATING BUTTON STATES ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://alienterprises.in" />
          <link rel="icon" href="/favicon_io/favicon.ico" />
          <meta name="theme-color" content="#0f172a" />
          <title>Ali Enterprises</title>
          <meta name="description" content="Leading manufacturer of industrial machinery." />
        </Head>

        <body className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans ${isNavOpen ? 'overflow-hidden' : ''}`}>
          
          <Navbar onNavToggle={setIsNavOpen} />

          {/* Analytics */}
          {measurementId && (
            <>
              <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${measurementId}', {
                    page_path: window.location.pathname,
                  });
                `}
              </Script>
            </>
          )}

          {/* Main Content */}
          <main className="flex-grow w-full relative z-0 mt-20 lg:mt-20">
            {isClient ? children : null}
          </main>

          <Footer />
          <Analytics /> 

          {/* --- INTELLIGENT FLOATING ACTION BUTTONS (FABs) --- */}
          {isClient && !isNavOpen && (
            <div className="fixed bottom-5 right-4 z-[999] flex flex-col items-end gap-3 pointer-events-none">
              
              {/* Chat Window Container */}
              <AnimatePresence>
                {isChatOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="pointer-events-auto origin-bottom-right mb-1"
                  >
                    <Suspense fallback={null}>
                      <ChatBot onClose={() => setIsChatOpen(false)} />
                    </Suspense>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons Stack */}
              <AnimatePresence mode="wait">
                {!isChatOpen && (
                  <motion.div 
                    variants={stackContainerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="pointer-events-auto flex flex-col items-end gap-3"
                  >
                    
                    {/* 1. Phone Call */}
                    <motion.a
                      href="tel:+919756300040"
                      variants={fabVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center transition-shadow hover:shadow-xl"
                      aria-label="Call Us"
                    >
                      <Phone size={20} fill="currentColor" className="ml-0.5" />
                    </motion.a>

                    {/* 2. WhatsApp */}
                    <motion.a
                      href="https://wa.me/919756300040"
                      target="_blank"
                      rel="noopener noreferrer"
                      variants={fabVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="w-12 h-12 bg-[#25D366] text-white rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center transition-shadow hover:shadow-xl"
                      aria-label="Chat on WhatsApp"
                    >
                      <MessageCircle size={22} fill="currentColor" />
                    </motion.a>

                    {/* 3. AI Assistant */}
                    <div className="relative">
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2, duration: 0.5 }}
                          className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap bg-white px-2.5 py-1 rounded-lg shadow-md border border-slate-100 hidden sm:block"
                        >
                          <span className="text-[10px] font-bold text-slate-600">Need Help?</span>
                          <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white transform -translate-y-1/2 rotate-45 border-r border-t border-slate-100"></div>
                        </motion.div>

                        <motion.button
                          onClick={() => setIsChatOpen(true)}
                          variants={fabVariants}
                          animate="animate"
                          whileHover="hover"
                          whileTap="tap"
                          className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full shadow-xl shadow-teal-500/40 flex items-center justify-center relative z-10"
                          aria-label="Open AI Assistant"
                        >
                          <motion.div variants={rippleEffect} className="absolute inset-0 rounded-full z-0" />
                          <MessageSquareText size={26} className="relative z-10" />
                          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-teal-500 rounded-full z-20"></span>
                        </motion.button>
                    </div>

                  </motion.div>
                )}

                {/* Close Button */}
                {isChatOpen && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    onClick={() => setIsChatOpen(false)}
                    className="pointer-events-auto w-12 h-12 bg-slate-800 text-white rounded-full shadow-xl hover:bg-slate-900 flex items-center justify-center transition-colors"
                    aria-label="Close Chat"
                  >
                    <X size={24} />
                  </motion.button>
                )}
              </AnimatePresence>

            </div>
          )}

        </body>
      </html>
    </>
  );
};

export default Layout;