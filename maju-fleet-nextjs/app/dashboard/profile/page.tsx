"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, AlertCircle, CheckCircle2, Lock, RefreshCw, HelpCircle, X } from "lucide-react";
import UserNavbar from "@/components/usernavbar";
// Import Server Actions resmi profil dari backend actions.ts
import { getCurrentSession, getUserProfile, updateUserProfile } from "@/app/lib/actions";

function ProfileSkeleton() {
  return (
    <main className="flex-1 py-10 px-6 md:px-10 relative overflow-hidden animate-pulse">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B026FF]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BDF4FF]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1000px] mx-auto relative z-10">
        <div className="mb-10 border-b border-white/5 pb-6">
          <div className="h-10 w-72 bg-white/10 rounded mb-4"></div>
          <div className="h-4 w-96 bg-white/5 rounded"></div>
        </div>

        <div className="bg-[#121317]/40 border border-white/5 rounded-xl p-6 md:p-10">
          <div className="mb-10">
            <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-14 bg-white/5 rounded"></div>
              <div className="h-14 bg-white/5 rounded"></div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex justify-end">
            <div className="h-12 w-48 bg-[#B026FF]/20 border border-[#B026FF]/30 rounded"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // 💡 STATE UTAMA HALAMAN
  const [formData, setFormData] = useState({
    role: "",
    email: "",
    name: "",
    phone: "",
    gender: "",
    age: "",
    origin: "",
    address: "",
    password: ""
  });

  // 💡 STATE POP-UP MODAL PASSWORD BARU
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto dismiss toast notification
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sinkronisasi data session dan load database user secara real-time
  useEffect(() => {
    async function loadUserProfileData() {
      try {
        const session = await getCurrentSession();
        if (session) {
          setUserId(session.id);
          const res = await getUserProfile(session.id);
          if (res.success && res.user) {
            const u = res.user as any; 
            setFormData({
              role: u.role ? u.role.toUpperCase() : "CUSTOMER",
              email: u.email || "",
              name: u.name || "",
              phone: u.phone || "",
              gender: u.gender || "",
              age: u.age ? String(u.age) : "",
              origin: u.origin || "",
              address: u.address || "",
              password: u.password || ""
            });
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi terminal profil:", err);
      } finally {
        setIsPageLoading(false);
      }
    }
    loadUserProfileData();
  }, []);

  // Handler simpan data umum (Nama & Alamat)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setFormErrors({});
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Full name cannot be left blank.";
      isValid = false;
    }

    if (!isValid) {
      setFormErrors(errors);
      setToast({ type: "error", text: "Please review the marked invalid parameters." });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateUserProfile(userId, {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        age: formData.age ? Number(formData.age) : 0,
        origin: formData.origin,
        address: formData.address,
        password: formData.password // Tetap meloloskan password lama jika tidak diganti via modal
      });

      if (res.success) {
        setToast({ type: "success", text: "Profile manifest updated successfully!" });
      } else {
        setToast({ type: "error", text: res.message || "Failed to update profile." });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", text: "Terminal network failure to database server." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi khusus untuk memproses update ganti password dari pop-up modal
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!userId) return;

    if (!passwordData.newPassword.trim()) {
      setPasswordError("New password cannot be left blank.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateUserProfile(userId, {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        age: formData.age ? Number(formData.age) : 0,
        origin: formData.origin,
        address: formData.address,
        password: passwordData.newPassword // Kirim password kustom baru ke database Neon
      });

      if (res.success) {
        setFormData({ ...formData, password: passwordData.newPassword });
        setShowPasswordModal(false);
        setToast({ type: "success", text: "Account credentials key secure updated!" });
      } else {
        setPasswordError(res.message || "Failed to alter account credentials key.");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Terminal network failure to submit password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#121317]/90 border rounded px-10 py-3 text-white font-inter text-[13px] placeholder-white/20 focus:outline-none transition-all";
  const lockedInputClass = "w-full bg-[#16171d]/50 border border-white/5 rounded px-10 py-3 text-white/40 font-mono text-[13px] focus:outline-none cursor-not-allowed select-none";
  const labelClass = "text-white/40 font-mono text-[10px] uppercase tracking-[2px] mb-2 block font-bold";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-70";

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col relative overflow-x-hidden">
      <UserNavbar />

      {/* === NOTIFIKASI FLOATING TOAST SYSTEM === */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -10, x: "-50%" }}
            className={`fixed top-24 left-1/2 z-[100] w-full max-w-[400px] border p-4 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-3 bg-[#0d0d11]/95 ${toast.type === "success" ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400"}`}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-mono text-[12px] uppercase tracking-wide flex-1">{toast.text}</span>
            <button onClick={() => setToast(null)} className="opacity-40 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isPageLoading ? (
        <ProfileSkeleton />
      ) : (
        <main className="flex-1 py-10 px-6 md:px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B026FF]/5 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="max-w-[800px] mx-auto relative z-10">
            <div className="mb-8 border-b border-white/5 pb-6 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-white font-grotesk font-bold text-3xl uppercase tracking-[-1px]">
                  ACCOUNT <span className="text-[#B026FF]">PROFILE</span>
                </h1>
                <p className="text-white/50 font-inter text-[14px] mt-1">
                  Manage your profile details.
                </p>
              </div>
              
              {/* 💡 FIXED BADGE ROLE: Memasang kembali pembungkus visual role keamanan akun */}
            </div>

            <form onSubmit={handleSubmit} noValidate className="bg-[#121317]/40 backdrop-blur-sm border border-white/5 p-6 md:p-8 rounded-2xl shadow-2xl space-y-8">
              
              {/* SECTION 1: SYSTEM KEYS (LOCKED READ-ONLY) */}
              <div className="space-y-4">
                <h3 className="text-white/80 font-grotesk text-[13px] uppercase tracking-[2px] font-bold border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <Lock size={14} className="text-white/40"/> 1. Account Details
                </h3>
                
                <div className="w-full">
                  <label className={labelClass}>Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input type="text" readOnly value={formData.email} className={lockedInputClass} />
                  </div>
                </div>
              </div>

              {/* SECTION 2: EDITABLE PROFILE PARAMETERS */}
              <div className="space-y-5">
                <h3 className="text-[#B026FF] font-grotesk text-[13px] uppercase tracking-[2px] font-bold border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <User size={14}/> 2. Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* EDITABLE: Nama Lengkap */}
                  <div>
                    <label className={labelClass}>Full Name / Corporation</label>
                    <div className="relative">
                      <User size={14} className={iconClass} />
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`${inputClass} ${formErrors.name ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#B026FF]"}`} placeholder="e.g. Nicholas Juan" />
                    </div>
                    {formErrors.name && <p className="text-red-400 text-[11px] font-mono mt-1.5">✕ {formErrors.name}</p>}
                  </div>
                  
                  {/* LOCKED: Nomor Telepon */}
                  <div>
                    <label className={labelClass}>Contact Number</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="text" readOnly value={formData.phone || "Not Configured"} className={lockedInputClass} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* LOCKED: Gender */}
                  <div>
                    <label className={labelClass}>Gender</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="text" readOnly value={formData.gender ? formData.gender.toUpperCase() : "Not Specified"} className={lockedInputClass} />
                    </div>
                  </div>
                  
                  {/* LOCKED: Umur */}
                  <div>
                    <label className={labelClass}>Age (Years)</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="text" readOnly value={formData.age || "Not Configured"} className={lockedInputClass} />
                    </div>
                  </div>
                  
                  {/* LOCKED: Pelabuhan Asal */}
                  <div>
                    <label className={labelClass}>Origin Port</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="text" readOnly value={formData.origin || "Not Configured"} className={lockedInputClass} />
                    </div>
                  </div>
                </div>

                {/* EDITABLE: Alamat Gudang */}
                <div>
                  <label className={labelClass}>Address</label>
                  <div className="relative">
                    <MapPin size={14} className={iconClass} />
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`${inputClass} border-white/10 focus:border-[#B026FF]`} placeholder="Detailed warehouse address..." />
                  </div>
                </div>
              </div>

              {/* ACTION UTAMA */}
              <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button 
                  type="button"
                  onClick={() => { setPasswordData({ newPassword: "", confirmPassword: "" }); setPasswordError(""); setShowPasswordModal(true); }}
                  className="w-full sm:w-auto bg-transparent border border-[#B026FF]/40 hover:bg-[#B026FF]/10 text-[#E5B5FF] px-6 py-3 rounded-xl font-grotesk font-bold text-[12px] uppercase tracking-[2px] transition-all flex items-center justify-center gap-2"
                >
                  <Lock size={14} /> Change Current Password
                </button>

                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-[#B026FF] hover:bg-[#9a1ce6] text-white px-10 py-3.5 rounded-xl font-grotesk font-bold text-[14px] uppercase tracking-[2px] transition-all shadow-[0_0_30px_rgba(176,38,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>

            </form>
          </div>
        </main>
      )}

      {/* === MODAL POP-UP OVERLAY GANTI PASSWORD === */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPasswordModal(false)} className="fixed inset-0 cursor-pointer" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="relative w-full max-w-[400px] bg-[#0d0d11] border border-[#B026FF]/30 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(176,38,255,0.15)] z-10"
            >
              <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <div className="absolute top-0 left-0 w-full h-[4px] bg-[#B026FF]" />

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center bg-[#B026FF]/10 text-[#E5B5FF] p-2.5 rounded-full mb-2 border border-[#B026FF]/20">
                  <Lock size={20} />
                </div>
                <h3 className="font-grotesk font-bold text-[18px] text-white tracking-[1px] uppercase">Update Password</h3>
                <p className="text-white/40 font-mono text-[9px] uppercase tracking-[2px] mt-0.5">Maju Fleet Credentials</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>New Secret Password</label>
                  <div className="relative">
                    <Lock size={14} className={iconClass} />
                    <input 
                      type="password" 
                      required
                      value={passwordData.newPassword} 
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                      className={inputClass} 
                      placeholder="Type new secure key..." 
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <div className="relative">
                    <Lock size={14} className={iconClass} />
                    <input 
                      type="password" 
                      required
                      value={passwordData.confirmPassword} 
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                      className={inputClass} 
                      placeholder="Re-type new secure key..." 
                    />
                  </div>
                </div>

                {passwordError && (
                  <p className="text-red-400 text-[11px] font-mono mt-2">✕ {passwordError}</p>
                )}

                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setShowPasswordModal(false)} 
                    className="flex-1 py-3 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-mono text-[11px] font-bold tracking-[1px] uppercase transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-[#B026FF] hover:bg-[#9a1ce6] text-white rounded-xl font-mono text-[11px] font-bold tracking-[1px] uppercase shadow-[0_0_20px_rgba(176,38,255,0.2)] transition-all flex justify-center items-center"
                  >
                    {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : "Confirm"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}