"use client";

import React, { useState, useMemo } from "react";
import { Calculator, TrendingUp } from "lucide-react";

const ROICalculator = () => {
  // Default values standard for the industry
  const [production, setProduction] = useState(4000); // Bricks per day
  const [cost, setCost] = useState(4.5); // Cost to make 1 brick
  const [price, setPrice] = useState(8.0); // Selling price of 1 brick
  const [days, setDays] = useState(26); // Working days per month

  // Memoize calculations to prevent unnecessary re-renders
  const { profitPerBrick, dailyProfit, monthlyProfit, yearlyProfit } = useMemo(() => {
    const profitPerBrick = price - cost;
    const dailyProfit = profitPerBrick * production;
    const monthlyProfit = dailyProfit * days;
    const yearlyProfit = monthlyProfit * 12;
    return { profitPerBrick, dailyProfit, monthlyProfit, yearlyProfit };
  }, [production, cost, price, days]);

  // Currency Formatter (Indian Rupee)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-teal-100 overflow-hidden my-6 w-full max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 p-4 text-white flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
             <Calculator size={20} className="text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">Profit Calculator</h3>
            <p className="text-teal-100 text-[10px] mt-0.5">Estimate your earnings</p>
          </div>
        </div>
        <TrendingUp className="text-teal-200 opacity-20 w-16 h-16 absolute -right-4 -bottom-4" />
      </div>
      
      <div className="p-5 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* LEFT: Inputs */}
        <div className="space-y-5">
          
          {/* Slider 1: Production */}
          <div>
            <div className="flex justify-between mb-2">
               <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Daily Production</label>
               <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">{production.toLocaleString()} Bricks</span>
            </div>
            <input 
              type="range" min="1000" max="20000" step="500"
              value={production} 
              onChange={(e) => setProduction(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
               <span>1k</span>
               <span>20k+</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Input 2: Cost */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mfg. Cost (₹)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  step="0.1"
                  value={cost} 
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none font-bold text-slate-700 text-sm transition-all"
                />
              </div>
            </div>

            {/* Input 3: Selling Price */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Selling Price (₹)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  step="0.1"
                  value={price} 
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none font-bold text-slate-700 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Input 4: Work Days */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
             <label className="text-xs font-bold text-slate-600">Working Days / Month</label>
             <div className="flex items-center gap-2">
                <button onClick={() => setDays(Math.max(1, days - 1))} className="w-6 h-6 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-teal-50 text-teal-600 font-bold text-sm transition-colors">-</button>
                <span className="w-6 text-center font-bold text-slate-800 text-sm">{days}</span>
                <button onClick={() => setDays(Math.min(31, days + 1))} className="w-6 h-6 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-teal-50 text-teal-600 font-bold text-sm transition-colors">+</button>
             </div>
          </div>

        </div>

        {/* RIGHT: Results Card */}
        <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col justify-between relative overflow-hidden shadow-inner">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-[50px] opacity-20 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
             <div className="flex justify-between items-end border-b border-white/10 pb-3">
               <span className="text-slate-300 text-xs font-medium">Profit Per Brick</span>
               <span className="text-lg font-bold text-white">₹ {profitPerBrick.toFixed(2)}</span>
             </div>

             <div className="flex justify-between items-end border-b border-white/10 pb-3">
               <span className="text-slate-300 text-xs font-medium">Daily Profit</span>
               <span className="text-lg font-bold text-teal-400">{formatCurrency(dailyProfit)}</span>
             </div>

             <div className="pt-1">
               <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1 block">Monthly Potential</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{formatCurrency(monthlyProfit)}</span>
               </div>
               <p className="text-slate-400 text-[10px] mt-1">*Yearly potential: <span className="text-white">{formatCurrency(yearlyProfit)}</span></p>
             </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/5 relative z-10">
             <p className="text-[9px] text-slate-500 leading-tight text-center">
               *Estimations only. Actual profits vary by location and raw material costs.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;