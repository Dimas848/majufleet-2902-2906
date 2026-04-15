"use client";

import { motion } from "framer-motion";
import { Phone, Mail } from "lucide-react";
import { FadeUp } from "@/components/FadeUp";

const persons = [
  {
    name: "Dimas",
    role: "Head of Operations",
    phone: "+62 812-3456-7890",
    email: "dimas@majufleet.id",
  },
  {
    name: "Juan",
    role: "Systems Integrator",
    phone: "+62 821-9876-5432",
    email: "juan@majufleet.id",
  },
];

export default function ContactPersons() {
  return (
    <div className="flex flex-col gap-5">
      {persons.map((p, i) => (
        <FadeUp key={i} delay={0.15 + i * 0.12}>
          <motion.div
            whileHover={{ y: -3 }}
            className="p-10 rounded-lg bg-bg-card transition-transform duration-300"
            style={{ borderLeft: "2px solid rgba(189,244,255,0.2)" }}
          >
            <h3 className="font-grotesk font-bold text-[26px] tracking-[-0.75px] text-cyan mb-1">
              {p.name}
            </h3>
            <p
              className="font-grotesk text-[12px] uppercase tracking-[1.4px] mb-7"
              style={{ color: "rgba(210,193,215,0.5)" }}
            >
              {p.role}
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Phone size={15} className="opacity-60" style={{ color: "#BDF4FF" }} />
                <span className="font-inter font-light text-[15px] tracking-[0.8px] text-text-primary">
                  {p.phone}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={15} className="opacity-60" style={{ color: "#BDF4FF" }} />
                <span className="font-inter font-light text-[15px] tracking-[0.8px] text-text-primary">
                  {p.email}
                </span>
              </div>
            </div>
          </motion.div>
        </FadeUp>
      ))}

      {/* Response badge */}
      <FadeUp delay={0.4}>
        <div
          className="p-6 rounded-lg text-center"
          style={{
            background: "rgba(176,38,255,0.06)",
            border: "1px solid rgba(176,38,255,0.15)",
          }}
        >
          <p className="font-inter text-[12px] text-text-muted/50 mb-1">
            Response Time
          </p>
          <p className="font-grotesk font-bold text-[22px] text-purple mb-1">
            &lt; 2 Hours
          </p>
          <p
            className="font-inter text-[10px] uppercase tracking-[1px]"
            style={{ color: "rgba(189,244,255,0.45)" }}
          >
            24/7 Command Center
          </p>
        </div>
      </FadeUp>
    </div>
  );
}
