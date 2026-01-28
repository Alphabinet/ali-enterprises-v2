"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, Target, TrendingUp, Globe, Quote, 
  Linkedin, Mail 
} from "lucide-react";

// --- Data ---
const STATS = [
  { label: "Experience", value: "30+ Yrs" },
  { label: "Installations", value: "2k+" },
  { label: "States", value: "22+" },
  { label: "Support", value: "24/7" },
];

const TIMELINE = [
  { year: "1995", title: "The Foundation", desc: "Established in Khatauli with a vision for robust local manufacturing." },
  { year: "2010", title: "Semi-Auto Era", desc: "Launched high-capacity Semi-Automatic Fly Ash machines." },
  { year: "2018", title: "Smart Tech", desc: "Integrated PLC logic and High-Pressure Hydraulic systems." },
  { year: "2025", title: "Global Reach", desc: "Export-quality manufacturing recognized across North India." },
];

// --- Updated Team Data ---
const TEAM = [
  { name: "Minhal Haider", role: "Sales & Marketing", image: "/team/placeholderman.jpg" },
  { name: "Parvez Ali", role: "Service Department", image: "/team/placeholderman.jpg" },
  { name: "Ankit Arya", role: "R&D Department", image: "/team/placeholderman.jpg" },
  { name: "Rifakat Mirza", role: "Site & Quality Engineer", image: "/team/placeholderman.jpg" },
  { name: "Zeeshan", role: "Production Manager", image: "/team/placeholderman.jpg" },
];

// --- Components ---

const SectionHeader = ({ label, title, light = false }: { label: string, title: string, light?: boolean }) => (
  <div className="mb-8 md:mb-16">
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
      className={`text-2xl md:text-5xl font-black leading-tight max-w-2xl ${light ? "text-white" : "text-slate-900"}`}
    >
      {title}
    </motion.h2>
  </div>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-12 md:pt-40 md:pb-32 px-4 md:px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 border border-slate-200 rounded-full bg-slate-50 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 md:mb-6">
                Est. 1995 • Khatauli, India
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-4 md:mb-8">
                ENGINEERING <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">INDIA'S</span> <br />
                FUTURE.
              </h1>
              <p className="text-sm md:text-lg text-slate-500 max-w-md leading-relaxed mb-6 md:mb-10 border-l-4 border-teal-500 pl-4 md:pl-6">
                Manufacturers of heavy-duty Automatic Fly Ash Brick Machines & Paver Systems. Built to last generations.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Link href="/products" className="flex-1 md:flex-none text-center px-6 py-3 bg-slate-900 text-white font-bold text-sm md:text-base rounded-lg md:rounded-none hover:bg-teal-600 transition-colors">
                  View Machines
                </Link>
                <Link href="/contactus" className="flex-1 md:flex-none text-center px-6 py-3 bg-white border border-slate-300 text-slate-900 font-bold text-sm md:text-base rounded-lg md:rounded-none hover:bg-slate-50 transition-colors">
                  Get Quote
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[250px] md:h-[600px] w-full bg-slate-100 rounded-2xl md:rounded-tr-[100px] md:rounded-bl-[100px] overflow-hidden shadow-xl mt-4 md:mt-0"
            >
               <Image 
                 src="/Aboutu.jpg" 
                 alt="Automatic Brick Machine"
                 fill
                 className="object-cover"
                 priority
                 sizes="(max-width: 768px) 100vw, 50vw"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
               <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 text-white">
                  <p className="font-bold text-lg md:text-xl mb-0 md:mb-1">Fully Automatic Plant</p>
                  <p className="text-teal-300 text-[10px] md:text-sm font-medium tracking-wide">HIGH CAPACITY • HYDRAULIC</p>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. STATS STRIP */}
      <section className="bg-slate-900 text-white py-10 md:py-16 border-y border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 md:divide-x md:divide-slate-800">
            {STATS.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center md:px-4"
              >
                <div className="text-3xl md:text-5xl font-black text-teal-500 mb-1 md:mb-2">{stat.value}</div>
                <div className="text-[10px] md:text-sm font-medium text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VISION & PHILOSOPHY */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader label="Our Philosophy" title="Precision engineering for maximum profit." />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {[
              { icon: Target, title: "Precision", desc: "Zero tolerance for error. Machines calibrated for 100% brick uniformity." },
              { icon: TrendingUp, title: "Growth", desc: "We help you set up a profitable business model with high ROI." },
              { icon: Globe, title: "Eco-Friendly", desc: "Promoting green construction with fly-ash technology." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 md:p-10 border border-slate-200 shadow-sm rounded-xl md:rounded-none"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-100 text-slate-900 flex items-center justify-center rounded-lg md:rounded-none mb-4 md:mb-6">
                  <item.icon size={20} className="md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOUNDER SECTION */}
      <section className="py-16 md:py-24 px-4 md:px-6 overflow-hidden bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-24">
            
            {/* Image Side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-full lg:w-1/2 h-[350px] md:h-[600px] rounded-2xl overflow-hidden"
            >
              <Image 
                src="/Founder/OwnerProfile.jpg" 
                alt="Mr. Ali Hassan" 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Mobile Name Overlay */}
              <div className="absolute bottom-0 left-0 w-full bg-slate-900/80 p-4 lg:hidden text-white backdrop-blur-sm">
                 <p className="font-bold text-lg uppercase">Mr. Ali Hassan</p>
                 <p className="text-teal-400 text-xs font-bold">Founder & CEO</p>
              </div>
            </motion.div>

            {/* Text Side */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2"
            >
              <Quote className="text-teal-600 w-8 h-8 md:w-12 md:h-12 mb-4 md:mb-6 opacity-50" />
              <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 md:mb-6 leading-tight">
                "We don't build machines to fill a catalog. We build them to build your legacy."
              </h3>
              <div className="space-y-4 md:space-y-6 text-slate-600 text-sm md:text-lg leading-relaxed">
                <p>
                  When I started Ali Enterprises in 1995, the goal wasn't to be the biggest. It was to be the most reliable. We chose the hard path of precision engineering and heavy-duty steel.
                </p>
                <p>
                  My promise to you is simple: If it comes from our factory, it will perform for a lifetime.
                </p>
              </div>
              <div className="hidden lg:block mt-10 pt-10 border-t border-slate-100">
                <p className="text-slate-900 font-black text-2xl uppercase tracking-wide">Mr. Ali Hassan</p>
                <p className="text-teal-600 font-bold mt-1">Founder & CEO</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. HISTORY TIMELINE */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-900 text-white relative">
        <div className="container mx-auto max-w-5xl relative z-10">
          <SectionHeader label="Our Journey" title="Decades of Innovation" light />

          <div className="relative border-l-2 border-slate-700 ml-2 md:ml-1/2 space-y-10 md:space-y-16">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className="relative pl-6 md:pl-0">
                {/* Dot */}
                <div className="absolute -left-[7px] top-1 md:top-0 w-3 h-3 md:w-4 md:h-4 bg-teal-500 rounded-full border-2 md:border-4 border-slate-900"></div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="md:grid md:grid-cols-12 md:items-start"
                >
                  <div className="hidden md:block col-span-5 text-right pr-12 pt-1">
                    <span className="text-teal-400 font-bold text-2xl relative z-10">{item.year}</span>
                  </div>
                  <div className="hidden md:block col-span-2"></div>
                  <div className="md:col-span-5 md:pl-8">
                    <span className="md:hidden text-teal-400 font-bold text-lg block mb-1">{item.year}</span>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-xs md:text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TEAM MEMBERS (Updated Layout for 5 members) */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader label="Our People" title="Meet the Experts" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
            {TEAM.map((member, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white border border-slate-100 shadow-sm rounded-lg overflow-hidden"
              >
                <div className="relative aspect-[3/4] bg-slate-200 overflow-hidden mb-2 md:mb-4">
                  <Image 
                    src={member.image} 
                    alt={member.name}
                    fill
                    className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <div className="text-center pb-4 px-2">
                  <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">{member.name}</h3>
                  <p className="text-[10px] md:text-xs text-teal-600 font-bold uppercase tracking-widest mt-0.5">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-teal-700 text-white text-center relative overflow-hidden">
        <div className="container mx-auto max-w-3xl relative z-10">
          <h2 className="text-2xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight">READY TO START?</h2>
          <p className="text-teal-100 text-sm md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            Get a free consultation and customized quote today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Link href="/contactus" className="inline-flex items-center justify-center gap-2 bg-white text-teal-900 px-8 py-4 rounded-lg md:rounded-none font-bold text-sm md:text-lg hover:bg-slate-100 transition-all shadow-xl">
              Get Started Now <ArrowRight size={18} />
            </Link>
            <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg md:rounded-none font-bold text-sm md:text-lg hover:bg-white/10 transition-all">
              View Catalog
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}