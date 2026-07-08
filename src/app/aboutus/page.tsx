"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, Target, TrendingUp, Globe, Quote, 
  Linkedin, Mail, Factory, Settings, Cpu, Globe2, Cog
} from "lucide-react";

// --- SEO Schema Data ---
const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "mainEntity": {
    "@type": "Organization",
    "name": "Ali Enterprises",
    "foundingDate": "1995",
    "description": "Manufacturers of heavy-duty Automatic Fly Ash Brick Machines & Paver Systems. Built to last generations.",
    "url": "https://alienterprises.in/aboutus",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Khatauli",
      "addressRegion": "Uttar Pradesh",
      "addressCountry": "IN"
    }
  }
};

// --- Data ---
const STATS = [
  { label: "Experience", value: "30+ Yrs" },
  { label: "Installations", value: "2k+" },
  { label: "States", value: "22+" },
  { label: "Support", value: "24/7" },
];

const TIMELINE = [
  { 
    year: "1995", 
    title: "The Foundation", 
    desc: "Established in Khatauli with a mission to engineer robust, reliable industrial manufacturing solutions.",
    icon: Factory
  },
  { 
    year: "2010", 
    title: "The Semi-Auto Revolution", 
    desc: "Introduced our high-capacity Semi-Automatic Fly Ash machines, drastically boosting client production rates.",
    icon: Cog
  },
  { 
    year: "2018", 
    title: "Advanced Automation", 
    desc: "Upgraded our machinery with cutting-edge PLC logic and heavy-duty High-Pressure Hydraulic systems.",
    icon: Cpu
  },
  { 
    year: "2025", 
    title: "Market Expansion", 
    desc: "Achieved export-quality manufacturing standards, becoming a recognized industry leader across North India.",
    icon: TrendingUp
  },
  { 
    year: "2026", 
    title: "Digital Connectivity", 
    desc: "Expanded our digital footprint to provide seamless support, faster service, and global customer connectivity.",
    icon: Globe2
  },
];

const TEAM = [
  { name: "Minhal Haider", role: "Sales & Marketing", image: "/team/placeholderman.jpg" },
  { name: "Parvez Ali", role: "Service Department", image: "/team/placeholderman.jpg" },
  { name: "Ankit Arya", role: "R&D Department", image: "/team/placeholderman.jpg" },
  { name: "Rifakat Mirza", role: "Site & Quality Engineer", image: "/team/placeholderman.jpg" },
  { name: "Zeeshan", role: "Production Manager", image: "/team/placeholderman.jpg" },
];

// --- Sub-Components ---

// Lightweight, CSS-only rotating background gears
const BackgroundGears = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-20 -right-20 text-slate-100 opacity-50 animate-[spin_40s_linear_infinite]">
      <Settings size={400} strokeWidth={0.5} />
    </div>
    <div className="absolute top-[40%] -left-32 text-slate-100 opacity-40 animate-[spin_50s_linear_infinite_reverse]">
      <Settings size={500} strokeWidth={0.5} />
    </div>
  </div>
);

const SectionHeader = ({ label, title, light = false }: { label: string, title: string, light?: boolean }) => (
  <div className="mb-10 md:mb-16 relative z-10">
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 mb-3"
    >
      <span className={`h-px w-6 md:w-8 ${light ? "bg-teal-400" : "bg-teal-600"}`}></span>
      <span className={`${light ? "text-teal-400" : "text-teal-600"} font-bold uppercase tracking-widest text-[10px] md:text-xs`}>{label}</span>
    </motion.div>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`text-3xl md:text-5xl font-black leading-tight max-w-2xl ${light ? "text-white" : "text-slate-900"}`}
    >
      {title}
    </motion.h2>
  </div>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white">
      
      {/* JSON-LD SEO Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-12 md:pt-40 md:pb-32 px-4 md:px-6 overflow-hidden">
        <BackgroundGears />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-slate-200 rounded-full bg-slate-50 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 md:mb-6 shadow-sm">
                <Cog size={14} className="text-teal-600 animate-spin" style={{ animationDuration: '4s' }} />
                Est. 1995 • Khatauli, India
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-4 md:mb-8">
                ENGINEERING <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">INDIA'S</span> <br />
                FUTURE.
              </h1>
              <p className="text-sm md:text-lg text-slate-500 max-w-md leading-relaxed mb-6 md:mb-10 border-l-4 border-teal-500 pl-4 md:pl-6 bg-gradient-to-r from-slate-50 to-transparent py-2">
                Manufacturers of heavy-duty Automatic Fly Ash Brick Machines & Paver Systems. Built to last generations.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Link href="/products" className="flex-1 md:flex-none text-center px-6 py-3.5 bg-slate-900 text-white font-bold text-sm md:text-base rounded-xl hover:bg-teal-600 transition-colors shadow-lg active:scale-95">
                  View Machines
                </Link>
                <Link href="/contactus" className="flex-1 md:flex-none text-center px-6 py-3.5 bg-white border border-slate-300 text-slate-900 font-bold text-sm md:text-base rounded-xl hover:bg-slate-50 transition-colors active:scale-95">
                  Get Quote
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[300px] md:h-[600px] w-full bg-slate-100 rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white mt-4 md:mt-0 group"
            >
               <Image 
                 src="/Aboutu.jpg" 
                 alt="Automatic Brick Machine Factory"
                 fill
                 className="object-cover transition-transform duration-700 group-hover:scale-105"
                 priority
                 sizes="(max-width: 768px) 100vw, 50vw"
                 unoptimized
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80"></div>
               <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white">
                  <p className="font-black text-xl md:text-3xl mb-1 flex items-center gap-2">
                    <Factory size={24} className="text-teal-400" /> Fully Automatic Plant
                  </p>
                  <p className="text-teal-300 text-[10px] md:text-sm font-bold tracking-widest uppercase">High Capacity • Hydraulic System</p>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. STATS STRIP */}
      <section className="bg-slate-900 text-white py-12 md:py-20 relative overflow-hidden">
        {/* Subtle gear texture inside the dark strip */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 md:divide-x md:divide-slate-800">
            {STATS.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center md:px-6 group"
              >
                <div className="text-4xl md:text-6xl font-black text-teal-500 mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                <div className="text-[11px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VISION & PHILOSOPHY */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-slate-50 relative">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader label="Our Philosophy" title="Precision engineering for maximum profit." />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Target, title: "Precision", desc: "Zero tolerance for error. Machines calibrated for 100% brick uniformity and extreme pressure." },
              { icon: TrendingUp, title: "Growth", desc: "We don't just sell machines; we help you set up a highly profitable business model with massive ROI." },
              { icon: Globe, title: "Eco-Friendly", desc: "Promoting green construction by transforming industrial fly-ash waste into premium building materials." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 md:p-10 border border-slate-200 shadow-sm hover:shadow-xl rounded-2xl md:rounded-[2rem] transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-teal-50 text-teal-600 flex items-center justify-center rounded-xl mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOUNDER SECTION */}
      <section className="py-20 md:py-32 px-4 md:px-6 overflow-hidden bg-white border-y border-slate-100">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
            
            {/* Image Side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-full lg:w-5/12 h-[400px] md:h-[600px] rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl group"
            >
              <Image 
                src="/Founder/OwnerProfile.jpg" 
                alt="Mr. Ali Hassan - Founder" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
              {/* Mobile Name Overlay */}
              <div className="absolute bottom-6 left-6 lg:hidden text-white">
                 <p className="font-black text-2xl uppercase tracking-wide">Mr. Ali Hassan</p>
                 <p className="text-teal-400 text-sm font-bold uppercase tracking-widest mt-1">Founder & CEO</p>
              </div>
            </motion.div>

            {/* Text Side */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-7/12"
            >
              <Quote className="text-teal-500 w-12 h-12 md:w-16 md:h-16 mb-6 md:mb-8 opacity-40 transform -scale-x-100" />
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 md:mb-8 leading-[1.1] tracking-tight">
                "We don't build machines to fill a catalog. We build them to build your legacy."
              </h3>
              <div className="space-y-4 md:space-y-6 text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                <p>
                  When I started Ali Enterprises in 1995, the goal wasn't to be the biggest. It was to be the most reliable. We chose the hard path of precision engineering and heavy-duty steel.
                </p>
                <p className="p-4 bg-slate-50 border-l-4 border-teal-500 rounded-r-xl italic">
                  My promise to you is simple: If it comes from our factory, it will perform for a lifetime.
                </p>
              </div>
              <div className="hidden lg:block mt-10 pt-10 border-t border-slate-100">
                <p className="text-slate-900 font-black text-3xl uppercase tracking-wider">Mr. Ali Hassan</p>
                <p className="text-teal-600 font-bold uppercase tracking-widest mt-2 text-sm">Founder & CEO</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. ALTERNATING HISTORY TIMELINE */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-slate-900 text-white relative overflow-hidden">
        {/* Dark Mechanical Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <Settings size={600} className="absolute -top-40 -left-40 animate-[spin_60s_linear_infinite]" />
          <Settings size={400} className="absolute bottom-0 right-0 animate-[spin_40s_linear_infinite_reverse]" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <SectionHeader label="Our Journey" title="Decades of Innovation" light />
          </div>

          <div className="relative">
            {/* Center Line for Desktop, Left Line for Mobile */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-slate-800 md:-translate-x-1/2 rounded-full"></div>

            <div className="space-y-12 md:space-y-24">
              {TIMELINE.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div key={idx} className={`relative flex flex-col md:flex-row items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Empty half for flex spacing on desktop */}
                    <div className="hidden md:block w-1/2"></div>
                    
                    {/* The Icon Node */}
                    <div className="absolute left-6 md:left-1/2 w-12 h-12 md:w-16 md:h-16 bg-teal-600 border-4 border-slate-900 rounded-full flex items-center justify-center -translate-x-1/2 z-10 shadow-[0_0_20px_rgba(13,148,136,0.4)]">
                      <item.icon size={24} className="text-white" />
                    </div>

                    {/* Content Card */}
                    <motion.div 
                      initial={{ opacity: 0, x: isEven ? 30 : -30, y: 20 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`w-full md:w-1/2 pl-16 pr-4 md:px-12 py-2 ${isEven ? 'md:text-left' : 'md:text-right'}`}
                    >
                      <div className="bg-slate-800/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-700/50 hover:border-teal-500/50 transition-colors group">
                        <span className="text-teal-400 font-black text-2xl md:text-3xl block mb-2">{item.year}</span>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">{item.title}</h3>
                        <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">{item.desc}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. TEAM MEMBERS */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <SectionHeader label="Our People" title="Meet the Experts" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
            {TEAM.map((member, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white border border-slate-200 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden transition-all duration-300"
              >
                <div className="relative aspect-[4/5] bg-slate-200 overflow-hidden">
                  <Image 
                    src={member.image} 
                    alt={member.name}
                    fill
                    className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 20vw"
                    unoptimized
                  />
                  {/* Subtle Gear Overlay on hover */}
                  <div className="absolute inset-0 bg-teal-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                     <Cog size={48} className="text-white/30 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                </div>
                <div className="p-4 md:p-5 text-center bg-white relative z-10">
                  <h3 className="text-sm md:text-lg font-black text-slate-900 truncate">{member.name}</h3>
                  <p className="text-[10px] md:text-xs text-teal-600 font-bold uppercase tracking-widest mt-1">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-gradient-to-br from-teal-800 to-teal-900 text-white text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-400"></div>
        <div className="absolute -bottom-40 -right-40 text-teal-700/30 animate-[spin_30s_linear_infinite]">
           <Settings size={400} />
        </div>

        <div className="container mx-auto max-w-3xl relative z-10">
          <h2 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight">READY TO START?</h2>
          <p className="text-teal-100 text-sm md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Get a free consultation and customized quote for your manufacturing plant today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contactus" className="inline-flex items-center justify-center gap-2 bg-amber-400 text-teal-950 px-8 py-4 rounded-xl font-black text-sm md:text-lg hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95">
              Get Started Now <ArrowRight size={20} />
            </Link>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-sm md:text-lg hover:bg-white/10 transition-all active:scale-95">
              View Catalog
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}