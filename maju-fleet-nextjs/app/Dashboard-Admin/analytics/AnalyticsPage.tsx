"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TrendingUp, Activity, BarChart2, MoreVertical, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation"; 
import AdminNavbar from "@/components/adminnavbar"; 

// WAJIB: Import dari actions.ts
import { getAllData } from "../../lib/actions";

function AnalyticsSkeleton() {
  return (
    <div className="w-full flex flex-1 overflow-hidden mt-4 animate-pulse">
      <div className="flex-1 flex flex-col px-6 md:px-10 overflow-y-auto relative z-10 pb-6">
        <div className="h-10 w-72 bg-white/10 rounded mb-8 mt-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#121317]/60 border border-white/5 p-6 rounded-lg h-[150px] flex flex-col justify-between">
              <div className="h-3 w-32 bg-white/10 rounded"></div>
              <div className="h-10 w-24 bg-white/20 rounded"></div>
              <div className="h-3 w-40 bg-white/10 rounded mt-2"></div>
            </div>
          ))}
        </div>
        <div className="bg-[#121317]/40 border border-white/5 rounded-xl p-8 flex flex-col flex-1 min-h-[300px]">
          <div className="flex justify-between items-start mb-6">
            <div className="h-5 w-64 bg-white/10 rounded"></div>
            <div className="flex gap-4">
              <div className="h-4 w-28 bg-white/10 rounded"></div>
              <div className="h-5 w-5 bg-white/10 rounded"></div>
            </div>
          </div>
          <div className="flex-1 w-full bg-white/5 rounded-lg mt-4"></div>
          <div className="h-4 w-full bg-white/5 rounded mt-6"></div>
        </div>
      </div>
      <div className="w-[320px] bg-[#0d0d11] border-l border-white/5 h-full p-8 flex flex-col">
        <div className="h-6 w-32 bg-white/10 rounded mb-10"></div>
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-4">
          <div className="h-3 w-16 bg-white/10 rounded"></div>
          <div className="h-4 w-4 bg-white/10 rounded"></div>
        </div>
        <div className="h-8 w-24 bg-white/10 rounded mb-10"></div>
        <div className="flex flex-col gap-3">
          <div className="h-14 w-full bg-white/10 rounded-lg"></div>
          <div className="h-14 w-full bg-white/10 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [analyticsChartType, setAnalyticsChartType] = useState<"LINE" | "BAR" | "PIE">("LINE");
  const [isAnalyticsMenuOpen, setIsAnalyticsMenuOpen] = useState(false);
  const [analyticsSidebarTab, setAnalyticsSidebarTab] = useState<"TREND" | "INCOME">("TREND");
  const [isAnalyticsFilterOpen, setIsAnalyticsFilterOpen] = useState(false);
  const [chartTimeFilter, setChartTimeFilter] = useState<"Day" | "Week" | "Month">("Week");

  // STATE UNTUK DATA DINAMIS DARI NEON
  const [realShipments, setRealShipments] = useState<any[]>([]);
  const [totalFleets, setTotalFleets] = useState(0);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "INCOME") setAnalyticsSidebarTab("INCOME");
    else setAnalyticsSidebarTab("TREND");
  }, [searchParams]);

  const handleTabChange = (tab: "TREND" | "INCOME") => {
    setAnalyticsSidebarTab(tab);
    router.push(`/Dashboard-Admin/analytics?tab=${tab}`);
  };

  // TARIK DATA DARI NEON
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const dbData = await getAllData();
        if (dbData.shipments) {
          setRealShipments(dbData.shipments);
        }
        if (dbData.vessels) {
          setTotalFleets(dbData.vessels.length);
        }
      } catch (error) {
        console.error("Gagal menarik data Analytics:", error);
      }
    };
    fetchAnalytics();
  }, []);

  const { packageStats, incomeStats, trendLine, incomeLine } = useMemo(() => {
  const pkgCounts: Record<string, number> = {};
  const pkgIncomes: Record<string, number> = {};

  console.log("Total shipments:", realShipments.length);
  console.log("Sample items[0]:", realShipments[0]?.items);
  
  realShipments.forEach((s) => {
    if (!s.items || s.items.length === 0) return;

    s.items.forEach((item: { 
      packageType?: { name: string } | null; 
      weight_kg?: number | null 
    }) => {
      const name = item.packageType?.name?.toUpperCase() ?? "UNKNOWN";
      pkgCounts[name] = (pkgCounts[name] || 0) + 1;

      const weight = item.weight_kg || 1000;
      const incomeInMillions = (weight * 50) / 1_000_000;
      pkgIncomes[name] = (pkgIncomes[name] || 0) + incomeInMillions;
    });
  });

  const colors = ["#e879f9", "#c084fc", "#a855f7", "#8b5cf6", "#6b21a8"];

  const sortedPackages = Object.entries(pkgCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const formattedPackages = sortedPackages.map((item, idx) => ({
    name: item[0],
    value: item[1],
    color: colors[idx % colors.length]
  }));
  while (formattedPackages.length < 5) formattedPackages.push({ name: "-", value: 0, color: colors[formattedPackages.length] });

  const sortedIncomes = Object.entries(pkgIncomes).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const formattedIncomes = sortedIncomes.map((item, idx) => ({
    name: item[0],
    value: Number(item[1].toFixed(2)),
    color: colors[idx % colors.length]
  }));
  while (formattedIncomes.length < 5) formattedIncomes.push({ name: "-", value: 0, color: colors[formattedIncomes.length] });

  const totalCurrentPkg = formattedPackages.reduce((sum, item) => sum + item.value, 0);
  const totalCurrentInc = formattedIncomes.reduce((sum, item) => sum + item.value, 0);

  let baseTLine = [12, 18, 15, 25, 20, 30];
  let baseILine = [0.5, 0.8, 0.6, 1.2, 0.9, 1.5];

  if (chartTimeFilter === "Day") {
    baseTLine = [2, 5, 3, 8, 6, 10];
    baseILine = [0.1, 0.2, 0.15, 0.3, 0.25, 0.4];
  } else if (chartTimeFilter === "Month") {
    baseTLine = [50, 65, 55, 80, 75, 95];
    baseILine = [2.5, 3.1, 2.8, 4.0, 3.6, 4.8];
  }

  return {
    packageStats: formattedPackages,
    incomeStats: formattedIncomes,
    trendLine: [...baseTLine, totalCurrentPkg > 0 ? totalCurrentPkg : 35],
    incomeLine: [...baseILine, totalCurrentInc > 0 ? totalCurrentInc : 1.8]
  };
}, [realShipments, chartTimeFilter]);

  // KALKULASI VARIABEL TREND
  const topTrendPackage = packageStats.reduce((prev, curr) => prev.value > curr.value ? prev : curr, packageStats[0]);
  const trendTotalUse = packageStats.reduce((acc, curr) => acc + curr.value, 0);
  const trendTopPercentage = trendTotalUse > 0 ? ((topTrendPackage.value / trendTotalUse) * 100).toFixed(0) : "0";
  
  let trendPieCurrentAngle = 0;
  const trendConicGradients = packageStats.map((stat) => { const angle = trendTotalUse > 0 ? (stat.value / trendTotalUse) * 360 : 0; const start = trendPieCurrentAngle; trendPieCurrentAngle += angle; return `${stat.color} ${start}deg ${trendPieCurrentAngle}deg`; }).join(", ");

  // KALKULASI VARIABEL INCOME
  const topIncomePackage = incomeStats.reduce((prev, curr) => prev.value > curr.value ? prev : curr, incomeStats[0]);
  const incomeTotalValue = incomeStats.reduce((acc, curr) => acc + curr.value, 0);
  
  let incomePieCurrentAngle = 0;
  const incomeConicGradients = incomeStats.map((stat) => { const angle = incomeTotalValue > 0 ? (stat.value / incomeTotalValue) * 360 : 0; const start = incomePieCurrentAngle; incomePieCurrentAngle += angle; return `${stat.color} ${start}deg ${incomePieCurrentAngle}deg`; }).join(", ");

  // GENERATOR SVG LINE CHART
  const generateSmoothPath = (data: number[], maxY: number) => {
    if (!data || data.length === 0) return "";
    const safeMax = maxY || 1;
    const points = data.map((val, i) => [(i / (data.length - 1)) * 1000, 400 - (val / safeMax) * 400]);
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) { const prev = points[i - 1]; const curr = points[i]; const cpX = (prev[0] + curr[0]) / 2; d += ` C ${cpX} ${prev[1]}, ${cpX} ${curr[1]}, ${curr[0]} ${curr[1]}`; }
    return d;
  };
  const generateFillPath = (data: number[], maxY: number) => { if (!data || data.length === 0) return ""; return `${generateSmoothPath(data, maxY)} L 1000 400 L 0 400 Z`; };

  // Konfigurasi Label Waktu
  const timeLabels = { Day: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "NOW"], Week: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "TODAY"], Month: ["1ST", "5TH", "10TH", "15TH", "20TH", "25TH", "NOW"] };
  const currentXLabels = timeLabels[chartTimeFilter];
  
  // Konfigurasi Line Chart
  const trendMax = Math.max(...trendLine) * 1.5;
  const incomeMax = Math.max(...incomeLine) * 1.5;

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
                    <h3 className="font-grotesk font-bold text-[32px] tracking-[2px] text-white mb-2 truncate" title={topTrendPackage.name}>{topTrendPackage.name}</h3>
                    <div className="w-[80%] h-1 bg-white/10 mt-4 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-500" style={{ width: `${trendTopPercentage}%`, backgroundColor: topTrendPackage.color }}></div>
                    </div>
                  </div>
                  <div className="bg-[#121317]/60 border border-white/5 p-6">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Total Volumes</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <h3 className="font-grotesk font-bold text-[36px] leading-none text-white">{trendTotalUse}</h3>
                      <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase">/ REALTIME</span>
                    </div>
                    <p className="font-mono text-[10px] text-[#00E3FD] flex items-center gap-1.5 tracking-widest"><TrendingUp size={14} /> LIVE DATA</p>
                  </div>
                  <div className="bg-[#121317]/60 border border-white/5 p-6">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Peak Contributor</p>
                    <h3 className="font-grotesk font-bold text-[36px] leading-none text-white">{topTrendPackage.value}</h3>
                  </div>
                </div>

                <div className="bg-[#121317]/40 border border-white/5 rounded-xl p-8 flex flex-col relative flex-1 min-h-[300px]">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-grotesk text-[18px] text-[#E5B5FF] uppercase tracking-[2px] font-bold">MOST USED CARGO</h3>
                    <div className="flex items-center gap-4">
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
                          {["MAX", "AVG", "LOW", "-", "0"].map((label, idx) => (<div key={idx} className="w-full border-t border-white/5 h-0 relative"><span className="absolute -left-10 -top-2 text-[9px] font-mono text-white/40">{label}</span></div>))}
                        </div>
                        <div className="flex w-full h-[calc(100%-32px)] z-10"> 
                          {packageStats.map((stat, idx) => {
                            const h = topTrendPackage.value > 0 ? (stat.value / topTrendPackage.value) * 100 : 0;
                            return (
                            <div key={stat.name} className="flex-1 flex flex-col justify-end group h-full relative mx-1">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ type: "spring", stiffness: 60, damping: 15, delay: idx * 0.1 }} className="w-full relative transition-all duration-300 opacity-90 group-hover:opacity-100" style={{ background: `linear-gradient(to top, rgba(176,38,255,0.2) 0%, ${stat.color} 100%)` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a0a0c] text-[#E5B5FF] border border-[#B026FF]/50 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-[0_0_10px_rgba(176,38,255,0.3)]">{stat.value} Qty</div>
                              </motion.div>
                              <span className="absolute -bottom-8 left-0 right-0 text-center text-[9px] font-mono text-white/40 uppercase tracking-widest group-hover:text-[#E5B5FF] transition-colors truncate px-1">{stat.name}</span>
                            </div>
                          )})}
                        </div>
                      </div>
                    )}
                    {analyticsChartType === "LINE" && (
                      <div className="flex-1 w-full h-full relative border-b border-l border-white/10 pb-8 pl-12">
                        <div className="absolute inset-0 flex flex-col justify-between pb-8 pl-12 pointer-events-none z-0">
                          {["MAX", "HIGH", "AVG", "LOW", "MIN", "0"].map((label, idx) => (<div key={idx} className="w-full border-t border-white/5 h-0 relative"><span className="absolute -left-10 -top-2 text-[9px] font-mono text-white/40">{label}</span></div>))}
                        </div>
                        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className="w-full h-[calc(100%-32px)] overflow-visible absolute bottom-8 left-12 right-0 z-10" style={{ width: 'calc(100% - 48px)' }}>
                          <defs>
                            <linearGradient id="purpleFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(176, 38, 255, 0.3)" /><stop offset="100%" stopColor="rgba(176, 38, 255, 0)" /></linearGradient>
                            <filter id="glow-purple-trend"><feGaussianBlur stdDeviation="5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          </defs>
                          <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }} d={generateFillPath(trendLine, trendMax)} fill="url(#purpleFill)" />
                          <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} d={generateSmoothPath(trendLine, trendMax)} fill="none" stroke="#E5B5FF" strokeWidth="4" style={{ filter: "url(#glow-purple-trend)" }} />
                          {trendLine.map((val, i) => (
                            <g key={i} className="group cursor-pointer">
                              <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }} cx={(i / (trendLine.length - 1)) * 1000} cy={400 - (val / trendMax) * 400} r="6" fill="#1a1b22" stroke="#B026FF" strokeWidth="3" className="hover:scale-[1.8] hover:fill-[#E5B5FF] transition-all" />
                              <text x={(i / (trendLine.length - 1)) * 1000} y={400 - (val / trendMax) * 400 - 20} textAnchor="middle" fill="#E5B5FF" className="text-[12px] font-mono opacity-0 group-hover:opacity-100 transition-opacity font-bold">{val} QTY</text>
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
                          {packageStats.map((stat, i) => (
                             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={stat.name} className="flex items-center gap-3">
                               <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: stat.color }}></div>
                               <div>
                                 <p className="font-mono text-[11px] text-white/70 uppercase tracking-widest">{stat.name.substring(0, 15)}</p>
                                 <p className="font-bold text-[14px] text-white">{stat.value} Qty <span className="text-white/30 text-[10px] font-normal">({trendTotalUse > 0 ? ((stat.value/trendTotalUse)*100).toFixed(1) : 0}%)</span></p>
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
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Total Real Revenue</p>
                    <div className="flex items-baseline gap-2 mb-3"><h3 className="font-grotesk font-bold text-[36px] leading-none text-white">${incomeTotalValue.toFixed(2)}M</h3></div>
                    <p className="font-mono text-[10px] text-[#00E3FD] flex items-center gap-1.5 tracking-widest"><TrendingUp size={14} /> LIVE UPDATE</p>
                  </div>
                  <div className="bg-[#121317]/60 border border-white/5 p-6">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Most Profitable Cargo</p>
                    <h3 className="font-grotesk font-bold text-[28px] tracking-[2px] text-white mb-2 truncate">{topIncomePackage.name}</h3>
                  </div>
                  <div className="bg-[#121317]/60 border border-white/5 p-6">
                    <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-4">Total Fleets Deployed</p>
                    <div className="flex items-baseline gap-2"><h3 className="font-grotesk font-bold text-[36px] leading-none text-white">{totalFleets}</h3><span className="font-mono text-[11px] text-white/40 tracking-widest">VESSELS</span></div>
                  </div>
                </div>

                <div className="bg-[#121317]/40 border border-white/5 rounded-xl p-8 flex flex-col relative flex-1 min-h-[300px]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-grotesk text-[18px] text-white uppercase tracking-[2px] font-bold mb-1">REAL-TIME INCOME MAP</h3>
                      <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase">STREAMING DIRECTLY FROM NEON DB •</p>
                    </div>
                    <div className="flex items-center gap-6">
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
                          {["MAX", "HIGH", "AVG", "LOW", "0"].map((label, idx) => (<div key={idx} className="w-full border-t border-white/5 h-0 relative"><span className="absolute -left-10 -top-2 text-[9px] font-mono text-white/40">{label}</span></div>))}
                        </div>
                        <div className="flex w-full h-[calc(100%-32px)] z-10"> 
                          {incomeStats.map((stat, idx) => {
                             const h = topIncomePackage.value > 0 ? (stat.value / topIncomePackage.value) * 100 : 0;
                             return(
                            <div key={stat.name} className="flex-1 flex flex-col justify-end group h-full relative mx-1">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ type: "spring", stiffness: 60, damping: 15, delay: idx * 0.1 }} className="w-full relative transition-all duration-300 opacity-90 group-hover:opacity-100" style={{ background: `linear-gradient(to top, rgba(176,38,255,0.2) 0%, #00E3FD 100%)` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a0a0c] text-[#00E3FD] border border-[#00E3FD]/50 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-[0_0_10px_rgba(0,227,253,0.3)]">${stat.value}M</div>
                              </motion.div>
                              <span className="absolute -bottom-8 left-0 right-0 text-center text-[9px] font-mono text-white/40 uppercase tracking-widest group-hover:text-[#00E3FD] transition-colors truncate px-1">{stat.name}</span>
                            </div>
                          )})}
                        </div>
                      </div>
                    )}
                    {analyticsChartType === "LINE" && (
                      <div className="flex-1 w-full h-full relative border-b border-l border-white/10 pb-8 pl-12">
                        <div className="absolute inset-0 flex flex-col justify-between pb-8 pl-12 pointer-events-none z-0">
                          {["MAX", "HIGH", "AVG", "LOW", "MIN", "0"].map((label, idx) => (<div key={idx} className="w-full border-t border-white/5 h-0 relative"><span className="absolute -left-10 -top-2 text-[9px] font-mono text-white/40">{label}</span></div>))}
                        </div>
                        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className="w-full h-[calc(100%-32px)] overflow-visible absolute bottom-8 left-12 right-0 z-10" style={{ width: 'calc(100% - 48px)' }}>
                          <defs>
                            <linearGradient id="cyanFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(0, 227, 253, 0.25)" /><stop offset="100%" stopColor="rgba(0, 227, 253, 0)" /></linearGradient>
                            <filter id="glow-cyan-income"><feGaussianBlur stdDeviation="5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          </defs>
                          <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }} d={generateFillPath(incomeLine, incomeMax)} fill="url(#cyanFill)" />
                          <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} d={generateSmoothPath(incomeLine, incomeMax)} fill="none" stroke="#00E3FD" strokeWidth="4" style={{ filter: "url(#glow-cyan-income)" }} />
                          {incomeLine.map((val, i) => (
                            <g key={`actual-${i}`} className="group cursor-pointer">
                              <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }} cx={(i / (incomeLine.length - 1)) * 1000} cy={400 - (val / incomeMax) * 400} r="6" fill="#1a1b22" stroke="#00E3FD" strokeWidth="3" className="hover:scale-[1.8] hover:fill-[#00E3FD] transition-all" />
                              <text x={(i / (incomeLine.length - 1)) * 1000} y={400 - (val / incomeMax) * 400 - 20} textAnchor="middle" fill="#00E3FD" className="text-[12px] font-mono opacity-0 group-hover:opacity-100 transition-opacity font-bold">${val}M</text>
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
                          {incomeStats.map((stat, i) => (
                             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={stat.name} className="flex items-center gap-3">
                               <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: stat.color }}></div>
                               <div>
                                 <p className="font-mono text-[11px] text-white/70 uppercase tracking-widest">{stat.name.substring(0, 15)}</p>
                                 <p className="font-bold text-[14px] text-white">${stat.value}M <span className="text-white/30 text-[10px] font-normal">({incomeTotalValue > 0 ? ((stat.value/incomeTotalValue)*100).toFixed(1) : 0}%)</span></p>
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
          <p className="font-mono text-[11px] text-white/70 tracking-widest uppercase mb-10">LAST UPDATE: <br/> <span className="text-[#00E3FD] font-bold mt-1 inline-block flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00E3FD] animate-pulse"></span>LIVE FROM NEON DB</span></p>
          <div className="flex flex-col gap-2">
            <button onClick={() => handleTabChange("TREND")} className={`flex items-center gap-4 px-4 py-4 rounded-lg font-mono text-[11px] tracking-widest uppercase transition-all text-left ${analyticsSidebarTab === "TREND" ? "bg-[#B026FF]/10 border-l-2 border-[#B026FF] text-[#E5B5FF] font-bold" : "text-white/40 hover:bg-white/5 hover:text-white"}`}><TrendingUp size={16} /> CARGO TREND</button>
            <button onClick={() => handleTabChange("INCOME")} className={`flex items-center gap-4 px-4 py-4 rounded-lg font-mono text-[11px] tracking-widest uppercase transition-all text-left ${analyticsSidebarTab === "INCOME" ? "bg-[#B026FF]/10 border-l-2 border-[#B026FF] text-[#E5B5FF] font-bold" : "text-white/40 hover:bg-white/5 hover:text-white"}`}><Activity size={16} /> AVERAGE INCOME</button>
          </div>
        </div>
      </main>
    </>
  );
}

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer); 
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white overflow-hidden flex flex-col">
      <AdminNavbar />
      
      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <AnalyticsContent />
      )}

      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(176, 38, 255, 0.5); }`}</style>
    </div>
  );
}