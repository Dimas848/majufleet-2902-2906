"use client";

import { FadeUp } from "@/components/FadeUp";
import { Ship, Package, ShieldCheck, Zap, UserCheck } from "lucide-react";
import Link from "next/link";

const services = [
  {
    title: "Maju Economy",
    desc: "Cost-optimized solution for non-urgent bulk shipments. Features schedule-based optimized routing.",
    icon: <Ship className="text-[#B026FF]" size={32} />,
    accent: "purple",
  },
  {
    title: "Maju Standard",
    desc: "End-to-end container logistics. Integrated with our global satellite tracking for full route transparency.",
    icon: <Package className="text-[#BDF4FF]" size={32} /> ,
    accent: "cyan",
  },
  {
    title: "Maju Heavy",
    desc: "Specialized heavy-duty logistics for industrial machinery. Secure handling with 24/7 command supervision.",
    icon: <ShieldCheck className="text-[#B026FF]" size={32} />,
    accent: "purple",
  },
  {
    title: "Maju Express",
    desc: "Priority freight options for time-critical shipments. Guaranteed minimum transit time.",
    icon: <Zap className="text-[#BDF4FF]" size={32} />,
    accent: "cyan",
  },
  {
    title: "Maju VIP",
    desc: "Dedicated logistics coordination. Access to priority fleet allocation and strategic supply chain data.",
    icon: <UserCheck className="text-[#B026FF]" size={32} />,
    accent: "purple",
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#121317] pt-32 pb-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        <FadeUp className="text-center mb-16 border-b border-white/5 pb-10">
          <p className="text-[10px] uppercase tracking-[3px] text-[#BDF4FF] mb-4 font-inter">
            Integrated Logistics Plans
          </p>
          <h1 className="font-grotesk font-bold text-[clamp(40px,5vw,64px)] text-white mb-6 uppercase tracking-[-2px]">
            OUR FREIGHT <span className="text-grad-purple">SOLUTIONS</span>
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto font-inter text-[18px]">
            Integrated maritime logistics solutions designed to power global industrial supply chains with machine-level precision.
          </p>
        </FadeUp>

        
        <div className="flex flex-wrap justify-center gap-6 items-stretch">
          {services.map((s, i) => (
            <FadeUp 
              key={i} 
              delay={i * 0.1} 
              className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex"
            >
              <div className="w-full p-10 rounded-lg bg-[#1a1b20] border border-white/5 hover:border-white/20 transition-all duration-500 group relative flex flex-col justify-between h-full overflow-hidden">
                
                {/* Decorative background glow on hover (Diperbaiki agar selalu muncul) */}
                <div 
                  className="absolute -right-10 -top-10 w-32 h-32 blur-3xl transition-opacity duration-500 opacity-5 group-hover:opacity-20 pointer-events-none" 
                  style={{ backgroundColor: s.accent === 'purple' ? '#B026FF' : '#BDF4FF' }}
                />
                
                <div className="flex-1 flex flex-col relative z-10">
                  <div className="mb-6">{s.icon}</div>
                  <h3 className="font-grotesk font-bold text-2xl text-white mb-4 uppercase tracking-tight">
                    {s.title}
                  </h3>
                  <p className="font-inter text-white/60 leading-relaxed mb-8 flex-1">
                    {s.desc}
                  </p>
                </div>
                
                <Link 
                  href="/register" 
                  className="w-full py-4 rounded font-grotesk font-black text-center text-white text-[13px] uppercase tracking-[1.6px] transition-all duration-200 mt-auto relative z-10 hover:scale-[1.02]"
                  style={{
                    background: s.accent === 'purple' ? "linear-gradient(135deg, #E5B5FF 0%, #B026FF 100%)" : "linear-gradient(135deg, #E5B5FF 0%, #BDF4FF 100%)",
                    color: "#4E0078",
                    boxShadow: "0 10px 30px -10px rgba(176,38,255,0.4)",
                  }}
                >
                  Initiate Logistics Booking
                </Link>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </main>
  );
}