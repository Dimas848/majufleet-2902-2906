"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, Lock, Eye, EyeOff, RefreshCw, ShieldAlert, ArrowLeft, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginCustomer, registerCustomer, loginAdmin } from "../app/lib/actions";

const links = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Services", href: "/services" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mainMenuDropdown, setMainMenuDropdown] = useState(false);
  const [activeModal, setActiveModal] = useState<"none" | "login" | "register" | "admin">("none");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  
  // FORM STATES
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const [adminId, setAdminId] = useState("");
  const [adminKey, setAdminKey] = useState("");

  const [captchaCode, setCaptchaCode] = useState("");
  
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    generateCaptcha();
    
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getPasswordStrength = (pwd: string) => {
    let str = 0;
    if (pwd.length > 0) str += 25;
    if (pwd.length >= 8) str += 25;
    if (/[0-9]/.test(pwd)) str += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) str += 25;
    return str;
  };

  const strength = getPasswordStrength(regPassword);
  let strengthColor = "bg-gray-600";
  if (strength === 25) strengthColor = "bg-red-500";
  else if (strength === 50) strengthColor = "bg-orange-500";
  else if (strength === 75) strengthColor = "bg-yellow-400";
  else if (strength === 100) strengthColor = "bg-green-500";

  // ==========================================
  // 1. HANDLER LOGIN CUSTOMER (WITH ENGLISH TRANSLATION)
  // ==========================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await loginCustomer(loginEmail, loginPassword);
      if (res && res.success) {
        setLoading(false);
        setActiveModal("none");
        resetFormStates();
        router.push("/dashboard/bookship");
      } else {
        // 🔄 MENGUBAH RESPON BAHASA INDONESIA KE BAHASA INGGRIS UNTUK DOSEN
        let rawMessage = res?.message || "INVALID USERNAME OR PASSWORD.";
        if (rawMessage.includes("tidak ditemukan") || rawMessage.includes("bukan akun Customer")) {
          rawMessage = "EMAIL NOT FOUND OR INVALID CUSTOMER ACCOUNT.";
        } else if (rawMessage.includes("salah") || rawMessage.includes("Password yang Anda masukkan salah")) {
          rawMessage = "INCORRECT PASSWORD. PLEASE TRY AGAIN.";
        }
        setErrorMsg(rawMessage.toUpperCase());
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("CONNECTION FAULT TO NEON SERVER.");
      setLoading(false);
    }
  };

  // ==========================================
  // 2. HANDLER REGISTER CUSTOMER
  // ==========================================
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (regPassword !== regConfirm) {
      setErrorMsg("PASSWORDS DO NOT MATCH.");
      return;
    }

    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg("INVALID CAPTCHA CODE.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerCustomer({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        address: ""
      });

      if (res && res.success) {
        setLoading(false);
        alert(`Your username "${regEmail}" has been registered successfully! Please sign in using your credentials.`);
        switchModal("login"); 
      } else {
        setErrorMsg(res?.message || "REGISTRATION FAILED.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("CONNECTION FAULT TO DATABASE SERVER.");
      setLoading(false);
    }
  };

  // ==========================================
  // 3. HANDLER LOGIN ADMIN OVERRIDE
  // ==========================================
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await loginAdmin(adminId, adminKey);
      if (res && res.success) {
        setLoading(false);
        setActiveModal("none");
        resetFormStates();
        router.push("/Dashboard-Admin/fleet");
      } else {
        setErrorMsg(res?.message || "ACCESS DENIED: CREDENTIAL INVALID.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("CONNECTION FAULT TO DATABASE SERVER.");
      setLoading(false);
    }
  };

  const resetFormStates = () => {
    setErrorMsg("");
    setLoading(false);
    setLoginEmail("");
    setLoginPassword("");
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegPassword("");
    setRegConfirm("");
    setCaptchaInput("");
    setAdminId("");
    setAdminKey("");
  };

  const switchModal = (modalType: "none" | "login" | "register" | "admin") => {
    resetFormStates();
    setActiveModal(modalType);
  };

  if (
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/Dashboard-Admin")
  ) return null;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center ${
          isScrolled 
            ? "bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/10 py-4" 
            : "bg-transparent border-transparent py-6" 
        }`}
      >
        <div className="w-full px-3 md:px-3 flex items-center justify-between">
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-4 group">
              <Image src="/logo.png" alt="Maju Fleet Logo" width={100} height={100} className="transition-transform group-hover:scale-105" />
              <span className="text-[#E5B5FF] font-grotesk font-bold text-[28px] tracking-[2px] uppercase drop-shadow-[0_0_15px_rgba(176,38,255,0.4)]">
                MAJU FLEET
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-start gap-8">
            <div className="relative">
              <button onClick={() => setMainMenuDropdown(!mainMenuDropdown)} className="flex items-center gap-2 text-white hover:text-[#E5B5FF] font-grotesk font-bold text-[18px] tracking-[1px] transition-colors mt-2">
                Main Menu {mainMenuDropdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              <AnimatePresence>
                {mainMenuDropdown && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full right-0 mt-4 w-[220px] rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl" style={{ background: "linear-gradient(180deg, rgba(30,30,35,0.9) 0%, rgba(15,15,20,0.95) 100%)", border: "1px solid rgba(176,38,255,0.3)" }}>
                    <div className="flex flex-col py-4">
                      {links.map((l) => {
                        const isActive = pathname === l.href;
                        return (
                          <Link key={l.href} href={l.href} onClick={() => setMainMenuDropdown(false)} className={`px-6 py-3 font-grotesk text-[14px] uppercase tracking-[1px] transition-all duration-200 ${isActive ? "text-[#E5B5FF] bg-white/5 border-l-4 border-[#B026FF]" : "text-white/70 hover:text-white hover:bg-white/5 border-l-4 border-transparent"}`}>
                            {l.label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <button id="login-trigger-btn" onClick={() => switchModal("login")} className="px-6 py-2.5 rounded border border-[#B026FF]/50 text-[#E5B5FF] hover:bg-[#B026FF]/10 font-grotesk font-bold text-[13px] uppercase tracking-[1px] transition-all duration-200 backdrop-blur-md" style={{ boxShadow: "0 0 15px rgba(176,38,255,0.15)" }}>
                LOGIN DASHBOARD
              </button>
            </motion.div>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden shrink-0 text-white/70 p-2 mt-1 bg-black/40 rounded backdrop-blur-md border border-white/10">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MOBILE NAVIGATION MENU */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="md:hidden mt-4 border-y border-white/10 bg-[#0a0a0c]/95 backdrop-blur-md px-6 py-4 flex flex-col gap-2 overflow-hidden">
              {links.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className={`font-grotesk text-[14px] font-bold uppercase py-3 border-b border-white/5 ${isActive ? "text-[#E5B5FF]" : "text-white/60"}`}>
                    {l.label}
                  </Link>
                );
              })}
              <button onClick={() => {setMenuOpen(false); switchModal("login");}} className="mt-4 px-6 py-3 rounded border border-[#B026FF] text-[#E5B5FF] font-grotesk font-bold text-[13px] uppercase tracking-[1px]">
                LOGIN DASHBOARD
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==========================================
          MODALS AREA
          ========================================== */}
      <AnimatePresence>
        {activeModal !== "none" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => switchModal("none")} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

            {/* 1. MODAL LOGIN CUSTOMER */}
            {activeModal === "login" && (
              <motion.div key="modal-login" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-[420px] bg-[#0a0a0c] border border-white/10 rounded-xl p-8 shadow-[0_0_50px_rgba(176,38,255,0.15)] z-10 my-auto">
                <button onClick={() => switchModal("none")} className="absolute top-4 right-4 text-white/40 hover:text-[#B026FF] transition-colors"><X size={20} /></button>
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#B026FF]/30 rounded-tl-xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#B026FF]/30 rounded-br-xl pointer-events-none" />
                <div className="flex flex-col items-center mb-6 mt-2">
                  <Image src="/logo.png" alt="Maju Fleet Logo" width={110} height={110} className="mb-0 opacity-100 drop-shadow-[0_0_15px_rgba(176,38,255,0.3)] -mr-3" />
                  <h2 className="text-white font-grotesk font-bold text-2xl tracking-[3px] uppercase mt-[-5px]">Maju Fleet</h2>
                </div>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[11px] text-center p-2.5 rounded mb-4 uppercase tracking-wide">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block">Username / Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80"><User size={16} /></div>
                      <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Enter email" className="w-full bg-[#121317] border border-[#B026FF]/30 rounded pl-12 pr-4 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                    </div>
                    {/* STATIS TANPA kedap-kedip */}
                    {errorMsg && (
                      <span className="text-[10px] font-mono text-white/40 mt-1.5 block tracking-wide">
                        💡 Example: <button type="button" onClick={() => setLoginEmail("dimju@gmail.com")} className="text-[#00E3FD] underline hover:text-white transition-colors outline-none">dimju@gmail.com</button> (Click to fill)
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block">Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80"><Lock size={16} /></div>
                      <input type={showLoginPassword ? "text" : "password"} required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Enter password" className="w-full bg-[#121317] border border-[#B026FF]/30 rounded pl-12 pr-12 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* STATIS TANPA kedap-kedip */}
                    {errorMsg && (
                      <span className="text-[10px] font-mono text-white/40 mt-1.5 block tracking-wide">
                        💡 Example: <button type="button" onClick={() => { setLoginPassword("maju123"); setShowLoginPassword(true); }} className="text-[#00E3FD] underline hover:text-white transition-colors outline-none">maju123</button> (Click to fill)
                      </span>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-3 py-3.5 rounded border border-[#B026FF]/50 bg-[#121317] hover:bg-[#B026FF]/10 hover:border-[#B026FF] text-white font-grotesk font-bold text-[13px] uppercase tracking-[2px] transition-all duration-300 disabled:opacity-50">
                    {loading ? "Authenticating..." : "System Login"}
                  </button>
                </form>
                <div className="mt-6 flex flex-col items-center gap-3 font-inter text-[12px]">
                  <p className="text-white/60">Don't have an account? <button onClick={() => switchModal("register")} className="text-[#B026FF] font-semibold hover:text-[#BDF4FF] transition-colors">Register Now</button></p>
                  <button onClick={() => switchModal("admin")} className="text-white/40 hover:text-[#BDF4FF] transition-colors uppercase tracking-[1px] text-[10px] font-grotesk mt-1">Login as Admin?</button>
                </div>
              </motion.div>
            )}

            {/* 2. MODAL REGISTER CUSTOMER */}
            {activeModal === "register" && (
              <motion.div key="modal-register" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-[420px] bg-[#0a0a0c] border border-white/10 rounded-xl p-8 shadow-[0_0_50px_rgba(176,38,255,0.15)] z-10 my-auto">
                <button onClick={() => switchModal("none")} className="absolute top-4 right-4 text-white/40 hover:text-[#B026FF] transition-colors"><X size={20} /></button>
                <button onClick={() => switchModal("login")} className="absolute top-4 left-4 text-white/40 hover:text-[#B026FF] transition-colors"><ArrowLeft size={20} /></button>
                <h2 className="text-white font-grotesk font-bold text-2xl tracking-[2px] uppercase mb-4 text-center">Register Account</h2>
                
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[11px] text-center p-2.5 rounded mb-4 uppercase tracking-wide">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block flex justify-between"><span>Full / Company Name</span></label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80"><User size={16} /></div>
                      <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. PT. Logistik Jaya" className="w-full bg-[#121317] border border-[#B026FF]/30 rounded pl-12 pr-4 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block">Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80"><Mail size={16} /></div>
                      <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Enter email address..." className="w-full bg-[#121317] border border-[#B026FF]/30 rounded pl-12 pr-4 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80"><Phone size={16} /></div>
                      <input type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="w-full bg-[#121317] border border-[#B026FF]/30 rounded pl-12 pr-4 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block">Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80"><Lock size={16} /></div>
                      <input type={showRegPassword ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required placeholder="Create password..." className="w-full bg-[#121317] border border-[#B026FF]/30 rounded pl-12 pr-12 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                      <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex-1 h-1.5 bg-[#121317] rounded-full overflow-hidden mr-3">
                        <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${strength}%` }}></div>
                      </div>
                      <span className="text-[10px] font-inter text-white/50">Strength: {strength}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80"><Lock size={16} /></div>
                      <input type={showRegConfirm ? "text" : "password"} required value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="Repeat password..." className="w-full bg-[#121317] border border-[#B026FF]/30 rounded pl-12 pr-12 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                      <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        {showRegConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px]">Captcha:</span>
                      <div className="bg-[#121317] border border-[#B026FF]/20 px-3 py-1.5 rounded font-mono text-white font-bold tracking-[2px] select-none">{captchaCode}</div>
                      <button type="button" onClick={generateCaptcha} className="text-white/40 hover:text-[#B026FF] transition-colors"><RefreshCw size={14} /></button>
                    </div>
                    <input type="text" required value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Enter captcha code" className="w-full bg-[#121317] border border-[#B026FF]/30 rounded px-4 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-3 py-3.5 rounded border border-[#B026FF]/50 bg-[#121317] hover:bg-[#B026FF]/10 hover:border-[#B026FF] text-white font-grotesk font-bold text-[13px] uppercase tracking-[2px] transition-all duration-300 disabled:opacity-50">
                    {loading ? "Processing..." : "Register"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* 3. MODAL LOGIN ADMIN / OVERRIDE */}
            {activeModal === "admin" && (
              <motion.div key="modal-admin" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-[420px] bg-[#0a0a0c] border border-[#B026FF]/25 rounded-xl p-8 shadow-[0_0_50px_rgba(176,38,255,0.15)] z-10 my-auto">
                <button onClick={() => switchModal("none")} className="absolute top-4 right-4 text-white/40 hover:text-[#B026FF] transition-colors"><X size={20} /></button>
                <button onClick={() => switchModal("login")} className="absolute top-4 left-4 text-white/40 hover:text-[#B026FF] transition-colors"><ArrowLeft size={20} /></button>
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#B026FF]/30 rounded-tl-xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#B026FF]/30 rounded-br-xl pointer-events-none" />
                <div className="flex flex-col items-center mb-6 mt-2">
                  <ShieldAlert size={48} className="mb-4 text-[#B026FF] drop-shadow-[0_0_15px_rgba(176,38,255,0.4)]" />
                  {/* REVISI JUDUL MODAL JADI LOGIN ADMINISTRATOR */}
                  <h2 className="text-white font-grotesk font-bold text-xl tracking-[4px] uppercase text-center leading-tight">LOGIN ADMINISTRATOR</h2>
                </div>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[11px] text-center p-2.5 rounded mb-4 uppercase tracking-wide">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block">USERNAME / EMAIL</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80"><User size={16} /></div>
                      <input type="text" required value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Authorized Username / Email..." className="w-full bg-[#121317] border border-[#B026FF]/30 rounded pl-12 pr-4 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                    </div>
                    {/* STATIS TANPA kedap-kedip */}
                    {errorMsg && (
                      <span className="text-[10px] font-mono text-white/40 mt-1.5 block tracking-wide">
                        💡 Example: <button type="button" onClick={() => setAdminId("rina.commander@majufleet.com")} className="text-[#00E3FD] underline hover:text-white transition-colors outline-none">rina.commander@majufleet.com</button> (Click to fill)
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block">PASSWORD</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80"><Lock size={16} /></div>
                      <input type={showAdminPassword ? "text" : "password"} required value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Password Code..." className="w-full bg-[#121317] border border-[#B026FF]/30 rounded pl-12 pr-12 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors" />
                      <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                        {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* STATIS TANPA kedap-kedip */}
                    {errorMsg && (
                      <span className="text-[10px] font-mono text-white/40 mt-1.5 block tracking-wide">
                        💡 Example: <button type="button" onClick={() => { setAdminKey("MAJUADMIN2026"); setShowAdminPassword(true); }} className="text-[#00E3FD] underline hover:text-white transition-colors outline-none">MAJUADMIN2026</button> (Click to fill)
                      </span>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-3 py-3.5 rounded border border-[#B026FF]/50 bg-[#121317] hover:bg-[#B026FF]/10 hover:border-[#B026FF] text-white font-grotesk font-bold text-[13px] uppercase tracking-[2px] transition-all duration-300 disabled:opacity-50">
                    {loading ? "Authenticating..." : "LOGIN"}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}