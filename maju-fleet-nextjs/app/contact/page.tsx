import ContactForm from "@/components/contact/ContactForm";
import ContactPersons from "@/components/contact/ContactPersons";
import { FadeUp } from "@/components/FadeUp";

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-bg-deep overflow-hidden">
      <div
        className="fixed right-[-128px] top-[240px] w-[500px] h-[500px] rounded-xl pointer-events-none z-0"
        style={{
          background: "#B026FF",
          opacity: 0.15,
          filter: "blur(90px)",
        }}
      />
      <div
        className="fixed left-[-128px] bottom-[-120px] w-[420px] h-[420px] rounded-xl pointer-events-none z-0"
        style={{
          background: "rgba(0,227,253,0.12)",
          filter: "blur(75px)",
        }}
      />

      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-20">
            <h1
              className="font-grotesk font-bold tracking-[-3.6px] text-white mb-5"
              style={{ fontSize: "clamp(44px, 6vw, 72px)" }}
            >
              CONTACT US
            </h1>
            <p
              className="font-inter font-light text-[18px] tracking-[0.5px] max-w-[480px] mx-auto"
              style={{ color: "rgba(210,193,215,0.6)" }}
            >
              Reach out to our command center for enterprise inquiries.
            </p>
          </FadeUp>

          {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContactForm />
            <ContactPersons />
          </div>
        </div>
      </section>
    </div>
  );
}
