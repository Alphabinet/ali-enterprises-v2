"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Phone, MessageCircle, X, MessageSquareText } from "lucide-react";

// --- ChatBot Import ---
const ChatBot = dynamic(() => import("@/components/ChatBot/ChatBot"), {
  ssr: false,
  loading: () => <div className="fixed bottom-24 right-6 bg-white p-3 rounded-2xl shadow-xl z-50">Loading...</div>,
});

// =====================================================================
// Brand mark — same two-gear signature used inside the chatbot itself,
// duplicated here (lightweight, non-animated-by-default) so the launcher
// button reads as "this opens the assistant" rather than a generic chat
// bubble. If you'd rather not duplicate it, export GearMark from
// components/ChatBot/ChatBot.tsx and import it here instead.
// =====================================================================
function gearPath(cx: number, cy: number, outerR: number, innerR: number, teeth: number): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / (teeth * 2);
  for (let i = 0; i < teeth * 2; i++) {
    const angle = i * step - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  pts.push("Z");
  return pts.join(" ");
}
const BIG_GEAR = gearPath(46, 60, 27, 20, 10);
const SMALL_GEAR = gearPath(80, 32, 17, 12, 8);

const GearFabIcon = ({ size = 26, spinning = true }: { size?: number; spinning?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 100 90" fill="none" aria-hidden="true">
    <g style={{ transformOrigin: "46px 60px", animation: spinning ? "gear-fab-cw 7s linear infinite" : undefined }}>
      <path d={BIG_GEAR} fill="white" />
      <circle cx="46" cy="60" r="8" fill="#0f766e" />
    </g>
    <g style={{ transformOrigin: "80px 32px", animation: spinning ? "gear-fab-ccw 5s linear infinite" : undefined }}>
      <path d={SMALL_GEAR} fill="white" fillOpacity="0.85" />
      <circle cx="80" cy="32" r="5" fill="#0f766e" />
    </g>
    <style jsx>{`
      @keyframes gear-fab-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes gear-fab-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
      @media (prefers-reduced-motion: reduce) {
        g { animation: none !important; }
      }
    `}</style>
  </svg>
);

// --- Variants ---
const stackContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

const fabVariants: Variants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 500, damping: 25 } },
  hover: { scale: 1.08 },
  tap: { scale: 0.92 },
};

const rippleEffect: Variants = {
  animate: {
    boxShadow: ["0 0 0 0 rgba(15, 118, 110, 0.45)", "0 0 0 12px rgba(15, 118, 110, 0)"],
    transition: { duration: 2.2, repeat: Infinity, repeatType: "loop" },
  },
};

// Shared tooltip that only shows on pointer devices (hover), never traps
// touch taps, and never blocks the button underneath it.
const FabTooltip = ({ label }: { label: string }) => (
  <span
    role="tooltip"
    className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 sm:block"
  >
    {label}
    <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
  </span>
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-R6B186WMDW";
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

      {/* SEO FIX: Render children immediately so search engines can read the HTML */}
      <main className="flex-grow w-full relative z-0 mt-20 lg:mt-20">
        {children}
      </main>

      <Footer />
      <Analytics />

      {/* FABs - Kept strictly client-side to prevent hydration mismatch */}
      {isClient && !isNavOpen && (
        <div
          className="fixed right-3 z-[999] flex flex-col items-end gap-2.5 sm:right-6 sm:gap-3 pointer-events-none"
          style={{ bottom: "max(1.1rem, env(safe-area-inset-bottom))" }}
        >
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                style={{ originX: 1, originY: 1 }}
                className="pointer-events-auto origin-bottom-right mb-1 w-[calc(100vw-1.5rem)] max-w-[400px] sm:w-auto"
              >
                <Suspense fallback={null}>
                  <ChatBot onClose={() => setIsChatOpen(false)} />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isChatOpen && (
              <motion.div
                variants={stackContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="pointer-events-auto flex flex-col items-end gap-2.5 sm:gap-3"
              >
                <motion.a
                  href="tel:+919756300040"
                  aria-label="Call Ali Enterprises"
                  variants={fabVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-teal-100 bg-green-100 text-teal-700 shadow-lg shadow-teal-900/5 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:h-12 sm:w-12"
                >
                  <FabTooltip label="Call us" />
                  <Phone size={19} className="sm:hidden" />
                  <Phone size={20} className="hidden sm:block" />
                </motion.a>

                <motion.a
                  href="https://wa.me/919756300040"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Message Ali Enterprises on WhatsApp"
                  variants={fabVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-teal-900/10 transition-colors hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:h-12 sm:w-12"
                >
                  <FabTooltip label="WhatsApp us" />
                  <MessageCircle size={20} fill="currentColor" className="sm:hidden" />
                  <MessageCircle size={22} fill="currentColor" className="hidden sm:block" />
                </motion.a>

                <div className="group relative">
                  <motion.button
                    onClick={() => setIsChatOpen(true)}
                    aria-label="Open chat assistant"
                    variants={fabVariants}
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-teal-700 text-white shadow-xl shadow-teal-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:h-14 sm:w-14"
                  >
                    <motion.div variants={rippleEffect} className="absolute inset-0 rounded-full z-0" />
                    <span className="relative z-10 flex items-center justify-center">
                      <MessageSquareText size={24} />
                    </span>
                  </motion.button>
                  <FabTooltip label="Chat with us" />
                </div>
              </motion.div>
            )}

            {isChatOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                onClick={() => setIsChatOpen(false)}
                aria-label="Close chat assistant"
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:h-12 sm:w-12"
              >
                <X size={24} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}