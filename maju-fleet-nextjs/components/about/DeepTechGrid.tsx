import Image from "next/image";
import { FadeUp } from "@/components/FadeUp";

export default function DeepTechGrid() {
  return (
    <section className="py-24 px-6 bg-bg-mid">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="text-center mb-14">
          <p className="text-[10px] uppercase tracking-[2px] text-cyan mb-3 font-inter">
            The Technology
          </p>
          <h2 className="font-grotesk font-bold text-[clamp(32px,4vw,48px)] tracking-[-2px] text-text-primary">
            Deep Tech Grid
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Large image card — spans 2 cols */}
          <FadeUp delay={0} className="md:col-span-2">
            <div className="relative rounded-lg overflow-hidden h-[300px]">
              <Image
                src="/ship-aerial.png"
                alt="Container ship aerial view"
                fill
                className="object-cover"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(0deg, #121317 0%, rgba(18,19,23,0) 60%)",
                }}
              />
              <div className="absolute bottom-10 left-10 z-10">
                <h3 className="font-grotesk font-bold text-[32px] leading-[1.1] tracking-[-0.9px] text-text-primary mb-3">
                  Satellite-Link
                  <br />
                  Technology
                </h3>
                <p className="font-inter text-[15px] text-text-muted max-w-[380px]">
                  Our proprietary technology ensures that no vessel is ever
                  truly alone.
                </p>
              </div>
            </div>
          </FadeUp>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <FadeUp delay={0.1}>
              <div
                className="p-10 rounded-lg flex flex-col justify-end"
                style={{ background: "#B026FF", minHeight: "142px" }}
              >
                <h4 className="font-grotesk font-bold text-[20px] uppercase tracking-[-1.2px] text-white mb-2">
                  Enterprise Ready
                </h4>
                <p className="font-inter text-[13px] leading-[1.5] text-white/80">
                  Scalable infrastructure for the world&apos;s largest shipping
                  conglomerates.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div
                className="p-10 rounded-lg flex flex-col justify-end bg-bg-card2"
                style={{
                  borderLeft: "4px solid #BDF4FF",
                  minHeight: "142px",
                }}
              >
                <h4 className="font-grotesk font-bold text-[20px] uppercase tracking-[-1.2px] text-cyan mb-2">
                  Zero Latency
                </h4>
                <p className="font-inter text-[13px] leading-[1.5] text-text-muted">
                  Real-time telemetry processed at the edge for immediate
                  tactical response.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
