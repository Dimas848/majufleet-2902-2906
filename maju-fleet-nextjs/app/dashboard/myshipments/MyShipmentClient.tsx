"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, MapPin, Ship, Navigation, Clock, CheckCircle2, FileText, Activity, Anchor, Search, XCircle, RefreshCw, X, ShieldCheck, Box, AlertCircle, Weight } from "lucide-react";
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
  const [toastText, setToastText] = useState("TRACKING ID NOT FOUND"); 
  const [currentTrackingData, setCurrentTrackingData] = useState<any>(null);

  // STATE: Pengendali pop-up lembar struk resi kargo
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);

  // Load daftar kargo asli milik user secara real-time saat halaman dibuka
  useEffect(() => {
    async function loadShipmentData() {
      try {
        const session = await getCurrentSession();
        if (session) {
          const res = await getCustomerShipments(session.id);
          if (res.success) {
            // 💡 REVISI FILTER: Hanya meloloskan kargo aktif yang sukses dipesan (Menyembunyikan status CANCELED)
            const activeShipments = res.shipments.filter(
              (s: any) => s.status !== "CANCELED" && s.status !== "CANCELLED"
            );
            setShipments(activeShipments);
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

        // Blokir pelacakan satelit jika kode resi yang dicari sudah berstatus batal
        if (s.status === "CANCELED" || s.status === "CANCELLED") {
          setTrackError(true);
          setToastText("TERMINATED: THIS SHIPMENT HAS BEEN CANCELED");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
          return;
        }
        
        const originCity = s.senderCity || "";
        const originCountry = s.senderCountry || "";
        const destinationCity = s.recipientCity || "";
        const destinationCountry = s.recipientCountry || "";

        if (
          originCity.trim().length < 4 || 
          originCountry.trim().length < 4 || 
          destinationCity.trim().length < 4 || 
          destinationCountry.trim().length < 4
        ) {
          setTrackError(true);
          setToastText("INVALID LOCATION: MINIMUM 4 CHARACTERS REQUIRED");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
          return;
        }

        const latestDetail = s.details?.[0];
        
        let progressPercent = 15; 
        if (s.status === "NOT DEPARTED YET") progressPercent = 40;
        if (s.status === "EN ROUTE" || s.status === "IN_TRANSIT") progressPercent = 70;
        if (s.status === "DELIVERED") progressPercent = 100;

        setCurrentTrackingData({
          status: s.status,
          progress: progressPercent,
          senderName: s.senderName || "Sender Reference",
          senderCountry: originCountry,
          recipientName: s.recipientName || "Recipient Reference",
          recipientCountry: destinationCountry,
          origin: originCity,
          destination: destinationCity,
          atd: s.book_date ? new Date(s.book_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-",
          eta: latestDetail ? `LAT: ${latestDetail.current_lat} | LNG: ${latestDetail.current_lng}` : "Awaiting Satellite Link...",
          vessel: s.vessel?.name || "UNASSIGNED LOGISTICS VESSEL",
          package: s.items?.[0]?.packageType?.name || "STANDARD CONTAINER",
          cargoDesc: s.cargoDesc || "General Cargo Load",
          cargoType: s.category || "Dry Goods",
          weight: s.weight || 0
        });
        
        setShowTrackResult(true);
      } else {
        setTrackError(true);
        setToastText("TRACKING ID NOT FOUND");
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

  const handleRowClick = (receiptNum: string) => {
    setTrackingNumber(receiptNum);
    performTracking(receiptNum);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const resetTracking = () => {
    setTrackingNumber("");
    setShowTrackResult(false);
    setTrackError(false);
    setShowToast(false);
    setCurrentTrackingData(null);
  };

  const formatCurrency = (amount: number) => {
    return "Rp " + amount.toLocaleString("id-ID");
  };

  const getReceiptGrandTotal = (s: any) => {
    if (s?.invoice?.amount) return Number(s.invoice.amount);
    const pricing: Record<string, number> = { economy: 59000, standard: 70000, heavy: 120000, express: 90000, vip: 150000 };
    const rawType = (s?.packageTypeString || "").toLowerCase();
    const cleanType = rawType.replace("maju", "").trim();
    const basePrice = pricing[cleanType] || pricing[rawType] || 70000;
    return basePrice * (s?.weight || 0);
  };

  const formatReceiptDate = (s: any) => {
    if (!s) return "-";
    const rawDate = s.book_date || s.bookDate || s.createdAt;
    if (!rawDate) return "-";
    return new Date(rawDate).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // 💡 CLEANER FORMATTER: Menghapus bug duplikasi kata "Maju Maju" di frontend
  const cleanPackageName = (nameString: string) => {
    if (!nameString) return "Maju Standard";
    const clean = nameString.replace(/maju/gi, "").trim();
    return `Maju ${clean.charAt(0).toUpperCase() + clean.slice(1)}`;
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
              {toastText}
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
                                <p className="text-white font-mono text-[12px]">{cleanPackageName(currentTrackingData.package)}</p>
                              </div>
                              <div className="bg-[#1a1b20] p-3 rounded border border-white/5">
                                <p className="text-white/40 font-grotesk text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1"><Package size={10}/> Cargo Description</p>
                                <p className="text-white font-mono text-[12px] truncate">{currentTrackingData.cargoDesc}</p>
                              </div>
                              <div className="bg-[#1a1b20] p-3 rounded border border-white/5">
                                <p className="text-white/40 font-grotesk text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldCheck size={10}/> Category</p>
                                <p className="text-white font-mono text-[12px]">{currentTrackingData.cargoType}</p>
                              </div>
                              <div className="bg-[#1a1b20] p-3 rounded border border-white/5 col-span-2">
                                <p className="text-white/40 font-grotesk text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1"><Weight size={10}/> Cargo Total Weight</p>
                                <p className="text-[#B026FF] font-mono text-[13px] font-bold">{currentTrackingData.weight.toLocaleString('id-ID')} KG</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h3 className="text-white font-grotesk text-[16px] uppercase tracking-[2px] mt-12 mb-4">Your Shipment Fleet Registry</h3>
              <div className="bg-[#121317]/80 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1a1b20] text-white/50 font-grotesk text-[10px] uppercase tracking-[2px] border-b border-white/5">
                        <th className="p-4 font-normal">Tracking ID</th>
                        <th className="p-4 font-normal">Package Type</th> 
                        <th className="p-4 font-normal">Route Hub</th>
                        <th className="p-4 font-normal">Weight</th>
                        <th className="p-4 font-normal">Status</th>
                        <th className="p-4 font-normal text-center">Action</th> 
                      </tr>
                    </thead>
                    <tbody className="text-white font-inter text-[13px]">
                      {shipments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-white/30 font-inter">No deployment records linked to this account.</td>
                        </tr>
                      ) : (
                        shipments.map((s) => (
                          <tr 
                            key={s.id} 
                            onClick={() => handleRowClick(s.receipt_number)}
                            className="border-b border-white/5 hover:bg-[#B026FF]/5 transition-colors cursor-pointer"
                          >
                            <td className="p-4 font-mono text-[#E5B5FF] font-bold">{s.receipt_number}</td>
                            <td className="p-4 text-white/80 font-mono text-[11px] uppercase tracking-wider">
                              {cleanPackageName(s.packageTypeString || s.package_type_string || s.items?.[0]?.packageType?.name)}
                            </td>
                            <td className="p-4 text-white/60 font-mono text-[12px]">{s.senderCity} ➔ {s.recipientCity}</td>
                            <td className="p-4 text-white/70">{(s.weight || 0).toLocaleString('id-ID')} KG</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                s.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                s.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => { setSelectedShipment(s); setShowReceiptModal(true); }}
                                className="inline-flex items-center gap-1.5 bg-[#B026FF]/10 text-[#E5B5FF] hover:bg-[#B026FF] hover:text-white px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all border border-[#B026FF]/20"
                              >
                                <FileText size={13} /> Receipt
                              </button>
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

      {/* === INTEGRASI MODAL POP-UP: SHIPMENT RECEIPT STRUK LOGISTIK PREMIUM === */}
      <AnimatePresence>
        {showReceiptModal && selectedShipment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReceiptModal(false)} className="fixed inset-0 cursor-pointer" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-[480px] bg-[#0d0d11] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(176,38,255,0.15)] z-10 my-auto flex flex-col justify-between">
              <button onClick={() => setShowReceiptModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"><XCircle size={22} /></button>
              <div className="absolute top-0 left-0 w-full h-[4px] bg-[#B026FF]" />
              
              <div>
                <div className="text-center pb-4 mb-4 border-b border-dashed border-white/10">
                  <div className="inline-flex items-center justify-center bg-[#B026FF]/10 text-[#E5B5FF] p-2.5 rounded-full mb-2 border border-[#B026FF]/20">
                    <Ship size={20} />
                  </div>
                  <h3 className="font-grotesk font-bold text-[18px] text-white tracking-[2px] uppercase">SHIPMENT RECEIPT</h3>
                  <p className="text-white/40 font-mono text-[9px] uppercase tracking-[3px] mt-0.5">MAJU FLEET</p>
                </div>

                {/* Meta Data Utama Nota Struk */}
                <div className="font-mono text-[11px] bg-[#121317] border border-white/5 rounded-lg p-4 space-y-2.5 mb-5 text-white/70">
                  {/* 💡 FIXED INVOICE LINE: Memasang kembali baris nomor invoice resmi yang sempat terhapus kosong */}
                  <div className="flex justify-between">
                    <span className="text-white/30">INVOICE NO:</span>
                    <span className="text-white font-bold">{selectedShipment.invoice?.invoiceNumber || selectedShipment.invoice?.invoiceNumString || "INV-2026-TEMP"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">FLEET ID:</span>
                    <span className="text-[#BDF4FF] font-bold">{selectedShipment.receipt_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">TRANSACTION DATE:</span>
                    <span className="text-white font-medium">{formatReceiptDate(selectedShipment)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/30">STATUS:</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${selectedShipment.status === "PENDING" ? "border border-orange-500/30 text-orange-400 bg-orange-500/5" : "border border-[#10B981]/30 text-[#10B981] bg-[#10B981]/5"}`}>
                      {selectedShipment.status}
                    </span>
                  </div>
                </div>

                {/* Logistic Details */}
                <div className="mb-5 bg-[#121317]/50 rounded-lg border border-white/5 p-4">
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-[2px] mb-3 flex items-center gap-1.5">
                    <MapPin size={11} className="text-[#B026FF]"/> Logistic Details
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-[12px] font-inter">
                    <div className="border-r border-white/5 pr-2">
                      <span className="block text-[9px] font-mono font-bold uppercase text-[#E5B5FF] tracking-wider mb-1">Shipped From</span>
                      <p className="text-white font-bold text-[13px] truncate">
                        {selectedShipment.senderName || "Sender Reference"}
                      </p>
                      <p className="text-white/50 text-[11px] truncate mt-0.5">
                        {selectedShipment.senderCity || "Origin Port"}
                        {selectedShipment.senderCountry ? `, ${selectedShipment.senderCountry}` : ""}
                      </p>
                    </div>
                    <div className="pl-2">
                      <span className="block text-[9px] font-mono font-bold uppercase text-[#00E3FD] tracking-wider mb-1">Shipped To</span>
                      <p className="text-white font-bold text-[13px] truncate">
                        {selectedShipment.recipientName || "Recipient Reference"}
                      </p>
                      <p className="text-white/50 text-[11px] truncate mt-0.5">
                        {selectedShipment.recipientCity || "Destination Port"}
                        {selectedShipment.recipientCountry ? `, ${selectedShipment.recipientCountry}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cargo Specification Details */}
                <div className="mb-6">
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-[2px] mb-2.5 flex items-center gap-1.5">
                    <Anchor size={11} className="text-[#B026FF]"/> CARGO Details
                  </p>
                  
                  <div className="border-t-2 border-dashed border-white/10 pt-3 space-y-2.5 font-mono text-[12px]">
                    <div className="flex justify-between text-white/50 text-[11px] items-center">
                      <span className="flex items-center gap-1"><Anchor size={11}/> Cargo Description:</span>
                      <span className="text-white font-bold truncate max-w-[220px]">{selectedShipment.cargoDesc || "General Load"}</span>
                    </div>

                    <div className="flex justify-between text-white/50 text-[11px] items-center">
                      <span className="flex items-center gap-1"><Weight size={11}/> Charged Weight:</span>
                      <span className="text-white font-bold">{(selectedShipment.weight || 0).toLocaleString('id-ID')} KG</span>
                    </div>

                    <div className="flex justify-between text-white/50 text-[11px] items-center uppercase">
                      <span className="flex items-center gap-1"><Box size={11}/> Rate Plan:</span>
                      <span className="text-[#BDF4FF] font-bold">
                        {cleanPackageName(selectedShipment.packageTypeString || selectedShipment.package_type_string || selectedShipment.items?.[0]?.packageType?.name)}
                      </span>
                    </div>

                    <div className="flex justify-between text-white/50 text-[11px] items-center">
                      <span className="flex items-center gap-1"><Box size={11}/> Cargo Type:</span>
                      <span className="text-white font-bold">{selectedShipment.category || "General Cargo"}</span>
                    </div>
                    
                    <div className="border-t border-dashed border-white/10 pt-3 mt-2 flex justify-between items-center">
                      <span className="text-white/40 font-grotesk text-[11px] uppercase tracking-wider font-bold">Grand Total (Net)</span>
                      <span className="text-[#B026FF] font-inter font-bold text-2xl tracking-[-0.5px] drop-shadow-[0_0_12px_rgba(176,38,255,0.4)]">
                        {formatCurrency(getReceiptGrandTotal(selectedShipment))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <button 
                  onClick={() => setShowReceiptModal(false)} 
                  className="w-full border border-white/10 py-3.5 rounded-lg text-white/50 font-grotesk font-bold text-[14px] uppercase tracking-[3px] hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> CLOSE RECEIPT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}