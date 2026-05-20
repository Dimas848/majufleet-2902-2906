"use client";

import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[1800px] mx-auto flex-1 mt-6 animate-pulse">
      
      {/* Skeleton Top Row: 4 Metric Cards (Mirip Admin Fleet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="bg-[#121317]/50 border border-white/5 p-5 flex flex-col justify-between h-[100px] rounded-r-lg"
          >
            {/* Judul Kartu */}
            <div className="h-2 w-24 bg-white/10 rounded mb-2"></div>
            {/* Angka Utama */}
            <div className="flex items-baseline gap-3 mt-auto">
              <div className="h-8 w-16 bg-white/20 rounded"></div>
              <div className="h-3 w-12 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Filter / Menu Row */}
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 w-48 bg-white/10 rounded"></div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-white/10 rounded"></div>
          <div className="h-8 w-16 bg-white/10 rounded"></div>
          <div className="h-8 w-16 bg-white/10 rounded"></div>
        </div>
      </div>

      {/* Skeleton Main Area (Bisa merepresentasikan Chart atau Tabel) */}
      <div className="w-full bg-[#121317]/30 border border-white/5 rounded-xl p-6 flex flex-col gap-6 h-[400px]">
        {/* Header Tabel/Chart */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="h-4 w-32 bg-white/10 rounded"></div>
          <div className="flex gap-3">
            <div className="h-8 w-32 bg-white/5 rounded"></div>
            <div className="h-8 w-32 bg-white/5 rounded"></div>
          </div>
        </div>

        {/* Baris Tabel/List */}
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                <div>
                  <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
                  <div className="h-2 w-20 bg-white/10 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-24 bg-white/10 rounded"></div>
              <div className="h-4 w-32 bg-white/10 rounded"></div>
              <div className="h-6 w-24 bg-white/10 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}