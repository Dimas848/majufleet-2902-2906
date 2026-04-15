"use client";

import { motion } from "framer-motion";
import { Globe, Zap } from "lucide-react";
import { FadeUp } from "@/components/FadeUp";

const cards = [
  {
    icon: Globe,
    accent: "#BDF4FF",
    iconBg: "rgba(189,244,255,0.1)",
    title: "Our Vision",
    text: "To be the global leader in maritime logistics technology, creating a safer and perfectly connected ocean.",
  },
  {
    icon: Zap,
    accent: "#E5B5FF",
    iconBg: "rgba(229,181,255,0.1)",
    title: "Our Mission",
    text: "To provide real-time, highly secure, and efficient remote fleet monitoring systems for seamless maritime operations.",
  },
];

export default function VisionMissionSection() {
  return (
    <section className="pb-24 px-6 bg-bg-mid">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((c, i) => (
          <FadeUp key={i} delay={i * 0.15}>
            <motion.div
              whileHover={{ y: -4 }}
              className="p-12 rounded-lg bg-bg-card transition-transform duration-300"
              style={{
                border: "1px solid rgba(176,38,255,0.2)",
                boxShadow: "0 0 30px rgba(176,38,255,0.05)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-6"
                style={{ background: c.iconBg }}
              >
                <c.icon size={18} style={{ color: c.accent }} />
              </div>
              <h3 className="font-grotesk font-bold text-[28px] uppercase tracking-[-0.75px] text-text-primary mb-4">
                {c.title}
              </h3>
              <p className="font-inter font-light text-[17px] leading-[28px] text-text-muted">
                {c.text}
              </p>
            </motion.div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
