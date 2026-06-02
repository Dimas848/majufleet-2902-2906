"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"; // 💡 IMPOR BARU: Untuk fallback navigasi antar halaman
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();

  // 💡 HANDLER SMARTSROLL & FALLBACK ROUTING
  const handleExploreUs = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const aboutElement = document.getElementById("about");
    
    if (aboutElement) {
      // Skenario A: Jika komponen About berada di satu halaman utama (Single Page)
      aboutElement.scrollIntoView({ behavior: "smooth" });
    } else {
      // Skenario B: Jika folder about diakses sebagai rute terpisah (/about)
      router.push("/about");
    }
  };

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-between overflow-hidden pt-28 pb-10">
      
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/shiphomebackground.png')" }} 
      />
      
      {/* Dark Overlay Gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(to bottom, rgba(18,19,23,0.4) 0%, rgba(18,19,23,0.7) 60%, rgba(10,10,12,1) 100%)",
        }}
      />

      {/* Decorative Glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-1/4 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{ background: "#B026FF", opacity: 0.15, filter: "blur(100px)" }}
      />

      {/* Main Content (Centered) */}
      <div className="relative z-10 max-w-[900px] mx-auto px-6 w-full flex flex-col items-center text-center flex-grow justify-center mb-12 mt-4">
        
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-grotesk font-bold leading-[1.1] tracking-[-2px] text-white mb-6"
          style={{ fontSize: "clamp(50px, 8vw, 96px)" }}
        >
          Maju Fleet:
          <br />
          <span className="text-[#E5B5FF] drop-shadow-[0_0_20px_rgba(176,38,255,0.6)]">Delivering</span>
          <br />
          the World
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="font-inter font-light text-[15px] md:text-[18px] leading-[1.6] text-white/70 max-w-[700px] mb-10"
        >
          Advanced remote fleet monitoring systems for real-time tracking, weather intelligence, and route optimization. Empowering the global supply chain through deep-tech command.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => document.getElementById("login-trigger-btn")?.click()}
              className="px-8 py-4 rounded font-grotesk font-bold text-[13px] md:text-[14px] uppercase tracking-[1px] text-white transition-all shadow-[0_0_25px_rgba(176,38,255,0.4)]"
              style={{
                background: "linear-gradient(90deg, #D946EF 0%, #B026FF 100%)",
              }}
            >
              Get Started Today
            </button>
          </motion.div>

          {/* 💡 FIX: Menggunakan handler hybrid yang kebal macet */}
          <a
            href="#about"
            onClick={handleExploreUs}
            className="flex items-center gap-2 font-grotesk font-bold text-[13px] md:text-[14px] uppercase tracking-[1px] text-white/80 hover:text-white transition-all duration-200 hover:gap-3"
          >
            Explore Us <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator at the Bottom */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-10 flex flex-col items-center gap-3 mt-auto"
      >
        <span className="text-[10px] uppercase tracking-[4px] text-white/40 font-mono">
          Scroll to discover
        </span>
        <div className="w-[1px] h-12 bg-white/10 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2 bg-[#B026FF]"
            animate={{ y: [0, 50, 50], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>
      </motion.div>

    </section>
  );
}