"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Mail, Shield, ToggleLeft, Phone, MapPin, 
  Calendar, CheckCircle, AlertCircle, Save, ArrowLeft, X, Lock, KeyRound, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/adminnavbar";

// IMPORT ACTIONS KITA
import { updateUserProfile, changeUserPassword } from "../../lib/actions";

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
  const [phone, setPhone] = useState(MOCK_USER.phone);
  const [address, setAddress] = useState(MOCK_USER.address);
  
  // ✅ STATES UNTUK MODAL PASSWORD INTERAKTIF (image_381b7a.png)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [userData] = useState(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  const isFormDirty = useMemo(() => {
    return (
      name !== MOCK_USER.name ||
      phone !== MOCK_USER.phone ||
      address !== MOCK_USER.address
    );
  }, [name, phone, address]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = "Unsaved change packages detected.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFormDirty]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleBackNavigation = () => {
    if (isFormDirty) {
      setShowLeaveModal(true);
    } else {
      router.back();
    }
  };

  // ✅ FUNGSI SUBMIT UNTUK MODAL UPDATE PASSWORD (SAMBUNG DATABASE)
  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrors({});

    let errors: Record<string, string> = {};
    if (!oldPassword) errors.oldPassword = "Current password is required.";
    if (!newPassword) errors.newPassword = "New secure key cannot be empty.";
    if (newPassword && newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters.";
    if (newPassword !== confirmPassword) errors.confirmPassword = "Security tokens mapping mismatch.";

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await changeUserPassword(userData.id, { oldPassword, newPassword });
      if (result.success) {
        setToast({ type: "success", title: "CREDENTIALS UPDATED", message: result.message });
        // Reset state modal
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordModal(false);
      } else {
        setToast({ type: "error", title: "SECURITY FAULT", message: result.message });
      }
    } catch (err) {
      setToast({ type: "error", title: "WRITE FAULT", message: "Failed to compile security streams." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    let errors: Record<string, string> = {};
    if (!name) errors.name = "Profile name parameter cannot be empty.";
    if (!phone) errors.phone = "Contact node parameter cannot be empty.";
    if (!address) errors.address = "Operational base location cannot be empty.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setToast({ type: "error", title: "VALIDATION FAULT", message: "Incomplete parameters detected." });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUserProfile(userData.id, { name, phone, address });
      if (result.success) {
        setToast({ type: "success", title: "CORE SYNCHRONIZED", message: result.message });
        MOCK_USER.name = name;
        MOCK_USER.phone = phone;
        MOCK_USER.address = address;
      } else {
        setToast({ type: "error", title: "WRITE FAULT", message: result.message });
      }
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

      {/* CUSTOM LEAVE MODAL GUARD */}
      <AnimatePresence>
        {showLeaveModal && (
          <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0c0d12] border border-[#FF3B30]/30 w-full max-w-[450px] rounded-xl p-6 shadow-[0_0_50px_rgba(255,59,48,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-[#FF3B30]" />
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-[#FF3B30]/10 rounded-lg shrink-0"><AlertCircle className="text-[#FF3B30]" size={24} /></div>
                <div>
                  <h3 className="font-mono text-xs font-bold tracking-[3px] text-[#FF3B30] uppercase mb-2">UNCOMMITTED CHANGES</h3>
                  <p className="text-white/80 text-[13px] leading-relaxed mb-6 font-inter">You have unsaved configuration parameters in your matrix profile. Leaving now will clear all current input streams. Are you sure you want to discard changes?</p>
                  <div className="flex justify-end gap-3 font-mono text-[11px] tracking-widest uppercase">
                    <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2.5 border border-white/10 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors">Stay on Node</button>
                    <button type="button" onClick={() => { setShowLeaveModal(false); router.back(); }} className="px-5 py-2.5 bg-[#FF3B30] text-white font-bold rounded-md hover:bg-[#FF3B30]/90 transition-colors shadow-[0_0_15px_rgba(255,59,48,0.3)]">Discard Changes</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✅ POPUP MODAL GANTI PASSWORD PREMIUM (100% IDENTIK DENGAN image_381b7a.png) */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-[#0b0c10] border border-white/5 w-full max-w-[440px] rounded-2xl p-8 shadow-[0_0_60px_rgba(176,38,255,0.12)] relative"
            >
              {/* Garis ungu neon di atas modal */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-[#B026FF]" />
              
              {/* Tombol X pojok kanan atas */}
              <button type="button" onClick={() => setShowPasswordModal(false)} className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"><X size={18} /></button>

              <form onSubmit={handleUpdatePasswordSubmit} className="flex flex-col items-center w-full">
                {/* Lingkaran Gembok */}
                <div className="w-14 h-14 rounded-full bg-[#B026FF]/5 border border-[#B026FF]/20 flex items-center justify-center text-[#E5B5FF] mb-4 shadow-[0_0_20px_rgba(176,38,255,0.1)]">
                  <Lock size={20} />
                </div>

                <h3 className="font-grotesk font-bold text-white text-xl tracking-[1px] text-center uppercase">Update Password</h3>
                <p className="text-white/30 font-mono text-[9px] tracking-[3px] text-center uppercase mt-1 mb-8">Maju Fleet Credentials</p>

                {/* INPUT FIELD 1: PASSWORD LAMA */}
                <div className="w-full mb-5">
                  <label className="text-[9px] font-bold text-white/40 tracking-[2px] uppercase mb-2 block font-mono">Current Access Password</label>
                  <div className="relative flex items-center bg-[#111216] border border-white/10 rounded-xl px-4 focus-within:border-[#B026FF]/50 transition-all">
                    <Lock size={14} className="text-white/30 shrink-0" />
                    <input 
                      type={showOldPass ? "text" : "password"} 
                      value={oldPassword} 
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Type old secure key..." 
                      className="w-full bg-transparent border-none py-3.5 px-3 text-sm text-white focus:outline-none placeholder-white/20 font-mono"
                    />
                    <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="text-white/20 hover:text-[#B026FF] transition-colors">{showOldPass ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                  </div>
                  {modalErrors.oldPassword && <p className="text-[#FF3B30] text-[10px] font-mono mt-1 flex items-center gap-1"><AlertCircle size={10}/> {modalErrors.oldPassword}</p>}
                </div>

                {/* INPUT FIELD 2: NEW SECRET PASSWORD */}
                <div className="w-full mb-5">
                  <label className="text-[9px] font-bold text-white/40 tracking-[2px] uppercase mb-2 block font-mono">New Password</label>
                  <div className="relative flex items-center bg-[#111216] border border-white/10 rounded-xl px-4 focus-within:border-[#B026FF]/50 transition-all">
                    <Lock size={14} className="text-white/30 shrink-0" />
                    <input 
                      type={showNewPass ? "text" : "password"} 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Type new secure key..." 
                      className="w-full bg-transparent border-none py-3.5 px-3 text-sm text-white focus:outline-none placeholder-white/20 font-mono"
                    />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="text-white/20 hover:text-[#B026FF] transition-colors">{showNewPass ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                  </div>
                  {modalErrors.newPassword && <p className="text-[#FF3B30] text-[10px] font-mono mt-1 flex items-center gap-1"><AlertCircle size={10}/> {modalErrors.newPassword}</p>}
                </div>

                {/* INPUT FIELD 3: CONFIRM NEW PASSWORD */}
                <div className="w-full mb-8">
                  <label className="text-[9px] font-bold text-white/40 tracking-[2px] uppercase mb-2 block font-mono">Confirm New Password</label>
                  <div className="relative flex items-center bg-[#111216] border border-white/10 rounded-xl px-4 focus-within:border-[#B026FF]/50 transition-all">
                    <Lock size={14} className="text-white/30 shrink-0" />
                    <input 
                      type={showConfirmPass ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new secure key..." 
                      className="w-full bg-transparent border-none py-3.5 px-3 text-sm text-white focus:outline-none placeholder-white/20 font-mono"
                    />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="text-white/20 hover:text-[#B026FF] transition-colors">{showConfirmPass ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                  </div>
                  {modalErrors.confirmPassword && <p className="text-[#FF3B30] text-[10px] font-mono mt-1 flex items-center gap-1"><AlertCircle size={10}/> {modalErrors.confirmPassword}</p>}
                </div>

                {/* TOMBOL AKSI BAWAH */}
                <div className="flex gap-4 w-full font-mono text-[11px] font-bold tracking-[2px] uppercase">
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-3.5 border border-white/5 bg-[#121317] rounded-xl text-white/50 hover:text-white transition-all">Cancel</button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-3.5 bg-[#B026FF] text-white rounded-xl hover:opacity-90 shadow-[0_0_20px_rgba(176,38,255,0.3)] transition-all">Confirm</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[1000px] mx-auto flex-1 mt-6">
        
        {/* BACK ACTION */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <button type="button" onClick={handleBackNavigation} className="flex items-center gap-2 text-xs font-mono tracking-widest text-white/40 hover:text-[#E5B5FF] transition-colors uppercase"><ArrowLeft size={14} /> Back to Dashboard</button>
          <span className="text-[10px] font-mono text-white/20 tracking-widest uppercase">ID NODE: System-701X-{userData.id}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: IDENTITY CARD */}
          <div className="bg-[#121317] border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-[#B026FF]/20 to-[#00E3FD]/20 opacity-30 blur-xl pointer-events-none" />
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#B026FF] to-[#00E3FD] p-[3px] mb-4 shadow-[0_0_30px_rgba(176,38,255,0.3)]">
              <div className="w-full h-full rounded-full bg-[#0a0a0c] flex items-center justify-center"><User size={36} className="text-[#E5B5FF]" /></div>
            </div>

            <h3 className="font-grotesk font-bold text-lg uppercase tracking-[1px] text-white">{name || "Commander"}</h3>
            <p className="font-mono text-[10px] text-[#00E3FD] tracking-widest uppercase mt-1 mb-6">{userData.role}</p>
            
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
            <h2 className="font-grotesk font-bold text-xl tracking-[2px] uppercase text-[#E5B5FF] mb-8 border-b border-white/5 pb-4">Profile Parameters</h2>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6" noValidate>              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-white/40 tracking-[3px] uppercase mb-2 block font-mono">Full Name <span className="text-[#B026FF]">*</span></label>
                  <div className="relative">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ENTER FULL NAME" className={`w-full bg-[#0a0a0c] border rounded px-4 py-3 text-sm font-medium text-white focus:outline-none transition-colors uppercase font-mono tracking-wide ${formErrors.name ? "border-[#FF3B30] focus:border-[#FF3B30]" : "border-white/10 focus:border-[#B026FF]"}`} />
                  </div>
                  {formErrors.name && <p className="text-[#FF3B30] text-[10px] font-mono mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {formErrors.name}</p>}
                </div>
                <div>

                  <label className="text-[10px] font-bold text-white/40 tracking-[3px] uppercase mb-2 block font-mono">Contact Node (Phone) <span className="text-[#B026FF]">*</span></label>

                  <div className="relative">

                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ENTER PHONE NUMBER" className={`w-full bg-[#0a0a0c] border rounded px-4 py-3 text-sm font-medium text-white focus:outline-none transition-colors font-mono tracking-wide ${formErrors.phone ? "border-[#FF3B30] focus:border-[#FF3B30]" : "border-white/10 focus:border-[#B026FF]"}`} />

                  </div>

                  {formErrors.phone && <p className="text-[#FF3B30] text-[10px] font-mono mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {formErrors.phone}</p>}

                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-white/40 tracking-[3px] uppercase mb-2 block font-mono">Operational Base Location (Address) <span className="text-[#B026FF]">*</span></label>
                  <div className="relative">
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ENTER BASE LOGISTICS ADDRESS" className={`w-full bg-[#0a0a0c] border rounded px-4 py-3 text-sm font-medium text-white focus:outline-none transition-colors font-mono tracking-wide ${formErrors.address ? "border-[#FF3B30] focus:border-[#FF3B30]" : "border-white/10 focus:border-[#B026FF]"}`} />
                  </div>
                  {formErrors.address && <p className="text-[#FF3B30] text-[10px] font-mono mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {formErrors.address}</p>}
                </div>
              </div>

              {/* SEKSI 2: RESTRICTED SECTION (Read Only) */}
              <div className="mt-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-bold text-white/30 tracking-[3px] uppercase font-mono">System Restricted Core Parameters (Read Only)</p>
                  <span className="text-[8px] font-mono bg-white/5 text-[#00E3FD] border border-white/10 px-1.5 py-0.5 rounded flex items-center gap-1"><Lock size={10}/> ID LOCKED</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono">
                  <div>
                    <label className="text-[9px] text-white/30 tracking-[2px] uppercase mb-1.5 block">Account Matrix (Email ID)</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded p-3 text-xs text-white/40 cursor-not-allowed flex items-center gap-2 select-none"><Mail size={14}/> {email}</div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 tracking-[2px] uppercase mb-1.5 block">Age Vector</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded p-3 text-xs text-white/50 cursor-not-allowed flex items-center gap-2"><Calendar size={14}/> {userData.age} Standard Years</div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 tracking-[2px] uppercase mb-1.5 block">Gender Classification</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded p-3 text-xs text-white/50 cursor-not-allowed flex items-center gap-2"><User size={14}/> {userData.gender}</div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 tracking-[2px] uppercase mb-1.5 block">Origin Node</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded p-3 text-xs text-white/50 cursor-not-allowed flex items-center gap-2"><MapPin size={14}/> {userData.origin}</div>
                  </div>
                </div>
              </div>

              {/* ✅ TOMBOL AKSI EDIT UTAMA: DIUBAH MENJADI SEJAJAR & SINKRON DENGAN image_382205.png */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-end gap-4">
                {/* Tombol Ganti Password di sebelah kiri */}
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(true)}
                  className="px-5 py-3 border border-white/10 bg-[#121317] text-white/80 font-mono text-[11px] font-bold uppercase tracking-[2px] rounded-xl hover:text-white hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-2"
                >
                  <Lock size={12} /> Change Current Password
                </button>
                
                {/* Tombol Utama Save Profile */}
                <button type="submit" disabled={isLoading} className="px-8 py-3.5 bg-gradient-to-r from-[#B026FF] to-[#00E3FD] text-white font-grotesk font-bold text-[13px] uppercase tracking-[2px] rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(176,38,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"><Save size={16} /> {isLoading ? "PROCESSING CHANGE PACKAGE..." : "Save Profile"}</button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}