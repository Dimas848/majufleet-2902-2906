"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, MapPin, Weight, Ruler, Calendar, ShieldCheck, Box, Send } from "lucide-react";
import UserNavbar from "@/components/usernavbar";

function BookShipmentSkeleton() {
  return (
    <main className="flex-1 py-10 px-6 md:px-10 relative overflow-hidden animate-pulse">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B026FF]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BDF4FF]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1000px] mx-auto relative z-10">
        <div className="mb-10 border-b border-white/5 pb-6">
          <div className="h-10 w-72 bg-white/10 rounded mb-4"></div>
          <div className="h-4 w-96 bg-white/5 rounded"></div>
        </div>

        <div className="bg-[#121317]/40 border border-white/5 rounded-xl p-6 md:p-10">
          <div className="mb-10">
            <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-14 bg-white/5 rounded"></div>
              <div className="h-14 bg-white/5 rounded"></div>
            </div>
          </div>

          <div className="mb-10">
            <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-14 bg-white/5 rounded"></div>
              <div className="h-14 bg-white/5 rounded"></div>
            </div>
          </div>

          <div className="mb-10">
            <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="h-14 bg-white/5 rounded"></div>
              <div className="h-14 bg-white/5 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 h-14 bg-white/5 rounded"></div>
              <div className="md:col-span-3 grid grid-cols-3 gap-4">
                <div className="h-14 bg-white/5 rounded"></div>
                <div className="h-14 bg-white/5 rounded"></div>
                <div className="h-14 bg-white/5 rounded"></div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end">
            <div className="h-12 w-48 bg-[#B026FF]/20 border border-[#B026FF]/30 rounded"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookShipmentPage() {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setSuccess(true);
    
    setTimeout(() => {
      setSuccess(false);
      (e.target as HTMLFormElement).reset();
      router.push("/dashboard/billing");
    }, 3000);
  };

  const inputClass = "w-full bg-[#121317] border border-white/10 rounded px-10 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors";
  const labelClass = "text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80";

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col relative overflow-x-hidden">
      
      <UserNavbar />

      {isPageLoading ? (
        <BookShipmentSkeleton />
      ) : (
        <main className="flex-1 py-10 px-6 md:px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B026FF]/5 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BDF4FF]/5 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-[1000px] mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-10 border-b border-white/5 pb-6">
                <h1 className="text-white font-grotesk font-bold text-3xl md:text-4xl tracking-[-1px] uppercase mb-2">
                  BOOK NEW <span className="text-[#B026FF]">SHIPMENT</span>
                </h1>
                <p className="text-white/50 font-inter text-[14px]">
                  Fill in your cargo details below to get scheduling and logistics fleet allocation.
                </p>
              </div>

              <form onSubmit={handleBooking} className="bg-[#121317]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-10 shadow-2xl">
                
                <div className="mb-10">
                  <h3 className="text-white flex items-center gap-2 font-grotesk text-[14px] uppercase tracking-[2px] mb-6 pb-2 border-b border-white/10">
                    <Box size={16} className="text-[#B026FF]" /> 1. Service Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Freight Service Plan</label>
                      <div className="relative">
                        <ShieldCheck size={16} className={iconClass} />
                        <select required defaultValue="" className={`${inputClass} pl-10 appearance-none`}>
                          <option value="" disabled>Select service plan...</option>
                          <option value="economy">Maju Economy (Cost-Optimized)</option>
                          <option value="standard">Maju Standard (Standard Container)</option>
                          <option value="heavy">Maju Heavy (Industrial Cargo)</option>
                          <option value="express">Maju Express (Time-Critical)</option>
                          <option value="vip">Maju VIP (Dedicated Care)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Preferred Shipping Date</label>
                      <div className="relative">
                        <Calendar size={16} className={iconClass} />
                        <input type="date" required className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-white flex items-center gap-2 font-grotesk text-[14px] uppercase tracking-[2px] mb-6 pb-2 border-b border-white/10">
                    <MapPin size={16} className="text-[#B026FF]" /> 2. Shipping Route
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Origin (Pickup Location/Port)</label>
                      <div className="relative">
                        <MapPin size={16} className={iconClass} />
                        <input type="text" required placeholder="e.g. Jakarta, Indonesia" className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Destination (Drop-off Location/Port)</label>
                      <div className="relative">
                        <MapPin size={16} className={`${iconClass} text-[#BDF4FF]`} />
                        <input type="text" required placeholder="e.g. Singapore Port" className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-white flex items-center gap-2 font-grotesk text-[14px] uppercase tracking-[2px] mb-6 pb-2 border-b border-white/10">
                    <Package size={16} className="text-[#B026FF]" /> 3. Cargo Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={labelClass}>Cargo Description</label>
                      <div className="relative">
                        <Package size={16} className={iconClass} />
                        <input type="text" required placeholder="What are you shipping?" className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Cargo Type</label>
                      <select required defaultValue="" className={`${inputClass} px-4 appearance-none`}>
                        <option value="" disabled>Select cargo category...</option>
                        <option value="general">General Goods (Dry)</option>
                        <option value="hazardous">Hazardous / Chemicals</option>
                        <option value="perishable">Perishable (Needs Cold Storage)</option>
                        <option value="fragile">Fragile / Electronics</option>
                        <option value="oversized">Oversized Machinery</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <label className={labelClass}>Total Weight</label>
                      <div className="relative">
                        <Weight size={16} className={iconClass} />
                        <input type="number" min="0.1" step="0.1" required placeholder="0.0" className={`${inputClass} pl-10 pr-20`} />
                        <div className="absolute right-1 top-1 bottom-1 flex items-center">
                          <select className="h-full bg-[#1a1b20] border-l border-white/10 rounded-r px-3 text-white/80 font-inter text-[11px] uppercase tracking-wider focus:outline-none cursor-pointer">
                            <option value="tons">Tons</option>
                            <option value="kg">KG</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Length (m)</label>
                        <div className="relative">
                          <Ruler size={16} className={iconClass} />
                          <input type="number" min="0.1" step="0.1" required placeholder="L" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Width (m)</label>
                        <div className="relative">
                          <Ruler size={16} className={iconClass} />
                          <input type="number" min="0.1" step="0.1" required placeholder="W" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Height (m)</label>
                        <div className="relative">
                          <Ruler size={16} className={iconClass} />
                          <input type="number" min="0.1" step="0.1" required placeholder="H" className={`${inputClass} pl-10`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full md:w-auto px-10 py-4 rounded bg-[#B026FF] hover:bg-[#9a1ce6] text-white font-grotesk font-bold text-[14px] uppercase tracking-[2px] transition-all duration-300 flex items-center justify-center gap-3 ml-auto"
                    style={{
                      boxShadow: success ? "0 0 20px rgba(16,185,129,0.3)" : "0 0 20px rgba(176,38,255,0.3)",
                      background: success ? "#10B981" : loading ? "#7a1aaa" : "linear-gradient(90deg, #B026FF, #4E0078)",
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">Processing Booking...</span>
                    ) : success ? (
                      <span className="flex items-center gap-2">Booking Confirmed!</span>
                    ) : (
                      <span className="flex items-center gap-2">Submit Request <Send size={16} /></span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </main>
      )}
    </div>
  );
}