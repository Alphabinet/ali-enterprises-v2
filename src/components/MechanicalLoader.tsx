import React from "react";
import { Settings } from "lucide-react";

export default function MechanicalLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full z-50 bg-slate-50">
      <div className="relative w-24 h-24 flex items-center justify-center mb-4">
        {/* Main Gear (Clockwise) */}
        <Settings 
          size={56} 
          className="absolute top-2 left-2 text-teal-600 animate-spin" 
          style={{ animationDuration: '3s' }} 
          strokeWidth={1.5} 
        />
        {/* Secondary Gear (Counter-Clockwise) */}
        <Settings 
          size={40} 
          className="absolute bottom-2 right-1 text-slate-400" 
          style={{ animation: 'spin 3s linear infinite reverse' }} 
          strokeWidth={1.5} 
        />
      </div>
      <span className="text-xs font-bold text-slate-500 tracking-widest uppercase animate-pulse">
        System Loading...
      </span>
    </div>
  );
}