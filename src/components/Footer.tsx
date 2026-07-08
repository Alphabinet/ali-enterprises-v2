"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, ChevronRight, ExternalLink, MapPin, Phone } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    // Changed to a brighter Teal gradient and reduced vertical padding (pt-10 pb-6)
    <footer className="bg-gradient-to-br from-teal-700 to-teal-600 text-white pt-10 pb-6 relative overflow-hidden">
      
      {/* Subtle Texture for Premium feel */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Main Grid: Reduced to 3 Columns for compactness */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          
          {/* 1. Brand & Socials (Compact) */}
          <div className="space-y-4">
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="cursor-pointer inline-flex items-center gap-3 group"
            >
              <div className="relative w-10 h-10 bg-white/20 rounded-lg p-1.5 backdrop-blur-sm group-hover:bg-white/30 transition-all">
                <Image
                  src="/logo.svg"
                  alt="Ali Enterprises Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                  unoptimized
                />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Ali Enterprises</h2>
                <p className="text-[10px] text-teal-100 tracking-widest uppercase font-medium">Smart Business Solutions</p>
              </div>
            </div>
            
            <p className="text-xs text-teal-50 leading-relaxed max-w-xs">
              Revolutionizing the industrial sector with high-performance automated machinery since 2010.
            </p>
            
            {/* Social Icons - Row */}
            <div className="flex gap-2">
              {[
                { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-400 hover:text-teal-900 flex items-center justify-center transition-all duration-300"
                >
                  <social.Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Quick Links (Compact List) */}
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
              Quick Navigation
            </h3>
            <ul className="grid grid-cols-2 gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/#products" },
                { label: "About Us", href: "/#about" },
                { label: "Terms", href: "/terms" },
                { label: "Contact", href: "/contactus" },
                { label: "Privacy", href: "/privacy" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    href={link.href}
                    className="text-teal-50 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center gap-1 group text-sm"
                  >
                    <ChevronRight size={12} className="text-amber-400 opacity-50 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Info (Replaces Newsletter for better utility) */}
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
              Get in Touch
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-teal-50">
                <MapPin size={16} className="mt-1 text-amber-400 shrink-0" />
                <p>Near Nahariya Dharam Kanta, Budhana Road, Khatauli, UP - 251201</p>
              </div>
              <a href="mailto:alienterprises54@yahoo.com" className="flex items-center gap-3 text-teal-50 hover:text-white transition-colors">
                <Mail size={16} className="text-amber-400 shrink-0" />
                alienterprises54@yahoo.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom - Minimal */}
        <div className="border-t border-teal-500/30 pt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-teal-100">
          <p>&copy; {currentYear} Ali Enterprises. All rights reserved.</p>
          
          <a 
            href="https://www.instagram.com/chaudhary_khatri/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-amber-300 transition-colors opacity-80 hover:opacity-100"
          >
            <span>Developed by Jayant Chaudhary</span>
            <ExternalLink size={8} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;