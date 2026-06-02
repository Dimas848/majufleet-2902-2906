import AboutHero from "@/components/about/AboutHero";
import AboutVisionMission from "@/components/about/AboutVisionMission";
import AboutMetrics from "@/components/about/AboutMetrics";
import DeepTechGrid from "@/components/about/DeepTechGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about Maju Fleet's deep-tech engineering team, our operational vision, and global maritime logistics intelligence systems.",
  keywords: ["about maju fleet", "maritime engineering", "fleet intelligence", "atmajaya yogyakarta"],
  openGraph: {
    title: "About Us | Maju Fleet", // OpenGraph bisa tetap panjang untuk preview sosmed
    description: "Discover the deep-tech architecture and engineering driving global supply chain automation.",
    url: "https://maju-fleet.vercel.app/about",
    type: "website",
    images: ["/shiphomebackground.png"],
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#0a0a0c] min-h-screen">
      <AboutHero />
      <AboutVisionMission />
      <AboutMetrics />
      <DeepTechGrid />
    </div>
  );
}