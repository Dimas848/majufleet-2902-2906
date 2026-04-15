"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo.png" alt="Maju Fleet Logo" width={42} height={42} className="opacity-90" />
          <span className="text-grad-logo font-grotesk font-bold text-[22px] tracking-[-1.2px] uppercase">
            MAJU Fleet
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-grotesk text-[13px] uppercase tracking-[-0.35px] pb-1 border-b-2 transition-all duration-200 ${
                pathname === l.href
                  ? "text-[#E5B5FF] border-[#B026FF]"
                  : "text-white/70 border-transparent hover:text-[#BDF4FF]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/contact"
              className="px-6 py-2 rounded border border-[#B026FF] text-[#E5B5FF] font-grotesk text-[13px] uppercase tracking-[-0.35px] transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.002)",
                boxShadow: "0 0 10px rgba(176,38,255,0.2), inset 0 0 10px 1px rgba(176,38,255,0.15)",
              }}
            >
              Request Demo
            </Link>
          </motion.div>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/70 p-1">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-white/5 bg-bg-dark px-6 py-4 flex flex-col gap-3 overflow-hidden"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`font-grotesk text-sm uppercase py-2 ${
                  pathname === l.href ? "text-[#E5B5FF]" : "text-white/60"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
