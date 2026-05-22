"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Settings, ChevronDown, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminNavbar from "@/components/adminnavbar";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { getAllData, saveEntity } from "../../lib/actions";

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

export default function AdminFleetPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activePackage, setActivePackage] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<string>("LAST 24 HOURS");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [chartTimeFilter, setChartTimeFilter] = useState<"Day" | "Week" | "Month">("Week");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [editingRow, setEditingRow] = useState<Delivery | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [topStats, setTopStats] = useState({ totalVessels: 0, activeTransit: 0, arrived: 0, problem: 0 });

  // DATA GRAFIK ASLI (Dikembalikan ke versi desain awal yang estetik)
  const packageStatsData = {
    Day: [
      { name: "MAJU ECONOMY", value: 15, color: "#6b21a8" },
      { name: "MAJU STANDARD", value: 30, color: "#8b5cf6" },
      { name: "MAJU HEAVY", value: 10, color: "#a855f7" },
      { name: "MAJU EXPRESS", value: 45, color: "#c084fc" },
      { name: "MAJU VIP", value: 25, color: "#e879f9" },
    ],
    Week: [
      { name: "MAJU ECONOMY", value: 45, color: "#6b21a8" },
      { name: "MAJU STANDARD", value: 35, color: "#8b5cf6" },
      { name: "MAJU HEAVY", value: 55, color: "#a855f7" },
      { name: "MAJU EXPRESS", value: 60, color: "#c084fc" },
      { name: "MAJU VIP", value: 75, color: "#e879f9" },
    ],
    Month: [
      { name: "MAJU ECONOMY", value: 65, color: "#6b21a8" },
      { name: "MAJU STANDARD", value: 95, color: "#8b5cf6" },
      { name: "MAJU HEAVY", value: 55, color: "#a855f7" },
      { name: "MAJU EXPRESS", value: 70, color: "#c084fc" },
      { name: "MAJU VIP", value: 45, color: "#e879f9" },
    ],
  };

  const currentPackageData = packageStatsData[chartTimeFilter];
  const topTrendPackage = currentPackageData.reduce((prev, curr) => prev.value > curr.value ? prev : curr);

  const fetchFleetData = async () => {
    setIsLoading(true);
    try {
      const dbData = await getAllData();
      
      if (dbData.shipments) {
        // 1. STATISTIK ATAS (REAL-TIME DARI NEON)
        const active = dbData.shipments.filter((s: any) => s.status === "EN ROUTE").length;
        const arrived = dbData.shipments.filter((s: any) => s.status === "ARRIVED" || s.status === "DELIVERED").length;
        const delayed = dbData.shipments.filter((s: any) => s.status === "DELAYED" || s.status === "NOT DEPARTED YET").length;
        
        setTopStats({
          totalVessels: dbData.vessels?.length || 0,
          activeTransit: active,
          arrived: arrived,
          problem: delayed
        });

        // 2. TABEL DATA (REAL-TIME DARI NEON)
        const formattedData = dbData.shipments.map((s: any) => {
          const isProblem = s.status === "DELAYED" || s.status === "NOT DEPARTED YET";
          
          // Fallback manual package type supaya sesuai dengan warna/filter grafik
          let fakePackage = "MAJU STANDARD";
          if (s.weight > 20000) fakePackage = "MAJU HEAVY";
          else if (s.weight < 10000) fakePackage = "MAJU EXPRESS";
          
          return {
            id: s.id,
            vessel: s.vessel?.name || "UNASSIGNED VESSEL", // Pastikan di actions.ts sudah pakai include: { vessel: true }
            receipt: s.receipt_number || `MJF-${s.id}`,
            crew: s.vessel?.crewLead || s.vessel?.crew_lead || "NO CREW",
            package: fakePackage, 
            routeOrigin: s.senderCity || "Unknown Origin",
            routeDest: s.recipientCity || "Unknown Dest",
            time: s.book_date ? new Date(s.book_date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit' }) : "---",
            status: s.status || "PENDING",
            statusColor: isProblem ? "text-[#FF3B30]" : "text-[#00E3FD]",
            dotColor: isProblem ? "bg-[#FF3B30]" : "bg-[#00E3FD]",
            isRedBox: isProblem
          };
        });

        setAllDeliveries(formattedData);
      }
    } catch (error) {
      console.error("Gagal memuat data dari database Neon:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  const filteredData = useMemo(() => {
    let data = allDeliveries;
    if (activePackage !== "ALL") data = data.filter(d => d.package === activePackage);
    if (statusFilter !== "ALL") data = data.filter(d => d.status === statusFilter);
    return data;
  }, [allDeliveries, activePackage, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  useEffect(() => { setCurrentPage(1); }, [activePackage, statusFilter, timeFilter]);

  const handleEditClick = (row: Delivery) => {
    if (row.vessel === "-") return;
    setEditingRow(row);
    setEditStatus(row.status);
  };

  const handleSaveEdit = async () => {
    if (!editingRow) return;
    setIsLoading(true);
    try {
      await saveEntity('fleet', { status: editStatus }, editingRow.id);
      alert(`Status for ${editingRow.receipt} updated to ${editStatus}!`);
      setEditingRow(null);
      await fetchFleetData();
    } catch (error) {
      alert("Gagal mengupdate status ke database.");
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white pb-6 flex flex-col overflow-x-hidden">
      <AdminNavbar />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[1800px] mx-auto flex-1 mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col h-full">
            
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
                <p className="text-[10px] font-grotesk uppercase tracking-[2px] text-white/50">Problem / Delayed</p>
                <div className="flex items-baseline gap-3">
                  <span className="font-grotesk font-bold text-4xl leading-none text-[#FF3B30]">{String(topStats.problem).padStart(3, '0')}</span>
                  <span className="text-[#FF3B30]/80 text-[11px] font-bold tracking-widest leading-tight">ACTION<br/>REQ.</span>
                </div>
              </div>
            </div>

            {/* GRAFIK DIKEMBALIKAN KE VERSI DESAIN AWAL */}
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
                    {currentPackageData.map((stat, idx) => {
                      const isActive = activePackage === "ALL" || activePackage === stat.name;
                      return (
                        <div key={`${chartTimeFilter}-${stat.name}`} className="flex-1 flex flex-col justify-end group h-full relative cursor-pointer" onClick={() => setActivePackage(activePackage === stat.name ? "ALL" : stat.name)}>
                          <motion.div initial={{ height: 0 }} animate={{ height: `${(stat.value / topTrendPackage.value) * 100}%` }} transition={{ type: "spring", stiffness: 60, damping: 15, delay: idx * 0.1 }} className="w-full relative transition-all duration-300" style={{ background: "linear-gradient(to top, rgba(176,38,255,0.4) 0%, rgba(229,181,255,0.9) 100%)", opacity: isActive ? 1 : 0.3 }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0a0a0c] text-[#E5B5FF] border border-[#B026FF]/50 font-mono text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-[0_0_10px_rgba(176,38,255,0.3)]">{stat.value}K</div>
                          </motion.div>
                          <span className={`absolute -bottom-8 left-0 right-0 text-center text-[10px] font-mono uppercase tracking-widest leading-none transition-colors duration-300 ${isActive ? "text-[#E5B5FF] font-bold" : "text-white/30"}`}>{stat.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-transparent flex flex-col gap-4 flex-1">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-grotesk font-bold text-[18px] uppercase tracking-[2px] text-white flex items-center gap-3">DELIVERY LIST</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <div onClick={() => {setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsTimeDropdownOpen(false);}} className="bg-[#0a0a0c] border border-white/10 px-5 py-2.5 flex items-center justify-between min-w-[160px] cursor-pointer hover:border-[#B026FF]/50 hover:bg-white/5 transition-colors rounded-md">
                      <span className="text-[11px] font-mono text-white/80 tracking-widest uppercase">STATUS: {statusFilter}</span><ChevronDown size={14} className="text-white/40" />
                    </div>
                    <AnimatePresence>
                      {isStatusDropdownOpen && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-2 w-full bg-[#121317] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                          {["ALL", "PENDING", "EN ROUTE", "ARRIVED", "DELAYED", "DELIVERED", "NOT DEPARTED YET"].map(opt => (
                            <div key={opt} onClick={() => {setStatusFilter(opt); setIsStatusDropdownOpen(false);}} className="px-4 py-3 text-[10px] font-mono text-white/60 hover:text-[#E5B5FF] hover:bg-[#B026FF]/20 cursor-pointer uppercase tracking-widest transition-colors">{opt}</div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-transparent text-white/40 font-mono text-[10px] uppercase tracking-[2px] border-y border-white/10">
                      <th className="px-4 py-5 font-normal">VESSEL NAME</th>
                      <th className="px-4 py-5 font-normal text-center">CREW ON BOARD</th>
                      <th className="px-4 py-5 font-normal text-center">PACKAGE TYPES</th>
                      <th className="px-4 py-5 font-normal text-center">ROUTE</th>
                      <th className="px-4 py-5 font-normal text-center">TIME</th>
                      <th className="px-4 py-5 font-normal text-center">STATUS</th>
                      <th className="px-4 py-5 font-normal text-center">MANUAL CONTROL</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[12px]">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                          <td className="px-4 py-5">
                            <div className="flex items-start gap-4">
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${row.dotColor} shadow-[0_0_8px_${row.dotColor}]`}></div>
                              <div>
                                <p className="text-white font-bold tracking-[2px] mb-1.5 text-[14px] uppercase">{row.vessel}</p>
                                <p className="text-[10px] text-white/40 tracking-widest uppercase">RECEIPT: {row.receipt}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5 text-center">
                            <span className="inline-block border border-[#B026FF]/30 bg-[#B026FF]/10 text-[#E5B5FF] px-5 py-1.5 rounded-md text-[11px] tracking-widest font-bold uppercase">{row.crew}</span>
                          </td>
                          <td className="px-4 py-5 text-center text-[#00E3FD] tracking-widest text-[12px] font-bold uppercase">{row.package}</td>
                          <td className="px-4 py-5 text-center">
                            <div className="flex flex-col w-[200px] mx-auto">
                              <div className="flex items-center w-full justify-between relative px-2">
                                <div className="absolute top-1/2 left-4 right-4 h-[1px] border-t-2 border-dashed border-white/20 -translate-y-1/2 z-0"></div>
                                <div className="relative z-10 bg-[#0a0a0c] p-1">
                                  <div className="w-3.5 h-3.5 rounded-full border-[2px] border-white/40 flex items-center justify-center">
                                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                  </div>
                                </div>
                                <div className="relative z-10 bg-[#0a0a0c] p-1">
                                  <div className="w-3.5 h-3.5 rounded-full border-[2px] border-[#E5B5FF] flex items-center justify-center shadow-[0_0_8px_rgba(176,38,255,0.4)]">
                                    <div className="w-1 h-1 rounded-full bg-[#E5B5FF]"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center w-full justify-between mt-1 text-[9px] font-mono text-white/50 tracking-wider uppercase">
                                <span>{row.routeOrigin}</span>
                                <span>{row.routeDest}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5 text-white/70 text-center tracking-widest text-[12px] uppercase">{row.time}</td>
                          <td className="px-4 py-5 text-center">
                            <span className={`inline-flex items-center justify-center gap-2 ${row.statusColor} font-bold text-[11px] tracking-widest uppercase min-w-[140px]`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${row.dotColor} ${row.isRedBox ? 'animate-pulse' : ''}`}></span>{row.status}
                            </span>
                          </td>
                          <td className="px-4 py-5 text-center">
                            <button onClick={() => handleEditClick(row)} className="text-white/40 hover:text-[#B026FF] transition-colors p-2 rounded-full hover:bg-[#B026FF]/10">
                              <Settings size={20} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <div className="flex flex-col items-center justify-center py-20">
                            <p className="text-white/40 font-mono tracking-widest text-sm mb-4">No vessels found.</p>
                            <button onClick={() => {setStatusFilter("ALL"); setTimeFilter("ALL TIME"); setActivePackage("ALL");}} className="text-[#B026FF] border border-[#B026FF]/50 px-6 py-2 rounded-md text-[11px] font-bold hover:bg-[#B026FF]/10 transition-colors uppercase tracking-widest">Reset All Filters</button>
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
      <button 
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
        disabled={currentPage === 1} 
        className="hover:text-[#E5B5FF] disabled:opacity-30 transition-colors px-2 cursor-pointer disabled:cursor-not-allowed uppercase"
      >
        Previous
      </button>

      <div className="flex gap-2">
        {(() => {
          const pageWindow = 5;
          let start = Math.max(1, currentPage - Math.floor(pageWindow / 2));
          let end = start + pageWindow - 1;

          if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - pageWindow + 1);
          }

          return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(num => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentPage === num
                  ? "border border-[#B026FF] text-[#E5B5FF] bg-[#B026FF]/20 shadow-[0_0_10px_rgba(176,38,255,0.2)]"
                  : "hover:text-white hover:bg-white/5"
              }`}
            >
              {num.toString().padStart(2, '0')}
            </button>
          ));
        })()}
      </div>

      <button 
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
        disabled={currentPage === totalPages} 
        className="hover:text-[#E5B5FF] disabled:opacity-30 transition-colors px-2 cursor-pointer disabled:cursor-not-allowed uppercase"
      >
        Next
      </button>
    </div>
  </div>
)}
            </div>
          </motion.div>
        </main>
      )}

      <AnimatePresence>
        {editingRow && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingRow(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#0a0a0c] border border-[#B026FF]/30 rounded-xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(176,38,255,0.15)] z-10">
              
              <button onClick={() => setEditingRow(null)} className="absolute top-4 right-4 text-white/40 hover:text-[#B026FF] transition-colors"><X size={20} /></button>
              
              <h2 className="text-white font-grotesk font-bold text-xl tracking-[2px] uppercase mb-1 flex items-center gap-3">
                <Settings size={22} className="text-[#B026FF]"/> Manual Control
              </h2>
              <p className="text-[#00E3FD] font-mono text-[11px] tracking-widest mb-8 uppercase">Receipt: {editingRow.receipt}</p>

              <div className="flex flex-col gap-6 mb-8">
                <div>
                  <label className="text-[10px] font-bold text-white/40 tracking-[3px] uppercase mb-2 block font-mono">VESSEL NAME (Read Only)</label>
                  <input type="text" readOnly value={editingRow.vessel} className="w-full bg-[#121317]/50 border border-white/5 rounded px-4 py-3 text-white/50 font-inter text-[13px] cursor-not-allowed uppercase" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 tracking-[3px] uppercase mb-2 block font-mono">DELIVERY STATUS</label>
                  <div className="relative">
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-[#121317] border border-white/10 rounded px-4 py-3 text-[13px] text-white appearance-none outline-none focus:border-[#B026FF] transition-colors cursor-pointer"
                    >
                      <option value="PENDING" className="bg-[#121317]">PENDING</option>
                      <option value="EN ROUTE" className="bg-[#121317]">EN ROUTE</option>
                      <option value="ARRIVED" className="bg-[#121317]">ARRIVED</option>
                      <option value="DELIVERED" className="bg-[#121317]">DELIVERED</option>
                      <option value="DELAYED" className="bg-[#121317]">DELAYED</option>
                      <option value="NOT DEPARTED YET" className="bg-[#121317]">NOT DEPARTED YET</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveEdit}
                className="w-full py-3.5 bg-gradient-to-r from-[#B026FF] to-[#00E3FD] text-white rounded-md hover:opacity-90 font-grotesk text-[13px] font-bold uppercase tracking-[2px] transition-opacity flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(176,38,255,0.3)]"
              >
                <Save size={16} /> Save Status
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}