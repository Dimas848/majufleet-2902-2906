import { FadeUp } from "@/components/FadeUp";

const metrics = [
  { value: "320+", label: "ACTIVE VESSELS" },
  { value: "12M+", label: "TONS DELIVERED" },
  { value: "150+", label: "GLOBAL PORTS" },
  { value: "24/7", label: "FREIGHT OPS" },
];

export default function AboutMetricsSection() {
  return (
    <section className="py-24 bg-bg-dark">
      <div className="max-w-[1400px] mx-auto px-6">
        
      
        <FadeUp className="text-center mb-16">
          <p className="font-inter text-[10px] uppercase tracking-[3px] text-[#BDF4FF] mb-3">
            Global Logistics Scale
          </p>
          <h2 className="font-grotesk font-bold text-4xl md:text-5xl text-white tracking-[-1px]">
            NUMBERS THAT <span className="text-grad-purple">DELIVER</span>
          </h2>
        </FadeUp>

       
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div className="p-10 rounded-lg bg-[#1a1b20] border border-white/5 text-center flex flex-col items-center justify-center hover:border-[#B026FF]/30 transition-all duration-300">
                <h3 className="font-grotesk font-bold text-4xl md:text-5xl text-[#B026FF] mb-3">
                  {m.value}
                </h3>
                <p className="font-inter text-[11px] uppercase tracking-[2px] text-white/70 font-semibold">
                  {m.label}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
        
      </div>
    </section>
  );
}