"use client";

import React, { useState, useEffect, Suspense } from "react";
import { TrendingUp, Activity, BarChart2, MoreVertical, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation"; 
import AdminNavbar from "@/components/adminnavbar"; 

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [analyticsChartType, setAnalyticsChartType] = useState<"LINE" | "BAR" | "PIE">("LINE");
  const [isAnalyticsMenuOpen, setIsAnalyticsMenuOpen] = useState(false);
  const [analyticsSidebarTab, setAnalyticsSidebarTab] = useState<"TREND" | "INCOME">("TREND");
  const [isAnalyticsFilterOpen, setIsAnalyticsFilterOpen] = useState(false);
  const [chartTimeFilter, setChartTimeFilter] = useState<"Day" | "Week" | "Month">("Week");

  // MENANGKAP URL DARI NAVBAR
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "INCOME") {
      setAnalyticsSidebarTab("INCOME");
    } else {
      setAnalyticsSidebarTab("TREND");
    }
  }, [searchParams]);

  // FUNGSI SAAT TOMBOL SIDEBAR DIKLIK (AGAR URL IKUT BERUBAH)
  const handleTabChange = (tab: "TREND" | "INCOME") => {
    setAnalyticsSidebarTab(tab);
    router.push(`/Dashboard-Admin/analytics?tab=${tab}`);
  };

  const packageStatsData = {
    Day: [{ name: "MAJU ECONOMY", value: 15, color: "#6b21a8" }, { name: "MAJU STANDARD", value: 30, color: "#8b5cf6" }, { name: "MAJU HEAVY", value: 10, color: "#a855f7" }, { name: "MAJU EXPRESS", value: 45, color: "#c084fc" }, { name: "MAJU VIP", value: 25, color: "#e879f9" }],
    Week: [{ name: "MAJU ECONOMY", value: 45, color: "#6b21a8" }, { name: "MAJU STANDARD", value: 35, color: "#8b5cf6" }, { name: "MAJU HEAVY", value: 55, color: "#a855f7" }, { name: "MAJU EXPRESS", value: 60, color: "#c084fc" }, { name: "MAJU VIP", value: 75, color: "#e879f9" }],
    Month: [{ name: "MAJU ECONOMY", value: 65, color: "#6b21a8" }, { name: "MAJU STANDARD", value: 95, color: "#8b5cf6" }, { name: "MAJU HEAVY", value: 55, color: "#a855f7" }, { name: "MAJU EXPRESS", value: 70, color: "#c084fc" }, { name: "MAJU VIP", value: 45, color: "#e879f9" }],
  };
  const currentPackageData = packageStatsData[chartTimeFilter];
  const topTrendPackage = currentPackageData.reduce((prev, curr) => prev.value > curr.value ? prev : curr);
  const trendTotalUse = currentPackageData.reduce((acc, curr) => acc + curr.value, 0);
  const trendTopPercentage = ((topTrendPackage.value / trendTotalUse) * 100).toFixed(0);
  
  let trendPieCurrentAngle = 0;
  const trendConicGradients = currentPackageData.map((stat) => { const angle = (stat.value / trendTotalUse) * 360; const start = trendPieCurrentAngle; trendPieCurrentAngle += angle; return `${stat.color} ${start}deg ${trendPieCurrentAngle}deg`; }).join(", ");

  const incomeStatsData = {
    Day: [{ name: "MAJU ECONOMY", value: 0.12, color: "#6b21a8" }, { name: "MAJU STANDARD", value: 0.25, color: "#8b5cf6" }, { name: "MAJU HEAVY", value: 0.08, color: "#a855f7" }, { name: "MAJU EXPRESS", value: 0.15, color: "#c084fc" }, { name: "MAJU VIP", value: 0.19, color: "#e879f9" }],
    Week: [{ name: "MAJU ECONOMY", value: 0.45, color: "#6b21a8" }, { name: "MAJU STANDARD", value: 0.35, color: "#8b5cf6" }, { name: "MAJU HEAVY", value: 0.55, color: "#a855f7" }, { name: "MAJU EXPRESS", value: 0.42, color: "#c084fc" }, { name: "MAJU VIP", value: 0.50, color: "#e879f9" }],
    Month: [{ name: "MAJU ECONOMY", value: 0.85, color: "#6b21a8" }, { name: "MAJU STANDARD", value: 1.25, color: "#8b5cf6" }, { name: "MAJU HEAVY", value: 1.10, color: "#a855f7" }, { name: "MAJU EXPRESS", value: 0.90, color: "#c084fc" }, { name: "MAJU VIP", value: 1.05, color: "#e879f9" }],
  };
  const currentIncomeData = incomeStatsData[chartTimeFilter];
  const topIncomePackage = currentIncomeData.reduce((prev, curr) => prev.value > curr.value ? prev : curr);
  const incomeTotalValue = currentIncomeData.reduce((acc, curr) => acc + curr.value, 0);
  
  let incomePieCurrentAngle = 0;
  const incomeConicGradients = currentIncomeData.map((stat) => { const angle = (stat.value / incomeTotalValue) * 360; const start = incomePieCurrentAngle; incomePieCurrentAngle += angle; return `${stat.color} ${start}deg ${incomePieCurrentAngle}deg`; }).join(", ");

  const generateSmoothPath = (data: number[], maxY: number) => {
    if (!data || data.length === 0) return "";
    const points = data.map((val, i) => [(i / (data.length - 1)) * 1000, 400 - (val / maxY) * 400]);
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) { const prev = points[i - 1]; const curr = points[i]; const cpX = (prev[0] + curr[0]) / 2; d += ` C ${cpX} ${prev[1]}, ${cpX} ${curr[1]}, ${curr[0]} ${curr[1]}`; }
    return d;
  };
  const generateFillPath = (data: number[], maxY: number) => { if (!data || data.length === 0) return ""; return `${generateSmoothPath(data, maxY)} L 1000 400 L 0 400 Z`; };

  const timeLabels = { Day: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"], Week: ["MON 12", "TUE 13", "WED 14", "THU 15", "FRI 16", "SAT 17", "SUN 18"], Month: ["1ST", "5TH", "10TH", "15TH", "20TH", "25TH", "30TH"] };
  const trendTimeSeries = { Day: { data: [20, 35, 28, 55, 40, 70, 65], max: 100, yLabels: ["100K", "80K", "60K", "40K", "20K", "0"] }, Week: { data: [65, 80, 50, 110, 95, 140, 120], max: 150, yLabels: ["150K", "120K", "90K", "60K", "30K", "0"] }, Month: { data: [250, 320, 280, 390, 310, 440, 380], max: 500, yLabels: ["500K", "400K", "300K", "200K", "100K", "0"] } };
  const incomeTimeSeries = { Day: { actual: [0.3, 0.5, 0.4, 0.8, 0.6, 1.0, 0.9], target: [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7], max: 1.5, yLabels: ["1.5M", "1.2M", "0.9M", "0.6M", "0.3M", "0"] }, Week: { actual: [0.8, 0.9, 1.4, 1.7, 1.3, 1.5, 1.8], target: [1.2, 1.3, 1.2, 1.3, 1.2, 1.3, 1.2], max: 2.5, yLabels: ["2.5M", "2.0M", "1.5M", "1.0M", "0.5M", "0"] }, Month: { actual: [1.5, 2.8, 2.1, 3.8, 3.1, 4.5, 4.1], target: [2.5, 2.7, 2.9, 3.1, 3.3, 3.5, 3.7], max: 5, yLabels: ["5.0M", "4.0M", "3.0M", "2.0M", "1.0M", "0"] } };

  const currentXLabels = timeLabels[chartTimeFilter];
  const currentTrendTimeData = trendTimeSeries[chartTimeFilter];
  const currentIncomeTimeData = incomeTimeSeries[chartTimeFilter];

  return (
    <>
      <main className="w-full flex flex-1 overflow-hidden mt-4">
        <div className="flex-1 flex flex-col px-6 md:px-10 overflow-y-auto custom-scrollbar relative z-10 pb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col flex-1 h-full">
            
            {analyticsSidebarTab === "TREND" && (
              <>
                <h1 className="font-grotesk font-bold text-[32px] tracking-[2px] uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-8 mt-2">PACKAGE TREND</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#121317]/60 border border-white/5 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 transition-shadow" style={{ backgroundColor: topTrendPackage.color, boxShadow: `0 0 15px ${topTrendPackage.color}` }}></div>
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Favourite Package Type</p>
                    <h3 className="font-grotesk font-bold text-[32px] tracking-[2px] text-white mb-2">{topTrendPackage.name}</h3>
                    <div className="w-[80%] h-1 bg-white/10 mt-4 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-500" style={{ width: `${trendTopPercentage}%`, backgroundColor: topTrendPackage.color }}></div>
                    </div>
                  </div>
                  <div className="bg-[#121317]/60 border border-white/5 p-6">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Total Volumes</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <h3 className="font-grotesk font-bold text-[36px] leading-none text-white">{trendTotalUse}k</h3>
                      <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase">/ {chartTimeFilter}</span>
                    </div>
                    <p className="font-mono text-[10px] text-[#00E3FD] flex items-center gap-1.5 tracking-widest"><TrendingUp size={14} /> +4.2% VS LAST {chartTimeFilter.toUpperCase()}</p>
                  </div>
                  <div className="bg-[#121317]/60 border border-white/5 p-6">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Peak Contributor</p>
                    <h3 className="font-grotesk font-bold text-[36px] leading-none text-white">{topTrendPackage.value}k</h3>
                  </div>
                </div>

                <div className="bg-[#121317]/40 border border-white/5 rounded-xl p-8 flex flex-col relative flex-1 min-h-[300px]">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-grotesk text-[18px] text-[#E5B5FF] uppercase tracking-[2px] font-bold">MOST USED PACKAGE TYPE</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#B026FF]"></div><span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">PACKAGE TYPE</span></div>
                      <div className="relative">
                        <button onClick={() => setIsAnalyticsMenuOpen(!isAnalyticsMenuOpen)} className="text-white/40 hover:text-white transition-colors p-1"><MoreVertical size={18} /></button>
                        <AnimatePresence>
                          {isAnalyticsMenuOpen && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute right-0 top-full mt-2 w-[160px] bg-[#1a1b22] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                              <div onClick={() => {setAnalyticsChartType("BAR"); setIsAnalyticsMenuOpen(false);}} className={`px-4 py-3 text-[11px] font-mono cursor-pointer uppercase tracking-widest transition-colors flex items-center gap-3 ${analyticsChartType === "BAR" ? "text-[#E5B5FF] bg-[#B026FF]/20 font-bold" : "text-white/60 hover:text-white hover:bg-white/5"}`}><BarChart2 size={14}/> Bar Chart</div>
                              <div onClick={() => {setAnalyticsChartType("LINE"); setIsAnalyticsMenuOpen(false);}} className={`px-4 py-3 text-[11px] font-mono cursor-pointer uppercase tracking-widest transition-colors flex items-center gap-3 ${analyticsChartType === "LINE" ? "text-[#E5B5FF] bg-[#B026FF]/20 font-bold" : "text-white/60 hover:text-white hover:bg-white/5"}`}><TrendingUp size={14}/> Line Chart</div>
                              <div onClick={() => {setAnalyticsChartType("PIE"); setIsAnalyticsMenuOpen(false);}} className={`px-4 py-3 text-[11px] font-mono cursor-pointer uppercase tracking-widest transition-colors flex items-center gap-3 ${analyticsChartType === "PIE" ? "text-[#E5B5FF] bg-[#B026FF]/20 font-bold" : "text-white/60 hover:text-white hover:bg-white/5"}`}><Activity size={14}/> Pie Chart</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full relative flex items-center justify-center mt-4">
                    {analyticsChartType === "BAR" && (
                      <div className="flex-1 flex items-end border-b border-l border-white/10 w-full h-full relative pb-0 pl-12">
                        <div className="absolute inset-0 flex flex-col justify-between pb-8 pl-12 pointer-events-none z-0">
                          {["100", "75", "50", "25", "10"].map((label, idx) => (<div key={idx} className="w-full border-t border-white/5 h-0 relative"><span className="absolute -left-10 -top-2 text-[9px] font-mono text-white/40">{label}</span></div>))}
                        </div>
                        <div className="flex w-full h-[calc(100%-32px)] z-10"> 
                          {currentPackageData.map((stat, idx) => (
                            <div key={stat.name} className="flex-1 flex flex-col justify-end group h-full relative mx-1">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${(stat.value / topTrendPackage.value) * 100}%` }} transition={{ type: "spring", stiffness: 60, damping: 15, delay: idx * 0.1 }} className="w-full relative transition-all duration-300 opacity-90 group-hover:opacity-100" style={{ background: `linear-gradient(to top, rgba(176,38,255,0.2) 0%, ${stat.color} 100%)` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a0a0c] text-[#E5B5FF] border border-[#B026FF]/50 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-[0_0_10px_rgba(176,38,255,0.3)]">{stat.value}K</div>
                              </motion.div>
                              <span className="absolute -bottom-8 left-0 right-0 text-center text-[10px] font-mono text-white/40 uppercase tracking-widest group-hover:text-[#E5B5FF] transition-colors">{stat.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {analyticsChartType === "LINE" && (
                      <div className="flex-1 w-full h-full relative border-b border-l border-white/10 pb-8 pl-12">
                        <div className="absolute inset-0 flex flex-col justify-between pb-8 pl-12 pointer-events-none z-0">
                          {currentTrendTimeData.yLabels.map((label, idx) => (<div key={idx} className="w-full border-t border-white/5 h-0 relative"><span className="absolute -left-10 -top-2 text-[9px] font-mono text-white/40">{label}</span></div>))}
                        </div>
                        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className="w-full h-[calc(100%-32px)] overflow-visible absolute bottom-8 left-12 right-0 z-10" style={{ width: 'calc(100% - 48px)' }}>
                          <defs>
                            <linearGradient id="purpleFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(176, 38, 255, 0.3)" /><stop offset="100%" stopColor="rgba(176, 38, 255, 0)" /></linearGradient>
                            <filter id="glow-purple-trend"><feGaussianBlur stdDeviation="5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          </defs>
                          <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }} d={generateFillPath(currentTrendTimeData.data, currentTrendTimeData.max)} fill="url(#purpleFill)" />
                          <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} d={generateSmoothPath(currentTrendTimeData.data, currentTrendTimeData.max)} fill="none" stroke="#E5B5FF" strokeWidth="4" style={{ filter: "url(#glow-purple-trend)" }} />
                          {currentTrendTimeData.data.map((val, i) => (
                            <g key={i} className="group cursor-pointer">
                              <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }} cx={(i / (currentTrendTimeData.data.length - 1)) * 1000} cy={400 - (val / currentTrendTimeData.max) * 400} r="6" fill="#1a1b22" stroke="#B026FF" strokeWidth="3" className="hover:scale-[1.8] hover:fill-[#E5B5FF] transition-all" />
                              <text x={(i / (currentTrendTimeData.data.length - 1)) * 1000} y={400 - (val / currentTrendTimeData.max) * 400 - 20} textAnchor="middle" fill="#E5B5FF" className="text-[12px] font-mono opacity-0 group-hover:opacity-100 transition-opacity font-bold">{val}K</text>
                            </g>
                          ))}
                        </svg>
                        <div className="absolute -bottom-6 left-12 right-0 h-6 z-20">
                          {currentXLabels.map((label, idx) => (<span key={idx} className="absolute text-center text-[9px] font-mono text-white/40 uppercase tracking-widest transform -translate-x-1/2" style={{ left: `${(idx / (currentXLabels.length - 1)) * 100}%` }}>{label}</span>))}
                        </div>
                      </div>
                    )}
                    {analyticsChartType === "PIE" && (
                      <div className="flex w-full h-full items-center justify-center gap-16">
                        <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 50, damping: 20 }} className="w-[250px] h-[250px] rounded-full relative shrink-0" style={{ background: `conic-gradient(${trendConicGradients})`, boxShadow: "0 0 40px rgba(176,38,255,0.2)" }}>
                          <div className="absolute inset-[40px] bg-[#1a1b22] rounded-full flex items-center justify-center flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                             <span className="font-grotesk font-bold text-2xl text-white">100%</span>
                             <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Total Data</span>
                          </div>
                        </motion.div>
                        <div className="flex flex-col gap-4">
                          {currentPackageData.map((stat, i) => (
                             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={stat.name} className="flex items-center gap-3">
                               <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: stat.color }}></div>
                               <div>
                                 <p className="font-mono text-[11px] text-white/70 uppercase tracking-widest">{stat.name}</p>
                                 <p className="font-bold text-[14px] text-white">{stat.value}K <span className="text-white/30 text-[10px] font-normal">({((stat.value/trendTotalUse)*100).toFixed(1)}%)</span></p>
                               </div>
                             </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {analyticsSidebarTab === "INCOME" && (
              <>
                <h1 className="font-grotesk font-bold text-[32px] tracking-[2px] uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-8 mt-2">AVERAGE INCOME</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#121317]/60 border border-white/5 p-6 relative overflow-hidden">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Average Percentage</p>
                    <div className="flex items-baseline gap-2 mb-3"><h3 className="font-grotesk font-bold text-[36px] leading-none text-white">94%</h3></div>
                    <p className="font-mono text-[10px] text-[#00E3FD] flex items-center gap-1.5 tracking-widest"><TrendingUp size={14} /> 2.1%</p>
                  </div>
                  <div className="bg-[#121317]/60 border border-white/5 p-6">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Most Contributed Package</p>
                    <h3 className="font-grotesk font-bold text-[32px] tracking-[2px] text-white mb-2">{topIncomePackage.name}</h3>
                  </div>
                  <div className="bg-[#121317]/60 border border-white/5 p-6">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Success Departed</p>
                    <div className="flex items-baseline gap-2"><h3 className="font-grotesk font-bold text-[36px] leading-none text-white">1</h3><span className="font-mono text-[11px] text-white/40 tracking-widest">FLEETS</span></div>
                  </div>
                </div>

                <div className="bg-[#121317]/40 border border-white/5 rounded-xl p-8 flex flex-col relative flex-1 min-h-[300px]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-grotesk text-[18px] text-white uppercase tracking-[2px] font-bold mb-1">AVERAGE INCOME EARNED</h3>
                      <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase">REAL-TIME DATA STREAMING •</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2"><div className="w-4 border-t-2 border-dashed border-[#B026FF]"></div><span className="text-[9px] font-mono text-white/60 tracking-widest uppercase">TARGET ETA</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-[#00E3FD]"></div><span className="text-[9px] font-mono text-white/60 tracking-widest uppercase">ACTUAL INCOME AVG</span></div>
                      </div>
                      <div className="relative">
                        <button onClick={() => setIsAnalyticsMenuOpen(!isAnalyticsMenuOpen)} className="text-white/40 hover:text-white transition-colors p-1"><MoreVertical size={18} /></button>
                        <AnimatePresence>
                          {isAnalyticsMenuOpen && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute right-0 top-full mt-2 w-[160px] bg-[#1a1b22] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                              <div onClick={() => {setAnalyticsChartType("BAR"); setIsAnalyticsMenuOpen(false);}} className={`px-4 py-3 text-[11px] font-mono cursor-pointer uppercase tracking-widest transition-colors flex items-center gap-3 ${analyticsChartType === "BAR" ? "text-[#E5B5FF] bg-[#B026FF]/20 font-bold" : "text-white/60 hover:text-white hover:bg-white/5"}`}><BarChart2 size={14}/> Bar Chart</div>
                              <div onClick={() => {setAnalyticsChartType("LINE"); setIsAnalyticsMenuOpen(false);}} className={`px-4 py-3 text-[11px] font-mono cursor-pointer uppercase tracking-widest transition-colors flex items-center gap-3 ${analyticsChartType === "LINE" ? "text-[#E5B5FF] bg-[#B026FF]/20 font-bold" : "text-white/60 hover:text-white hover:bg-white/5"}`}><TrendingUp size={14}/> Line Chart</div>
                              <div onClick={() => {setAnalyticsChartType("PIE"); setIsAnalyticsMenuOpen(false);}} className={`px-4 py-3 text-[11px] font-mono cursor-pointer uppercase tracking-widest transition-colors flex items-center gap-3 ${analyticsChartType === "PIE" ? "text-[#E5B5FF] bg-[#B026FF]/20 font-bold" : "text-white/60 hover:text-white hover:bg-white/5"}`}><Activity size={14}/> Pie Chart</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full relative flex items-center justify-center mt-4">
                    {analyticsChartType === "BAR" && (
                      <div className="flex-1 flex items-end border-b border-l border-white/10 w-full h-full relative pb-0 pl-12">
                        <div className="absolute inset-0 flex flex-col justify-between pb-8 pl-12 pointer-events-none z-0">
                          {["100", "75", "50", "25", "10"].map((label, idx) => (<div key={idx} className="w-full border-t border-white/5 h-0 relative"><span className="absolute -left-10 -top-2 text-[9px] font-mono text-white/40">{label}</span></div>))}
                        </div>
                        <div className="flex w-full h-[calc(100%-32px)] z-10"> 
                          {currentIncomeData.map((stat, idx) => (
                            <div key={stat.name} className="flex-1 flex flex-col justify-end group h-full relative mx-1">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${(stat.value / topIncomePackage.value) * 100}%` }} transition={{ type: "spring", stiffness: 60, damping: 15, delay: idx * 0.1 }} className="w-full relative transition-all duration-300 opacity-90 group-hover:opacity-100" style={{ background: `linear-gradient(to top, rgba(176,38,255,0.2) 0%, #B026FF 100%)` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a0a0c] text-[#E5B5FF] border border-[#B026FF]/50 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-[0_0_10px_rgba(176,38,255,0.3)]">${stat.value}M</div>
                              </motion.div>
                              <span className="absolute -bottom-8 left-0 right-0 text-center text-[10px] font-mono text-white/40 uppercase tracking-widest group-hover:text-[#E5B5FF] transition-colors">{stat.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {analyticsChartType === "LINE" && (
                      <div className="flex-1 w-full h-full relative border-b border-l border-white/10 pb-8 pl-12">
                        <div className="absolute inset-0 flex flex-col justify-between pb-8 pl-12 pointer-events-none z-0">
                          {currentIncomeTimeData.yLabels.map((label, idx) => (<div key={idx} className="w-full border-t border-white/5 h-0 relative"><span className="absolute -left-10 -top-2 text-[9px] font-mono text-white/40">{label}</span></div>))}
                        </div>
                        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className="w-full h-[calc(100%-32px)] overflow-visible absolute bottom-8 left-12 right-0 z-10" style={{ width: 'calc(100% - 48px)' }}>
                          <defs>
                            <linearGradient id="cyanFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(0, 227, 253, 0.25)" /><stop offset="100%" stopColor="rgba(0, 227, 253, 0)" /></linearGradient>
                            <filter id="glow-cyan-income"><feGaussianBlur stdDeviation="5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          </defs>
                          <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} d={generateSmoothPath(currentIncomeTimeData.target, currentIncomeTimeData.max)} fill="none" stroke="#B026FF" strokeWidth="2" strokeDasharray="10 10" style={{ opacity: 0.8 }} />
                          <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }} d={generateFillPath(currentIncomeTimeData.actual, currentIncomeTimeData.max)} fill="url(#cyanFill)" />
                          <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} d={generateSmoothPath(currentIncomeTimeData.actual, currentIncomeTimeData.max)} fill="none" stroke="#00E3FD" strokeWidth="4" style={{ filter: "url(#glow-cyan-income)" }} />
                          {currentIncomeTimeData.actual.map((val, i) => (
                            <g key={`actual-${i}`} className="group cursor-pointer">
                              <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }} cx={(i / (currentIncomeTimeData.actual.length - 1)) * 1000} cy={400 - (val / currentIncomeTimeData.max) * 400} r="6" fill="#1a1b22" stroke="#00E3FD" strokeWidth="3" className="hover:scale-[1.8] hover:fill-[#00E3FD] transition-all" />
                              <text x={(i / (currentIncomeTimeData.actual.length - 1)) * 1000} y={400 - (val / currentIncomeTimeData.max) * 400 - 20} textAnchor="middle" fill="#00E3FD" className="text-[12px] font-mono opacity-0 group-hover:opacity-100 transition-opacity font-bold">${val}M</text>
                            </g>
                          ))}
                        </svg>
                        <div className="absolute -bottom-6 left-12 right-0 h-6 z-20">
                          {currentXLabels.map((label, idx) => (<span key={idx} className="absolute text-center text-[9px] font-mono text-white/40 uppercase tracking-widest transform -translate-x-1/2" style={{ left: `${(idx / (currentXLabels.length - 1)) * 100}%` }}>{label}</span>))}
                        </div>
                      </div>
                    )}
                    {analyticsChartType === "PIE" && (
                      <div className="flex w-full h-full items-center justify-center gap-16">
                        <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 50, damping: 20 }} className="w-[250px] h-[250px] rounded-full relative shrink-0" style={{ background: `conic-gradient(${incomeConicGradients})`, boxShadow: "0 0 40px rgba(0,227,253,0.1)" }}>
                          <div className="absolute inset-[40px] bg-[#1a1b22] rounded-full flex items-center justify-center flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                             <span className="font-grotesk font-bold text-2xl text-white">100%</span>
                             <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Total Revenue</span>
                          </div>
                        </motion.div>
                        <div className="flex flex-col gap-4">
                          {currentIncomeData.map((stat, i) => (
                             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={stat.name} className="flex items-center gap-3">
                               <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: stat.color }}></div>
                               <div>
                                 <p className="font-mono text-[11px] text-white/70 uppercase tracking-widest">{stat.name}</p>
                                 <p className="font-bold text-[14px] text-white">${stat.value}M <span className="text-white/30 text-[10px] font-normal">({((stat.value/incomeTotalValue)*100).toFixed(1)}%)</span></p>
                               </div>
                             </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div className="w-[320px] bg-[#0d0d11] border-l border-white/5 h-full p-8 flex flex-col relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-grotesk font-bold text-[20px] uppercase tracking-[1px] text-[#E5B5FF] mb-10">ANALYTICS</h2>
          <div className="flex justify-between items-center text-white/40 font-mono text-[10px] tracking-widest uppercase mb-4 border-b border-white/5 pb-4 relative z-[60]">
            <span>BY DATE</span>
            <div className="relative">
              <Filter size={14} onClick={() => setIsAnalyticsFilterOpen(!isAnalyticsFilterOpen)} className={`cursor-pointer transition-colors ${isAnalyticsFilterOpen ? "text-[#E5B5FF]" : "hover:text-white"}`} />
              <AnimatePresence>
                {isAnalyticsFilterOpen && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-2 w-[120px] bg-[#121317] border border-white/10 rounded-lg shadow-2xl z-[100] overflow-hidden">
                    {(["Day", "Week", "Month"] as const).map((t) => (
                      <div key={t} onClick={() => {setChartTimeFilter(t); setIsAnalyticsFilterOpen(false);}} className={`px-4 py-3 text-[10px] font-mono cursor-pointer uppercase tracking-widest transition-colors ${chartTimeFilter === t ? 'text-[#E5B5FF] bg-[#B026FF]/20 font-bold' : 'text-white/60 hover:text-[#E5B5FF] hover:bg-[#B026FF]/10'}`}>{t}</div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="font-mono text-[11px] text-white/70 tracking-widest uppercase mb-10">LAST UPDATE: <br/> <span className="text-white font-bold mt-1 inline-block">2026-04-15</span></p>
          <div className="flex flex-col gap-2">
            {/* INI YANG DIUBAH AGAR MENGGUNAKAN FUNGSI handleTabChange */}
            <button onClick={() => handleTabChange("TREND")} className={`flex items-center gap-4 px-4 py-4 rounded-lg font-mono text-[11px] tracking-widest uppercase transition-all text-left ${analyticsSidebarTab === "TREND" ? "bg-[#B026FF]/10 border-l-2 border-[#B026FF] text-[#E5B5FF] font-bold" : "text-white/40 hover:bg-white/5 hover:text-white"}`}><TrendingUp size={16} /> PACKAGE TREND</button>
            <button onClick={() => handleTabChange("INCOME")} className={`flex items-center gap-4 px-4 py-4 rounded-lg font-mono text-[11px] tracking-widest uppercase transition-all text-left ${analyticsSidebarTab === "INCOME" ? "bg-[#B026FF]/10 border-l-2 border-[#B026FF] text-[#E5B5FF] font-bold" : "text-white/40 hover:bg-white/5 hover:text-white"}`}><Activity size={16} /> AVERAGE INCOME</button>
          </div>
        </div>
      </main>
    </>
  );
}

// WRAPPER UTAMA
export default function AdminAnalyticsPage() {
  return (
    <div className="absolute top-0 left-0 w-full h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white overflow-hidden flex flex-col">
      <AdminNavbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white/50">Loading Analytics...</div>}>
        <AnalyticsContent />
      </Suspense>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(176, 38, 255, 0.5); }`}</style>
    </div>
  );
}