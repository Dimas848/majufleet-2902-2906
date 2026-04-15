"use client";

import { FadeUp } from "@/components/FadeUp";
import { MessageSquareQuote, Star } from "lucide-react";

const feedbacks = [
  {
    company: "Oceanic Trade Co.",
    name: "Sarah Jenkins",
    role: "Head of Port Operations",
    text: "Maju Fleet's deployment system integrated seamlessly with our port. The scheduling precision for our standard containers cut waiting times by 30%.",
  },
  {
    company: "HeavyDuty Logistics",
    name: "Marcus Vance",
    role: "Supply Chain Director",
    text: "The real-time tracking on their VIP Dashboard is a game changer. We monitored our heavy machinery freight across the Pacific without a single blind spot.",
  },
  {
    company: "SeaRoutes Inc.",
    name: "Capt. Johan",
    role: "Fleet Commander",
    text: "Outstanding reliability. We've routed over 50 bulk cargo shipments this quarter and their AI-driven ETA predictions were 99% accurate.",
  },
];

export default function FeedbackSection() {
  return (
    <section className="py-24 bg-bg-dark border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header Section */}
        <FadeUp className="text-center mb-16">
          <p className="font-inter text-[10px] uppercase tracking-[3px] text-[#BDF4FF] mb-3">
            Operation Logs
          </p>
          <h2 className="font-grotesk font-bold text-4xl md:text-5xl text-white tracking-[-1px]">
            CLIENT <span className="text-grad-purple">TRANSMISSIONS</span>
          </h2>
        </FadeUp>

        {/* Feedback Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedbacks.map((item, index) => (
            <FadeUp key={index} delay={index * 0.15} className="h-full">
              <div 
                className="relative p-8 rounded-lg bg-[#1a1b20] border border-white/5 hover:border-[#B026FF]/40 transition-all duration-300 h-full flex flex-col group"
              >
                {/* Accent line on top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B026FF] to-[#BDF4FF] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-[#B026FF] text-[#B026FF]" />
                    ))}
                  </div>
                  <MessageSquareQuote size={20} className="text-white/20 group-hover:text-[#BDF4FF] transition-colors" />
                </div>

                <p className="font-inter text-[15px] text-white/70 leading-relaxed mb-8 flex-1 italic">
                  "{item.text}"
                </p>

                <div className="border-t border-white/10 pt-5">
                  <p className="font-grotesk font-bold text-[16px] text-white tracking-tight">
                    {item.company}
                  </p>
                  <p className="font-inter text-[12px] text-[#BDF4FF] mt-1">
                    {item.name} <span className="text-white/30 mx-1">|</span> <span className="text-white/50">{item.role}</span>
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

      </div>
    </section>
  );
}