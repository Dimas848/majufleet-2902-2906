"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, MapPin, Weight, Ruler, Calendar, ShieldCheck, Box, Send, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import UserNavbar from "@/components/usernavbar";
import { bookShipmentCustomer, getCurrentSession } from "@/app/lib/actions";

function BookShipmentSkeleton() {
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

export default function BookShipmentPage() {
  const router = useRouter();
  const calendarRef = useRef<HTMLDivElement>(null);
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [todayDate, setTodayDate] = useState("");

  // STATE KALENDER KUSTOM
  const [selectedDate, setSelectedDate] = useState(""); 
  const [showCalendar, setShowCalendar] = useState(false); 
  const [currentMonth, setCurrentMonth] = useState(new Date()); 

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setTodayDate(`${yyyy}-${mm}-${dd}`);

    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LOGIKA GENERATOR GRID KALENDER
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const totalDays = new Date(year, month + 1, 0).getDate(); 
  const firstDayIndex = new Date(year, month, 1).getDay(); 

  const blanks = Array(firstDayIndex).fill(null);
  const daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const currentFormElement = e.currentTarget;
    const formData = new FormData(currentFormElement);
    const newErrors: Record<string, string> = {};

    const packageType = formData.get("packageType") as string;
    const shippingDate = formData.get("shippingDate") as string; 
    const senderCity = formData.get("senderCity") as string;
    const recipientCity = formData.get("recipientCity") as string;
    const cargoDesc = formData.get("cargoDesc") as string;
    const category = formData.get("category") as string;
    const weight = parseFloat(formData.get("weight") as string) || 0;
    const length = parseFloat(formData.get("length") as string) || 0;
    const width = parseFloat(formData.get("width") as string) || 0;
    const height = parseFloat(formData.get("height") as string) || 0;

    if (!packageType) newErrors.packageType = "Please select a freight service plan.";
    if (!shippingDate) newErrors.shippingDate = "Please select a preferred shipping date.";
    if (!senderCity.trim()) newErrors.senderCity = "Please enter an origin location or port.";
    if (!recipientCity.trim()) newErrors.recipientCity = "Please enter a destination location or port.";
    if (!cargoDesc.trim()) newErrors.cargoDesc = "Please enter a description for the cargo.";
    if (!category) newErrors.category = "Please select a cargo category.";
    if (weight <= 0) newErrors.weight = "Please enter a weight greater than 0.";
    if (length <= 0) newErrors.length = "Length must be greater than 0m.";
    if (width <= 0) newErrors.width = "Width must be greater than 0m.";
    if (height <= 0) newErrors.height = "Height must be greater than 0m.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const session = await getCurrentSession();
      if (!session) {
        alert("Sesi otentikasi habis. Silakan melakukan login kembali.");
        router.push("/login");
        return;
      }
      
      const calculatedVolume = length * width * height;
      const weightUnit = formData.get("weightUnit") as string;
      const weightInKg = weightUnit === "tons" ? weight * 1000 : weight;

      const payload = {
        userId: session.id,
        packageTypeString: packageType,
        senderCity: senderCity,
        recipientCity: recipientCity,
        cargoDesc: cargoDesc,
        category: category,
        weight: weightInKg,
        dimensions: calculatedVolume
      };

      const res = await bookShipmentCustomer(payload);
      
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelectedDate("");
          currentFormElement.reset();
          router.push("/dashboard/billing");
        }, 2000);
      } else {
        alert("Gagal memproses data booking: " + res.message);
      }
    } catch (error) {
      console.error("Critical error inside form component:", error);
      alert("Terjadi kegagalan komunikasi sistem ke server.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#121317] border border-white/10 rounded px-10 py-3 text-white font-inter text-[13px] placeholder-white/30 focus:outline-none focus:border-[#B026FF] transition-colors";
  const labelClass = "text-white/80 font-grotesk text-[10px] uppercase tracking-[2px] mb-2 block";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-[#B026FF] opacity-80";
  
  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <p className="text-red-400 text-[11px] font-mono mt-1.5 flex items-center gap-1">
        <AlertCircle size={12} className="shrink-0" /> {message}
      </p>
    );
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select shipping date...";
    const [dYear, dMonth, dDay] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${parseInt(dDay)} ${months[parseInt(dMonth) - 1]} ${dYear}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col relative overflow-x-hidden">
      
      <UserNavbar />

      {isPageLoading ? (
        <BookShipmentSkeleton />
      ) : (
        <main className="flex-1 py-10 px-6 md:px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B026FF]/5 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BDF4FF]/5 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-[1000px] mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-10 border-b border-white/5 pb-6">
                <h1 className="text-white font-grotesk font-bold text-3xl md:text-4xl tracking-[-1px] uppercase mb-2">
                  BOOK NEW <span className="text-[#B026FF]">SHIPMENT</span>
                </h1>
                <p className="text-white/50 font-inter text-[14px]">
                  Fill in your cargo details below to get scheduling and logistics fleet allocation.
                </p>
              </div>

              <form onSubmit={handleBooking} noValidate className="bg-[#121317]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-10 shadow-2xl">
                
                <div className="mb-10">
                  <h3 className="text-white flex items-center gap-2 font-grotesk text-[14px] uppercase tracking-[2px] mb-6 pb-2 border-b border-white/10">
                    <Box size={16} className="text-[#B026FF]" /> 1. Service Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Freight Service Plan</label>
                      <div className="relative">
                        <ShieldCheck size={16} className={iconClass} />
                        <select name="packageType" defaultValue="" className={`${inputClass} pl-10 appearance-none ${errors.packageType ? "border-red-500/50" : ""}`}>
                          <option value="" disabled>Select service plan...</option>
                          <option value="economy">Maju Economy (Cost-Optimized)</option>
                          <option value="standard">Maju Standard (Standard Container)</option>
                          <option value="heavy">Maju Heavy (Industrial Cargo)</option>
                          <option value="express">Maju Express (Time-Critical)</option>
                          <option value="vip">Maju VIP (Dedicated Care)</option>
                        </select>
                      </div>
                      <ErrorMessage message={errors.packageType} />
                    </div>
                    
                    {/* KALENDER KUSTOM DENGAN SELECT DROPDOWN BULAN & TAHUN */}
                    <div className="relative" ref={calendarRef}>
                      <label className={labelClass}>Preferred Shipping Date</label>
                      <div 
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={`${inputClass} cursor-pointer relative flex items-center ${selectedDate ? "text-white" : "text-white/30"} ${errors.shippingDate ? "border-red-500/50" : ""}`}
                      >
                        <Calendar size={16} className={iconClass} />
                        {formatDisplayDate(selectedDate)}
                      </div>
                      
                      <input type="hidden" name="shippingDate" value={selectedDate} />
                      <ErrorMessage message={errors.shippingDate} />

                      {/* Floating UI Kalender */}
                      <AnimatePresence>
                        {showCalendar && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 mt-2 w-[330px] bg-[#0d0d11] border border-white/10 rounded-xl p-4 shadow-2xl right-0 md:left-0 text-white"
                          >
                            {/* Header Navigasi Menggunakan Pilihan Dropdown Drop-select */}
                            <div className="flex justify-between items-center mb-4 gap-2">
                              <button 
                                type="button"
                                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                                className="p-1 hover:bg-white/5 rounded text-white/60 hover:text-white transition-colors shrink-0"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              
                              {/* 💡 UPDATE TERBARU: Dropdown Seleksi Bulan & Tahun */}
                              <div className="flex items-center gap-1.5 flex-1 justify-center">
                                {/* Pilihan Bulan */}
                                <select 
                                  value={month} 
                                  onChange={(e) => setCurrentMonth(new Date(year, parseInt(e.target.value), 1))}
                                  className="bg-[#121317] text-white border border-white/10 rounded px-2 py-1 font-grotesk text-xs uppercase cursor-pointer focus:outline-none focus:border-[#B026FF] appearance-none text-center"
                                >
                                  {monthNames.map((mName, idx) => (
                                    <option key={mName} value={idx} className="bg-[#0d0d11]">{mName.substring(0, 3)}</option>
                                  ))}
                                </select>

                                {/* Pilihan Tahun (Menyediakan opsi tahun ini hingga +5 tahun ke depan) */}
                                <select 
                                  value={year} 
                                  onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), month, 1))}
                                  className="bg-[#121317] text-white border border-white/10 rounded px-2 py-1 font-grotesk text-xs cursor-pointer focus:outline-none focus:border-[#B026FF] appearance-none text-center"
                                >
                                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                                    <option key={y} value={y} className="bg-[#0d0d11]">{y}</option>
                                  ))}
                                </select>
                              </div>

                              <button 
                                type="button"
                                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                                className="p-1 hover:bg-white/5 rounded text-white/60 hover:text-white transition-colors shrink-0"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>

                            {/* Nama-Nama Hari */}
                            <div className="grid grid-cols-7 text-center gap-1 mb-2">
                              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
                                <span key={dayName} className="text-white/30 font-mono text-[11px] font-bold uppercase">{dayName}</span>
                              ))}
                            </div>

                            {/* Grid Angka Hari Tanpa Trailing Angka Bulan Depan */}
                            <div className="grid grid-cols-7 text-center gap-1 text-[12px] font-inter">
                              {blanks.map((_, idx) => (
                                <div key={`blank-start-${idx}`} className="h-8" />
                              ))}

                              {daysInMonth.map((day) => {
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isPast = dateStr < todayDate;
                                const isSelected = selectedDate === dateStr;

                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => {
                                      setSelectedDate(dateStr);
                                      setShowCalendar(false);
                                    }}
                                    className={`h-8 w-8 mx-auto rounded flex items-center justify-center font-mono transition-all
                                      ${isPast ? "text-white/10 cursor-not-allowed" : "text-white/80 hover:bg-[#B026FF]/20 hover:text-white"}
                                      ${isSelected ? "!bg-[#B026FF] !text-white font-bold shadow-[0_0_10px_rgba(176,38,255,0.5)]" : ""}
                                    `}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-white flex items-center gap-2 font-grotesk text-[14px] uppercase tracking-[2px] mb-6 pb-2 border-b border-white/10">
                    <MapPin size={16} className="text-[#B026FF]" /> 2. Shipping Route
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Origin (Pickup Location/Port)</label>
                      <div className="relative">
                        <MapPin size={16} className={iconClass} />
                        <input name="senderCity" type="text" placeholder="e.g. Jakarta, Indonesia" className={`${inputClass} pl-10 ${errors.senderCity ? "border-red-500/50" : ""}`} />
                      </div>
                      <ErrorMessage message={errors.senderCity} />
                    </div>
                    <div>
                      <label className={labelClass}>Destination (Drop-off Location/Port)</label>
                      <div className="relative">
                        <MapPin size={16} className={`${iconClass} text-[#BDF4FF]`} />
                        <input name="recipientCity" type="text" placeholder="e.g. Singapore Port" className={`${inputClass} pl-10 ${errors.recipientCity ? "border-red-500/50" : ""}`} />
                      </div>
                      <ErrorMessage message={errors.recipientCity} />
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-white flex items-center gap-2 font-grotesk text-[14px] uppercase tracking-[2px] mb-6 pb-2 border-b border-white/10">
                    <Package size={16} className="text-[#B026FF]" /> 3. Cargo Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className={labelClass}>Cargo Description</label>
                      <div className="relative">
                        <Package size={16} className={iconClass} />
                        <input name="cargoDesc" type="text" placeholder="What are you shipping?" className={`${inputClass} pl-10 ${errors.cargoDesc ? "border-red-500/50" : ""}`} />
                      </div>
                      <ErrorMessage message={errors.cargoDesc} />
                    </div>
                    <div>
                      <label className={labelClass}>Cargo Type</label>
                      <div className="relative">
                        <select name="category" defaultValue="" className={`${inputClass} px-4 appearance-none ${errors.category ? "border-red-500/50" : ""}`}>
                          <option value="" disabled>Select cargo category...</option>
                          <option value="general">General Goods (Dry)</option>
                          <option value="hazardous">Hazardous / Chemicals</option>
                          <option value="perishable">Perishable (Needs Cold Storage)</option>
                          <option value="fragile">Fragile / Electronics</option>
                          <option value="oversized">Oversized Machinery</option>
                        </select>
                      </div>
                      <ErrorMessage message={errors.category} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <label className={labelClass}>Total Weight</label>
                      <div className="relative">
                        <Weight size={16} className={iconClass} />
                        <input name="weight" type="number" placeholder="0.0" className={`${inputClass} pl-10 pr-20 ${errors.weight ? "border-red-500/50" : ""}`} />
                        <div className="absolute right-1 top-1 bottom-1 flex items-center">
                          <select name="weightUnit" className="h-full bg-[#1a1b20] border-l border-white/10 rounded-r px-3 text-white/80 font-inter text-[11px] uppercase tracking-wider focus:outline-none cursor-pointer">
                            <option value="kg">KG</option>
                            <option value="tons">Tons</option>
                          </select>
                        </div>
                      </div>
                      <ErrorMessage message={errors.weight} />
                    </div>
                    <div className="md:col-span-3 grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Length (m)</label>
                        <div className="relative">
                          <Ruler size={16} className={iconClass} />
                          <input name="length" type="number" placeholder="L" className={`${inputClass} pl-10 ${errors.length ? "border-red-500/50" : ""}`} />
                        </div>
                        <ErrorMessage message={errors.length} />
                      </div>
                      <div>
                        <label className={labelClass}>Width (m)</label>
                        <div className="relative">
                          <Ruler size={16} className={iconClass} />
                          <input name="width" type="number" placeholder="W" className={`${inputClass} pl-10 ${errors.width ? "border-red-500/50" : ""}`} />
                        </div>
                        <ErrorMessage message={errors.width} />
                      </div>
                      <div>
                        <label className={labelClass}>Height (m)</label>
                        <div className="relative">
                          <Ruler size={16} className={iconClass} />
                          <input name="height" type="number" placeholder="H" className={`${inputClass} pl-10 ${errors.height ? "border-red-500/50" : ""}`} />
                        </div>
                        <ErrorMessage message={errors.height} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                  {Object.keys(errors).length > 0 && (
                    <div className="p-4 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle size={16} /> Missing Fields. Failed to Process Booking.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full md:w-auto px-10 py-4 rounded bg-[#B026FF] hover:bg-[#9a1ce6] text-white font-grotesk font-bold text-[14px] uppercase tracking-[2px] transition-all duration-300 flex items-center justify-center gap-3 ml-auto"
                    style={{
                      boxShadow: success ? "0 0 20px rgba(16,185,129,0.3)" : "0 0 20px rgba(176,38,255,0.3)",
                      background: success ? "#10B981" : loading ? "#7a1aaa" : "linear-gradient(90deg, #B026FF, #4E0078)",
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">Processing Booking...</span>
                    ) : success ? (
                      <span className="flex items-center gap-2">Booking Confirmed!</span>
                    ) : (
                      <span className="flex items-center gap-2">Submit Request <Send size={16} /></span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </main>
      )}
    </div>
  );
}