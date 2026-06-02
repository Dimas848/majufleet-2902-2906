"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname(); 
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("Loading...");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${year}-${month}-${day} ${hours}:${minutes}`);
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleLogout = () => router.push("/");

  const navLinks = [
    { 
      name: "FLEET", 
      href: "/Dashboard-Admin/fleet",
      dropdown: [
        { name: "FULL OVERVIEW", href: "/Dashboard-Admin/fleet?view=full" },
        { name: "ANALYTICS", href: "/Dashboard-Admin/fleet?view=stats" },
        { name: "DELIVERY LIST", href: "/Dashboard-Admin/fleet?view=list" }
      ]
    },
    { 
      name: "MAP", 
      href: "/Dashboard-Admin/map",
      dropdown: [
        { name: "ALL", href: "/Dashboard-Admin/map?tab=ALL" },
        { name: "ALERTS", href: "/Dashboard-Admin/map?tab=ALERTS" }
      ]
    },
    { 
      name: "ANALYTICS", 
      href: "/Dashboard-Admin/analytics",
      dropdown: [
        { name: "PACKAGE TREND", href: "/Dashboard-Admin/analytics?tab=TREND" },
        { name: "AVERAGE INCOME", href: "/Dashboard-Admin/analytics?tab=INCOME" }
      ]
    },
    { 
      name: "CONSOLE", 
      href: "/Dashboard-Admin/register",
      dropdown: [
        { name: "FLEET REGISTRATION", href: "/Dashboard-Admin/register?type=fleet" },
        { name: "CUSTOMER REGISTRATION", href: "/Dashboard-Admin/register?type=customer" },
        { name: "VESSEL REGISTRATION", href: "/Dashboard-Admin/register?type=vessel" },
        { name: "CREW REGISTRATION", href: "/Dashboard-Admin/register?type=crew" }
      ]
    },
    { 
      name: "LOGS", 
      href: "/Dashboard-Admin/logs",
      dropdown: [
        { name: "FULL OVERVIEW", href: "/Dashboard-Admin/logs?role=all" },
        { name: "ADMIN LOGS", href: "/Dashboard-Admin/logs?role=admin" },
        { name: "CUSTOMER LOGS", href: "/Dashboard-Admin/logs?role=customer" }
      ]
    }, 
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 h-[80px] flex items-center justify-between px-6 md:px-10 bg-[#0a0a0c]">
        <div className="flex items-center gap-4 w-1/3">
          <Image src="/logo.png" alt="Logo" width={65} height={65} className="-mr-1 opacity-90" />
          <span className="font-grotesk font-bold text-[30px] tracking-[3px] uppercase text-[#E5B5FF] drop-shadow-[0_0_10px_rgba(176,38,255,0.4)]">
            Maju Fleet
          </span>
        </div>
        
        <div className="hidden lg:flex items-center justify-center gap-10 w-2/3 mt-2 relative">
          {navLinks.map((link) => {
            const isActive = link.href === "/Dashboard-Admin" 
              ? pathname === link.href 
              : pathname.startsWith(link.href);

            return (
              <div 
                key={link.name} 
                className="relative group py-4"
                onMouseEnter={() => setDropdownOpen(link.name)}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <Link 
                  href={link.href} 
                  className={`font-grotesk text-[13px] uppercase tracking-[2px] pb-2 transition-all flex items-center gap-1.5 ${
                    isActive 
                      ? "font-bold text-[#E5B5FF] border-b-2 border-[#B026FF]" 
                      : "text-white/50 hover:text-[#E5B5FF] border-b-2 border-transparent hover:border-[#B026FF]"
                  }`}
                >
                  {link.name}
                  {link.dropdown && <ChevronDown size={14} className={`transition-transform duration-300 ${dropdownOpen === link.name ? 'rotate-180 text-[#B026FF]' : 'opacity-60'}`} />}
                </Link>

                <AnimatePresence>
                  {link.dropdown && dropdownOpen === link.name && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }} 
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-0 min-w-[200px] w-auto bg-[#121317] border border-white/10 rounded-lg shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-[100] overflow-hidden flex flex-col whitespace-nowrap"
                    >
                      {link.dropdown.map((subItem) => (
                        <Link 
                          key={subItem.name} 
                          href={subItem.href}
                          onClick={() => setDropdownOpen(null)}
                          className="px-5 py-3.5 text-[11px] font-mono text-white/60 hover:text-[#E5B5FF] hover:bg-[#B026FF]/20 uppercase tracking-widest transition-colors border-b border-white/5 last:border-none"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-6 w-1/3">
          <div suppressHydrationWarning className="border border-[#B026FF]/50 bg-transparent rounded-full px-5 py-2 font-mono text-[11px] text-[#E5B5FF] tracking-widest shadow-[0_0_10px_rgba(176,38,255,0.1)]">
            {currentTime}
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#B026FF] to-[#00E3FD] p-[2px] cursor-pointer hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-[#0a0a0c] flex items-center justify-center overflow-hidden">
              <User size={18} className="text-white/60"/>
            </div>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="w-10 h-10 rounded-full border border-white/10 bg-[#121317] flex items-center justify-center text-white/50 hover:text-[#FF3B30] hover:border-[#FF3B30]/50 hover:bg-[#FF3B30]/10 transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="w-full h-px bg-white/5 shrink-0 mb-6 mt-[10px]"></div>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#0a0a0c] border border-[#B026FF]/30 rounded-xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(176,38,255,0.15)] z-10 text-center">
              <h2 className="text-white font-grotesk font-bold text-xl tracking-[2px] uppercase mb-3">System Logout</h2>
              <p className="text-white/60 font-mono text-[11px] tracking-widest mb-8 leading-relaxed">Are you sure you want to terminate the current session and return to the main portal?</p>
              <div className="flex gap-4">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 border border-white/10 rounded-md text-white/60 hover:text-white hover:bg-white/5 font-grotesk text-[12px] uppercase tracking-[1px] transition-colors">Cancel</button>
                <button onClick={handleLogout} className="flex-1 py-3 bg-[#FF3B30]/10 border border-[#FF3B30]/50 text-[#FF3B30] rounded-md hover:bg-[#FF3B30] hover:text-white font-grotesk text-[12px] font-bold uppercase tracking-[1px] transition-colors">Confirm Exit</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}