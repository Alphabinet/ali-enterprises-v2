"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Settings } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  image: string;
  quote: string;
  role: string;
};

interface Props {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slider logic
  useEffect(() => {
    if (isPaused || !testimonials || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // 5 seconds interval

    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  }, [testimonials.length]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section 
      className="py-20 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mechanical Background Gear Layers */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <Settings size={400} className="absolute -top-20 -left-20 text-teal-500 animate-[spin_60s_linear_infinite]" />
        <Settings size={250} className="absolute bottom-0 right-0 text-teal-500 animate-[spin_60s_linear_infinite_reverse]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-teal-800 uppercase tracking-tighter">
            Client <span className="text-teal-500">Feedback</span>
          </h2>
        </div>

        <div className="relative bg-teal-950 border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl">
          {/* Dual Gear Mechanical Aesthetic */}
          <div className="absolute -top-6 -right-6 flex items-center justify-center">
            <Settings size={40} className="text-teal-600 animate-spin" style={{ animationDuration: '4s' }} />
            <Settings size={24} className="text-slate-700 -ml-2 animate-[spin_4s_linear_infinite_reverse]" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center"
            >
              <Quote className="text-teal-500 w-12 h-12 mb-6 opacity-50" />
              <p className="text-lg md:text-xl text-slate-300 mb-8 font-light italic leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </p>
              
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-800 mb-4 relative">
                <Image
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </div>
              
              <h3 className="text-white font-bold text-lg">{testimonials[currentIndex].name}</h3>
              <p className="text-teal-500 text-sm font-bold uppercase tracking-widest">{testimonials[currentIndex].role}</p>
            </motion.div>
          </AnimatePresence>

          {/* Mechanical Navigation */}
          <div className="flex justify-center items-center gap-8 mt-12">
            <button onClick={prevTestimonial} className="group p-2 hover:bg-slate-800 rounded-full transition-all" aria-label="Previous">
              <Settings size={32} className="text-slate-600 group-hover:text-teal-500 transition-colors" />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    currentIndex === i ? 'w-8 bg-teal-500' : 'w-2 bg-slate-700'
                  }`} 
                />
              ))}
            </div>

            <button onClick={nextTestimonial} className="group p-2 hover:bg-slate-800 rounded-full transition-all" aria-label="Next">
              <Settings size={32} className="text-slate-600 group-hover:text-teal-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}