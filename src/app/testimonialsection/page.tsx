"use client";

import React, { useState, useEffect, useRef, useCallback, TouchEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star, Loader2 } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore"; // Import Firebase
import { db } from "@/lib/firebase";

// --- Types ---
type Testimonial = {
  id: string; // Added ID
  name: string;
  image: string;
  quote: string;
  role: string;
};

// --- Swipe Hook (Unchanged) ---
const useSwipe = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    touchEnd.current = 0;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) onSwipeLeft();
    if (isRightSwipe) onSwipeRight();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // --- FETCH DATA FROM FIREBASE ---
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Testimonial[];

        if (data.length > 0) {
          setTestimonials(data);
        } else {
           // Fallback if no reviews exist in DB yet
           // You can remove this else block once you have real data
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-cycle logic
  useEffect(() => {
    if (isPaused || testimonials.length === 0) return;
    const timer = setInterval(() => {
      nextTestimonial();
    }, 6000); 
    return () => clearInterval(timer);
  }, [isPaused, currentIndex, testimonials.length]);

  const nextTestimonial = useCallback(() => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  }, [testimonials.length]);

  // Swipe handlers
  const swipeHandlers = useSwipe(nextTestimonial, prevTestimonial);

  if (loading) {
    return (
       <section className="py-20 bg-gray-50 flex justify-center items-center h-[500px]">
          <Loader2 className="animate-spin text-teal-600 w-10 h-10" />
       </section>
    );
  }

  if (testimonials.length === 0) return null; // Don't show section if empty

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-200 relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-teal-600 mb-3"
          >
            <span className="w-8 h-0.5 bg-teal-600"></span>
            <span className="text-sm font-bold uppercase tracking-widest">Client Success Stories</span>
            <span className="w-8 h-0.5 bg-teal-600"></span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gray-900"
          >
            Trusted by <span className="text-teal-600">Industry Leaders</span>
          </motion.h2>
        </div>

        {/* Main Card Area */}
        <div 
          className="relative max-w-4xl mx-auto touch-pan-y" 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          {...swipeHandlers}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-xl p-6 md:p-12 relative overflow-hidden border border-white/50 min-h-[300px] flex items-center"
            >
              {/* Large Background Quote Icon */}
              <Quote className="absolute top-4 right-8 text-gray-100 w-24 h-24 md:w-48 md:h-48 -z-0 rotate-12" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full">
                
                {/* Profile Image Column */}
                <div className="flex-shrink-0 relative group">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-teal-500 to-amber-400 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                      <Image
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-teal-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide whitespace-nowrap z-20">
                    Verified Client
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <blockquote className="text-base md:text-xl text-gray-700 leading-relaxed font-medium mb-6 italic">
                    "{testimonials[currentIndex].quote}"
                  </blockquote>

                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      {testimonials[currentIndex].name}
                    </h3>
                    <p className="text-sm md:text-base text-teal-600 font-bold">
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons (Desktop) */}
          <button
            onClick={prevTestimonial}
            className="absolute top-1/2 -left-5 md:-left-16 -translate-y-1/2 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-teal-50 hover:text-teal-600 transition-all focus:outline-none z-20 group hidden lg:block"
            aria-label="Previous"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute top-1/2 -right-5 md:-right-16 -translate-y-1/2 bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-teal-50 hover:text-teal-600 transition-all focus:outline-none z-20 group hidden lg:block"
            aria-label="Next"
          >
            <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Dots / Pagination */}
        <div className="flex justify-center items-center gap-2 mt-8 md:mt-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index
                  ? "w-8 h-2 bg-teal-600"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;