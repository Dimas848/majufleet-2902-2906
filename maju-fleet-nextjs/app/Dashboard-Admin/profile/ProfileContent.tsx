"use client";

import React, { useState, useEffect } from "react";
import { 
  User, Mail, Shield, ToggleLeft, Phone, MapPin, 
  Calendar, CheckCircle, AlertCircle, Save, ArrowLeft, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/adminnavbar";

// Mock data session/current user berdasarkan record Commander Rina di User.csv & AccessLog.csv
const MOCK_USER = {
  id: 12,
  name: "Commander Rina",
  email: "rina.commander@majufleet.com",
  phone: "08123456706",
  address: "Port Warehouse Zone Alpha",
  age: 34,
  gender: "Female",
  origin: "Indonesia",
  role: "administrator",
  status: "Active"
};

export default function ProfileContent() {
  const router = useRouter();
  
  // FORM STATES
  const [name, setName] = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email);
  
  // SYSTEM READ-ONLY STATES
  const [userData] = useState(MOCK_USER);

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    let errors: Record<string, string> = {};
    if (!name) errors.name = "Profile name parameter cannot be empty.";
    if (!email) {
      errors.email = "System communications email cannot be empty.";
    } else if (!email.includes("@")) {
      errors.email = "Invalid email format topology.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setToast({ type: "error", title: "VALIDATION FAULT", message: "Incomplete parameters detected." });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulasi sinkronisasi ke server action saveEntity('user', { name, email }, id)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setToast({ 
        type: "success", 
        title: "CORE SYNCHRONIZED", 
        message: "User profile core matrices have been safely committed to database node." 
      });
    } catch (err) {
      setToast({ type: "error", title: "WRITE FAULT", message: "Failed to broadcast secure packets." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white pb-12 flex flex-col overflow-x-hidden">
      <AdminNavbar />

      {/* TOAST NOTIFICATION PREMIUM */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-[99999] w-full max-w-[420px] bg-[#0c0d12]/95 backdrop-blur-md border rounded-xl p-5 shadow-2xl flex items-start gap-4"
            style={{
              borderColor: toast.type === "success" ? "rgba(52, 199, 89, 0.3)" : "rgba(255, 59, 48, 0.3)",
              boxShadow: toast.type === "success" ? "0 0 40px rgba(52, 199, 89, 0.2)" : "0 0 40px rgba(255, 59, 48, 0.2)"
            }}
          >
            <div className={`absolute top-0 left-0 w-full h-[3px] ${toast.type === "success" ? "bg-[#34C759]" : "bg-[#FF3B30]"}`} />
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" ? <CheckCircle size={22} className="text-[#34C759]" /> : <AlertCircle size={22} className="text-[#FF3B30]" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-mono text-[11px] font-bold tracking-[3px] uppercase mb-1" style={{ color: toast.type === "success" ? "#34C759" : "#FF3B30" }}>
                {toast.title}
              </h4>
              <p className="text-white/80 text-[13px] leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[1000px] mx-auto flex-1 mt-6">
        
        {/* BACK ACTION */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-xs font-mono tracking-widest text-white/40 hover:text-[#E5B5FF] transition-colors uppercase"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">ID NODE: System-701X-{userData.id}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: IDENTITY CARD */}
          <div className="bg-[#121317] border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-[#B026FF]/20 to-[#00E3FD]/20 opacity-30 blur-xl pointer-events-none" />
            
            {/* AVATAR GLOW */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#B026FF] to-[#00E3FD] p-[3px] mb-4 shadow-[0_0_30px_rgba(176,38,255,0.3)]">
              <div className="w-full h-full rounded-full bg-[#0a0a0c] flex items-center justify-center">
                <User size={36} className="text-[#E5B5FF]" />
              </div>
            </div>

            <h3 className="font-grotesk font-bold text-lg uppercase tracking-[1px] text-white">{name || "Commander"}</h3>
            <p className="font-mono text-[10px] text-[#00E3FD] tracking-widest uppercase mt-1 mb-6">{userData.role}</p>
            
            {/* METADATA CHIPS */}
            <div className="w-full flex flex-col gap-3 border-t border-white/5 pt-6 text-left font-mono text-[11px] text-white/50 tracking-wide">
              <div className="flex justify-between items-center bg-black/20 p-2.5 rounded border border-white/5">
                <span className="flex items-center gap-2"><Shield size={14} className="text-[#B026FF]"/> Security Role</span>
                <span className="text-white uppercase font-bold text-[10px] bg-[#B026FF]/10 text-[#E5B5FF] border border-[#B026FF]/20 px-2 py-0.5 rounded">{userData.role}</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-2.5 rounded border border-white/5">
                <span className="flex items-center gap-2"><ToggleLeft size={14} className="text-[#34C759]"/> System Status</span>
                <span className="text-white uppercase font-bold text-[10px] bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 px-2 py-0.5 rounded">{userData.status}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CORE CONFIGURATION MATRIX */}
          <div className="md:col-span-2 bg-[#121317] border border-white/5 p-8 rounded-2xl">
            <h2 className="font-grotesk font-bold text-xl tracking-[2px] uppercase text-[#E5B5FF] mb-8 border-b border-white/5 pb-4">
              Profile Parameters
            </h2>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6" noValidate>
              
              {/* EDITABLE SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-white/40 tracking-[3px] uppercase mb-2 block font-mono">
                    Full Name <span className="text-[#B026FF]">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="ENTER FULL NAME"
                      className={`w-full bg-[#0a0a0c] border rounded px-4 py-3 text-sm font-medium text-white focus:outline-none transition-colors uppercase font-mono tracking-wide ${
                        formErrors.name ? "border-[#FF3B30] focus:border-[#FF3B30]" : "border-white/10 focus:border-[#B026FF]"
                      }`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-[#FF3B30] text-[10px] font-mono mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/40 tracking-[3px] uppercase mb-2 block font-mono">
                    Email Address <span className="text-[#B026FF]">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="ENTER EMAIL"
                      className={`w-full bg-[#0a0a0c] border rounded px-4 py-3 text-sm font-medium text-white focus:outline-none transition-colors font-mono tracking-wide ${
                        formErrors.email ? "border-[#FF3B30] focus:border-[#FF3B30]" : "border-white/10 focus:border-[#B026FF]"
                      }`}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-[#FF3B30] text-[10px] font-mono mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* READ-ONLY SYSTEM PARAMS TERMINAL */}
              <div className="mt-4 pt-6 border-t border-white/5">
                <p className="text-[10px] font-bold text-white/30 tracking-[3px] uppercase mb-6 font-mono">
                  System Restricted Core Parameters (Read Only)
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono">
                  <div>
                    <label className="text-[9px] text-white/30 tracking-[2px] uppercase mb-1.5 block">Contact Node</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded p-3 text-xs text-white/50 cursor-not-allowed flex items-center gap-2"><Phone size={14}/> {userData.phone}</div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 tracking-[2px] uppercase mb-1.5 block">Age Vector</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded p-3 text-xs text-white/50 cursor-not-allowed flex items-center gap-2"><Calendar size={14}/> {userData.age} Standard Years</div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 tracking-[2px] uppercase mb-1.5 block">Operational Base Location</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded p-3 text-xs text-white/50 cursor-not-allowed flex items-center gap-2"><MapPin size={14}/> {userData.address}, {userData.origin}</div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 tracking-[2px] uppercase mb-1.5 block">Gender Classification</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded p-3 text-xs text-white/50 cursor-not-allowed flex items-center gap-2"><User size={14}/> {userData.gender}</div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#B026FF] to-[#00E3FD] text-white font-grotesk font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(176,38,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} /> {isLoading ? "PROCESSING CHANGE PACKAGE..." : "Save Parameters"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}