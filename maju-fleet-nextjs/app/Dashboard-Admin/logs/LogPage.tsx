"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, User, Shield, Anchor } from "lucide-react";
import { useSearchParams } from "next/navigation";
import AdminNavbar from "@/components/adminnavbar";

import { getSystemAccessLogs } from "@/app/lib/actions";

function AccessLogsSkeleton() {
  return (
    <main className="w-full max-w-[1400px] mx-auto px-6 md:px-10 flex-1 relative z-10 pb-20 pt-10 animate-pulse">
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-8">
        <div className="h-10 w-64 bg-white/10 rounded"></div>
        <div className="h-4 w-24 bg-white/10 rounded"></div>
      </div>
      <div className="flex border-b border-white/5 pb-4 mb-2">
        <div className="w-[20%]"><div className="h-3 w-16 bg-white/10 rounded"></div></div>
        <div className="w-[35%]"><div className="h-3 w-24 bg-white/10 rounded"></div></div>
        <div className="w-[25%]"><div className="h-3 w-20 bg-white/10 rounded"></div></div>
        <div className="w-[20%] flex justify-end"><div className="h-3 w-16 bg-white/10 rounded"></div></div>
      </div>
      <div className="flex flex-col mt-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center border-b border-white/5 py-6 px-2 -mx-2">
            <div className="w-[20%]"><div className="h-4 w-20 bg-white/10 rounded"></div></div>
            <div className="w-[35%]"><div className="h-5 w-32 bg-white/20 rounded mb-2"></div><div className="h-3 w-24 bg-white/10 rounded"></div></div>
            <div className="w-[25%]"><div className="h-6 w-24 bg-white/10 rounded-full"></div></div>
            <div className="w-[20%] flex justify-end"><div className="h-8 w-24 bg-white/10 rounded-full"></div></div>
          </div>
        ))}
      </div>
    </main>
  );
}

function AdminLogsContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [systemLogsData, setSystemLogsData] = useState<any[]>([]);

  const roleFilter = searchParams.get("role");

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      try {
        const result = await getSystemAccessLogs();
        if (result.success) {
          let filteredLogs = result.logs;

          // LOGIKA FILTER MEGA MENU
          if (roleFilter === "admin") {
            filteredLogs = filteredLogs.filter(
              (log: any) => log.role.toLowerCase() === "administrator" || log.role.toLowerCase() === "captain"
            );
          } else if (roleFilter === "customer") {
            filteredLogs = filteredLogs.filter(
              (log: any) => log.role.toLowerCase() === "customer"
            );
          } // Jika roleFilter === "all" atau null, maka otomatis menampilkan SEMUA data tanpa difilter

          const formattedData = filteredLogs.map((log: any) => {
            const dateObj = new Date(log.createdAt);
            return {
              id: log.id,
              time: dateObj.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              date: dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
              name: log.name,
              email: log.email,
              role: log.role,
              status: log.status
            };
          });
          setSystemLogsData(formattedData);
        }
      } catch (error) {
        console.error("Gagal menarik log sistem", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLogs();
  }, [roleFilter]);

  const getRoleBadge = (role: string) => {
    switch(role.toLowerCase()) {
      case "administrator":
        return <span className="flex items-center gap-1.5 bg-[#B026FF]/10 text-[#E5B5FF] border border-[#B026FF]/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest w-max"><Shield size={12}/> Admin</span>;
      case "captain":
        return <span className="flex items-center gap-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest w-max"><Anchor size={12}/> Captain</span>;
      case "customer":
        return <span className="flex items-center gap-1.5 bg-[#00E3FD]/10 text-[#00E3FD] border border-[#00E3FD]/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest w-max"><User size={12}/> Customer</span>;
      default:
        return <span className="flex items-center gap-1.5 bg-white/5 text-white/50 border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest w-max"><User size={12}/> {role}</span>;
    }
  };

  const getPageTitle = () => {
    if (roleFilter === "admin") return "ADMIN ACCESS LOGS";
    if (roleFilter === "customer") return "CUSTOMER ACCESS LOGS";
    return "SYSTEM ACCESS LOGS (FULL OVERVIEW)";
  };

  return (
    isLoading ? (
      <AccessLogsSkeleton />
    ) : (
      <main className="w-full max-w-[1400px] mx-auto px-6 md:px-10 flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-20 pt-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-8">
            <div>
              <h1 className="font-grotesk font-bold text-[32px] tracking-[2px] uppercase text-white mb-2">{getPageTitle()}</h1>
              <p className="text-white/40 font-mono text-[12px] tracking-widest uppercase">Monitoring Authentication & Security Events</p>
            </div>
            <span className="flex items-center gap-2 text-[#00E3FD] font-mono text-[10px] tracking-[2px] uppercase font-bold bg-[#00E3FD]/5 px-4 py-2 rounded-full border border-[#00E3FD]/20">
              <span className="w-2 h-2 rounded-full bg-[#00E3FD] animate-pulse shadow-[0_0_8px_#00E3FD]"></span> SECURE CONNECTION
            </span>
          </div>

          <div className="w-full">
            {/* TABLE HEADER */}
            <div className="flex border-b border-transparent pb-4 mb-2 text-[10px] font-mono text-white/40 uppercase tracking-[2px] px-2">
              <div className="w-[20%]">TIME & DATE</div>
              <div className="w-[35%]">USER IDENTITY</div>
              <div className="w-[25%]">ACCESS LEVEL</div>
              <div className="w-[20%] text-right">AUTH STATUS</div>
            </div>

            {/* TABLE BODY */}
            <div className="flex flex-col">
              {systemLogsData.length > 0 ? systemLogsData.map((log) => (
                <div key={log.id} className="flex items-center border-b border-white/5 py-5 group hover:bg-[#121317] px-2 -mx-2 rounded transition-colors">
                  
                  {/* TIME */}
                  <div className="w-[20%] flex flex-col gap-1">
                    <span className="text-[14px] font-mono text-white/80">{log.time}</span>
                    <span className="text-[10px] font-mono text-white/30">{log.date}</span>
                  </div>

                  {/* USER IDENTITY */}
                  <div className="w-[35%] flex flex-col gap-1 pr-4">
                    <span className={`text-[15px] font-grotesk font-bold tracking-[1px] uppercase ${log.status.includes("FAILED") ? "text-[#FF3B30]" : "text-white"}`}>
                      {log.name}
                    </span>
                    <span className="text-[12px] font-mono text-white/40">{log.email}</span>
                  </div>
                  
                  {/* ROLE */}
                  <div className="w-[25%]">
                    {getRoleBadge(log.role)}
                  </div>

                  {/* STATUS */}
                  <div className="w-[20%] flex justify-end">
                    {log.status === "SUCCESS" ? (
                      <span className="inline-flex items-center justify-center gap-2 text-[#34C759] text-[11px] tracking-widest uppercase font-bold bg-[#34C759]/10 px-4 py-2 rounded border border-[#34C759]/20">
                        <ShieldCheck size={14} /> GRANTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 text-[#FF3B30] text-[11px] tracking-widest uppercase font-bold bg-[#FF3B30]/10 px-4 py-2 rounded border border-[#FF3B30]/20">
                        <ShieldAlert size={14} /> DENIED
                      </span>
                    )}
                  </div>

                </div>
              )) : (
                <div className="text-center py-20 text-white/40 font-mono text-sm tracking-widest uppercase">
                  NO LOGS FOUND FOR THIS CATEGORY IN DATABASE
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    )
  );
}

export default function AdminLogsPage() {
  return (
    <div className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white pb-20 overflow-x-hidden flex flex-col">
      <AdminNavbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white/50">Loading Secure Audit Stream...</div>}>
        <AdminLogsContent />
      </Suspense>
      
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