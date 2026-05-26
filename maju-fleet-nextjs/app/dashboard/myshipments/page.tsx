"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, MapPin, Ship, Navigation, Clock, CheckCircle2, FileText, Activity, Anchor, Search, XCircle, RefreshCw, X, ShieldCheck, Box, AlertCircle } from "lucide-react";
import UserNavbar from "@/components/usernavbar";
// Import Server Actions resmi dari backend actions.ts
import { trackShipmentCustomer, getCurrentSession, getCustomerShipments } from "@/app/lib/actions";

function MyShipmentsSkeleton() {
  return (
    <main className="flex-1 py-10 px-6 md:px-10 relative overflow-hidden animate-pulse">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B026FF]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BDF4FF]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1000px] mx-auto relative z-10">
        <div className="mb-10 border-b border-white/5 pb-6">
          <div className="h-10 w-64 bg-white/10 rounded mb-4"></div>
          <div className="h-4 w-96 bg-white/5 rounded"></div>
        </div>

        <div className="max-w-2xl mb-10 flex flex-col md:flex-row gap-4">
          <div className="flex-1 h-[56px] bg-[#121317]/80 border border-white/10 rounded"></div>
          <div className="w-[140px] h-[56px] bg-white/10 rounded"></div>
        </div>

        <div className="h-6 w-64 bg-white/10 rounded mb-6 mt-12"></div>
        <div className="bg-[#121317]/40 border border-white/5 rounded-xl overflow-hidden">
          <div className="h-12 border-b border-white/5 bg-[#1a1b20]/50"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-white/5">
              <div className="h-4 w-28 bg-white/10 rounded"></div>
              <div className="h-4 w-24 bg-white/5 rounded"></div>
              <div className="h-4 w-40 bg-white/5 rounded"></div>
              <div className="h-4 w-20 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function MyShipmentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [shipments, setShipments] = useState<any[]>([]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [showTrackResult, setShowTrackResult] = useState(false);
  const [trackError, setTrackError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentTrackingData, setCurrentTrackingData] = useState<any>(null);

  // Load daftar kargo asli milik user secara real-time saat halaman dibuka
  useEffect(() => {
    async function loadShipmentData() {
      try {
        const session = await getCurrentSession();
        if (session) {
          const res = await getCustomerShipments(session.id);
          if (res.success) {
            setShipments(res.shipments);
          }
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data armada:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadShipmentData();
  }, []);

  // Handler fungsi pelacakan satelit
  const performTracking = async (targetCode: string) => {
    if (!targetCode) return;
    setIsTracking(true);
    setShowTrackResult(false);
    setTrackError(false);
    setShowToast(false);
    
    try {
      const res = await trackShipmentCustomer(targetCode);
      
      if (res.success && res.data) {
        const s = res.data;
        const latestDetail = s.details?.[0];
        
        let progressPercent = 15; 
        if (s.status === "NOT DEPARTED YET") progressPercent = 40;
        if (s.status === "EN ROUTE" || s.status === "IN_TRANSIT") progressPercent = 70;
        if (s.status === "DELIVERED") progressPercent = 100;

        setCurrentTrackingData({
          status: s.status,
          progress: progressPercent,
          origin: s.senderCity || "Origin Hub",
          destination: s.recipientCity || "Destination Hub",
          atd: s.book_date ? new Date(s.book_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
          eta: latestDetail ? `LAT: ${latestDetail.current_lat} | LNG: ${latestDetail.current_lng}` : "Awaiting Satellite Link...",
          vessel: s.vessel?.name || "UNASSIGNED LOGISTICS VESSEL",
          package: s.items?.[0]?.packageType?.name || "STANDARD CONTAINER",
          cargoDesc: s.cargoDesc || "General Cargo Load",
          cargoType: s.category || "Dry Goods"
        });
        
        setShowTrackResult(true);
      } else {
        setTrackError(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error(error);
      setTrackError(true);
    } finally {
      setIsTracking(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performTracking(trackingNumber);
  };

  // Fungsi auto-track ketika baris tabel di bawah diklik oleh user
  const handleRowClick = (receiptNum: string) => {
    setTrackingNumber(receiptNum);
    performTracking(receiptNum);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll otomatis ke atas untuk melihat radar peta
  };

  const resetTracking = () => {
    setTrackingNumber("");
    setShowTrackResult(false);
    setTrackError(false);
    setShowToast(false);
    setCurrentTrackingData(null);
  };

  const isDelivered = currentTrackingData?.status === "DELIVERED";
  const isSailing = currentTrackingData?.status === "EN ROUTE" || currentTrackingData?.status === "IN_TRANSIT";

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col relative overflow-x-hidden">
      
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-24 right-6 z-[100] bg-[#0d0d11] border border-white/5 rounded-[10px] px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4"
          >
            <div className="w-6 h-6 rounded-full bg-[#e87c86] flex items-center justify-center text-white shrink-0">
              <X size={14} strokeWidth={3} />
            </div>
            <span className="text-[#e87c86] font-grotesk font-bold text-[14px] uppercase tracking-[1px]">
              TRACKING ID NOT FOUND
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <UserNavbar />

      {isLoading ? (
        <MyShipmentsSkeleton />
      ) : (
        <main className="flex-1 py-10 px-6 md:px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B026FF]/5 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BDF4FF]/5 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-[1000px] mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              
              <div className="mb-10 border-b border-white/5 pb-6">
                <h1 className="text-white font-grotesk font-bold text-3xl md:text-4xl tracking-[-1px] uppercase mb-2">
                  TRACK & <span className="text-[#B026FF]">TRACE</span>
                </h1>
                <p className="text-white/50 font-inter text-[14px]">
                  Enter your Tracking ID or select from your shipment registry below to view real-time telemetry.
                </p>
              </div>

              <div className="max-w-2xl mb-10">
                <form onSubmit={handleTrackSubmit} className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80" />
                    <input 
                      type="text" 
                      required 
                      value={trackingNumber}
                      onChange={(e) => {
                        setTrackingNumber(e.target.value.toUpperCase());
                        setTrackError(false);
                        setShowToast(false);
                      }}
                      placeholder="Enter Tracking ID (e.g. MJF-123456)" 
                      className={`w-full bg-[#121317]/80 backdrop-blur-sm border rounded px-12 py-4 text-white font-mono text-[14px] placeholder-white/30 focus:outline-none transition-all uppercase ${trackError ? 'border-[#e87c86]/70 focus:border-[#e87c86]' : 'border-[#B026FF]/30 focus:border-[#B026FF]'}`} 
                      disabled={isTracking || showTrackResult}
                    />
                    {(showTrackResult || trackError) && (
                      <button type="button" onClick={resetTracking} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-red-400 transition-colors">
                        <XCircle size={20} />
                      </button>
                    )}
                  </div>
                  <button 
                    type="submit" 
                    disabled={isTracking || showTrackResult || !trackingNumber}
                    className="px-8 py-4 rounded bg-[#B026FF] hover:bg-[#9a1ce6] text-white font-grotesk font-bold text-[14px] uppercase tracking-[2px] transition-all disabled:opacity-50 min-w-[140px] flex justify-center items-center"
                    style={{ background: isTracking ? "#7a1aaa" : "linear-gradient(90deg, #B026FF, #4E0078)" }}
                  >
                    {isTracking ? <RefreshCw size={20} className="animate-spin" /> : "TRACK"}
                  </button>
                </form>
              </div>

              <AnimatePresence>
                {showTrackResult && currentTrackingData && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-[#121317]/80 backdrop-blur-sm border border-[#B026FF]/40 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(176,38,255,0.15)] mb-8">
                      
                      <div className="bg-[#1a1b20] px-6 py-4 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#B026FF]/20 p-2 rounded text-[#E5B5FF]"><Ship size={20} /></div>
                          <div>
                            <p className="text-white/50 font-grotesk text-[10px] uppercase tracking-[2px] mb-1">Result For</p>
                            <p className="text-[#BDF4FF] font-mono font-bold text-[16px] tracking-widest">{trackingNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {isDelivered ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] font-inter text-[11px] font-bold uppercase tracking-wider">
                              <CheckCircle2 size={12} /> Delivered
                            </div>
                          ) : (
                            <>
                              {isSailing && (
                                <div className="hidden sm:flex items-center gap-2 bg-[#121317] border border-[#B026FF]/30 px-3 py-1.5 rounded text-[#B026FF] font-mono text-[10px] tracking-wide">
                                  <Activity size={12} className="animate-pulse" /> LIVE RADAR SYNC
                                </div>
                              )}
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-inter text-[11px] font-bold uppercase tracking-wider">
                                <Navigation size={12} /> {currentTrackingData.status}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-6 md:p-8">
                        <div className="mb-10 relative mt-2">
                          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10 -translate-y-1/2 z-0"></div>
                          <div 
                            className="absolute top-1/2 left-0 h-[2px] bg-[#B026FF] -translate-y-1/2 z-0 shadow-[0_0_10px_#B026FF] transition-all duration-1000"
                            style={{ width: `${currentTrackingData.progress}%` }}
                          ></div>
                          
                          <div className="flex justify-between relative z-10">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-[#B026FF] flex items-center justify-center text-white mb-2 shadow-[0_0_15px_rgba(176,38,255,0.4)]"><CheckCircle2 size={16} /></div>
                              <p className="text-[#E5B5FF] font-grotesk font-bold text-[11px] uppercase tracking-wide">Booked</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentTrackingData.progress >= 40 ? 'bg-[#B026FF] text-white' : 'bg-[#1a1b20] border-2 border-white/20 text-white/30'}`}><Anchor size={16} /></div>
                              <p className={`${currentTrackingData.progress >= 40 ? 'text-[#E5B5FF]' : 'text-white/40'} font-grotesk font-bold text-[11px] uppercase tracking-wide`}>Cleared</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentTrackingData.progress >= 70 ? 'bg-[#B026FF] text-white' : 'bg-[#1a1b20] border-2 border-white/20 text-white/30'}`}>
                                <Ship size={14} className={isSailing ? "animate-pulse" : ""} />
                              </div>
                              <p className={`${currentTrackingData.progress >= 70 ? 'text-[#E5B5FF]' : 'text-white/40'} font-grotesk font-bold text-[11px] uppercase tracking-wide`}>Sailing</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isDelivered ? 'bg-[#B026FF] text-white' : 'bg-[#1a1b20] border-2 border-white/20 text-white/30'}`}><Package size={14} /></div>
                              <p className={`${isDelivered ? 'text-[#E5B5FF]' : 'text-white/40'} font-grotesk font-bold text-[11px] uppercase tracking-wide`}>Delivered</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <h4 className="text-white font-grotesk text-[13px] uppercase tracking-[2px] border-b border-white/10 pb-2">Route & Schedule</h4>
                            <div className="flex items-start gap-4">
                              <div className="mt-1 text-[#B026FF]"><MapPin size={18} /></div>
                              <div>
                                <p className="text-white/50 font-inter text-[11px] uppercase tracking-wider mb-1">Origin Port</p>
                                <p className="text-white font-bold font-inter text-[14px]">{currentTrackingData.origin}</p>
                                <p className="text-white/40 font-mono text-[12px] flex items-center gap-1 mt-1"><Clock size={12}/> Issue Date: {currentTrackingData.atd}</p>
                              </div>
                            </div>
                            <div className="w-[1px] h-6 bg-white/10 ml-[9px] -my-2"></div>
                            <div className="flex items-start gap-4">
                              <div className="mt-1 text-[#BDF4FF]"><MapPin size={18} /></div>
                              <div>
                                <p className="text-white/50 font-inter text-[11px] uppercase tracking-wider mb-1">Destination Port</p>
                                <p className="text-white font-bold font-inter text-[14px]">{currentTrackingData.destination}</p>
                                <p className="text-[#BDF4FF]/70 font-mono text-[12px] flex items-center gap-1 mt-1">
                                  <Clock size={12}/> Satellite Link: {currentTrackingData.eta}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <h4 className="text-white font-grotesk text-[13px] uppercase tracking-[2px] border-b border-white/10 pb-2">Vessel Telemetry & Cargo</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[#1a1b20] p-3 rounded border border-white/5">
                                <p className="text-white/40 font-grotesk text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1"><Ship size={10}/> Fleet Allocation</p>
                                <p className="text-white font-mono text-[12px]">{currentTrackingData.vessel}</p>
                              </div>
                              <div className="bg-[#1a1b20] p-3 rounded border border-white/5">
                                <p className="text-white/40 font-grotesk text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1"><Box size={10}/> Package Tier</p>
                                <p className="text-white font-mono text-[12px]">{currentTrackingData.package}</p>
                              </div>
                              <div className="bg-[#1a1b20] p-3 rounded border border-white/5">
                                <p className="text-white/40 font-grotesk text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1"><Package size={10}/> Cargo Manifest</p>
                                <p className="text-white font-mono text-[12px]">{currentTrackingData.cargoDesc}</p>
                              </div>
                              <div className="bg-[#1a1b20] p-3 rounded border border-white/5">
                                <p className="text-white/40 font-grotesk text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldCheck size={10}/> Category</p>
                                <p className="text-white font-mono text-[12px]">{currentTrackingData.cargoType}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 💡 SINKRONISASI MUTLAK: Tabel Manifest Riwayat Kargo Dinamis Asli Database */}
              <h3 className="text-white font-grotesk text-[16px] uppercase tracking-[2px] mt-12 mb-4">Your Shipment Fleet Registry</h3>
              <div className="bg-[#121317]/80 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1a1b20] text-white/50 font-grotesk text-[10px] uppercase tracking-[2px] border-b border-white/5">
                        <th className="p-4 font-normal">Tracking ID</th>
                        <th className="p-4 font-normal">Cargo Manifest</th>
                        <th className="p-4 font-normal">Route Hub</th>
                        <th className="p-4 font-normal">Weight</th>
                        <th className="p-4 font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-white font-inter text-[13px]">
                      {shipments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-white/30 font-inter">No deployment records linked to this account.</td>
                        </tr>
                      ) : (
                        shipments.map((s) => (
                          <tr 
                            key={s.id} 
                            onClick={() => handleRowClick(s.receipt_number)}
                            className="border-b border-white/5 hover:bg-[#B026FF]/5 transition-colors cursor-pointer"
                          >
                            <td className="p-4 font-mono text-[#E5B5FF] font-bold">{s.receipt_number}</td>
                            <td className="p-4 text-white/80">{s.cargoDesc}</td>
                            <td className="p-4 text-white/60 font-mono text-[12px]">{s.senderCity} ➔ {s.recipientCity}</td>
                            <td className="p-4 text-white/70">{s.weight.toLocaleString('id-ID')} KG</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                s.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                s.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          </div>
        </main>
      )}
    </div>
  );
}