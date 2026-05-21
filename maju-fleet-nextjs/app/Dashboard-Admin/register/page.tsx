"use client";

import React, { useState, useEffect } from "react";
import { Hash, Users, MapPin, Package, RefreshCw, Briefcase, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import AdminNavbar from "@/components/adminnavbar";

function RegisterSkeleton() {
  return (
    <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[900px] mx-auto pb-10 mt-6 animate-pulse">
      <div className="mb-10">
        <div className="h-10 w-[350px] bg-white/10 rounded mb-2"></div>
        <div className="h-1 w-[350px] bg-[#B026FF]/30 rounded"></div>
      </div>
      <div className="flex flex-col gap-10">
        <div>
          <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
          <div className="flex gap-6 items-end">
            <div className="flex-1 h-12 bg-white/5 border-b border-white/10 rounded-t"></div>
            <div className="w-40 h-12 bg-white/10 rounded"></div>
          </div>
        </div>
        <div>
          <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8">
            <div className="col-span-2 h-12 bg-white/5 border-b border-white/10 rounded-t"></div>
            <div className="h-12 bg-white/5 border-b border-white/10 rounded-t"></div>
            <div className="h-12 bg-white/5 border-b border-white/10 rounded-t"></div>
          </div>
        </div>
        <div className="h-14 w-full bg-white/10 rounded-md mt-4"></div>
      </div>
    </main>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const [regType, setRegType] = useState<"fleet" | "crew">("fleet");
  const [trackingCode, setTrackingCode] = useState("");
  const [crewCode, setCrewCode] = useState("");

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "crew") {
      setRegType("crew");
    } else {
      setRegType("fleet");
    }
  }, [searchParams]);

  const generateTracking = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setTrackingCode(`MJF - ${randomNum}`);
  };

  const generateCrewCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setCrewCode(`CRW - ${randomNum}`);
  };

  return (
    <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[900px] mx-auto pb-10 mt-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-transparent pb-4">
        
        <div className="mb-10">
          <h1 className="font-grotesk font-bold text-[36px] md:text-[42px] tracking-[2px] uppercase text-white border-b-4 border-[#B026FF] pb-2 inline-block">
            {regType === "fleet" ? "FLEET REGISTRATION" : "CREW REGISTRATION"}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {regType === "fleet" ? (
            <motion.div 
              key="fleet-form"
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }} 
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10">
                <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                  <Hash size={20} /> TRACKING NUMBER
                </h2>
                <div className="flex gap-6 items-end">
                  <div className="flex-1">
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">TRACKING CODE</label>
                    <input type="text" readOnly value={trackingCode} placeholder="MJF - XXXX" className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <button onClick={generateTracking} className="px-6 py-3 border border-white/10 rounded text-white/60 text-[12px] font-bold tracking-[2px] uppercase hover:text-white hover:border-white/50 transition-colors flex items-center gap-2">
                    <RefreshCw size={16} /> GENERATE NEW
                  </button>
                </div>
              </div>

              <div className="mb-10">
                <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                  <Users size={20} /> CREW INFORMATION
                </h2>
                <div className="w-full sm:w-[60%] pr-0">
                  <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ASSIGNED CAPTAIN</label>
                  <input type="text" placeholder="Enter captain's name..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                </div>
              </div>

              <div className="mb-10">
                <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                  <MapPin size={20} /> SENDER INFORMATION
                </h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">NAME</label>
                    <input type="text" placeholder="Enter name..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CONTACT</label>
                    <input type="text" placeholder="Phone number..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ORIGIN ADDRESS</label>
                    <input type="text" placeholder="Full address..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">COUNTRY</label>
                    <input type="text" placeholder="Country Origin..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">PROVINCE / CITY</label>
                    <input type="text" placeholder="Province / City Origin..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                  <MapPin size={20} /> RECIPIENT INFORMATION
                </h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">NAME</label>
                    <input type="text" placeholder="Enter name..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CONTACT</label>
                    <input type="text" placeholder="Phone number..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">DESTINATION ADDRESS</label>
                    <input type="text" placeholder="Full address..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">COUNTRY</label>
                    <input type="text" placeholder="Country Destination..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">PROVINCE / CITY</label>
                    <input type="text" placeholder="Province / City Destination..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                  <Package size={20} /> CARGO DETAILS
                </h2>
                <div className="grid grid-cols-3 gap-x-8 gap-y-8">
                  <div className="col-span-3">
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ITEM DESCRIPTION</label>
                    <input type="text" placeholder="Cargo type..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">WEIGHT (KG)</label>
                    <input type="text" placeholder="0.00" className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">DIMENSIONS (CBM)</label>
                    <input type="text" placeholder="0.00" className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CATEGORY</label>
                    <div className="relative mt-1">
                      <select className="w-full bg-[#1a1b22] border-none rounded py-3 px-5 text-[16px] text-white/60 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF] transition-all cursor-pointer">
                        <option value="" disabled selected hidden>Select category...</option>
                        <option value="electronics" className="bg-[#121317]">Electronics</option>
                        <option value="clothing" className="bg-[#121317]">Clothing</option>
                        <option value="food" className="bg-[#121317]">Food & Beverage</option>
                        <option value="heavy" className="bg-[#121317]">Heavy Machinery</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 mt-4 rounded-md font-grotesk font-bold text-[16px] text-white tracking-[3px] uppercase bg-gradient-to-r from-[#B026FF] to-[#a2d2ff] hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(176,38,255,0.2)]">
                CREATE DELIVERY
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="crew-form"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10">
                <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                  <Hash size={20} /> CREW IDENTIFICATION
                </h2>
                <div className="flex gap-6 items-end">
                  <div className="flex-1">
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CREW ID</label>
                    <input type="text" readOnly value={crewCode} placeholder="CRW - XXXX" className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <button onClick={generateCrewCode} className="px-6 py-3 border border-white/10 rounded text-white/60 text-[12px] font-bold tracking-[2px] uppercase hover:text-white hover:border-white/50 transition-colors flex items-center gap-2">
                    <RefreshCw size={16} /> GENERATE ID
                  </button>
                </div>
              </div>

              <div className="mb-10">
                <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                  <Users size={20} /> PERSONAL DETAILS
                </h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                  <div className="col-span-2">
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">FULL NAME</label>
                    <input type="text" placeholder="Enter full name..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">GENDER</label>
                    <div className="relative mt-1">
                      <select className="w-full bg-[#1a1b22] border-none rounded py-3 px-5 text-[16px] text-white/60 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF] transition-all cursor-pointer">
                        <option value="" disabled selected hidden>Select gender...</option>
                        <option value="male" className="bg-[#121317]">Male</option>
                        <option value="female" className="bg-[#121317]">Female</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">AGE</label>
                    <input type="number" placeholder="Enter age..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                  <Briefcase size={20} /> PROFESSIONAL DETAILS
                </h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">SPECIALIST</label>
                    <div className="relative mt-1">
                      <select className="w-full bg-[#1a1b22] border-none rounded py-3 px-5 text-[16px] text-white/60 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF] transition-all cursor-pointer">
                        <option value="" disabled selected hidden>Select role...</option>
                        <option value="captain" className="bg-[#121317]">Captain</option>
                        <option value="navigator" className="bg-[#121317]">Navigator</option>
                        <option value="chief_engineer" className="bg-[#121317]">Chief Engineer</option>
                        <option value="deck_officer" className="bg-[#121317]">Deck Officer</option>
                        <option value="communications" className="bg-[#121317]">Communications Officer</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ORIGIN CITY / COUNTRY</label>
                    <input type="text" placeholder="City, Country..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CONTACT NUMBER</label>
                    <input type="text" placeholder="Phone number..." className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white placeholder:text-white/30 focus:border-[#B026FF] outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <button className="w-full py-4 mt-4 rounded-md font-grotesk font-bold text-[16px] text-white tracking-[3px] uppercase bg-gradient-to-r from-[#B026FF] to-[#a2d2ff] hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(176,38,255,0.2)]">
                REGISTER CREW
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

export default function AdminRegisterPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white pb-10 flex flex-col">
      <AdminNavbar />
      {isLoading ? (
        <RegisterSkeleton />
      ) : (
        <RegisterContent />
      )}
    </div>
  );
}