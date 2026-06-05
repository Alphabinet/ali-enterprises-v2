"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ScriptableContext,
  ChartOptions
} from "chart.js";
import { motion } from "framer-motion";
import { TrendingUp, Trophy, Globe, BarChart3 } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- Sales Data: Showing exponential market adoption ---
const labels = ["2021", "2022", "2023", "2024", "2025", "2026 (Est.)"];
const salesData = [120, 280, 550, 890, 1350, 1800];

const GrowthGraph: React.FC = () => {

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Machines Deployed",
        data: salesData,
        fill: true,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(20, 184, 166, 0.5)"); // Teal-500
          gradient.addColorStop(1, "rgba(20, 184, 166, 0.0)");
          return gradient;
        },
        borderColor: "#14b8a6", // Teal-500
        borderWidth: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#14b8a6",
        pointHoverBackgroundColor: "#f59e0b", // Amber glow on hover
        pointHoverBorderColor: "#fff",
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBorderWidth: 2,
        tension: 0.4, // Smooth upward curve
      }
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Hidden since it's only one dataset
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.95)", // Slate-900
        titleColor: "#f59e0b", // Amber
        bodyColor: "#f8fafc", // Slate-50
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 14, weight: 'bold' },
        callbacks: {
          label: (context) => {
            return ` ${context.parsed.y} Units Deployed`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#94a3b8", font: { family: "inherit", size: 12, weight: 'bold' } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)", tickLength: 0 },
        ticks: { 
            color: "#94a3b8", 
            font: { size: 12, weight: 'bold' },
            callback: (value) => `${value}` 
        },
        border: { display: false },
      },
    },
    interaction: {
      mode: "nearest",
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <section className="py-12 lg:py-12 bg-slate-50 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        
        {/* --- Header Section --- */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-teal-700 bg-teal-100 px-4 py-2 rounded-full mb-4"
          >
            <BarChart3 size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Market Leaders</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4"
          >
            Trusted by Thousands <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Across India.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-sm lg:text-base"
          >
            Our commitment to flawless heavy-duty performance has driven our sales from a hundred units a year to over a thousand, making us the top choice for brick production.
          </motion.p>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Left: Leadership & Growth Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4 flex flex-col gap-2"
          >
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl shadow-slate-900/20 transform hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-4 relative z-10">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 relative z-10">10x Sales Growth</h3>
              <p className="text-slate-400 text-sm relative z-10">Annual machine deployments over the last 5 years. Unmatched reliability and client referrals.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Undisputed Leader</h3>
              <p className="text-slate-500 text-sm">From local startups to massive infrastructure firms.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Expanding Footprint</h3>
              <p className="text-slate-500 text-sm">Rapidly expanding our presence, delivering world-class manufacturing technology.</p>
            </div>
          </motion.div>

          {/* Right: The High-End Chart */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 bg-slate-900 rounded-[2rem] p-6 lg:p-8 relative shadow-2xl border border-slate-800"
          >
            {/* Ambient Glow behind the chart */}
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/20 to-slate-900 rounded-[2rem] pointer-events-none"></div>
            
            <div className="relative z-10 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Annual Machine Delivered</h3>
                <p className="text-slate-400 text-sm mt-1">Total operational Machines delivered.</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl">
                 <span className="text-xs text-amber-200 block font-bold uppercase tracking-wider mb-0.5">Delivered Machines</span>
                 <span className="text-lg font-black text-amber-400">1800+ unit Year</span>
              </div>
            </div>

            {/* Explicit height prevents layout shift */}
            <div className="relative w-full h-[300px] md:h-[400px] z-10">
              <Line data={chartData} options={options} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default GrowthGraph;
