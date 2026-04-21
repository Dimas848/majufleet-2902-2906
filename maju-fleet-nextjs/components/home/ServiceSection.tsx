"use client";

import { FadeUp } from "@/components/FadeUp";
import { Ship, Package, ShieldCheck, Zap, UserCheck, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation"; 

const services = [
  {
    title: "Maju Economy",
    desc: "Cost-optimized solution for non-urgent bulk shipments. Features schedule-based optimized routing.",
    price: "IDR 59.000 / KG",
    features: [
      "30-45 Days Estimated Transit",
      "Standard Port Handling",
      "Basic Daily Location Tracking",
      "Port-to-Port Delivery"
    ],
    icon: <Ship className="text-[#B026FF]" size={32} />,
    accent: "purple",
  },
  {
    title: "Maju Standard",
    desc: "End-to-end container logistics. Integrated with our global satellite tracking for full route transparency.",
    price: "IDR 70.000 / KG",
    features: [
      "20-30 Days Estimated Transit",
      "Priority Container Handling",
      "Real-Time Satellite Telemetry",
      "Comprehensive Cargo Insurance"
    ],
    icon: <Package className="text-[#BDF4FF]" size={32} /> ,
    accent: "cyan",
  },
  {
    title: "Maju Heavy",
    desc: "Specialized heavy-duty logistics for industrial machinery. Secure handling with 24/7 command supervision.",
    price: "Custom Pricing",
    features: [
      "Out-of-Gauge (OOG) Cargo Handling",
      "Flat Rack & Open Top Containers",
      "24/7 Dedicated Command Supervision",
      "Specialized Crane Logistics"
    ],
    icon: <ShieldCheck className="text-[#B026FF]" size={32} />,
    accent: "purple",
  },
  {
    title: "Maju Express",
    desc: "Priority freight options for time-critical shipments. Guaranteed minimum transit time.",
    price: "IDR 90.000 / KG",
    features: [
      "10-15 Days Guaranteed Transit",
      "Priority Fleet Allocation Space",
      "Live Temperature & Status Alerts",
      "Dedicated Account Manager"
    ],
    icon: <Zap className="text-[#BDF4FF]" size={32} />,
    accent: "cyan",
  },
  {
    title: "Maju VIP",
    desc: "Dedicated logistics coordination. Access to priority fleet allocation and strategic supply chain data.",
    price: "Contract Based",
    features: [
      "Full Vessel Chartering Options",
      "Strategic Supply Chain Analytics",
      "Zero-Delay Port Clearance (Customs)",
      "High-Security Escort Availability"
    ],
    icon: <UserCheck className="text-[#B026FF]" size={32} />,
    accent: "purple",
  }
];

export default function ServicesSection() {
  const router = useRouter(); 

  return (
    <section className="bg-[#121317] py-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        <FadeUp className="text-center mb-16 border-b border-white/5 pb-10">
          <p className="text-[10px] uppercase tracking-[3px] text-[#BDF4FF] mb-4 font-inter">
            Integrated Logistics Plans
          </p>
          <h2 className="font-grotesk font-bold text-[clamp(40px,5vw,64px)] text-white mb-6 uppercase tracking-[-2px]">
            OUR FREIGHT <span className="text-grad-purple">SOLUTIONS</span>
          </h2>
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
              <div className="w-full p-8 md:p-10 rounded-lg bg-[#1a1b20] border border-white/5 hover:border-white/20 transition-all duration-500 group/card relative flex flex-col h-full overflow-hidden">
                
                <div 
                  className="absolute -right-10 -top-10 w-32 h-32 blur-3xl transition-opacity duration-500 opacity-0 group-hover/card:opacity-10 pointer-events-none" 
                  style={{ backgroundColor: s.accent === 'purple' ? '#B026FF' : '#00E3FD' }}
                />
                
                <div className="relative z-10 mb-6">
                  <div className="mb-6">{s.icon}</div>
                  <h3 className="font-grotesk font-bold text-2xl text-white mb-3 uppercase tracking-tight">
                    {s.title}
                  </h3>
                  <p className="font-inter text-[14px] text-white/60 leading-relaxed min-h-[60px]">
                    {s.desc}
                  </p>
                </div>

                <div className="w-full h-px bg-white/5 my-4"></div>

                <div className="mb-6 relative z-10">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">Estimated Base Price</p>
                  <p className={`font-grotesk font-bold text-3xl ${s.accent === 'purple' ? 'text-[#E5B5FF]' : 'text-[#BDF4FF]'}`}>
                    {s.price}
                  </p>
                </div>

                <div className="flex-1 flex flex-col gap-3 mb-10 relative z-10">
                  {s.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 
                        size={18} 
                        className={`shrink-0 mt-0.5 ${s.accent === 'purple' ? 'text-[#B026FF]' : 'text-[#00E3FD]'}`} 
                      />
                      <span className="font-inter text-[13px] text-white/80 leading-snug">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => {
                    // Cek apakah layanannya adalah MAJU VIP atau MAJU HEAVY
                    if (s.title === "Maju VIP" || s.title === "Maju Heavy") {
                      router.push("/contact"); 
                    } else {
                      document.getElementById("login-trigger-btn")?.click(); 
                    }
                  }}
                  className="w-full py-4 rounded font-grotesk font-black text-[13px] uppercase tracking-[1.6px] transition-all duration-500 mt-auto relative z-10 overflow-hidden hover:scale-[1.02] group/btn outline-none"
                >
                  <div className="absolute inset-0 bg-[#27272a] transition-opacity duration-500 group-hover/btn:opacity-0" />
                  <div 
                    className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
                    style={{
                      background: s.accent === 'purple' ? "linear-gradient(135deg, #E5B5FF 0%, #B026FF 100%)" : "linear-gradient(135deg, #E5B5FF 0%, #BDF4FF 100%)",
                    }}
                  />
                  <span className="relative z-10 text-white/50 group-hover/btn:text-[#4E0078] transition-colors duration-500 block">
                    {/* Mengubah teks tombol khusus untuk VIP dan Heavy */}
                    {s.title === "Maju VIP" || s.title === "Maju Heavy" ? "Contact Command Center" : "Initiate Logistics Booking"}
                  </span>
                </button>

              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}