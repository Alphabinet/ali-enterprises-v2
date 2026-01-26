"use client";

import React from "react";
import { motion, Variants } from "framer-motion"; // Import Variants type
import Link from "next/link";
import { 
  Factory, 
  Zap, 
  Wrench, 
  Target, 
  Eye, 
  ArrowRight 
} from "lucide-react";

const AboutUsSection = () => {
  // --- Animation Variants ---
  // Explicitly type the variants to satisfy TypeScript
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.6 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      // Removed specific 'ease' string to prevent TS mismatch. 
      // Default easeOut is applied automatically.
      transition: { duration: 0.5 } 
    }
  };

  const features = [
    {
      icon: Factory,
      title: "Quality",
      desc: "ISO Certified Manufacturing",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      icon: Zap,
      title: "Efficiency",
      desc: "AI-Ready Technology",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      icon: Wrench,
      title: "Support",
      desc: "Lifetime Maintenance",
      color: "text-teal-600",
      bg: "bg-teal-50"
    },
  ];

  return (
    <section
      id="about"
      className="relative py-12 lg:py-24 bg-slate-50 overflow-hidden"
    >
      {/* Decorative Background Elements (Desktop Only) */}
      <div className="hidden lg:block absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="container mx-auto px-4 lg:px-8 relative z-10"
      >
        
        {/* --- Top Section: Header & Content --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center mb-10 lg:mb-16">
          
          {/* Left: Introduction Text */}
          <motion.div variants={itemVariants} className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-4 lg:mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Since 1995</span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 lg:mb-6 leading-tight">
              About <span className="text-teal-600">Ali Enterprises</span>
            </h2>
            
            <p className="text-sm lg:text-lg text-slate-600 leading-relaxed mb-6">
              Based in the industrial heartland of Uttar Pradesh, we are a premier manufacturer of high-performance brick-making machinery. We deliver robust solutions backed by comprehensive support.
            </p>

            <Link href="/aboutus" passHref>
              <button className="hidden lg:inline-flex items-center gap-2 text-teal-700 font-bold text-lg border-b-2 border-teal-200 hover:border-teal-600 transition-all pb-1">
                Read Our Full Story <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>

          {/* Right: Mission/Vision Cards */}
          <div className="w-full">
             {/* Mobile Swipe Label */}
             <p className="lg:hidden text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Swipe to explore →</p>
             
             <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory lg:flex-col lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0 lg:gap-4 scrollbar-hide">
              
              {/* Mission Card */}
              <motion.div 
                variants={itemVariants}
                className="flex-none w-[85%] snap-center lg:w-full bg-white p-5 lg:p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col lg:flex-row gap-4 items-start"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 lg:w-6 lg:h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-1">Our Mission</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    To engineer superior machinery that boosts productivity and empowers businesses with reliable tools.
                  </p>
                </div>
              </motion.div>

              {/* Vision Card */}
              <motion.div 
                variants={itemVariants}
                className="flex-none w-[85%] snap-center lg:w-full bg-white p-5 lg:p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col lg:flex-row gap-4 items-start"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-1">Our Vision</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    To set new benchmarks for durability and service, becoming the most trusted partner in construction.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* --- Bottom Section: Why Choose Us --- */}
        <motion.div variants={itemVariants}>
          <div className="text-left lg:text-center mb-6 lg:mb-10">
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Why Leaders Choose Us</h3>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-8 max-w-5xl mx-auto">
            {features.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white p-3 lg:p-6 rounded-xl lg:rounded-2xl text-center flex flex-col items-center justify-center h-full shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 lg:w-16 lg:h-16 mx-auto ${item.bg} rounded-full flex items-center justify-center mb-2 lg:mb-4 transition-transform group-hover:scale-110`}>
                  <item.icon className={`w-5 h-5 lg:w-8 lg:h-8 ${item.color}`} />
                </div>
                <h4 className="text-xs lg:text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-slate-500 text-[10px] lg:text-sm leading-tight hidden sm:block">{item.desc}</p>
                {/* Mobile simplified desc */}
                <p className="text-slate-500 text-[9px] leading-tight sm:hidden">{item.desc.split(' ')[0]}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* --- Footer Quote --- */}
        <motion.div 
          variants={itemVariants}
          className="hidden lg:block mt-16 pt-10 border-t border-slate-200 text-center max-w-3xl mx-auto"
        >
          <p className="text-lg text-slate-600 italic font-medium">
            "Our commitment to excellence has established us as the trusted partner for construction businesses nationwide."
          </p>
        </motion.div>

        {/* Mobile-Only Link */}
        <div className="lg:hidden mt-8 text-center">
            <Link href="/aboutus" className="text-teal-700 font-bold text-sm border-b border-teal-200 pb-0.5">
                Read Our Full Story →
            </Link>
        </div>

      </motion.div>

      {/* Hide Scrollbar Utility */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default AboutUsSection;