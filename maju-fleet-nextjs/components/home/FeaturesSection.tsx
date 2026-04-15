"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Globe } from "lucide-react";
import { FadeUp } from "@/components/FadeUp";

const features = [
  {
    icon: Activity,
    accent: "#E5B5FF",
    border: "rgba(176,38,255,0.25)",
    title: "Real-time Telemetry",
    desc: "Continuous data streaming from every node in your fleet, providing unparalleled situational awareness.",
  },
  {
    icon: Cpu,
    accent: "#BDF4FF",
    border: "rgba(189,244,255,0.25)",
    title: "Predictive Maintenance",
    desc: "AI-driven insights that anticipate mechanical failures before they occur, reducing downtime by 40%.",
  },
  {
    icon: Globe,
    accent: "#E5B5FF",
    border: "rgba(176,38,255,0.25)",
    title: "Global Connectivity",
    desc: "Seamless satellite integration ensuring your fleet is never out of reach, even in the most remote waters.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-bg-mid">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="text-center mb-14">
          <p className="text-[10px] uppercase tracking-[2px] text-cyan mb-3 font-inter">
            Platform Capabilities
          </p>
          <h2 className="font-grotesk font-bold text-[clamp(32px,4vw,48px)] tracking-[-2px] text-text-primary">
            Intelligence at Sea
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FadeUp key={i} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -6, boxShadow: `0 0 30px ${f.border}` }}
                className="p-8 rounded-lg bg-bg-card2 h-full transition-shadow duration-300"
                style={{ borderBottom: `2px solid ${f.border}` }}
              >
                <f.icon size={20} style={{ color: f.accent }} className="mb-5" />
                <h3 className="font-grotesk font-bold text-[18px] text-text-primary mb-3">
                  {f.title}
                </h3>
                <p className="font-inter text-[13px] leading-[22px] text-text-muted">
                  {f.desc}
                </p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
