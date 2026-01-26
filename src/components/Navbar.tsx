"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Phone, ChevronRight, Home, Info, Box, Settings, Mail, 
  Image as ImageIcon, MapPin, Languages, ChevronDown, Video 
} from "lucide-react";

// --- Types ---
interface NavbarProps {
  onNavToggle?: (isOpen: boolean) => void;
}

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
];

const Navbar: React.FC<NavbarProps> = ({ onNavToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  // --- 1. Sync State with Parent ---
  useEffect(() => {
    if (onNavToggle) {
      onNavToggle(isOpen);
    }
  }, [isOpen, onNavToggle]);

  // --- 2. Scroll Handler ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- 3. Google Translate Init ---
  useEffect(() => {
    const getCookie = (name: string) => {
      const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
    };
    const langCookie = getCookie("googtrans");
    if (langCookie) {
      const langCode = langCookie.split("/")[2];
      if (langCode) setCurrentLang(langCode);
    }

    // @ts-ignore
    window.googleTranslateElementInit = () => {
      // @ts-ignore
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,bn,ta',
        autoDisplay: false,
      }, 'google_translate_element');
    };
  }, []);

  // --- 4. Language Switcher Logic ---
  const changeLanguage = (langCode: string) => {
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`; 
    setCurrentLang(langCode);
    setLangMenuOpen(false);
    setIsOpen(false);
    window.location.reload();
  };

  // Updated Navigation Items
  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "About Us", href: "/aboutus", icon: Info },
    { name: "Products", href: "/products", icon: Box },
    { name: "Demos", href: "/product-demo", icon: Video }, // <--- New Item Added Here
    { name: "Gallery", href: "/gallery", icon: ImageIcon },
    { name: "Service Centers", href: "/service-centers", icon: MapPin },
    { name: "Contact", href: "/contactus", icon: Mail },
  ];

  return (
    <>
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
      
      <div id="google_translate_element" className="hidden"></div>
      <style jsx global>{`
        .skiptranslate { display: none !important; }
        body { top: 0 !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip-hover { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
      `}</style>

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled || isOpen
            ? "bg-teal-900/95 backdrop-blur-md shadow-lg py-3"
            : "bg-gradient-to-r from-teal-800 to-teal-900 py-4"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* --- Logo & Brand --- */}
            <Link href="/" className="flex items-center space-x-3 group z-50">
              <div className="relative w-10 h-10 lg:w-11 lg:h-11 bg-white rounded-lg p-1.5 backdrop-blur-sm group-hover:bg-white/20 transition-all">
                <Image
                  src="/logo.svg"
                  alt="Ali Enterprises Logo"
                  width={44}
                  height={44}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight leading-tight">
                  Ali Enterprises
                </span>
                <span className="text-[10px] lg:text-xs text-teal-200 font-medium tracking-wider uppercase">
                  Industrial Machinery
                </span>
              </div>
            </Link>

            {/* --- Desktop Navigation --- */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white/90 hover:text-amber-400 font-medium text-sm transition-colors relative group flex items-center gap-1"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}

              {/* Language Selector (Desktop) */}
              <div className="relative ml-2">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1.5 text-white/90 hover:text-amber-400 font-medium text-sm transition-colors bg-white/10 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/20"
                >
                  <Languages size={16} />
                  <span className="uppercase">{currentLang}</span>
                  <ChevronDown size={14} className={`transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                      onMouseLeave={() => setLangMenuOpen(false)}
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-teal-50 transition-colors flex items-center justify-between ${
                            currentLang === lang.code ? "text-teal-600 bg-teal-50/50" : "text-slate-600"
                          }`}
                        >
                          <span>{lang.native}</span>
                          {currentLang === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Desktop CTA */}
              <Link href="/contactus">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-teal-950 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm ml-2">
                  <Phone size={16} />
                  <span>Get Quote</span>
                </button>
              </Link>
            </div>

            {/* --- Mobile Menu Toggle --- */}
            <div className="lg:hidden flex items-center gap-3">
               <button 
                  onClick={() => setIsOpen(true)} 
                  className="p-2 text-white/80 hover:bg-white/10 rounded-lg"
               >
                  <Languages size={24} />
               </button>

               <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-50"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[85%] max-w-sm h-full bg-white z-50 shadow-2xl lg:hidden flex flex-col"
            >
              
              {/* Drawer Header */}
              <div className="p-6 bg-teal-900 text-white">
                <div className="mt-12 mb-4">
                  <h3 className="text-2xl font-bold">Menu</h3>
                  <p className="text-teal-200 text-xs uppercase tracking-wider">Navigation</p>
                </div>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto py-2">
                
                {/* Mobile Language Selector */}
                <div className="px-6 py-4 border-b border-gray-100">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Language</p>
                   <div className="grid grid-cols-2 gap-2">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all text-center ${
                            currentLang === lang.code 
                              ? "bg-teal-600 text-white border-teal-600 shadow-sm" 
                              : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                          }`}
                        >
                          {lang.native}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex flex-col mt-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between px-6 py-3.5 hover:bg-teal-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-teal-50 text-teal-700 rounded-lg group-hover:bg-teal-100 transition-colors">
                          <item.icon size={20} />
                        </div>
                        <span className="font-semibold text-gray-700 group-hover:text-teal-900">
                          {item.name}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <Link href="/contactus" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                    <Phone size={18} />
                    Contact Support
                  </button>
                </Link>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">© 2026 Ali Enterprises</p>
                  <p className="text-xs text-gray-400">website by Alphabinet.com</p>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;