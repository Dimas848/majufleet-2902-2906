"use client";

import Image from "next/image";
import { FadeUp } from "@/components/FadeUp";

export default function DeepTechGrid() {
  return (
    <section className="py-24 px-6 bg-bg-mid">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="text-center mb-14">
          <p className="text-[10px] uppercase tracking-[2px] text-cyan mb-3 font-inter">
            Core Infrastructure
          </p>
          <h2 className="font-grotesk font-bold text-[clamp(32px,4vw,48px)] tracking-[-2px] text-text-primary">
            Heavy Logistics Grid
          </h2>
        </FadeUp>

      
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          

          <FadeUp delay={0} className="flex-[2] relative rounded-lg overflow-hidden md:min-h-full min-h-[300px]">
            <Image
              src="/ship-aerial.png"
              alt="Container ship aerial view"
              fill
              className="object-cover absolute inset-0 w-full h-full"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 z-1"
              style={{
                background:
                  "linear-gradient(0deg, #121317 0%, rgba(18,19,23,0) 60%)",
              }}
            />
            {/* Teks di atas gambar */}
            <div className="absolute bottom-10 left-10 z-10">
              <h3 className="font-grotesk font-bold text-[32px] leading-[1.1] tracking-[-0.9px] text-text-primary mb-3">
                Mega-Vessel <br /> Capacity
              </h3>
              <p className="font-inter text-[15px] text-text-muted max-w-[380px]">
                Our physical fleet is engineered to secure and transport industrial-scale loads safely across turbulent oceans.
              </p>
            </div>
          </FadeUp>

          {/* Right column — Menjadi flex item 1/3, flex flex-col untuk 2 kotak --- */}
          <div className="flex-[1] flex flex-col gap-4">
            <FadeUp delay={0.1}>
              <div
                className="p-10 rounded-lg flex flex-col justify-end min-h-[142px]"
                style={{ background: "#B026FF" }}
              >
                <h4 className="font-grotesk font-bold text-[20px] uppercase tracking-[-1.2px] text-white mb-2">Industrial Scale</h4>
                <p className="font-inter text-[13px] leading-[1.5] text-white/80">Heavy-duty logistics built to support global manufacturing and massive supply chains.</p>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div
                className="p-10 rounded-lg flex flex-col justify-end bg-bg-card2 min-h-[142px]"
                style={{
                  borderLeft: "4px solid #BDF4FF",
                }}
              >
                <h4 className="font-grotesk font-bold text-[20px] uppercase tracking-[-1.2px] text-cyan mb-2">Secure Handling</h4>
                <p className="font-inter text-[13px] leading-[1.5] text-text-muted">Robust port-to-port freight operations designed to eliminate physical bottlenecks and delays.</p>
              </div>
            </FadeUp>
          </div>
        </div>


      </div>
    </section>
  );
}