"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Send, Loader2, CheckCircle } from "lucide-react";

interface FormState {
  company: string;
  email: string;
  message: string;
}

const INITIAL_FORM: FormState = { company: "", email: "", message: "" };

function Toast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-7 py-4 rounded-xl whitespace-nowrap"
          style={{
            background: "#16181F",
            border: "1px solid rgba(189,244,255,0.3)",
            boxShadow: "0 0 30px rgba(176,38,255,0.3)",
          }}
        >
          <CheckCircle size={18} style={{ color: "#BDF4FF" }} />
          <span className="font-grotesk font-medium text-[14px] text-text-primary">
            ✓ Transmission Sent — We&apos;ll respond within 2 hours.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1800));
    setForm(INITIAL_FORM);
    setLoading(false);
    setToast(true);
    setTimeout(() => setToast(false), 4500);
  };

  const inputBase =
    "w-full bg-bg-dark border-0 border-b border-[#4F4255]/40 rounded-sm px-4 py-4 text-text-primary font-inter text-[15px] placeholder-[#6B7280] transition-all duration-200 input-focus";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative p-12 rounded-lg bg-bg-card"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)" }}
      >
        {/* Purple left bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ background: "#B026FF" }}
        />

        {/* Heading */}
        <div className="flex items-center gap-3 mb-8">
          <Shield size={16} style={{ color: "#E5B5FF" }} />
          <h3 className="font-grotesk font-bold text-[22px] text-white">
            Contact Us
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* Company Name */}
          <div className="flex flex-col gap-2">
            <label className="font-grotesk text-[11px] uppercase tracking-[1.2px] text-cyan opacity-75">
              Company Name
            </label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              required
              placeholder="Enter full legal entity"
              className={inputBase}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="font-grotesk text-[11px] uppercase tracking-[1.2px] text-cyan opacity-75">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="secure@company.com"
              className={inputBase}
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label className="font-grotesk text-[11px] uppercase tracking-[1.2px] text-cyan opacity-75">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Brief of operation requirements..."
              className={inputBase + " resize-none"}
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02, boxShadow: "0 12px 40px -10px rgba(176,38,255,0.65)" } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="w-full py-5 rounded font-grotesk font-black text-white text-[15px] uppercase tracking-[1.6px] flex items-center justify-center gap-3 transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              background: loading ? "#7a1aaa" : "#B026FF",
              boxShadow: "0 10px 30px -10px rgba(176,38,255,0.5)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>Transmitting...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Submit Message</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      <Toast show={toast} />
    </>
  );
}
