"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Filter, AlertTriangle, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminNavbar from "@/components/adminnavbar";
import { getAllData } from "../../lib/actions";

interface MapViewerProps {
  vessels: any[];
  selectedVessel: string | null;
  setSelectedVessel: React.Dispatch<React.SetStateAction<string | null>>;
}

const MapViewer = dynamic<MapViewerProps>(() => import("../../../components/MapViewerComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#121317]/40 rounded-[32px] animate-pulse flex items-center justify-center text-white/50 font-mono text-sm tracking-widest border border-white/5">
      INITIALIZING SATELLITE LINK...
    </div>
  )
});

function MapSkeleton() {
  return (
    <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[1800px] mx-auto flex-1 mt-6 animate-pulse">
      <div className="flex gap-8 h-[750px]">
        <div className="flex-1 bg-[#121317]/40 rounded-[32px] border border-white/5"></div>
        <div className="w-[420px] bg-transparent flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 mt-4">
            <div className="h-6 w-48 bg-white/10 rounded"></div>
            <div className="h-6 w-6 bg-white/10 rounded"></div>
          </div>
          <div className="flex gap-2 border-b border-white/5 pb-4 mb-6">
            <div className="h-6 w-16 bg-white/10 rounded"></div>
            <div className="h-6 w-16 bg-white/10 rounded"></div>
          </div>
          <div className="h-9 w-full bg-white/10 rounded mb-4"></div>
          <div className="flex-1 flex flex-col gap-4 pr-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-white/10 rounded p-5 bg-[#121317]/40">
                <div className="h-4 w-24 bg-white/20 rounded mb-4"></div>
                <div className="h-2 w-full bg-white/5 rounded mb-2"></div>
                <div className="h-2 w-2/3 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const CITY_COORDS: Record<string, [number, number]> = {
  "Jakarta": [-6.2, 106.8],
  "Rotterdam": [51.9, 4.5],
  "Singapore": [1.3, 103.8],
  "Tokyo": [35.6, 139.7],
  "Sydney": [-33.8, 151.2],
  "Shanghai": [31.2, 121.4],
  "Busan": [35.1, 129.0],
  "Los Angeles": [34.0, -118.2],
  "Dubai": [25.2, 55.2],
  "Hamburg": [53.5, 9.9],
  "New York": [40.7, -74.0],
  "London": [51.5, -0.1],
  "Yokohama": [35.4, 139.6],
};

function getCoords(city: string): [number, number] {
  if (!city) return [0, 0];
  const match = Object.keys(CITY_COORDS).find(k => city.toLowerCase().includes(k.toLowerCase()));
  return match ? CITY_COORDS[match] : [0, 0];
}

function MapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [mapSubTab, setMapSubTab] = useState<"ALL" | "ALERTS">("ALL");
  const [mapStatusFilter, setMapStatusFilter] = useState("ALL");
  const [isSidebarFilterOpen, setIsSidebarFilterOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [vesselsData, setVesselsData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "ALERTS") setMapSubTab("ALERTS");
    else setMapSubTab("ALL");
  }, [searchParams]);

  useEffect(() => {
    const fetchMapData = async () => {
      setIsLoadingData(true);
      try {
        const dbData = await getAllData();

        if (dbData.shipments && dbData.shipments.length > 0) {
          const mapped = dbData.shipments.map((s: any) => {
            const isProblem = s.status === "NOT DEPARTED YET";
            const dotColor = isProblem ? "#FF3B30" : "#00E3FD";
            const statusColor = isProblem ? "text-[#FF3B30]" : "text-[#00E3FD]";

            const lat = s.detail?.current_lat ?? getCoords(s.senderCity)[0];
            const lng = s.detail?.current_lng ?? getCoords(s.senderCity)[1];

            const packageName = s.items?.[0]?.packageType?.name ?? "MAJU STANDARD";

            return {
              id: s.receipt_number || `MJF-${s.id}`,
              package: packageName,
              crew: s.vessel?.crewLead || s.captain?.name || "NO CREW",
              status: s.status || "PENDING",
              statusColor,
              dotColor,
              reason: isProblem ? (s.delayReason || "Status requires attention") : undefined,
              lat: lat || 0,
              lng: lng || 0,
              origin: s.senderCity ? `${s.senderCity}` : "Unknown",
              dest: s.recipientCity ? `${s.recipientCity}` : "Unknown",
              eta: s.eta || "TBD",
              speed: s.speed || (isProblem ? "0 knots" : "18.5 knots"),
              vesselName: s.vessel?.name || "UNASSIGNED",
            };
          });

          setVesselsData(mapped);
          if (mapped.length > 0) setSelectedVessel(mapped[0].id);
        }
      } catch (error) {
        console.error("Gagal memuat data map dari Neon:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchMapData();
  }, []);

  const handleTabChange = (tab: "ALL" | "ALERTS") => {
    setMapSubTab(tab);
    router.push(`/Dashboard-Admin/map?tab=${tab}`);
  };

  const displayedVessels = vesselsData.filter(v => {
    const passesTab = mapSubTab === "ALL" ? true : (v.status === "NOT DEPARTED YET");
    const passesStatus = mapStatusFilter === "ALL" ? true : v.status === mapStatusFilter;
    const q = searchQuery.toLowerCase().trim();
    const passesSearch = q === "" ? true : (
      v.id.toLowerCase().includes(q) ||
      v.vesselName.toLowerCase().includes(q) ||
      v.crew.toLowerCase().includes(q) ||
      v.origin.toLowerCase().includes(q) ||
      v.dest.toLowerCase().includes(q) ||
      v.status.toLowerCase().includes(q)
    );
    return passesTab && passesStatus && passesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, mapSubTab, mapStatusFilter]);

  const totalPages = Math.ceil(displayedVessels.length / itemsPerPage);
  const paginatedVessels = displayedVessels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const pageWindow = 4;
  let startPage = Math.max(1, currentPage - Math.floor(pageWindow / 2));
  let endPage = Math.min(totalPages, startPage + pageWindow - 1);
  if (endPage - startPage < pageWindow - 1) startPage = Math.max(1, endPage - pageWindow + 1);

  if (isLoadingData) return <MapSkeleton />;

  return (
    <>
      <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[1800px] mx-auto flex-1 mt-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex gap-8 h-[750px]">

            {/* MAP AREA */}
            <div className="flex-1 rounded-[32px] overflow-hidden relative border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#0d0d11]">
              <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
                <p className="flex items-center gap-2 text-[#00FF00] font-mono text-[9px] uppercase tracking-widest mb-1 font-bold bg-black/60 border border-[#00FF00]/30 px-3 py-1.5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,255,0,0.1)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00] animate-pulse"></span> LIVE SATELLITE LINK
                </p>
              </div>
              <MapViewer
                vessels={vesselsData}
                selectedVessel={selectedVessel}
                setSelectedVessel={setSelectedVessel}
              />
            </div>

            {/* SIDEBAR */}
            <div className="w-[420px] bg-transparent flex flex-col h-full">

              {/* Header */}
              <div className="flex justify-between items-center mb-6 mt-4 relative z-[60]">
                <h2 className="font-grotesk font-bold text-[20px] uppercase tracking-[1px] text-white">VESSEL MONITOR</h2>
                <div className="relative">
                  <Filter
                    size={18}
                    onClick={() => setIsSidebarFilterOpen(!isSidebarFilterOpen)}
                    className={`cursor-pointer transition-colors ${mapStatusFilter !== "ALL" ? "text-[#B026FF]" : "text-white/60 hover:text-[#E5B5FF]"}`}
                  />
                  <AnimatePresence>
                    {isSidebarFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-3 w-[180px] bg-[#121317] border border-white/10 rounded-lg shadow-2xl z-[100] overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-white/5 text-[9px] font-mono text-white/40 uppercase tracking-widest bg-[#0a0a0c]">Filter by Status</div>
                        {["ALL", "EN ROUTE", "ARRIVED", "NOT DEPARTED YET"].map(opt => (
                          <div
                            key={opt}
                            onClick={() => { setMapStatusFilter(opt); setIsSidebarFilterOpen(false); }}
                            className={`px-4 py-3 text-[10px] font-mono cursor-pointer uppercase tracking-widest transition-colors ${mapStatusFilter === opt ? 'text-[#E5B5FF] bg-[#B026FF]/20 font-bold' : 'text-white/60 hover:text-[#E5B5FF] hover:bg-[#B026FF]/10'}`}
                          >
                            {opt}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4 relative z-40">
                <button
                  onClick={() => handleTabChange("ALL")}
                  className={`px-4 py-1.5 rounded-[4px] text-[10px] font-mono tracking-widest font-bold transition-all ${mapSubTab === "ALL" ? "bg-[#B026FF] text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]" : "bg-white/5 text-white/40 hover:text-white"}`}
                >
                  ALL
                </button>
                <button
                  onClick={() => handleTabChange("ALERTS")}
                  className={`px-4 py-1.5 rounded-[4px] text-[10px] font-mono tracking-widest font-bold transition-all ${mapSubTab === "ALERTS" ? "bg-[#B026FF] text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]" : "bg-white/5 text-white/40 hover:text-white"}`}
                >
                  ALERTS {vesselsData.filter(v => v.reason).length > 0 && (
                    <span className="ml-1.5 bg-[#FF3B30] text-white text-[8px] px-1.5 py-0.5 rounded-full">
                      {vesselsData.filter(v => v.reason).length}
                    </span>
                  )}
                </button>
              </div>

              {/* SEARCH BAR */}
              <div className="relative mb-4 z-30">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH ID, VESSEL, CREW, ROUTE..."
                  className="w-full bg-[#121317] border border-white/10 rounded pl-9 pr-9 py-2.5 text-[10px] font-mono tracking-widest text-white placeholder-white/25 focus:border-[#B026FF]/60 focus:outline-none focus:bg-[#1a1b22] transition-all"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                      <X size={12} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Hasil search info */}
              {searchQuery && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[9px] font-mono text-white/30 tracking-widest uppercase mb-3"
                >
                  {displayedVessels.length} RESULT{displayedVessels.length !== 1 ? "S" : ""} FOR &quot;{searchQuery.toUpperCase()}&quot;
                </motion.p>
              )}

              {/* Vessel List */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar relative z-30">
                <AnimatePresence mode="wait">
                  {displayedVessels.length === 0 ? (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center py-16 text-center w-full"
                    >
                      <AlertTriangle size={24} className="text-white/20 mb-3" />
                      <p className="text-white/40 font-mono text-[10px] tracking-widest uppercase px-4 leading-relaxed">
                        {searchQuery ? `No vessels match "${searchQuery}"` : "No vessels found"}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="mt-4 text-[9px] font-mono text-[#B026FF] hover:text-white border border-[#B026FF]/40 px-3 py-1.5 rounded transition-colors uppercase tracking-widest"
                        >
                          Clear Search
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="list-container" className="flex flex-col gap-4 w-full">
                      {paginatedVessels.map((vessel, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.05 }}
                          key={vessel.id}
                          onClick={() => setSelectedVessel(vessel.id)}
                          className={`bg-transparent border rounded p-5 relative overflow-hidden group transition-all cursor-pointer ${
                            vessel.id === selectedVessel
                              ? 'border-[#B026FF] bg-[#1a1b22] shadow-[0_0_15px_rgba(176,38,255,0.1)]'
                              : vessel.reason
                              ? 'border-[#FF3B30]/30 hover:border-[#FF3B30]/50 hover:bg-[#1a1b22]'
                              : 'border-white/10 hover:border-[#00E3FD]/50 hover:bg-[#1a1b22]'
                          }`}
                        >
                          {vessel.reason && <div className="absolute top-0 left-0 w-1 h-full bg-[#FF3B30]"></div>}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className={`font-grotesk font-bold text-[13px] tracking-[1px] transition-colors ${vessel.id === selectedVessel ? 'text-[#E5B5FF]' : 'text-white group-hover:text-[#00E3FD]'}`}>
                                {searchQuery && vessel.id.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                                  <span dangerouslySetInnerHTML={{
                                    __html: vessel.id.replace(
                                      new RegExp(`(${searchQuery})`, 'gi'),
                                      '<mark style="background: rgba(176,38,255,0.35); color: #E5B5FF; border-radius: 2px; padding: 0 1px;">$1</mark>'
                                    )
                                  }} />
                                ) : vessel.id}
                              </h3>
                              <p className="text-[9px] font-mono text-white/30 tracking-widest mt-0.5">{vessel.vesselName}</p>
                            </div>
                            <span className={`flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded-[3px] bg-black/40 ${vessel.reason ? 'border-[#FF3B30]/40 text-[#FF3B30]' : 'border-white/10 text-[#00E3FD]'}`}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: vessel.dotColor }}></span> {vessel.status}
                            </span>
                          </div>
                          {!vessel.reason ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between text-[10px] font-mono"><span className="text-white/40 uppercase tracking-widest">PACKAGE</span><span className="text-white/70 uppercase tracking-widest text-right">{vessel.package}</span></div>
                              <div className="flex justify-between text-[10px] font-mono"><span className="text-white/40 uppercase tracking-widest">CREW</span><span className="text-white/70 uppercase tracking-widest text-right">{vessel.crew}</span></div>
                              <div className="flex justify-between text-[10px] font-mono"><span className="text-white/40 uppercase tracking-widest">ROUTE</span><span className="text-[#00E3FD] tracking-widest text-right">{vessel.origin} → {vessel.dest}</span></div>
                            </div>
                          ) : (
                            <div className="flex text-[10px] font-mono gap-4 mt-2 justify-between">
                              <span className="text-white/40 uppercase tracking-widest">REASON</span>
                              <span className="text-[#FF3B30] tracking-widest text-right">{vessel.reason}</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Komponen Paginasi Sidebar */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center gap-2 mt-4 pt-4 border-t border-white/5 font-mono text-[10px] tracking-widest uppercase text-white/40 relative z-40 shrink-0">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="hover:text-[#E5B5FF] disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-not-allowed font-bold"
                  >
                    PREV
                  </button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(num => (
                      <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`px-2.5 py-1 rounded transition-colors text-[10px] font-mono ${
                          currentPage === num
                            ? "border border-[#B026FF] text-[#E5B5FF] bg-[#B026FF]/20 shadow-[0_0_10px_rgba(176,38,255,0.2)] font-bold"
                            : "hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {num.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="hover:text-[#E5B5FF] disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-not-allowed font-bold"
                  >
                    NEXT
                  </button>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(176, 38, 255, 0.5); }
        .custom-leaflet-tooltip {
          background: rgba(10, 10, 12, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(8px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          padding: 0 !important;
          border-radius: 8px !important;
        }
        .leaflet-tooltip-top:before, .leaflet-tooltip-bottom:before,
        .leaflet-tooltip-left:before, .leaflet-tooltip-right:before {
          display: none !important;
        }
      `}</style>
    </>
  );
}

export default function AdminMapPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white pb-6 flex flex-col">
      <AdminNavbar />
      {isLoading ? <MapSkeleton /> : <MapContent />}
    </div>
  );
}