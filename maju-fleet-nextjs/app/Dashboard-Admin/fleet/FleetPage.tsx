"use client";

import React, { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { ChevronDown, X, RefreshCw, CheckCircle, AlertCircle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import AdminNavbar from "@/components/adminnavbar";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { getAllData } from "../../lib/actions";

interface Delivery {
  id: number;
  vessel: string;
  receipt: string;
  crew: string;
  package: string;
  routeOrigin: string;
  routeDest: string;
  time: string;
  status: string;
  statusColor: string;
  dotColor: string;
  isRedBox?: boolean;
}

// Fungsi terpusat untuk menentukan warna berdasarkan status
function getStatusColors(status: string): { textColor: string; dotColor: string; isRedBox: boolean } {
  const s = status ? status.toUpperCase() : "PENDING";
  if (s === "DELIVERED" || s === "ARRIVED") {
    return { textColor: "text-[#34C759]", dotColor: "bg-[#34C759]", isRedBox: false };
  }
  if (s === "EN ROUTE") {
    return { textColor: "text-[#00E3FD]", dotColor: "bg-[#00E3FD]", isRedBox: false };
  }
  if (s === "NOT DEPARTED YET") {
    return { textColor: "text-[#FF3B30]", dotColor: "bg-[#FF3B30]", isRedBox: true };
  }
  return { textColor: "text-[#FFCC00]", dotColor: "bg-[#FFCC00]", isRedBox: false };
}

function FleetDashboardContent() {
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view") || "full";

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activePackage, setActivePackage] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<string>("LAST 24 HOURS");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [chartTimeFilter, setChartTimeFilter] = useState<"Day" | "Week" | "Month">("Week");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  // State baru untuk Search Bar
  const [searchQuery, setSearchQuery] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [topStats, setTopStats] = useState({ totalVessels: 0, activeTransit: 0, arrived: 0, problem: 0 });

  const [packageStatsData, setPackageStatsData] = useState<any>({
    Day: [],
    Week: [],
    Month: []
  });

  // Sistem Notifikasi Custom Toast UI Premium
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showNotification = (type: "success" | "error", title: string, message: string) => {
    setToast({ type, title, message });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchFleetData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const dbData = await getAllData();
      
      if (dbData.shipments) {
        const active = dbData.shipments.filter((s: any) => s.status === "EN ROUTE").length;
        const arrived = dbData.shipments.filter((s: any) => s.status === "ARRIVED" || s.status === "DELIVERED").length;
        const delayed = dbData.shipments.filter((s: any) => s.status === "NOT DEPARTED YET").length;
        
        setTopStats({
          totalVessels: dbData.vessels?.length || 0,
          activeTransit: active,
          arrived: arrived,
          problem: delayed
        });

        const counts: Record<string, number> = {
          "MAJU ECONOMY": 0,
          "MAJU STANDARD": 0,
          "MAJU HEAVY": 0,
          "MAJU EXPRESS": 0,
          "MAJU VIP": 0,
        };

        dbData.shipments.forEach((s: any) => {
          const name = s.items && s.items.length > 0 && s.items[0].packageType
            ? s.items[0].packageType.name.toUpperCase()
            : "MAJU STANDARD";
          if (counts[name] !== undefined) {
            counts[name]++;
          }
        });

        setPackageStatsData({
          Day: [
            { name: "MAJU ECONOMY", value: Math.ceil(counts["MAJU ECONOMY"] * 0.3) || 5, color: "#6b21a8" },
            { name: "MAJU STANDARD", value: Math.ceil(counts["MAJU STANDARD"] * 0.3) || 12, color: "#8b5cf6" },
            { name: "MAJU HEAVY", value: Math.ceil(counts["MAJU HEAVY"] * 0.3) || 3, color: "#a855f7" },
            { name: "MAJU EXPRESS", value: Math.ceil(counts["MAJU EXPRESS"] * 0.3) || 15, color: "#c084fc" },
            { name: "MAJU VIP", value: Math.ceil(counts["MAJU VIP"] * 0.3) || 7, color: "#e879f9" },
          ],
          Week: [
            { name: "MAJU ECONOMY", value: Math.ceil(counts["MAJU ECONOMY"] * 0.7) || 18, color: "#6b21a8" },
            { name: "MAJU STANDARD", value: Math.ceil(counts["MAJU STANDARD"] * 0.7) || 25, color: "#8b5cf6" },
            { name: "MAJU HEAVY", value: Math.ceil(counts["MAJU HEAVY"] * 0.7) || 14, color: "#a855f7" },
            { name: "MAJU EXPRESS", value: Math.ceil(counts["MAJU EXPRESS"] * 0.7) || 38, color: "#c084fc" },
            { name: "MAJU VIP", value: Math.ceil(counts["MAJU VIP"] * 0.7) || 22, color: "#e879f9" },
          ],
          Month: [
            { name: "MAJU ECONOMY", value: counts["MAJU ECONOMY"] || 35, color: "#6b21a8" },
            { name: "MAJU STANDARD", value: counts["MAJU STANDARD"] || 65, color: "#8b5cf6" },
            { name: "MAJU HEAVY", value: counts["MAJU HEAVY"] || 40, color: "#a855f7" },
            { name: "MAJU EXPRESS", value: counts["MAJU EXPRESS"] || 72, color: "#c084fc" },
            { name: "MAJU VIP", value: counts["MAJU VIP"] || 45, color: "#e879f9" },
          ],
        });

        const formattedData = dbData.shipments.map((s: any) => {
          const pkgName = s.items && s.items.length > 0 && s.items[0].packageType
            ? s.items[0].packageType.name.toUpperCase()
            : "MAJU STANDARD";

          const { textColor, dotColor, isRedBox } = getStatusColors(s.status);
          
          return {
            id: s.id,
            vessel: s.vessel?.name || "UNASSIGNED VESSEL", 
            receipt: s.receipt_number || `MJF-${s.id}`,
            crew: s.captain && s.captain !== "UNASSIGNED" ? s.captain : (s.vessel?.crewLead || "NO CREW"),
            package: pkgName, 
            routeOrigin: s.senderCity || "Unknown Origin",
            routeDest: s.recipientCity || "Unknown Dest",
            time: s.book_date ? new Date(s.book_date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit' }) : "---",
            status: s.status || "PENDING",
            statusColor: textColor,
            dotColor: dotColor,
            isRedBox: isRedBox
          };
        });

        setAllDeliveries(formattedData);
      }
    } catch (error) {
      console.error("Gagal memuat data dari database Neon:", error);
      showNotification("error", "SYNC ERROR", "Failed to retrieve the latest data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchFleetData();
    }
  }, [mounted, fetchFleetData]);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      fetchFleetData(true); 
    }, 30000);
    return () => clearInterval(interval);
  }, [mounted, fetchFleetData]);

  const currentPackageData = packageStatsData[chartTimeFilter] || [];
  const topTrendPackage = currentPackageData.reduce((prev: any, curr: any) => (prev?.value > curr?.value ? prev : curr), { value: 1 });

  // Filter Data List (Berdasarkan Package, Status, & Search Query)
  const filteredData = useMemo(() => {
    let data = allDeliveries;
    
    if (activePackage !== "ALL") data = data.filter(d => d.package === activePackage);
    if (statusFilter !== "ALL") data = data.filter(d => d.status === statusFilter);
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      data = data.filter(d =>
        d.receipt.toLowerCase().includes(query) ||
        d.vessel.toLowerCase().includes(query) ||
        d.crew.toLowerCase().includes(query) ||
        d.routeOrigin.toLowerCase().includes(query) ||
        d.routeDest.toLowerCase().includes(query) ||
        d.status.toLowerCase().includes(query) ||
        d.package.toLowerCase().includes(query)
      );
    }
    
    return data;
  }, [allDeliveries, activePackage, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Reset pagination saat filter atau search berubah
  useEffect(() => { setCurrentPage(1); }, [activePackage, statusFilter, searchQuery, timeFilter]);

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-[99999] w-full max-w-[420px] bg-[#0c0d12]/95 backdrop-blur-md border rounded-xl p-5 shadow-2xl flex items-start gap-4 overflow-hidden"
            style={{
              borderColor: toast.type === "success" ? "rgba(52, 199, 89, 0.3)" : "rgba(255, 59, 48, 0.3)",
              boxShadow: toast.type === "success" ? "0 0 40px rgba(52, 199, 89, 0.2)" : "0 0 40px rgba(255, 59, 48, 0.2)"
            }}
          >
            <div className={`absolute top-0 left-0 w-full h-[3px] ${toast.type === "success" ? "bg-[#34C759]" : "bg-[#FF3B30]"}`} />
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" ? <CheckCircle size={22} className="text-[#34C759]" /> : <AlertCircle size={22} className="text-[#FF3B30]" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-mono text-[11px] font-bold tracking-[3px] uppercase mb-1" style={{ color: toast.type === "success" ? "#34C759" : "#FF3B30" }}>
                {toast.title}
              </h4>
              <p className="text-white/80 font-inter text-[13px] leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-white/30 hover:text-white transition-colors shrink-0 p-0.5 rounded hover:bg-white/5"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[1800px] mx-auto flex-1 mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col h-full">
            
            {(viewMode === "full" || viewMode === "stats") && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
                <div className="bg-[#121317]/80 backdrop-blur-md border border-white/5 border-l-4 border-l-white/20 p-5 flex flex-col justify-between h-[100px] rounded-r-lg">
                  <p className="text-[10px] font-grotesk uppercase tracking-[2px] text-white/50">Total Vessels</p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-grotesk font-bold text-4xl leading-none">{String(topStats.totalVessels).padStart(3, '0')}</span>
                    <span className="text-[#00E3FD] text-[11px] font-bold tracking-widest flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00E3FD] animate-pulse"></span>LIVE</span>
                  </div>
                </div>
                <div className="bg-[#121317]/80 backdrop-blur-md border border-white/5 border-l-4 border-l-[#00E3FD] p-5 flex flex-col justify-between h-[100px] rounded-r-lg shadow-[-15px_0_30px_-15px_rgba(0,227,253,0.15)]">
                  <p className="text-[10px] font-grotesk uppercase tracking-[2px] text-white/50">Active In Transit</p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-grotesk font-bold text-4xl leading-none">{String(topStats.activeTransit).padStart(3, '0')}</span>
                    <span className="text-[#00E3FD] text-[11px] font-bold tracking-widest flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00E3FD] animate-pulse"></span>LIVE</span>
                  </div>
                </div>
                <div className="bg-[#121317]/80 backdrop-blur-md border border-white/5 border-l-4 border-l-[#B026FF] p-5 flex flex-col justify-between h-[100px] rounded-r-lg shadow-[-15px_0_30px_-15px_rgba(176,38,255,0.15)]">
                  <p className="text-[10px] font-grotesk uppercase tracking-[2px] text-white/50">In Port / Arrived</p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-grotesk font-bold text-4xl leading-none">{String(topStats.arrived).padStart(3, '0')}</span>
                    <span className="text-white/40 text-[11px] font-bold tracking-widest">STABLE</span>
                  </div>
                </div>
                <div className="bg-[#121317]/80 backdrop-blur-md border border-white/5 border-l-4 border-l-[#FF3B30] p-5 flex flex-col justify-between h-[100px] rounded-r-lg shadow-[-15px_0_30px_-15px_rgba(255,59,48,0.15)]">
                  <p className="text-[10px] font-grotesk uppercase tracking-[2px] text-white/50">Not Departed Yet</p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-grotesk font-bold text-4xl leading-none text-[#FF3B30]">{String(topStats.problem).padStart(3, '0')}</span>
                    <span className="text-[#FF3B30]/80 text-[11px] font-bold tracking-widest leading-tight">ACTION<br/>REQ.</span>
                  </div>
                </div>
              </div>
            )}

            {(viewMode === "full" || viewMode === "stats") && (
              <div className="bg-transparent flex flex-col mt-8 shrink-0">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <h3 className="font-grotesk text-[16px] text-[#E5B5FF] uppercase tracking-[2px] font-bold">Most Used Package Type</h3>
                    {activePackage !== "ALL" && (
                      <button onClick={() => setActivePackage("ALL")} className="text-[10px] font-mono text-[#B026FF] hover:text-white border border-[#B026FF]/50 px-3 py-1 rounded transition-colors">CLEAR FILTER</button>
                    )}
                  </div>
                  <div className="flex bg-[#1a1b20] rounded-lg p-1 border border-white/10">
                    {(["Day", "Week", "Month"] as const).map((t) => (
                      <button key={t} onClick={() => setChartTimeFilter(t)} className={`px-5 py-1.5 rounded-md text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${chartTimeFilter === t ? 'bg-[#B026FF]/20 text-[#E5B5FF] shadow-[0_0_10px_rgba(176,38,255,0.2)]' : 'text-white/40 hover:text-[#B026FF]'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                
                <div className="flex h-[200px] w-full">
                  <div className="flex flex-col justify-between text-[10px] font-mono text-white/40 pr-6 pb-8 items-end w-[40px]">
                    <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                  </div>
                  <div className="flex-1 flex items-end border-b border-white/10 relative pb-0">
                    <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none">
                      <div className="w-full border-t border-white/5 h-0"></div><div className="w-full border-t border-white/5 h-0"></div><div className="w-full border-t border-white/5 h-0"></div><div className="w-full border-t border-white/5 h-0"></div><div className="w-full border-t border-white/5 h-0"></div>
                    </div>
                    <div className="flex w-full h-[calc(100%-32px)]"> 
                      {currentPackageData.map((stat: any, idx: number) => {
                        const isActive = activePackage === "ALL" || activePackage === stat.name;
                        return (
                          <div key={`${chartTimeFilter}-${stat.name}`} className="flex-1 flex flex-col justify-end group h-full relative cursor-pointer" onClick={() => setActivePackage(activePackage === stat.name ? "ALL" : stat.name)}>
                            <motion.div initial={{ height: 0 }} animate={{ height: `${(stat.value / topTrendPackage.value) * 100}%` }} transition={{ type: "spring", stiffness: 60, damping: 15, delay: idx * 0.1 }} className="w-full relative transition-all duration-300" style={{ background: "linear-gradient(to top, rgba(176,38,255,0.4) 0%, rgba(229,181,255,0.9) 100%)", opacity: isActive ? 1 : 0.3 }}>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a0a0c] text-[#E5B5FF] border border-[#B026FF]/50 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-[0_0_10px_rgba(176,38,255,0.3)]">{stat.value} Jobs</div>
                            </motion.div>
                            <span className={`absolute -bottom-8 left-0 right-0 text-center text-[10px] font-mono uppercase tracking-widest leading-none transition-colors duration-300 ${isActive ? "text-[#E5B5FF] font-bold" : "text-white/30"}`}>{stat.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(viewMode === "full" || viewMode === "list") && (
              <div className="mt-12 bg-transparent flex flex-col gap-4 flex-1">
                {/* Header Table & Actions */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
                  <h2 className="font-grotesk font-bold text-[18px] uppercase tracking-[2px] text-white flex items-center gap-3">DELIVERY LIST</h2>
                  
                  <div className="flex flex-wrap lg:flex-nowrap gap-3 items-center w-full lg:w-auto">
                    {/* Search Bar Baru */}
                    <div className="relative w-full lg:w-[280px]">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search receipt, vessel, crew..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-md py-2.5 pl-9 pr-8 text-[11px] font-mono text-white placeholder-white/30 focus:border-[#B026FF]/50 focus:outline-none transition-colors"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => fetchFleetData(true)}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-md text-[10px] font-mono text-white/40 hover:text-[#E5B5FF] hover:border-[#B026FF]/50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={isRefreshing ? "animate-spin text-[#B026FF]" : ""} />
                      {isRefreshing ? "SYNCING..." : "REFRESH"}
                    </button>

                    <div className="relative">
                      <div onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="bg-[#0a0a0c] border border-white/10 px-5 py-2.5 flex items-center justify-between min-w-[160px] cursor-pointer hover:border-[#B026FF]/50 hover:bg-white/5 transition-colors rounded-md">
                        <span className="text-[11px] font-mono text-white/80 tracking-widest uppercase">STATUS: {statusFilter}</span><ChevronDown size={14} className="text-white/40" />
                      </div>
                      <AnimatePresence>
                        {isStatusDropdownOpen && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 lg:left-0 top-full mt-2 w-full min-w-[180px] bg-[#121317] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                            {["ALL", "PENDING", "EN ROUTE", "ARRIVED", "DELIVERED", "NOT DEPARTED YET"].map(opt => (
                              <div key={opt} onClick={() => {setStatusFilter(opt); setIsStatusDropdownOpen(false);}} className="px-4 py-3 text-[10px] font-mono text-white/60 hover:text-[#E5B5FF] hover:bg-[#B026FF]/20 cursor-pointer uppercase tracking-widest transition-colors">{opt}</div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto w-full border border-white/5 rounded-lg bg-[#0a0a0c]/50">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-transparent text-white/40 font-mono text-[10px] uppercase tracking-[2px] border-b border-white/10">
                        <th className="px-4 py-5 font-normal">VESSEL NAME</th>
                        <th className="px-4 py-5 font-normal text-center">CREW ON BOARD</th>
                        <th className="px-4 py-5 font-normal text-center">PACKAGE TYPES</th>
                        <th className="px-4 py-5 font-normal text-center">ROUTE</th>
                        <th className="px-4 py-5 font-normal text-center">TIME</th>
                        <th className="px-4 py-5 font-normal text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[12px]">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                            <td className="px-4 py-5">
                              <div className="flex items-start gap-4">
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${row.dotColor}`}></div>
                                <div>
                                  <p className="text-white font-bold tracking-[2px] mb-1.5 text-[14px] uppercase">
                                    {searchQuery && row.vessel.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                                      <span dangerouslySetInnerHTML={{ __html: row.vessel.replace(new RegExp(`(${searchQuery})`, 'gi'), '<mark style="background: rgba(176,38,255,0.35); color: #E5B5FF; border-radius: 2px;">$1</mark>') }} />
                                    ) : row.vessel}
                                  </p>
                                  <p className="text-[10px] text-white/40 tracking-widest uppercase">
                                    RECEIPT: {searchQuery && row.receipt.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                                      <span dangerouslySetInnerHTML={{ __html: row.receipt.replace(new RegExp(`(${searchQuery})`, 'gi'), '<mark style="background: rgba(176,38,255,0.35); color: #E5B5FF; border-radius: 2px;">$1</mark>') }} />
                                    ) : row.receipt}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-5 text-center">
                              <span className="inline-block border border-[#B026FF]/30 bg-[#B026FF]/10 text-[#E5B5FF] px-5 py-1.5 rounded-md text-[11px] tracking-widest font-bold uppercase">
                                {searchQuery && row.crew.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                                  <span dangerouslySetInnerHTML={{ __html: row.crew.replace(new RegExp(`(${searchQuery})`, 'gi'), '<mark style="background: rgba(255,255,255,0.2); color: white;">$1</mark>') }} />
                                ) : row.crew}
                              </span>
                            </td>
                            <td className="px-4 py-5 text-center text-[#00E3FD] tracking-widest text-[12px] font-bold uppercase">{row.package}</td>
                            <td className="px-4 py-5 text-center">
                              <div className="flex flex-col w-[200px] mx-auto">
                                <div className="flex items-center w-full justify-between relative px-2">
                                  <div className="absolute top-1/2 left-4 right-4 h-[1px] border-t-2 border-dashed border-white/20 -translate-y-1/2 z-0"></div>
                                  <div className="relative z-10 bg-[#0a0a0c] p-1"><div className="w-3.5 h-3.5 rounded-full border-[2px] border-white/40 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-white/40"></div></div></div>
                                  <div className="relative z-10 bg-[#0a0a0c] p-1"><div className="w-3.5 h-3.5 rounded-full border-[2px] border-[#E5B5FF] flex items-center justify-center shadow-[0_0_8px_rgba(176,38,255,0.4)]"><div className="w-1 h-1 rounded-full bg-[#E5B5FF]"></div></div></div>
                                </div>
                                <div className="flex items-center w-full justify-between mt-1 text-[9px] font-mono text-white/50 tracking-wider uppercase">
                                  <span>{row.routeOrigin}</span><span>{row.routeDest}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-5 text-white/70 text-center tracking-widest text-[12px] uppercase">{row.time}</td>
                            <td className="px-4 py-5 text-center">
                              <span className={`inline-flex items-center justify-center gap-2 ${row.statusColor} font-bold text-[11px] tracking-widest uppercase min-w-[140px]`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${row.dotColor} ${row.isRedBox ? 'animate-pulse' : ''}`}></span>{row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6}>
                            <div className="flex flex-col items-center justify-center py-20">
                              <p className="text-white/40 font-mono tracking-widest text-sm mb-4">
                                {searchQuery ? `No vessels match "${searchQuery}"` : "No vessels found."}
                              </p>
                              {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="text-[#B026FF] text-[10px] font-mono border border-[#B026FF]/50 px-4 py-2 rounded-md hover:bg-[#B026FF]/10 transition-colors uppercase tracking-widest">
                                  Clear Search
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredData.length > 0 && (
                  <div className="bg-transparent flex justify-end items-center py-2 text-white/40 font-mono text-[11px] tracking-widest uppercase">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="hover:text-[#E5B5FF] disabled:opacity-30 transition-colors px-2 cursor-pointer disabled:cursor-not-allowed uppercase font-bold">Previous</button>
                      <div className="flex gap-2">
                        {(() => {
                          const pageWindow = 5;
                          let start = Math.max(1, currentPage - Math.floor(pageWindow / 2));
                          let end = Math.min(totalPages, start + pageWindow - 1);
                          return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(num => (
                            <button key={num} onClick={() => setCurrentPage(num)} className={`px-3 py-1 rounded-md transition-colors ${currentPage === num ? "border border-[#B026FF] text-[#E5B5FF] bg-[#B026FF]/20 shadow-[0_0_10px_rgba(176,38,255,0.2)] font-bold" : "hover:text-white hover:bg-white/5"}`}>{num.toString().padStart(2, '0')}</button>
                          ));
                        })()}
                      </div>
                      <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="hover:text-[#E5B5FF] disabled:opacity-30 transition-colors px-2 cursor-pointer disabled:cursor-not-allowed uppercase font-bold">Next</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </main>
      )}
    </>
  );
}

export default function AdminFleetPage() {
  return (
    <div className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white pb-6 flex flex-col overflow-x-hidden">
      <AdminNavbar />
      <Suspense fallback={<DashboardSkeleton />}>
        <FleetDashboardContent />
      </Suspense>
    </div>
  );
}