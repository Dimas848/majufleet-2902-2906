"use client";

import { motion } from "framer-motion";

export default function AboutHero() {
  return (
    <section className="relative h-[72vh] flex items-end overflow-hidden">
      {/* Background ship image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/ship-sunset.png')" }}
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,19,23,0.65) 0%, rgba(18,19,23,0.96) 100%)",
        }}
      />
      {/* Purple radial deco */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at 60% 50%, rgba(176,38,255,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-[10px] uppercase tracking-[2px] text-cyan mb-5 font-inter">
            About Maju Fleet
          </p>
          <h1
            className="font-grotesk font-bold leading-[1] tracking-[-4px] text-text-primary mb-5"
            style={{ fontSize: "clamp(52px, 8vw, 90px)" }}
          >
            TOGETHER
            <br />
            WE GROW
          </h1>
          <p className="font-inter font-light text-[20px] leading-[1.55] text-text-muted max-w-[520px]">
            Pioneering the future of maritime operations through technology,
            unity, and relentless innovation.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
