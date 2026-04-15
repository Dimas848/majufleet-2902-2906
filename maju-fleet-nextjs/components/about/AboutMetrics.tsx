"use client";

import { motion } from "framer-motion";
import { FadeUp } from "@/components/FadeUp";

const metrics = [
  { num: "500+",  label: "Active Vessels" },
  { num: "99.9%", label: "Uptime" },
  { num: "120",   label: "Global Ports" },
  { num: "24/7",  label: "Monitoring" },
];

export default function AboutMetrics() {
  return (
    <section className="py-24 px-6 bg-bg-dark">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <FadeUp key={i} delay={i * 0.1}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="p-8 rounded-lg text-center"
              style={{ background: "rgba(41,42,46,0.3)" }}
            >
              <div className="font-grotesk font-bold text-[clamp(36px,4vw,52px)] tracking-[-2.4px] text-purple mb-2">
                {m.num}
              </div>
              <div className="font-inter font-bold text-[11px] uppercase tracking-[1.2px] text-cyan">
                {m.label}
              </div>
            </motion.div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
