"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

function HUDCard({
  label,
  value,
  accent,
  delay,
  offsetRight,
}: {
  label: string;
  value: string;
  accent: string;
  delay: number;
  offsetRight?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.8 }}
      className="animate-float-hud"
      style={{ marginRight: offsetRight || "0" }}
    >
      <div
        className="px-5 py-4 rounded-r-lg"
        style={{
          background: "rgba(26,27,32,0.6)",
          borderLeft: `2px solid ${accent}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <p
          className="text-[9px] uppercase tracking-[1px] mb-1 font-inter"
          style={{ color: `${accent}b0` }}
        >
          {label}
        </p>
        <p className="font-grotesk font-medium text-[22px] text-text-primary">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-bg-dark">
      {/* Decorative blobs */}
      <div
        className="absolute right-[-60px] top-1/4 w-96 h-96 rounded-xl pointer-events-none"
        style={{ background: "#B026FF", opacity: 0.05, filter: "blur(60px)" }}
      />
      <div
        className="absolute left-[-60px] bottom-1/4 w-80 h-80 rounded-xl pointer-events-none"
        style={{ background: "#BDF4FF", opacity: 0.05, filter: "blur(50px)" }}
      />

      <div className="max-w-7xl mx-auto px-6 w-full py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* ── Left: Text ── */}
        <div>
          {/* Live chip */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#00E3FD] animate-pulse-dot" />
            <span className="text-cyan text-[10px] font-medium uppercase tracking-[2px] font-inter">
              Live Fleet Monitoring
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-grotesk font-bold leading-[1] tracking-[-3.5px] text-text-primary mb-6"
            style={{ fontSize: "clamp(46px, 6.5vw, 84px)" }}
          >
            Maju Fleet:
            <br />
            <span className="text-grad-purple">Navigating</span>
            <br />
            the Future
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-inter font-light text-[18px] leading-[1.7] text-text-muted/90 max-w-[440px] mb-10"
          >
            Intelligent maritime logistics powered by real-time telemetry,
            AI-driven insights, and global satellite connectivity.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center gap-6"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/contact"
                className="inline-block px-8 py-4 rounded font-grotesk font-bold text-[14px] uppercase tracking-[-0.4px] text-[#4E0078]"
                style={{
                  background: "linear-gradient(135deg, #E5B5FF 0%, #B026FF 100%)",
                  boxShadow: "0 0 20px rgba(176,38,255,0.35)",
                }}
              >
                Get Started Today
              </Link>
            </motion.div>

            <Link
              href="/about"
              className="flex items-center gap-2 font-grotesk text-[14px] uppercase tracking-[0.4px] text-cyan hover:gap-4 transition-all duration-200"
            >
              Explore Our Vision <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* ── Right: HUD ── */}
        <div className="hidden lg:flex flex-col items-end gap-4 opacity-85">
          <HUDCard label="Global Coverage"  value="99.8%"  accent="#B026FF" delay={0.8} />
          <HUDCard label="Route Efficiency" value="+24.5%" accent="#BDF4FF" delay={1.0} offsetRight="32px" />
          <HUDCard label="Active Vessels"   value="1,240"  accent="#B026FF" delay={1.2} offsetRight="64px" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 pointer-events-none">
        <span className="text-[10px] uppercase tracking-[3px] text-text-primary font-inter">
          Scroll to discover
        </span>
        <div
          className="w-px h-10 animate-scroll-fade"
          style={{ background: "linear-gradient(180deg, #B026FF, transparent)" }}
        />
      </div>
    </section>
  );
}
