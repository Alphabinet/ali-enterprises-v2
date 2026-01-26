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
  { label: "Years of Excellence", value: "30+" },
  { label: "Machines Installed", value: "2,000+" },
  { label: "States Covered", value: "22+" },
  { label: "Client Satisfaction", value: "100%" },
];

const TIMELINE = [
  { year: "1995", title: "The Foundation", desc: "Ali Enterprises was established in Khatauli with a vision to revolutionize local manufacturing." },
  { year: "2010", title: "Semi-Auto Era", desc: "Expanded production capacity and launched the first line of Semi-Automatic Fly Ash machines." },
  { year: "2018", title: "Smart Automation", desc: "Integrated PLC-based logic and High-Pressure Hydraulic systems for zero-breakage bricks." },
  { year: "2025", title: "Industry Leader", desc: "Recognized as the Most Trusted Manufacturer in North India with export-quality standards." },
];

const TEAM = [
  { name: "Er. Sameer Khan", role: "Head of Engineering", image: "/team/placeholderman.jpg" },
  { name: "Amit Sharma", role: "Production Manager", image: "/team/placeholderman.jpg" },
  { name: "Rahul Verma", role: "Quality Control", image: "/team/placeholderman.jpg" },
  { name: "Mohd. Zaid", role: "Sales Director", image: "/team/placeholderman.jpg" },
];

// --- Components ---

const SectionHeader = ({ label, title, light = false }: { label: string, title: string, light?: boolean }) => (
  <div className="mb-12 md:mb-20">
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 mb-4"
    >
      <span className={`h-px w-8 ${light ? "bg-teal-400" : "bg-teal-600"}`}></span>
      <span className={`${light ? "text-teal-400" : "text-teal-600"} font-bold uppercase tracking-widest text-xs`}>{label}</span>
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
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-1.5 border border-slate-200 rounded-full bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
                Est. 1995 • Khatauli, India
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
                ENGINEERING <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">INDIA'S</span> <br />
                INFRASTRUCTURE.
              </h1>
              <p className="text-lg text-slate-500 max-w-md leading-relaxed mb-10 border-l-4 border-teal-500 pl-6">
                Manufacturers of heavy-duty Automatic Fly Ash Brick Machines, Paver Block Systems, and Concrete Mixers. Built to last generations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-none hover:bg-teal-600 transition-colors">
                  View Machines
                </Link>
                <Link href="/contactus" className="px-8 py-4 bg-white border border-slate-300 text-slate-900 font-bold rounded-none hover:bg-slate-50 transition-colors">
                  Get Quote
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[400px] md:h-[600px] w-full bg-slate-100 rounded-tr-[100px] rounded-bl-[100px] overflow-hidden shadow-2xl"
            >
               <Image 
                 src="/Aboutu.jpg" 
                 alt="Automatic Brick Machine"
                 fill
                 className="object-cover"
                 priority
                 // Optimized sizes: 100vw on mobile/tablet, 50vw on desktop
                 sizes="(max-width: 1024px) 100vw, 50vw"
                 onError={(e) => { e.currentTarget.src = "https://placehold.co/800x600/e2e8f0/475569?text=Hero+Machine"; }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
               <div className="absolute bottom-10 left-10 text-white">
                  <p className="font-bold text-xl mb-1">Fully Automatic Plant</p>
                  <p className="text-teal-300 text-sm font-medium tracking-wide">HIGH CAPACITY • HYDRAULIC</p>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. STATS STRIP */}
      <section className="bg-slate-900 text-white py-16 border-y border-slate-800">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x md:divide-slate-800">
            {STATS.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center px-4"
              >
                <div className="text-4xl md:text-5xl font-black text-teal-500 mb-2">{stat.value}</div>
                <div className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VISION & PHILOSOPHY */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader label="Our Philosophy" title="Precision engineering for maximum profit." />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Precision", desc: "Zero tolerance for error. Our machines are calibrated for 100% brick uniformity and density." },
              { icon: TrendingUp, title: "Growth", desc: "We don't just sell machines; we help you set up a profitable business model with high ROI." },
              { icon: Globe, title: "Sustainability", desc: "Promoting green construction with fly-ash technology to reduce carbon footprint." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-slate-100 text-slate-900 flex items-center justify-center rounded-none mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOUNDER SECTION */}
      <section className="py-24 px-6 overflow-hidden bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            
            {/* Image Side */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-full lg:w-1/2 h-[500px] lg:h-[600px]"
            >
              <div className="absolute top-4 left-4 w-full h-full border-2 border-slate-900 z-0"></div>
              <div className="absolute inset-0 bg-slate-200 z-10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                <Image 
                  src="/Owner/OwnerProfile.jpg" 
                  alt="Mr. Ali Hassan" 
                  fill 
                  className="object-cover"
                  // Optimized sizes
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/600x800/1e293b/FFF?text=Founder"; }}
                />
              </div>
            </motion.div>

            {/* Text Side */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2"
            >
              <Quote className="text-teal-600 w-12 h-12 mb-6 opacity-50" />
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                "We don't build machines to fill a catalog. We build them to build your legacy."
              </h3>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  When I started Ali Enterprises in 1995, the goal wasn't to be the biggest. It was to be the most reliable. In an industry full of shortcuts, we chose the hard path of precision engineering and heavy-duty steel.
                </p>
                <p>
                  Today, seeing our machines powering thousands of factories across India is my greatest achievement. My promise to you is simple: If it comes from our factory, it will perform for a lifetime.
                </p>
              </div>
              <div className="mt-10 pt-10 border-t border-slate-100">
                <p className="text-slate-900 font-black text-2xl uppercase tracking-wide">Mr. Ali Hassan</p>
                <p className="text-teal-600 font-bold mt-1">Founder & CEO</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. HISTORY TIMELINE */}
      <section className="py-24 px-6 bg-slate-900 text-white relative">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-teal-400 font-bold uppercase tracking-widest text-xs">Our Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Decades of Innovation</h2>
          </div>

          <div className="relative border-l-2 border-slate-700 ml-4 md:ml-1/2 space-y-16">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className="relative pl-8 md:pl-0">
                {/* Dot */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-teal-500 rounded-full border-4 border-slate-900 shadow-[0_0_0_4px_rgba(13,148,136,0.3)]"></div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="md:grid md:grid-cols-12 md:items-start"
                >
                  {/* Year (Left on Desktop) */}
                  <div className="hidden md:block col-span-5 text-right pr-12 pt-1">
                    <span className="text-6xl font-black text-slate-800 absolute right-full mr-8 -mt-6 opacity-30 select-none">{item.year}</span>
                    <span className="text-teal-400 font-bold text-2xl relative z-10">{item.year}</span>
                  </div>

                  {/* Spacer for line */}
                  <div className="hidden md:block col-span-2"></div>

                  {/* Content (Right on Desktop) */}
                  <div className="md:col-span-5 md:pl-8">
                    <span className="md:hidden text-teal-400 font-bold text-xl block mb-2">{item.year}</span>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STAFF MEMBERS */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader label="Our People" title="Meet the experts behind the machinery." />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[3/4] bg-slate-200 overflow-hidden mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <Image 
                    src={member.image} 
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                    // Optimized sizes: 100vw mobile, 50vw tablet, 25vw desktop
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/400x500/e2e8f0/475569?text=Staff+Member"; }}
                  />
                  {/* Social Overlay */}
                  <div className="absolute inset-0 bg-teal-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                     <button className="p-2 bg-white rounded-full text-slate-900 hover:bg-teal-500 hover:text-white transition-colors" aria-label="LinkedIn Profile"><Linkedin size={18}/></button>
                     <button className="p-2 bg-white rounded-full text-slate-900 hover:bg-teal-500 hover:text-white transition-colors" aria-label="Send Email"><Mail size={18}/></button>
                  </div>
                </div>
                <div className="text-center pb-6 px-4">
                  <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                  <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mt-1">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BIG CTA */}
      <section className="py-24 px-6 bg-teal-700 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="container mx-auto max-w-3xl relative z-10">
          <h2 className="text-3xl md:text-6xl font-black mb-6 tracking-tight">READY TO START?</h2>
          <p className="text-teal-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Join 2,000+ successful business owners. Get a free consultation and customized quote for your production capacity today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contactus" className="inline-flex items-center justify-center gap-3 bg-white text-teal-900 px-10 py-5 rounded-none font-bold text-lg hover:bg-slate-100 transition-all shadow-xl">
              Get Started Now <ArrowRight size={20} />
            </Link>
            <Link href="/products" className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-10 py-5 rounded-none font-bold text-lg hover:bg-white/10 transition-all">
              View Catalog
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}