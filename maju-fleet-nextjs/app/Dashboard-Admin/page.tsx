"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminNavbar from "@/components/adminnavbar";

function LogsSkeleton() {
  return (
    <main className="w-full max-w-[1400px] mx-auto px-6 md:px-10 flex-1 relative z-10 pb-20 pt-10 animate-pulse">
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-8">
        <div className="h-10 w-48 bg-white/10 rounded"></div>
        <div className="h-4 w-24 bg-white/10 rounded"></div>
      </div>
      <div className="flex border-b border-white/5 pb-4 mb-2">
        <div className="w-[15%]"><div className="h-3 w-16 bg-white/10 rounded"></div></div>
        <div className="w-[20%]"><div className="h-3 w-24 bg-white/10 rounded"></div></div>
        <div className="w-[30%]"><div className="h-3 w-32 bg-white/10 rounded"></div></div>
        <div className="w-[20%] flex justify-center"><div className="h-3 w-16 bg-white/10 rounded"></div></div>
        <div className="w-[15%] flex justify-end"><div className="h-3 w-16 bg-white/10 rounded"></div></div>
      </div>
      <div className="flex flex-col mt-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center border-b border-white/5 py-6 px-2 -mx-2">
            <div className="w-[15%]"><div className="h-4 w-16 bg-white/10 rounded"></div></div>
            <div className="w-[20%]"><div className="h-5 w-28 bg-white/20 rounded"></div></div>
            <div className="w-[30%]"><div className="h-4 w-48 bg-white/10 rounded"></div></div>
            <div className="w-[20%] flex justify-center"><div className="h-8 w-40 bg-white/5 rounded"></div></div>
            <div className="w-[15%] flex justify-end"><div className="h-8 w-24 bg-white/10 rounded-full"></div></div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function AdminLogsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const systemLogsData = [
    { timeArrival: "14:32:01", receiptNumber: "MJF-8821-X9", crewMessage: "Lorem ipsum wlwlwlwlw", routeOrigin: "IDTPP, Jakarta", routeDest: "NLRTM, Rotterdam", status: "COMPLETED" },
    { timeArrival: "14:31:45", receiptNumber: "MJF-8821-X6", crewMessage: "Lorem ipsum wlwlwlwlw", routeOrigin: "IDTPP, Jakarta", routeDest: "NLRTM, Rotterdam", status: "COMPLETED" },
    { timeArrival: "14:28:10", receiptNumber: "MJF-7732-X1", crewMessage: "Engine maintenance logged and cleared", routeOrigin: "IDTPP, Jakarta", routeDest: "NLRTM, Rotterdam", status: "COMPLETED" },
    { timeArrival: "14:20:05", receiptNumber: "MJF-6610-X2", crewMessage: "Weather clearance approved for departure", routeOrigin: "IDTPP, Jakarta", routeDest: "NLRTM, Rotterdam", status: "COMPLETED" },
    { timeArrival: "14:15:30", receiptNumber: "MJF-5509-X8", crewMessage: "Lorem ipsum wlwlwlwlw", routeOrigin: "IDTPP, Jakarta", routeDest: "NLRTM, Rotterdam", status: "COMPLETED" },
    { timeArrival: "14:10:12", receiptNumber: "MJF-4411-X3", crewMessage: "Cargo manifest verified by port authority", routeOrigin: "IDTPP, Jakarta", routeDest: "NLRTM, Rotterdam", status: "COMPLETED" },
  ];

  return (
    <div className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white pb-20 overflow-x-hidden flex flex-col">
      <AdminNavbar />

      {isLoading ? (
        <LogsSkeleton />
      ) : (
        <main className="w-full max-w-[1400px] mx-auto px-6 md:px-10 flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-20 pt-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-8">
              <h1 className="font-grotesk font-bold text-[32px] tracking-[2px] uppercase text-white">DELIVERY</h1>
              <span className="flex items-center gap-2 text-[#00E3FD] font-mono text-[10px] tracking-[2px] uppercase font-bold">
                <span className="w-2 h-2 rounded-full bg-[#00E3FD] animate-pulse"></span> LIVE STREAM
              </span>
            </div>

            <div className="w-full">
              <div className="flex border-b border-transparent pb-4 mb-2 text-[10px] font-mono text-white/40 uppercase tracking-[2px] px-2">
                <div className="w-[15%]">TIME ARRIVAL</div>
                <div className="w-[20%]">RECEIPT NUMBER</div>
                <div className="w-[30%]">CREW MESSAGE</div>
                <div className="w-[20%] text-center">ROUTE</div>
                <div className="w-[15%] text-right">STATUS</div>
              </div>

              <div className="flex flex-col">
                {systemLogsData.map((log, i) => (
                  <div key={i} className="flex items-center border-b border-white/5 py-6 group hover:bg-[#121317] px-2 -mx-2 rounded transition-colors">
                    <div className="w-[15%] text-[13px] font-mono text-white/60">{log.timeArrival}</div>
                    <div className="w-[20%] text-[14px] font-grotesk font-bold text-white tracking-[1px] uppercase">{log.receiptNumber}</div>
                    <div className="w-[30%] text-[13px] font-mono text-white/70 pr-4">{log.crewMessage}</div>
                    
                    <div className="w-[20%]">
                      <div className="flex flex-col w-[200px] mx-auto">
                        <div className="flex items-center w-full justify-between relative px-2">
                          <div className="absolute top-1/2 left-4 right-4 h-[1px] border-t-2 border-dashed border-white/20 -translate-y-1/2 z-0"></div>
                          <div className="relative z-10 bg-[#0a0a0c] group-hover:bg-[#121317] p-1 transition-colors">
                            <div className="w-3.5 h-3.5 rounded-full border-[2px] border-white/30 flex items-center justify-center"></div>
                          </div>
                          <div className="relative z-10 bg-[#0a0a0c] group-hover:bg-[#121317] p-1 transition-colors">
                            <div className="w-4 h-4 rounded-full border-[2px] border-[#B026FF] flex items-center justify-center shadow-[0_0_8px_rgba(176,38,255,0.4)]">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#B026FF]"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center w-full justify-between mt-2 text-[9px] font-mono text-white/50 tracking-wider">
                          <span>{log.routeOrigin}</span>
                          <span>{log.routeDest}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-[15%] flex justify-end">
                      <span className="inline-flex items-center justify-center gap-2 bg-[#00b894]/10 text-[#00b894] border border-[#00b894]/30 px-5 py-2 rounded-full text-[10px] tracking-widest uppercase font-bold shadow-[0_0_10px_rgba(0,184,148,0.1)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00b894]"></span> {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(176, 38, 255, 0.5); }
      `}</style>
    </div>
  );
}