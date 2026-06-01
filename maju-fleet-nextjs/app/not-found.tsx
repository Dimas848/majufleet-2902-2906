// File: app/not-found.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  // Mengubah nama/judul web secara aman di tab browser saat halaman 404 terbuka
  useEffect(() => {
    document.title = "404 Page Not Found | Maju Fleet";
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative px-6 font-inter overflow-hidden text-white selection:bg-[#B026FF]">
      
      {/* 🔥 TRICK JITU: Menyembunyikan Navbar & Footer global tanpa ubah susunan folder */}
      <style>{`
        nav, footer {
          display: none !important;
        }
      `}</style>

      {/* Background Glow Efek Cyber */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full blur-[140px] bg-red-500/5"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] bg-[#0c0c0e]/95 border border-white/5 rounded-xl p-8 relative z-10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col items-center text-center"
      >
        {/* Garis Glow Sudut */}
        <div className="absolute bottom-0 right-0 w-[60px] h-[2px] bg-gradient-to-r from-transparent to-red-500 shadow-[0_0_10px_#ef4444]" />
        <div className="absolute bottom-0 right-0 w-[2px] h-[60px] bg-gradient-to-b from-transparent to-red-500 shadow-[0_0_10px_#ef4444]" />

        <ShieldAlert size={56} className="text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse" />
        
        <h1 className="font-mono font-bold text-[72px] leading-none tracking-tighter text-red-500/80 mb-2">
          404
        </h1>
        
        <h2 className="font-grotesk font-bold text-[16px] tracking-[3px] uppercase mb-3 text-white/90">
            ERROR: PAGE NOT FOUND
        </h2>
        
        <p className="text-white/40 text-xs font-mono tracking-wide mb-8 uppercase max-w-[300px]">
          Page does not exist or has been restricted.
        </p>

        <Link 
          href="/"
          className="w-full py-3 rounded-[4px] bg-[#0a0a0c] border border-white/10 text-white font-grotesk font-bold text-[12px] uppercase tracking-[2px] hover:border-red-500 hover:text-red-400 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} /> Return to Main Gateway
        </Link>
      </motion.div>
    </main>
  );
}