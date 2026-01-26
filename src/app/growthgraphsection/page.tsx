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
import { TrendingUp, Activity, Calendar } from "lucide-react";

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

const data = [
  { year: 2020, growth: 5 },
  { year: 2021, growth: 10 },
  { year: 2022, growth: 12 },
  { year: 2023, growth: 18 },
  { year: 2024, growth: 22 },
];

const GrowthGraph: React.FC = () => {
  
  const chartData = {
    labels: data.map((item) => item.year),
    datasets: [
      {
        label: "Growth Rate (%)",
        data: data.map((item) => item.growth),
        fill: true,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(13, 148, 136, 0.3)"); // Teal-500 low opacity
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
          return gradient;
        },
        borderColor: "#0d9488", // Teal-600
        pointBackgroundColor: "#fff",
        pointBorderColor: "#0d9488",
        pointHoverBackgroundColor: "#f59e0b", // Amber
        pointHoverBorderColor: "#fff",
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)", // Slate-900
        titleColor: "#f59e0b",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Growth: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { family: "inherit", size: 11 } },
      },
      y: {
        grid: { color: "#f1f5f9", tickLength: 0 },
        ticks: { 
            color: "#94a3b8", 
            font: { size: 11 },
            callback: (value) => value + "%" 
        },
        border: { display: false },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
  };

  return (
    <section className="py-12 lg:py-16 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-auto text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 text-teal-600 mb-2 justify-center md:justify-start w-full md:w-auto">
              <Activity size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Performance Metrics</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Year-on-Year <span className="text-teal-600">Growth</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto md:mx-0">
              Consistent expansion and reliability in the industrial machinery sector.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-3 w-full md:w-auto justify-center"
          >
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 md:flex-none min-w-[120px] max-w-[150px]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                <TrendingUp size={12} className="text-teal-600" /> Current Peak
              </div>
              <div className="text-xl font-bold text-slate-900">22%</div>
              <div className="text-[10px] text-green-600 font-bold">+4% vs last year</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 md:flex-none min-w-[120px] max-w-[150px]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
                <Calendar size={12} className="text-amber-500" /> Timeframe
              </div>
              <div className="text-xl font-bold text-slate-900">5 Yrs</div>
              <div className="text-[10px] text-slate-400 font-bold">2020 - 2024</div>
            </div>
          </motion.div>
        </div>

        {/* Chart Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl p-4 lg:p-6 relative z-10"
        >
          {/* Explicit height prevents layout shift */}
          <div className="relative w-full h-[280px] md:h-[350px]">
            <Line data={chartData} options={options} />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default GrowthGraph;