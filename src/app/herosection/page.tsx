"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  TouchEvent
} from "react";
import Image from "next/image";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Target, 
  Star,
  ArrowRight,
  Pause,
  MapPin,
  Quote
} from "lucide-react";

// --- Constants --- //
const MAIN_SLIDE_INTERVAL = 8000; 
const FOUNDER_SLIDE_INTERVAL = 7000; 
const SWIPE_THRESHOLD = 50; 

// --- Types --- //
type BaseSlide = {
  id: string;
  type: "video" | "image";
  src: string;
  alt: string;
  thumbnail?: string;
};

// --- DATA: Updated Content Slides --- //
const FOUNDER_SLIDES = [
  {
    id: "identity",
    render: () => (
      <div className="flex flex-col items-center justify-center h-full w-full relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Glow Effect Behind Image */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-400/30 rounded-full blur-[60px] pointer-events-none"></div>

        {/* --- Profile Image Area --- */}
        <div className="relative mb-2 group">
          <div className="relative w-28 h-28 lg:w-44 lg:h-44 rounded-full bg-white shadow-2xl shadow-teal-900/50">
            <div className="w-full h-full rounded-full overflow-hidden border-teal-900 relative bg-teal-950">
              <Image
                src="/Owner/OwnerProfile.jpg"
                alt="Hasan Ali"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 120px, 180px"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* --- Info Card --- */}
        <div className="w-full max-w-[90%] lg:max-w-[80%] bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 lg:p-6 text-center shadow-xl">
           <h2 className="text-xl lg:text-4xl font-extrabold text-white tracking-tight">
             Hasan Ali
           </h2>
           <p className="text-amber-400 font-bold uppercase text-[10px] lg:text-xs tracking-[0.2em] mb-1">
             Managing Director
           </p>
           
           <div className="flex flex-col items-center gap-1 text-teal-100 text-xs lg:text-sm font-medium border-t border-white/10 pt-2">
             <span className="flex items-center gap-1.5">
               <span className="w-1 h-1 rounded-full bg-teal-400"></span> 
               Ali Enterprises
             </span>
             <span className="flex items-center gap-1.5 opacity-80">
               <MapPin size={12} /> Khatauli, U.P.
             </span>
           </div>
        </div>

        <div className="mt-2">
           <a href="/contactus" className="inline-flex items-center gap-2 text-white font-bold text-xs lg:text-sm border-b border-amber-400/50 pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-all">
             Get in Touch <ArrowRight size={14} />
           </a>
        </div>
      </div>
    )
  },
  {
    id: "awards",
    render: () => (
      <div className="flex flex-col items-center justify-center h-full w-full px-6 relative z-10 animate-in slide-in-from-right duration-500 text-center">
        {/* Large Background Icon */}
        <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 text-teal-800/20 rotate-12 pointer-events-none" />

        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20 rotate-3 transform hover:rotate-6 transition-transform">
          <Trophy className="text-white w-10 h-10 drop-shadow-md" strokeWidth={2} />
        </div>
        
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Excellence Awarded</h2>
        <p className="text-teal-200 text-sm font-medium mb-6">Best Heavy Machinery Supplier</p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
           <div className="bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/5">
              <p className="text-2xl lg:text-3xl font-black text-white">15+</p>
              <p className="text-[10px] uppercase text-teal-400 font-bold">Years Exp.</p>
           </div>
           <div className="bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/5">
              <p className="text-2xl lg:text-3xl font-black text-white">100%</p>
              <p className="text-[10px] uppercase text-teal-400 font-bold">Quality</p>
           </div>
        </div>
      </div>
    )
  },
  {
    id: "vision",
    render: () => (
      <div className="flex flex-col items-center justify-center h-full w-full px-6 relative z-10 animate-in zoom-in duration-500 text-center">
        <div className="mb-6 relative">
           <div className="absolute inset-0 bg-teal-400 blur-xl opacity-20 animate-pulse"></div>
           <Target className="text-teal-300 w-16 h-16 relative z-10" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-xl lg:text-3xl font-bold text-white mb-6">Our Vision</h2>
        
        <div className="relative">
           <Quote className="absolute -top-4 -left-4 text-teal-500/30 w-8 h-8 transform -scale-x-100" />
           <p className="text-teal-50 text-sm lg:text-lg leading-relaxed font-medium max-w-xs mx-auto italic">
             "To revolutionize the manufacturing sector with affordable, <span className="text-amber-400 not-italic font-bold bg-amber-400/10 px-1 rounded">AI-driven</span> automated solutions."
           </p>
           <Quote className="absolute -bottom-4 -right-4 text-teal-500/30 w-8 h-8" />
        </div>

        <div className="mt-8">
          <a href="/products" className="bg-white text-teal-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-teal-50 transition-colors flex items-center gap-2">
            View Technology <ArrowRight size={16} />
          </a>
        </div>
      </div>
    )
  }
];

// --- Skeleton Component ---
const HeroSkeleton = () => (
  <div className="w-full flex flex-col lg:flex-row h-[85vh] lg:h-[650px] gap-3 p-3 lg:p-4 bg-slate-50">
    <div className="w-full lg:w-[68%] h-[60%] lg:h-full bg-slate-200 animate-pulse rounded-2xl"></div>
    <div className="w-full lg:w-[32%] h-[40%] lg:h-full bg-slate-200 animate-pulse rounded-2xl"></div>
  </div>
);

// --- Video Slide Component ---
const VideoSlide = ({
  slide,
  isActive,
  onVideoEnd,
  setVideoPlaying,
}: {
  slide: BaseSlide;
  isActive: boolean;
  onVideoEnd: () => void;
  setVideoPlaying: (playing: boolean) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().then(() => setVideoPlaying(true)).catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
      setVideoPlaying(false);
    }
  }, [isActive, setVideoPlaying]);

  return (
    <div className="w-full h-full relative bg-slate-900 flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={slide.src}
        className="w-full h-full object-cover" 
        muted
        playsInline
        onEnded={() => {
          setVideoPlaying(false);
          onVideoEnd();
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

// --- Main Hero Component ---
const HeroSection = () => {
  const [slides, setSlides] = useState<BaseSlide[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMainPaused, setIsMainPaused] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const touchStartMain = useRef<number>(0);
  
  const [founderIndex, setFounderIndex] = useState(0);
  const [isFounderPaused, setIsFounderPaused] = useState(false);
  const touchStartFounder = useRef<number>(0);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const q = query(collection(db, "hero_slides"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BaseSlide[];
        const sorted = data.sort((a, b) => (a.type === "video" ? -1 : 1));
        setSlides(sorted);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // --- Navigation Logic ---
  const navigateMain = useCallback((direction: "next" | "prev") => {
    setCurrentIndex((prev) => {
      const count = slides.length;
      if (count === 0) return 0;
      return direction === "next" ? (prev + 1) % count : (prev === 0 ? count - 1 : prev - 1);
    });
  }, [slides.length]);

  const navigateFounder = useCallback((direction: "next" | "prev") => {
    setFounderIndex((prev) => {
      const count = FOUNDER_SLIDES.length;
      return direction === "next" ? (prev + 1) % count : (prev === 0 ? count - 1 : prev - 1);
    });
  }, []);

  // --- Timers ---
  useEffect(() => {
    if (isMainPaused || videoPlaying || slides.length <= 1) return;
    const interval = setInterval(() => navigateMain("next"), MAIN_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [isMainPaused, videoPlaying, slides.length, navigateMain]);

  useEffect(() => {
    if (isFounderPaused) return;
    const interval = setInterval(() => navigateFounder("next"), FOUNDER_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [isFounderPaused, navigateFounder]);

  // --- Swipe Handlers ---
  const onTouchStart = (e: TouchEvent, type: 'main' | 'founder') => {
    if (type === 'main') {
      setIsMainPaused(true);
      touchStartMain.current = e.touches[0].clientX;
    } else {
      setIsFounderPaused(true);
      touchStartFounder.current = e.touches[0].clientX;
    }
  };

  const onTouchEnd = (e: TouchEvent, type: 'main' | 'founder') => {
    const touchEnd = e.changedTouches[0].clientX;
    const touchStart = type === 'main' ? touchStartMain.current : touchStartFounder.current;
    
    if (touchStart - touchEnd > SWIPE_THRESHOLD) {
      if (type === 'main') navigateMain("next");
      else navigateFounder("next");
    } else if (touchEnd - touchStart > SWIPE_THRESHOLD) {
      if (type === 'main') navigateMain("prev");
      else navigateFounder("prev");
    }

    setTimeout(() => {
        if (type === 'main') setIsMainPaused(false);
        else setIsFounderPaused(false);
    }, 4000);
  };

  if (loading) return <HeroSkeleton />;

  return (
    // Reduced Height: h-[85vh] on mobile, h-[650px] on desktop
    <section className="w-full bg-slate-50 flex flex-col lg:flex-row h-[90vh] lg:h-[750px] overflow-hidden lg:p-4 gap-3 relative">
      
      {/* =========================================================
          LEFT: MAIN SLIDER
      ========================================================= */}
      <div 
        className="w-full lg:w-[68%] relative h-[60%] lg:h-full bg-slate-900 overflow-hidden rounded-b-2xl lg:rounded-2xl shadow-xl z-10 group"
        onMouseEnter={() => setIsMainPaused(true)}
        onMouseLeave={() => setIsMainPaused(false)}
        onTouchStart={(e) => onTouchStart(e, 'main')}
        onTouchEnd={(e) => onTouchEnd(e, 'main')}
      >
        {!isMainPaused && !videoPlaying && slides.length > 1 && (
            <div className="absolute top-0 left-0 h-1 bg-teal-500/50 z-30 w-full">
                <div 
                    className="h-full bg-teal-400 origin-left animate-progress"
                    style={{ animationDuration: `${MAIN_SLIDE_INTERVAL}ms` }}
                    key={currentIndex} 
                />
            </div>
        )}

        <div
          className="flex h-full transition-transform duration-[800ms] cubic-bezier(0.2, 0.8, 0.2, 1) will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.length > 0 ? slides.map((slide, idx) => (
            <div key={slide.id} className="min-w-full h-full relative">
              {slide.type === "video" ? (
                <VideoSlide 
                  slide={slide} 
                  isActive={currentIndex === idx}
                  setVideoPlaying={setVideoPlaying}
                  onVideoEnd={() => navigateMain("next")} 
                />
              ) : (
                <div className="relative w-full h-full bg-slate-900">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="object-cover object-center transition-transform duration-[10s] hover:scale-105"
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90">
                      {/* Compact Caption Positioning */}
                      <div className="absolute bottom-6 left-5 lg:bottom-12 lg:left-10 max-w-[90%] lg:max-w-[80%]">
                          <h3 className={`text-white text-xl sm:text-2xl lg:text-5xl font-bold leading-tight drop-shadow-lg transform transition-all duration-700 ${currentIndex === idx ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                              {slide.alt}
                          </h3>
                          <div className={`mt-3 h-1 w-12 bg-teal-500 rounded-full transition-all duration-700 delay-200 ${currentIndex === idx ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}></div>
                      </div>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="min-w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                <p>No slides available</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={`absolute inset-0 flex items-center justify-between px-2 pointer-events-none transition-opacity duration-300 z-50 ${isMainPaused ? 'opacity-100' : 'opacity-0 lg:opacity-0 lg:group-hover:opacity-100'}`}>
             <button onClick={() => navigateMain("prev")} className="pointer-events-auto w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-lg">
                <ChevronLeft size={20} />
             </button>
             <button onClick={() => navigateMain("next")} className="pointer-events-auto w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-lg">
                <ChevronRight size={20} />
             </button>
        </div>

        <div className="absolute bottom-3 right-5 flex gap-1.5 z-50">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all duration-300 shadow-sm ${currentIndex === idx ? "w-6 bg-teal-400" : "w-1.5 bg-white/40 hover:bg-white"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        
        {isMainPaused && (
            <div className="absolute top-4 right-4 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white/80 animate-fade-in z-40">
                <Pause size={14} fill="currentColor" />
            </div>
        )}
      </div>

      {/* =========================================================
          RIGHT: FOUNDER/COMPANY WIDGET
      ========================================================= */}
      <div 
        className="w-full lg:w-[32%] h-[40%] lg:h-full relative overflow-hidden bg-gradient-to-br from-teal-700 to-teal-950 text-slate-200 shadow-xl z-20 rounded-t-2xl lg:rounded-2xl -mt-6 lg:mt-0 border-t lg:border border-white/10 group"
        onMouseEnter={() => setIsFounderPaused(true)}
        onMouseLeave={() => setIsFounderPaused(false)}
        onTouchStart={(e) => onTouchStart(e, 'founder')}
        onTouchEnd={(e) => onTouchEnd(e, 'founder')}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

        {!isFounderPaused && (
            <div className="absolute top-0 left-0 h-1 bg-white/10 z-30 w-full">
                <div 
                    className="h-full bg-amber-400 origin-left animate-progress"
                    style={{ animationDuration: `${FOUNDER_SLIDE_INTERVAL}ms` }}
                    key={founderIndex}
                />
            </div>
        )}

        <div 
          className="flex h-full transition-transform duration-500 ease-out will-change-transform relative z-10"
          style={{ transform: `translateX(-${founderIndex * 100}%)` }}
        >
          {FOUNDER_SLIDES.map((slide) => (
            <div key={slide.id} className="min-w-full h-full relative flex items-center justify-center p-3">
                {slide.render()}
            </div>
          ))}
        </div>

        {/* Arrows */}
        <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-2 pointer-events-none transition-opacity duration-300 z-50 ${isFounderPaused ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'}`}>
           <button 
             onClick={(e) => { e.stopPropagation(); navigateFounder("prev"); }} 
             className="pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-lg"
           >
             <ChevronLeft size={16} />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); navigateFounder("next"); }} 
             className="pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-lg"
           >
             <ChevronRight size={16} />
           </button>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-3 w-full flex justify-center items-center z-50">
           <div className="flex gap-1.5 p-1 rounded-full bg-black/20 backdrop-blur-md border border-white/5 shadow-sm">
             {FOUNDER_SLIDES.map((_, i) => (
               <button 
                 key={i}
                 onClick={(e) => { e.stopPropagation(); setFounderIndex(i); }}
                 className={`transition-all duration-300 rounded-full cursor-pointer ${founderIndex === i ? "w-2 h-2 bg-amber-400" : "w-1 h-1 bg-white/40 hover:bg-white"}`}
                 aria-label={`Go to slide ${i + 1}`}
               />
             ))}
           </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
        }
        .animate-progress {
            animation-name: progress;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
        }
        .animate-bounce-slow {
            animation: bounce 3s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
      `}</style>
    </section>
  );
};

export default memo(HeroSection);