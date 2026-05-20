"use client";

import React, { useState, useRef, useEffect } from "react";
import { Settings, ChevronDown, Filter, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminNavbar from "@/components/adminnavbar";

interface MapViewerProps {
  vessels: any[];
  selectedVessel: string | null;
  setSelectedVessel: React.Dispatch<React.SetStateAction<string | null>>;
}

const MapViewer = dynamic<MapViewerProps>(() => import("../../../components/MapViewerComponent"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#121317]/40 rounded-[32px] animate-pulse flex items-center justify-center text-white/50 font-mono text-sm tracking-widest border border-white/5">INITIALIZING SATELLITE LINK...</div>
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

function MapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedVessel, setSelectedVessel] = useState<string | null>("EVER BLUE");
  const [mapSubTab, setMapSubTab] = useState<"ALL" | "ALERTS">("ALL");
  const [mapStatusFilter, setMapStatusFilter] = useState("ALL");
  const [isSidebarFilterOpen, setIsSidebarFilterOpen] = useState(false);
  
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCrew, setEditCrew] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [isEditStatusDropdownOpen, setIsEditStatusDropdownOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "ALERTS") setMapSubTab("ALERTS");
    else setMapSubTab("ALL");
  }, [searchParams]);

  const handleTabChange = (tab: "ALL" | "ALERTS") => {
    setMapSubTab(tab);
    router.push(`/Dashboard-Admin/map?tab=${tab}`);
  };

  const [vesselsData, setVesselsData] = useState([
    { id: "EVER BLUE", package: "MAJU STANDARD", crew: "CHRIS", status: "EN ROUTE", statusColor: "text-[#00E3FD]", dotColor: "#00E3FD", lat: 25.0, lng: -45.0, origin: "Rotterdam (NLD)", dest: "New York (USA)", eta: "2026-04-18 09:00", speed: "18.5 knots" },
    { id: "EVER BULK", package: "MAJU HEAVY", crew: "DIMZZ", status: "ARRIVED", statusColor: "text-[#00E3FD]", dotColor: "#00E3FD", lat: -6.1, lng: 106.8, origin: "Jakarta (IDN)", dest: "Sydney (AUS)", eta: "2026-04-10 10:20", speed: "0 knots (Docked)" },
    { id: "EVER GLOW", package: "MAJU EXPRESS", crew: "JUWW", status: "NOT DEPARTED YET", statusColor: "text-[#FF3B30]", dotColor: "#FF3B30", reason: "Critical Engine Failure", lat: 31.2, lng: 121.4, origin: "Shanghai (CHN)", dest: "Busan (KOR)", eta: "TBD", speed: "0 knots" },
    { id: "EVER PIONEER", package: "MAJU VIP", crew: "RIZZ", status: "DELAYED", statusColor: "text-[#FF3B30]", dotColor: "#FF3B30", reason: "Weather Delay: Cyclone Alpha", lat: 35.6, lng: 139.7, origin: "Tokyo (JPN)", dest: "Seattle (USA)", eta: "2026-04-20 14:00", speed: "0 knots (Anchored)" },
  ]);

  const activeVesselDetails = vesselsData.find(v => v.id === selectedVessel);

  const displayedVessels = vesselsData.filter(v => {
    const passesTab = mapSubTab === "ALL" ? true : (v.status === "DELAYED" || v.status === "NOT DEPARTED YET");
    const passesStatus = mapStatusFilter === "ALL" ? true : v.status === mapStatusFilter;
    return passesTab && passesStatus;
  });

  const openControlModal = () => {
    if (activeVesselDetails) {
      setEditName(activeVesselDetails.id);
      setEditCrew(activeVesselDetails.crew);
      setEditStatus(activeVesselDetails.status);
      setIsControlModalOpen(true);
    }
  };

  const saveManualControl = () => {
    setVesselsData(prev => prev.map(v => {
      if (v.id === selectedVessel) {
        let newStatusColor = v.statusColor;
        let newDotColor = v.dotColor;
        let newReason = v.reason;

        if (editStatus === "EN ROUTE" || editStatus === "ARRIVED") {
          newStatusColor = "text-[#00E3FD]";
          newDotColor = "#00E3FD";
          newReason = undefined; 
        } else if (editStatus === "DELAYED" || editStatus === "NOT DEPARTED YET") {
          newStatusColor = "text-[#FF3B30]";
          newDotColor = "#FF3B30";
          if (!newReason) newReason = "Manual Override Logged";
        }
        return { ...v, id: editName, crew: editCrew, status: editStatus, statusColor: newStatusColor, dotColor: newDotColor, reason: newReason };
      }
      return v;
    }));
    setSelectedVessel(editName);
    setIsControlModalOpen(false);
  };

  return (
    <>
      <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[1800px] mx-auto flex-1 mt-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex gap-8 h-[750px]">
            
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

            <div className="w-[420px] bg-transparent flex flex-col h-full">
              <div className="flex justify-between items-center mb-6 mt-4 relative z-[60]">
                <h2 className="font-grotesk font-bold text-[20px] uppercase tracking-[1px] text-white">VESSEL MONITOR</h2>
                <div className="relative">
                  <Filter size={18} onClick={() => setIsSidebarFilterOpen(!isSidebarFilterOpen)} className={`cursor-pointer transition-colors ${mapStatusFilter !== "ALL" ? "text-[#B026FF]" : "text-white/60 hover:text-[#E5B5FF]"}`} />
                  <AnimatePresence>
                    {isSidebarFilterOpen && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-3 w-[180px] bg-[#121317] border border-white/10 rounded-lg shadow-2xl z-[100] overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-white/5 text-[9px] font-mono text-white/40 uppercase tracking-widest bg-[#0a0a0c]">Filter by Status</div>
                        {["ALL", "EN ROUTE", "ARRIVED", "DELAYED", "NOT DEPARTED YET"].map(opt => (
                          <div key={opt} onClick={() => {setMapStatusFilter(opt); setIsSidebarFilterOpen(false);}} className={`px-4 py-3 text-[10px] font-mono cursor-pointer uppercase tracking-widest transition-colors ${mapStatusFilter === opt ? 'text-[#E5B5FF] bg-[#B026FF]/20 font-bold' : 'text-white/60 hover:text-[#E5B5FF] hover:bg-[#B026FF]/10'}`}>{opt}</div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4 relative z-40">
                <button onClick={() => handleTabChange("ALL")} className={`px-4 py-1.5 rounded-[4px] text-[10px] font-mono tracking-widest font-bold transition-all ${mapSubTab === "ALL" ? "bg-[#B026FF] text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]" : "bg-white/5 text-white/40 hover:text-white"}`}>ALL</button>
                <button onClick={() => handleTabChange("ALERTS")} className={`px-4 py-1.5 rounded-[4px] text-[10px] font-mono tracking-widest font-bold transition-all ${mapSubTab === "ALERTS" ? "bg-[#B026FF] text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]" : "bg-white/5 text-white/40 hover:text-white"}`}>ALERTS</button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar relative z-30">
                <AnimatePresence mode="popLayout">
                  {displayedVessels.map((vessel, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }} key={vessel.id} onClick={() => setSelectedVessel(vessel.id)} className={`bg-transparent border rounded p-5 relative overflow-hidden group transition-all cursor-pointer ${vessel.id === selectedVessel ? 'border-[#B026FF] bg-[#1a1b22] shadow-[0_0_15px_rgba(176,38,255,0.1)]' : vessel.reason ? 'border-[#FF3B30]/30 hover:border-[#FF3B30]/50 hover:bg-[#1a1b22]' : 'border-white/10 hover:border-[#00E3FD]/50 hover:bg-[#1a1b22]'}`}>
                      {vessel.reason && <div className="absolute top-0 left-0 w-1 h-full bg-[#FF3B30]"></div>}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={`font-grotesk font-bold text-[15px] tracking-[1px] transition-colors ${vessel.id === selectedVessel ? 'text-[#E5B5FF]' : 'text-white group-hover:text-[#00E3FD]'}`}>{vessel.id}</h3>
                        <span className={`flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded-[3px] bg-black/40 ${vessel.reason ? 'border-[#FF3B30]/40 text-[#FF3B30]' : 'border-white/10 text-[#00E3FD]'}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: vessel.dotColor }}></span> {vessel.status}
                        </span>
                      </div>
                      {!vessel.reason ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-[10px] font-mono"><span className="text-white/40 uppercase tracking-widest">PACKAGE TYPE</span><span className="text-white/70 uppercase tracking-widest text-right">{vessel.package}</span></div>
                          <div className="flex justify-between text-[10px] font-mono"><span className="text-white/40 uppercase tracking-widest">CREW</span><span className="text-white/70 uppercase tracking-widest text-right">{vessel.crew}</span></div>
                        </div>
                      ) : (
                        <div className="flex text-[10px] font-mono gap-4 mt-2 justify-between"><span className="text-white/40 uppercase tracking-widest">REASON</span><span className="text-[#FF3B30] tracking-widest text-right">{vessel.reason}</span></div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-6 pt-4">
                <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase mb-3">ACTION CONTROL</p>
                <button onClick={openControlModal} className="w-full flex justify-center items-center gap-3 bg-transparent border border-[#FF3B30]/50 text-[#FF3B30] hover:bg-[#FF3B30]/10 py-4 rounded font-grotesk font-bold text-[12px] tracking-[2px] uppercase transition-all shadow-[0_0_15px_rgba(255,59,48,0.15)]">
                  <AlertTriangle size={16} /> CONTROL MANUALLY
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {isControlModalOpen && activeVesselDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsControlModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#0a0a0c] border border-[#B026FF]/50 rounded-xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(176,38,255,0.15)] z-10">
              <h2 className="text-white font-grotesk font-bold text-xl tracking-[2px] uppercase mb-6 flex items-center gap-3"><Settings className="text-[#B026FF]" size={20} /> Manual Control Override</h2>
              <div className="flex flex-col gap-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-mono text-white/50 tracking-widest uppercase mb-1.5 block">Vessel Name</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-[#121317] border border-white/20 rounded p-3 text-sm font-bold text-white focus:border-[#B026FF] outline-none transition-colors" /></div>
                  <div><label className="text-[10px] font-mono text-white/50 tracking-widest uppercase mb-1.5 block">Crew Leader</label><input type="text" value={editCrew} onChange={(e) => setEditCrew(e.target.value)} className="w-full bg-[#121317] border border-white/20 rounded p-3 text-sm font-bold text-white focus:border-[#B026FF] outline-none transition-colors" /></div>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-mono text-white/50 tracking-widest uppercase mb-1.5 block">Status Override</label>
                  <div onClick={() => setIsEditStatusDropdownOpen(!isEditStatusDropdownOpen)} className="w-full bg-[#121317] border border-white/20 rounded p-3 text-sm font-bold text-white cursor-pointer flex justify-between items-center hover:border-[#B026FF] transition-colors">{editStatus} <ChevronDown size={16} className="text-white/50" /></div>
                  <AnimatePresence>
                    {isEditStatusDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full left-0 right-0 mt-1 bg-[#1a1b22] border border-white/20 rounded-md shadow-xl z-[150] overflow-hidden">
                        {["EN ROUTE", "ARRIVED", "DELAYED", "NOT DEPARTED YET"].map(s => (<div key={s} onClick={() => {setEditStatus(s); setIsEditStatusDropdownOpen(false);}} className="p-3 text-sm font-bold text-white hover:bg-[#B026FF]/20 cursor-pointer transition-colors">{s}</div>))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="w-full h-px bg-white/10 my-2"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1.5 block">Package Type</label><input type="text" value={activeVesselDetails.package} disabled className="w-full bg-white/5 border border-white/5 rounded p-2.5 text-xs font-mono text-white/30 cursor-not-allowed" /></div>
                  <div><label className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1.5 block">Current Speed</label><input type="text" value={activeVesselDetails.speed} disabled className="w-full bg-white/5 border border-white/5 rounded p-2.5 text-xs font-mono text-white/30 cursor-not-allowed" /></div>
                  <div><label className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1.5 block">Origin</label><input type="text" value={activeVesselDetails.origin} disabled className="w-full bg-white/5 border border-white/5 rounded p-2.5 text-xs font-mono text-white/30 cursor-not-allowed" /></div>
                  <div><label className="text-[10px] font-mono text-white/30 tracking-widest uppercase mb-1.5 block">Destination</label><input type="text" value={activeVesselDetails.dest} disabled className="w-full bg-white/5 border border-white/5 rounded p-2.5 text-xs font-mono text-white/30 cursor-not-allowed" /></div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsControlModalOpen(false)} className="flex-1 py-3 border border-white/10 rounded-md text-white/60 hover:text-white hover:bg-white/5 font-grotesk text-[12px] uppercase tracking-[1px] transition-colors">Cancel</button>
                <button onClick={saveManualControl} className="flex-1 py-3 bg-[#B026FF]/20 border border-[#B026FF]/50 text-[#E5B5FF] rounded-md hover:bg-[#B026FF] hover:text-white font-grotesk text-[12px] font-bold uppercase tracking-[1px] transition-colors shadow-[0_0_15px_rgba(176,38,255,0.2)]">Apply Override</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AdminMapPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white pb-6 flex flex-col">
      <AdminNavbar />
      {isLoading ? <MapSkeleton /> : <MapContent />}
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
        .leaflet-tooltip-top:before, .leaflet-tooltip-bottom:before, .leaflet-tooltip-left:before, .leaflet-tooltip-right:before {
          display: none !important;
        }
      `}</style>
    </div>
  );
}