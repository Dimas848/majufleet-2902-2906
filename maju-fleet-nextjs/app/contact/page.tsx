import ContactForm from "@/components/contact/ContactForm";
import ContactPersons from "@/components/contact/ContactPersons";
import { FadeUp } from "@/components/FadeUp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Maju Fleet Command Center. Establish secure contract lines, specialized crane logistics, and real-time fleet allocation integrations.",
  keywords: ["contact logistics", "fleet command center", "support maju fleet", "indonesia cargo hub"],
  openGraph: {
    title: "Contact Logistics Control | Maju Fleet",
    description: "Establish encrypted communications and priority logistics lines with our global tracking center.",
    url: "https://maju-fleet.vercel.app/contact",
    type: "website",
    images: ["/shiphomebackground.png"],
  },
};

export default function ContactPage() {
  return (
    <div className="bg-[#0a0a0c] min-h-screen relative py-24 px-6 overflow-hidden">
      {/* Background efek */}
      <div className="fixed right-[-128px] top-[240px] w-[500px] h-[500px] rounded-xl pointer-events-none z-0" style={{ background: "#B026FF", opacity: 0.15, filter: "blur(90px)" }} />
      <div className="fixed left-[-128px] bottom-[-120px] w-[420px] h-[420px] rounded-xl pointer-events-none z-0" style={{ background: "rgba(0,227,253,0.12)", filter: "blur(75px)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <FadeUp className="text-center mb-20">
          <h1 className="font-grotesk font-bold tracking-[-3.6px] text-white mb-5" style={{ fontSize: "clamp(44px, 6vw, 72px)" }}>
            CONTACT <span className="text-grad-purple">US</span> 
          </h1>
          <p className="font-inter font-light text-[18px] tracking-[0.5px] max-w-[480px] mx-auto" style={{ color: "rgba(210,193,215,0.6)" }}>
            Reach out to our command center for enterprise inquiries.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContactForm />
          <ContactPersons />
        </div>
      </div>
    </div>
  );
}