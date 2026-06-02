import type { Metadata } from "next";
import ServicesSection from "@/components/home/ServiceSection";

// 💡 SEKARANG BERFUNGSI: Memanfaatkan cetakan otomatis dari layout.tsx
export const metadata: Metadata = {
  title: "Our Services", // Otomatis digabung di browser menjadi: Logistics Services & Pricing Plans | Maju Fleet
  description: "Explore our flat-rate per KG maritime shipping plans. From Maju Economy to Time-Critical Express and Dedicated VIP cargo care, choose the perfect tier for your global supply chain deployment.",
  keywords: ["shipping rates per kg", "maritime logistics plans", "cargo pricing tiers", "economy shipping", "express container freight", "maju standard"],
  openGraph: {
    title: "Logistics Services & Pricing Plans | Maju Fleet", // OpenGraph untuk pratinjau media sosial tetap lengkap
    description: "Explore optimized flat-rate per KG container shipping plans engineered for global fleet logistics control.",
    url: "https://maju-fleet.vercel.app/services",
    type: "website",
    images: ["/shiphomebackground.png"],
  },
};

export default function ServicesPage() {
  return (
    <div className="bg-[#0a0a0c] min-h-screen">
      <ServicesSection />
    </div>
  );
}