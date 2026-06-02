"use client";

import React, { useState, useEffect, Suspense } from "react";
import { 
  Hash, Users, MapPin, Package, RefreshCw, Briefcase, ChevronDown, 
  Search, Plus, Edit, Trash2, CheckCircle, Mail, Phone, Ship, Filter,
  AlertCircle, X, Trash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import AdminNavbar from "@/components/adminnavbar"; 

import { getAllData, saveEntity, deleteEntity } from "../../lib/actions";
type EntityType = "fleet" | "crew" | "customer" | "vessel";
type ViewMode = "table" | "form";

function AdminControlContent() {
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<EntityType>("fleet");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [fleetStatusFilter, setFleetStatusFilter] = useState("ALL");

  const [shipments, setShipments] = useState<any[]>([]);
  const [crews, setCrews] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({});
  
  // State untuk custom error handling UI internal form
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // State untuk Custom Toast Notification System
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // State untuk Custom Confirmation Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; targetId: number | null }>({
    isOpen: false,
    targetId: null
  });

  // Efek auto-dismiss untuk toast notification (menghilang otomatis dalam 4 detik)
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showNotification = (type: "success" | "error", title: string, message: string) => {
    setToast({ type, title, message });
  };

  useEffect(() => {
    const typeParam = searchParams.get("type") as EntityType;
    if (["fleet", "crew", "customer", "vessel"].includes(typeParam)) {
      setActiveTab(typeParam);
      setViewMode("table");
      setSearchQuery("");
      setFleetStatusFilter("ALL");
    }
  }, [searchParams]);

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery, fleetStatusFilter]);

  const fetchNeonData = async () => {
    setIsLoading(true);
    try {
      const dbData = await getAllData();
      
      if (dbData.shipments) {
        setShipments(dbData.shipments.map((s: any) => ({
          id: s.id,
          code: s.receipt_number || `MJF-${s.id}`,
          senderName: s.user?.name || s.senderName || "No Name",
          senderCity: s.senderCity || "Jakarta",
          recipientName: s.recipientName || "Client",
          recipientCity: s.recipientCity || "Rotterdam",
          status: s.status || "PENDING",
          ...s 
        })));
      }

      if (dbData.crews) setCrews(dbData.crews);
      if (dbData.customers) setCustomers(dbData.customers);
      if (dbData.vessels) setVessels(dbData.vessels);
    } catch (error) {
      console.error("Gagal memuat data dari database Neon:", error);
      showNotification("error", "FETCH COMPONENT ERROR", "Failed to compile latest database records stream.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNeonData();
  }, [activeTab, viewMode]);

  const generateCode = (prefix: string) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setFormData({ ...formData, code: `${prefix}-${randomNum}` });
    clearError("code");
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(activeTab === "fleet" ? { weightUnit: "KG", status: "PENDING", packageTypeId: "2", vesselId: "", captain: "" } : activeTab === "vessel" ? { capacityUnit: "TONNES" } : {});
    setFormErrors({});
    setGeneralError(null);
    setViewMode("form");
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const currentPackageId = item.items && item.items.length > 0 ? String(item.items[0].packageTypeId) : "2";
    setFormData({ ...item, packageTypeId: currentPackageId, vesselId: item.vesselId ? String(item.vesselId) : "" });
    setFormErrors({});
    setGeneralError(null);
    setViewMode("form");
  };

  // Membuka konfirmasi hapus kustom
  const openDeleteConfirmation = (id: number) => {
    setDeleteModal({ isOpen: true, targetId: id });
  };

  // Eksekusi hapus data dari database
  const executeDeleteData = async () => {
    if (!deleteModal.targetId) return;
    
    const id = deleteModal.targetId;
    setDeleteModal({ isOpen: false, targetId: null }); 
    setIsLoading(true);
    
    try {
      const result = await deleteEntity(activeTab, id) as { success: boolean; message?: string };
      if (result.success) {
        showNotification("success", "RECORD PURGED", `Data matrix sequence has been successfully deleted from database registry.`);
        fetchNeonData(); 
        setViewMode("table");
      } else {
        showNotification("error", "DELETE FAULT", result.message || "Database client rejected the deletion command token.");
      }
    } catch (error) {
      console.error("Kesalahan saat menghapus data:", error);
      showNotification("error", "NETWORK BREACH", "Cyberconnection timeout while sending deletion sequence.");
    } finally {
      setIsLoading(false);
    }
  };

  // Eksekusi simpan (Create & Update) data ke database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setGeneralError(null);

    let errors: Record<string, string> = {};

    // Validasi Form Komplit
    if (activeTab === "fleet") {
      if (!formData.vesselId) errors.vesselId = "Please select an operational vessel.";
      if (!formData.captain) errors.captain = "Please select a captain on board.";
      
      if (!formData.senderName) errors.senderName = "Please enter sender's name.";
      if (!formData.senderContact) errors.senderContact = "Please enter sender's contact.";
      if (!formData.senderEmail) {
        errors.senderEmail = "Please enter sender's email address.";
      } else if (!String(formData.senderEmail).includes("@")) {
        errors.senderEmail = "Email address must contain an '@' symbol.";
      }
      if (!formData.senderAddress) errors.senderAddress = "Please enter origin address.";
      if (!formData.senderCountry) errors.senderCountry = "Please enter origin country.";
      if (!formData.senderCity) errors.senderCity = "Please enter origin city.";

      if (!formData.recipientName) errors.recipientName = "Please enter recipient's name.";
      if (!formData.recipientContact) errors.recipientContact = "Please enter recipient's contact.";
      if (!formData.recipientEmail) {
        errors.recipientEmail = "Please enter recipient's email address.";
      } else if (!String(formData.recipientEmail).includes("@")) {
        errors.recipientEmail = "Email address must contain an '@' symbol.";
      }
      if (!formData.recipientAddress) errors.recipientAddress = "Please enter destination address.";
      if (!formData.recipientCountry) errors.recipientCountry = "Please enter destination country.";
      if (!formData.recipientCity) errors.recipientCity = "Please enter destination city.";

      if (!formData.cargoDesc) errors.cargoDesc = "Please enter a description for the cargo.";
      if (!formData.weight || parseFloat(formData.weight) <= 0) errors.weight = "Please enter a weight greater than 0.";
      if (!formData.dimensions) errors.dimensions = "Please enter cargo dimensions.";
      if (!formData.category || formData.category === " ") errors.category = "Please select a cargo category.";
    } else if (activeTab === "crew") {
      if (!formData.name) errors.name = "Please enter full name.";
      if (!formData.email) {
        errors.email = "Please enter an email address.";
      } else if (!String(formData.email).includes("@")) {
        errors.email = "Email address must contain an '@' symbol.";
      }
      if (!formData.gender) errors.gender = "Please select gender.";
      if (!formData.age || parseInt(formData.age) <= 0) errors.age = "Please enter a valid age.";
      if (!formData.role) errors.role = "Please select a specialist role.";
      if (!formData.origin) errors.origin = "Please enter origin city/country.";
      if (!formData.contact) errors.contact = "Please enter contact number.";
    } else if (activeTab === "vessel") {
      if (!formData.name) errors.name = "Please enter vessel name.";
      if (!formData.capacity || parseFloat(formData.capacity) <= 0) errors.capacity = "Please enter a valid capacity.";
      if (!formData.type) errors.type = "Please enter vessel type.";
      if (!formData.crewLead) errors.crewLead = "Please enter assigned crew lead.";
      if (!formData.status) errors.status = "Please select operational status.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setGeneralError("MISSING FIELDS. FAILED TO PROCESS DATA.");
      showNotification("error", "VALIDATION ERROR", "Incomplete matrix parameters. Action blocked.");
      return; 
    }

    setIsLoading(true);
    try {
      const result = await saveEntity(activeTab, formData, editingId) as { success: boolean; message?: string };
      
      if (result.success) {
        if (editingId) {
          showNotification("success", "MATRIX UPDATED", `Existing data sequence successfully re-compiled and updated.`);
        } else {
          showNotification("success", "RECORD DEPLOYED", `New data entry has been successfully initialized and saved to database.`);
        }
        setFormData({});
        setEditingId(null);
        fetchNeonData();
        setViewMode("table");
      } else {
        showNotification("error", "WRITE ERROR", result.message || "Neon node rejected the stream packet commit.");
      }
    } catch (error) {
      console.error("Gagal memproses pendaftaran/pembaruan data:", error);
      showNotification("error", "SERVER TIMEOUT", "Neon pipeline terminal failed to response.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const clearError = (field: string) => {
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: "" }));
  };

  const getInputClass = (fieldId: string) => {
    return `w-full bg-transparent border-b pb-3 text-[18px] text-white outline-none transition-colors ${formErrors[fieldId] ? "border-[#FF3B30] focus:border-[#FF3B30]" : "border-white/20 focus:border-[#B026FF]"}`;
  };

  const getSelectClass = (fieldId: string) => {
    return `w-full bg-[#1a1b22] border rounded py-3.5 px-5 text-[16px] appearance-none outline-none cursor-pointer transition-colors ${formErrors[fieldId] ? "border-[#FF3B30] text-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30]" : "border-transparent text-white/80 focus:ring-1 focus:ring-[#B026FF]"}`;
  };

  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-[#FF3B30] text-[11px] font-mono mt-2 flex items-center gap-1.5"><AlertCircle size={12}/> {error}</p>;
  };

  const getSummaryCode = (tab: string, id: number) => {
    if (tab === "fleet") return `FLT-${id}`;
    if (tab === "crew") return `CRW-${id}`;
    if (tab === "customer") return `CUST-${id}`;
    return `VSL-${id}`;
  };

  const getTitle = () => {
    switch (activeTab) {
      case "fleet": return "FLEET & SHIPMENTS DATA";
      case "crew": return "CREW MANAGEMENT";
      case "customer": return "CUSTOMER DIRECTORY";
      case "vessel": return "VESSEL REGISTRY";
      default: return "MASTER CONTROL CENTER";
    }
  };

  const filterData = (arr: any[], keys: string[]) => {
    if (!searchQuery) return arr;
    return arr.filter(item =>
      keys.some(key => String(item[key] || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const paginate = (arr: any[]) => {
    const totalPages = Math.ceil(arr.length / itemsPerPage);
    const paginated = arr.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return { paginated, totalPages };
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = status ? status.toUpperCase() : "PENDING";
    if (s === "DELIVERED" || s === "ARRIVED") return "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20 shadow-[0_0_10px_rgba(52,199,89,0.1)]";
    if (s === "DELAYED" || s === "NOT DEPARTED YET") return "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20 shadow-[0_0_10px_rgba(255,59,48,0.1)]";
    if (s === "EN ROUTE") return "bg-[#00E3FD]/10 text-[#00E3FD] border-[#00E3FD]/20 shadow-[0_0_10px_rgba(0,227,253,0.1)]";
    return "bg-[#FFCC00]/10 text-[#FFCC00] border-[#FFCC00]/20 shadow-[0_0_10px_rgba(255,204,0,0.1)]";
  };

  const PaginationBar = ({ total }: { total: number }) => {
    const totalPages = Math.ceil(total / itemsPerPage);
    if (totalPages <= 1) return null;

    const pageWindow = 5;
    let start = Math.max(1, currentPage - Math.floor(pageWindow / 2));
    let end = Math.min(totalPages, start + pageWindow - 1);
    if (end - start < pageWindow - 1) start = Math.max(1, end - pageWindow + 1);

    return (
      <div className="flex justify-end items-center gap-4 px-4 py-4 border-t border-white/5 font-mono text-[11px] tracking-widest uppercase text-white/40">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="hover:text-[#E5B5FF] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div className="flex gap-2">
          {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(num => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentPage === num
                  ? "border border-[#B026FF] text-[#E5B5FF] bg-[#B026FF]/20 shadow-[0_0_10px_rgba(176,38,255,0.2)]"
                  : "hover:text-white hover:bg-white/5"
              }`}
            >
              {num.toString().padStart(2, '0')}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="hover:text-[#E5B5FF] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  // --- SKELETON RENDER FUNCTIONS (RE-ADDED TO PREVENT COMPILER ERRORS) ---
  const renderTableSkeleton = () => (
    <div className="bg-[#121317] rounded-lg border border-white/5 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-white/5 bg-[#1a1b22] flex justify-between">
        <div className="h-3 w-16 bg-white/10 rounded"></div>
        <div className="h-3 w-32 bg-white/10 rounded"></div>
        <div className="h-3 w-20 bg-white/10 rounded"></div>
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 border-b border-white/5 flex justify-between items-center">
          <div className="h-4 w-20 bg-white/5 rounded"></div>
          <div className="h-4 w-48 bg-white/5 rounded"></div>
          <div className="h-6 w-16 bg-white/5 rounded-full"></div>
        </div>
      ))}
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="max-w-[1000px] w-full bg-[#121317] p-8 rounded-lg border border-white/5 animate-pulse">
      <div className="h-6 w-64 bg-white/10 rounded mb-10"></div>
      <div className="flex flex-col gap-10">
        <div className="h-12 w-full bg-white/5 rounded"></div>
        <div className="h-12 w-full bg-white/5 rounded"></div>
      </div>
    </div>
  );

  return (
    <main className="w-full px-6 md:px-10 relative z-10 flex flex-col gap-8 max-w-[1200px] mx-auto pb-10 mt-6">
      
      {/* === CUSTOM TOAST NOTIFICATION COMPONENT === */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-[99999] w-full max-w-[420px] bg-[#0c0d12]/95 backdrop-blur-md border rounded-xl p-5 shadow-2xl flex items-start gap-4 overflow-hidden"
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
              <p className="text-white/80 font-inter text-[13px] leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-white/30 hover:text-white transition-colors shrink-0 p-0.5 rounded hover:bg-white/5"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === CUSTOM DESTRUCTIVE DELETE CONFIRMATION MODAL === */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setDeleteModal({ isOpen: false, targetId: null })}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="relative w-full max-w-[440px] bg-[#0c0d12] border border-[#FF3B30]/30 rounded-xl p-8 shadow-[0_0_50px_rgba(255,59,48,0.15)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[4px] bg-[#FF3B30]" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center text-[#FF3B30] mb-5 shadow-[0_0_15px_rgba(255,59,48,0.1)]">
                  <Trash size={22} />
                </div>
                
                <h3 className="font-grotesk font-bold text-white text-xl tracking-[1px] uppercase mb-2">TERMINATE SYSTEM RECORD</h3>
                <p className="text-white/40 font-mono text-[10px] tracking-[2px] uppercase mb-4 text-[#FF3B30]/80 font-bold">
                  TARGET ADDR: {getSummaryCode(activeTab, deleteModal.targetId || 0)}
                </p>
                
                <p className="text-white/60 font-inter text-[13px] leading-relaxed mb-8">
                  Are you sure you want to permanently purge this database sequence? This action overrides system parameters and cannot be undone.
                </p>
                
                <div className="flex gap-4 w-full">
                  <button 
                    type="button" 
                    onClick={() => setDeleteModal({ isOpen: false, targetId: null })}
                    className="flex-1 py-3 border border-white/10 rounded text-white/60 hover:text-white hover:bg-white/5 font-mono text-[11px] font-bold tracking-[2px] uppercase transition-colors"
                  >
                    ABORT
                  </button>
                  <button 
                    type="button" 
                    onClick={executeDeleteData}
                    className="flex-1 py-3 bg-[#FF3B30]/10 border border-[#FF3B30]/40 text-[#FF3B30] rounded font-mono text-[11px] font-bold tracking-[2px] uppercase hover:bg-[#FF3B30] hover:text-white shadow-[0_0_15px_rgba(255,59,48,0.2)] transition-all"
                  >
                    PURGE DATA
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-transparent pb-4">
        
        <div className="mb-10">
          <p className="text-[#B026FF] font-mono tracking-[4px] text-sm mb-2 uppercase">Central Console</p>
          <h1 className="font-grotesk font-bold text-[32px] md:text-[42px] tracking-[2px] uppercase text-white border-b-4 border-[#B026FF] pb-2 inline-block">
            {getTitle()}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8 bg-[#121317] p-4 rounded-lg border border-white/5">
          <div className="flex flex-1 flex-col sm:flex-row gap-4">
            <div className="relative w-full md:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input 
                type="text" 
                placeholder={`Search in ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1b22] border-none rounded py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:ring-1 focus:ring-[#B026FF] outline-none transition-all"
              />
            </div>

            {activeTab === "fleet" && viewMode === "table" && (
              <div className="relative">
                <select 
                  value={fleetStatusFilter} 
                  onChange={(e) => setFleetStatusFilter(e.target.value)}
                  className="bg-[#1a1b22] border border-white/10 rounded py-2.5 pl-10 pr-10 text-xs font-mono tracking-widest text-[#E5B5FF] appearance-none outline-none cursor-pointer focus:border-[#B026FF] uppercase h-full"
                >
                  <option value="ALL">FILTER STATUS: ALL</option>
                  <option value="PENDING">PENDING</option>
                  <option value="EN ROUTE">EN ROUTE</option>
                  <option value="DELAYED">DELAYED</option>
                  <option value="ARRIVED">ARRIVED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="NOT DEPARTED YET">NOT DEPARTED YET</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#B026FF]"><Filter size={14} /></div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={14} /></div>
              </div>
            )}
          </div>
          
          {activeTab !== "customer" && (
            <button 
              onClick={() => viewMode === "table" ? handleAddNew() : setViewMode("table")}
              className="px-6 py-2.5 bg-[#B026FF]/10 text-[#E5B5FF] border border-[#B026FF]/30 rounded text-sm font-bold tracking-[2px] uppercase hover:bg-[#B026FF]/20 transition-all flex items-center justify-center gap-2"
            >
              {viewMode === "table" ? <><Plus size={16} /> ADD NEW DATA</> : <><Users size={16} /> VIEW DATA</>}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {viewMode === "table" ? renderTableSkeleton() : renderFormSkeleton()}
            </motion.div>
          ) : viewMode === "table" ? (
            <motion.div 
              key="table-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}
              className="bg-[#121317] rounded-lg border border-white/5 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1a1b22] border-b border-white/5">
                      <th className="p-4 font-mono text-[11px] text-white/40 tracking-[2px] uppercase">ID / Code</th>
                      <th className="p-4 font-mono text-[11px] text-white/40 tracking-[2px] uppercase">Primary Info</th>
                      <th className="p-4 font-mono text-[11px] text-white/40 tracking-[2px] uppercase">Status / Details</th>
                      <th className="p-4 font-mono text-[11px] text-white/40 tracking-[2px] uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>

                    {activeTab === "fleet" && (() => {
                      let filtered = filterData(shipments, ['code', 'senderName', 'recipientName', 'status']);
                      if (fleetStatusFilter !== "ALL") filtered = filtered.filter(s => s.status === fleetStatusFilter);
                      const { paginated } = paginate(filtered);
                      return paginated.map(s => (
                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-sm font-mono text-white/70">{s.code}</td>
                          <td className="p-4 text-sm text-white">{s.senderName} ({s.senderCity}) → {s.recipientName} ({s.recipientCity})</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border ${getStatusBadgeStyle(s.status)}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-4 flex justify-end gap-3">
                            <button type="button" onClick={() => handleEdit(s)} className="text-white/40 hover:text-[#a2d2ff]"><Edit size={18} /></button>
                            <button type="button" onClick={() => openDeleteConfirmation(s.id)} className="text-white/40 hover:text-red-400"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ));
                    })()}

                    {activeTab === "customer" && (() => {
                      const filtered = filterData(customers, ['name', 'email', 'phone']);
                      const { paginated } = paginate(filtered);
                      return paginated.map(c => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-sm font-mono text-white/70 align-top">CUST-{c.id}</td>
                          <td className="p-4 text-sm text-white">
                            <span className="font-bold text-[15px]">{c.name}</span>
                            <div className="flex flex-col gap-1 mt-2 text-white/50">
                              <span className="flex items-center gap-2 text-xs"><Mail size={12}/> {c.email}</span>
                              <span className="flex items-center gap-2 text-xs"><Phone size={12}/> {c.phone || "-"}</span>
                              <span className="flex items-center gap-2 text-xs"><MapPin size={12}/> {c.address || "-"}</span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <span className="flex items-center gap-2 px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-green-500/10 text-green-400 border border-green-500/20 w-max">
                              <CheckCircle size={12}/> {c.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-4 flex justify-end gap-3 align-top">
                            <button type="button" onClick={() => openDeleteConfirmation(c.id)} className="text-white/40 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}

                    {activeTab === "crew" && (() => {
                      const filtered = filterData(crews, ['name', 'email', 'role']);
                      const { paginated } = paginate(filtered);
                      return paginated.map(c => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-sm font-mono text-white/70">CRW-{c.id}</td>
                          <td className="p-4 text-sm text-white">{c.name} <br/><span className="text-xs text-white/40">{c.email}</span></td>
                          <td className="p-4 text-sm text-white/50 uppercase">{c.role ? c.role.replace(/_/g, ' ') : 'crew'}</td>
                          <td className="p-4 flex justify-end gap-3">
                            <button type="button" onClick={() => handleEdit(c)} className="text-white/40 hover:text-[#a2d2ff]"><Edit size={18} /></button>
                            <button type="button" onClick={() => openDeleteConfirmation(c.id)} className="text-white/40 hover:text-red-400"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ));
                    })()}

                    {activeTab === "vessel" && (() => {
                      const filtered = filterData(vessels, ['name', 'crewLead', 'type']);
                      const { paginated } = paginate(filtered);
                      return paginated.map(v => (
                        <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-sm font-mono text-white/70">VSL-{v.id}</td>
                          <td className="p-4 text-sm text-white">{v.name} <br/><span className="text-xs text-white/40">Lead: {v.crewLead || "None"}</span></td>
                          <td className="p-4 text-sm text-white/50">{v.capacity} {v.capacityUnit || "TONNES"}</td>
                          <td className="p-4 flex justify-end gap-3">
                            <button type="button" onClick={() => handleEdit(v)} className="text-white/40 hover:text-[#a2d2ff]"><Edit size={18} /></button>
                            <button type="button" onClick={() => openDeleteConfirmation(v.id)} className="text-white/40 hover:text-red-400"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ));
                    })()}

                  </tbody>
                </table>
              </div>

              {activeTab === "fleet" && (() => {
                let filtered = filterData(shipments, ['code', 'senderName', 'recipientName', 'status']);
                if (fleetStatusFilter !== "ALL") filtered = filtered.filter(s => s.status === fleetStatusFilter);
                return <PaginationBar total={filtered.length} />;
              })()}
              {activeTab === "customer" && <PaginationBar total={filterData(customers, ['name', 'email', 'phone']).length} />}
              {activeTab === "crew" && <PaginationBar total={filterData(crews, ['name', 'email', 'role']).length} />}
              {activeTab === "vessel" && <PaginationBar total={filterData(vessels, ['name', 'crewLead', 'type']).length} />}

            </motion.div>
          ) : (
            <motion.div 
              key="form-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
              className="max-w-[1000px] w-full"
            >
              <form onSubmit={handleSave} className="w-full" noValidate>
                {activeTab === "fleet" && (
                  <div className="flex flex-col gap-10">
                    <div className="mb-2">
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Hash size={20} /> TRACKING NUMBER & STATUS
                      </h2>
                      <div className="flex gap-6 items-end">
                        <div className="flex-1">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.code ? "text-[#FF3B30]" : "text-white/40"}`}>TRACKING CODE</label>
                          <input type="text" readOnly value={formData.code || ""} className={getInputClass("code")} />
                          <FieldError error={formErrors.code} />
                        </div>
                        {!editingId && (
                          <button type="button" onClick={() => generateCode('MJF-RND')} className="px-6 py-3 border border-white/10 rounded text-white/60 text-[12px] font-bold tracking-[2px] uppercase hover:text-white hover:border-white/50 flex items-center gap-2 mb-1">
                            <RefreshCw size={16} /> GENERATE NEW
                          </button>
                        )}
                        <div className="flex-1">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">STATUS</label>
                          <div className="relative">
                            <select value={formData.status || "PENDING"} onChange={e => updateField("status", e.target.value)} className={getSelectClass("status")}>
                              <option value="PENDING">PENDING</option>
                              <option value="EN ROUTE">EN ROUTE</option>
                              <option value="DELAYED">DELAYED</option>
                              <option value="ARRIVED">ARRIVED</option>
                              <option value="DELIVERED">DELIVERED</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Ship size={20} /> FLEET & CREW ASSIGNMENT
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.vesselId ? "text-[#FF3B30]" : "text-white/40"}`}>ASSIGNED VESSEL</label>
                          <div className="relative">
                            <select
                              value={formData.vesselId || ""}
                              onChange={e => {
                                const vId = e.target.value;
                                const selectedV = vessels.find(v => String(v.id) === vId);
                                const matchedCrew = selectedV?.crewLead ? crews.find(c => c.name?.trim().toLowerCase() === selectedV.crewLead?.trim().toLowerCase()) : null;
                                setFormData({ ...formData, vesselId: vId, captain: matchedCrew ? matchedCrew.name : "" });
                                clearError("vesselId"); clearError("captain");
                              }}
                              className={getSelectClass("vesselId")}
                            >
                              <option value="" disabled hidden>Select operational vessel...</option>
                              {vessels.map(v => (
                                <option key={v.id} value={v.id}>{v.name} ({v.type || "Cargo Fleet"})</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                          <FieldError error={formErrors.vesselId} />
                        </div>

                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.captain ? "text-[#FF3B30]" : "text-white/40"}`}>ASSIGNED CAPTAIN / CREW LEAD</label>
                          <div className="relative">
                            <select
                              value={formData.captain || ""}
                              onChange={e => updateField("captain", e.target.value)}
                              className={getSelectClass("captain")}
                            >
                              <option value="" disabled hidden>Select captain on board...</option>
                              {crews.map(c => (
                                <option key={c.id} value={c.name}>{c.name} ({c.role ? c.role.replace(/_/g, ' ').toUpperCase() : "CREW"})</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                          <FieldError error={formErrors.captain} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <MapPin size={20} /> SENDER INFORMATION
                      </h2>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.senderName ? "text-[#FF3B30]" : "text-white/40"}`}>NAME</label>
                          <input type="text" value={formData.senderName || ""} onChange={e => updateField("senderName", e.target.value)} className={getInputClass("senderName")} />
                          <FieldError error={formErrors.senderName} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.senderContact ? "text-[#FF3B30]" : "text-white/40"}`}>CONTACT</label>
                          <input type="text" value={formData.senderContact || ""} onChange={e => updateField("senderContact", e.target.value)} className={getInputClass("senderContact")} />
                          <FieldError error={formErrors.senderContact} />
                        </div>
                        <div className="col-span-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.senderEmail ? "text-[#FF3B30]" : "text-white/40"}`}>EMAIL ADDRESS</label>
                          <input type="email" value={formData.senderEmail || ""} onChange={e => updateField("senderEmail", e.target.value)} className={getInputClass("senderEmail")} />
                          <FieldError error={formErrors.senderEmail} />
                        </div>
                        <div className="col-span-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.senderAddress ? "text-[#FF3B30]" : "text-white/40"}`}>ORIGIN ADDRESS</label>
                          <input type="text" value={formData.senderAddress || ""} onChange={e => updateField("senderAddress", e.target.value)} className={getInputClass("senderAddress")} />
                          <FieldError error={formErrors.senderAddress} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.senderCountry ? "text-[#FF3B30]" : "text-white/40"}`}>COUNTRY</label>
                          <input type="text" value={formData.senderCountry || ""} onChange={e => updateField("senderCountry", e.target.value)} className={getInputClass("senderCountry")} />
                          <FieldError error={formErrors.senderCountry} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.senderCity ? "text-[#FF3B30]" : "text-white/40"}`}>PROVINCE / CITY</label>
                          <input type="text" value={formData.senderCity || ""} onChange={e => updateField("senderCity", e.target.value)} className={getInputClass("senderCity")} />
                          <FieldError error={formErrors.senderCity} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <MapPin size={20} /> RECIPIENT INFORMATION
                      </h2>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.recipientName ? "text-[#FF3B30]" : "text-white/40"}`}>NAME</label>
                          <input type="text" value={formData.recipientName || ""} onChange={e => updateField("recipientName", e.target.value)} className={getInputClass("recipientName")} />
                          <FieldError error={formErrors.recipientName} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.recipientContact ? "text-[#FF3B30]" : "text-white/40"}`}>CONTACT</label>
                          <input type="text" value={formData.recipientContact || ""} onChange={e => updateField("recipientContact", e.target.value)} className={getInputClass("recipientContact")} />
                          <FieldError error={formErrors.recipientContact} />
                        </div>
                        <div className="col-span-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.recipientEmail ? "text-[#FF3B30]" : "text-white/40"}`}>EMAIL ADDRESS</label>
                          <input type="email" value={formData.recipientEmail || ""} onChange={e => updateField("recipientEmail", e.target.value)} className={getInputClass("recipientEmail")} />
                          <FieldError error={formErrors.recipientEmail} />
                        </div>
                        <div className="col-span-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.recipientAddress ? "text-[#FF3B30]" : "text-white/40"}`}>DESTINATION ADDRESS</label>
                          <input type="text" value={formData.recipientAddress || ""} onChange={e => updateField("recipientAddress", e.target.value)} className={getInputClass("recipientAddress")} />
                          <FieldError error={formErrors.recipientAddress} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.recipientCountry ? "text-[#FF3B30]" : "text-white/40"}`}>COUNTRY</label>
                          <input type="text" value={formData.recipientCountry || ""} onChange={e => updateField("recipientCountry", e.target.value)} className={getInputClass("recipientCountry")} />
                          <FieldError error={formErrors.recipientCountry} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.recipientCity ? "text-[#FF3B30]" : "text-white/40"}`}>PROVINCE / CITY</label>
                          <input type="text" value={formData.recipientCity || ""} onChange={e => updateField("recipientCity", e.target.value)} className={getInputClass("recipientCity")} />
                          <FieldError error={formErrors.recipientCity} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Package size={20} /> CARGO DETAILS
                      </h2>
                      <div className="flex flex-col gap-8">
                        <div className="w-full">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.cargoDesc ? "text-[#FF3B30]" : "text-white/40"}`}>ITEM DESCRIPTION</label>
                          <input type="text" value={formData.cargoDesc || ""} onChange={e => updateField("cargoDesc", e.target.value)} className={getInputClass("cargoDesc")} placeholder="What are you shipping?" />
                          <FieldError error={formErrors.cargoDesc} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                          <div className="flex flex-col gap-2">
                            <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-1 block font-mono ${formErrors.weight ? "text-[#FF3B30]" : "text-white/40"}`}>TOTAL WEIGHT</label>
                            <div className={`flex gap-2 items-center relative border-b transition-colors ${formErrors.weight ? 'border-[#FF3B30]' : 'border-white/20 focus-within:border-[#B026FF]'}`}>
                              <input type="number" value={formData.weight || ""} onChange={e => updateField("weight", e.target.value)} className="w-full bg-transparent border-none pb-3 text-[18px] text-white outline-none" placeholder="0.0" />
                              <select value={formData.weightUnit || "KG"} onChange={e => updateField("weightUnit", e.target.value)} className="bg-[#1a1b22] border-none rounded py-1 px-3 mb-2 text-xs font-bold text-[#E5B5FF] appearance-none outline-none pr-7 cursor-pointer">
                                <option value="KG">KG</option><option value="TON">TON</option><option value="LBS">LBS</option>
                              </select>
                            </div>
                            <FieldError error={formErrors.weight} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-1 block font-mono ${formErrors.dimensions ? "text-[#FF3B30]" : "text-white/40"}`}>DIMENSIONS (CBM)</label>
                            <input type="number" value={formData.dimensions || ""} onChange={e => updateField("dimensions", e.target.value)} className={getInputClass("dimensions")} />
                            <FieldError error={formErrors.dimensions} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-1 block font-mono ${formErrors.category ? "text-[#FF3B30]" : "text-white/40"}`}>CATEGORY</label>
                            <div className="relative">
                              <select value={formData.category || ""} onChange={e => updateField("category", e.target.value)} className={getSelectClass("category")}>
                                <option value=" " disabled hidden>Select category...</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing</option>
                                <option value="food">Food & Beverage</option>
                                <option value="heavy">Heavy Machinery</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                            </div>
                            <FieldError error={formErrors.category} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-1 block font-mono ${formErrors.packageTypeId ? "text-[#FF3B30]" : "text-white/40"}`}>SERVICE PLAN</label>
                            <div className="relative">
                              <select 
                                value={formData.packageTypeId || "2"} 
                                onChange={e => updateField("packageTypeId", e.target.value)} 
                                className={getSelectClass("packageTypeId")}
                              >
                                <option value="1">MAJU ECONOMY</option>
                                <option value="2">MAJU STANDARD</option>
                                <option value="3">MAJU HEAVY</option>
                                <option value="4">MAJU EXPRESS</option>
                                <option value="5">MAJU VIP</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                            </div>
                            <FieldError error={formErrors.packageTypeId} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "crew" && (
                  <div className="flex flex-col gap-10">
                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Hash size={20} /> CREW IDENTIFICATION
                      </h2>
                      <div className="flex gap-6 items-end">
                        <div className="flex-1">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.code ? "text-[#FF3B30]" : "text-white/40"}`}>CREW ID</label>
                          <input type="text" readOnly value={formData.code || ""} className={getInputClass("code")} />
                          <FieldError error={formErrors.code} />
                        </div>
                        {!editingId && (
                          <button type="button" onClick={() => generateCode('CRW')} className="px-6 py-3 border border-white/10 rounded text-white/60 text-[12px] font-bold tracking-[2px] uppercase hover:text-white hover:border-white/50 flex items-center gap-2 mb-1">
                            <RefreshCw size={16} /> GENERATE ID
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Users size={20} /> PERSONAL DETAILS
                      </h2>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div className="col-span-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.name ? "text-[#FF3B30]" : "text-white/40"}`}>FULL NAME</label>
                          <input type="text" value={formData.name || ""} onChange={e => updateField("name", e.target.value)} className={getInputClass("name")} />
                          <FieldError error={formErrors.name} />
                        </div>
                        <div className="col-span-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.email ? "text-[#FF3B30]" : "text-white/40"}`}>EMAIL ADDRESS</label>
                          <input type="email" value={formData.email || ""} onChange={e => updateField("email", e.target.value)} className={getInputClass("email")} />
                          <FieldError error={formErrors.email} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.gender ? "text-[#FF3B30]" : "text-white/40"}`}>GENDER</label>
                          <div className="relative">
                            <select value={formData.gender || ""} onChange={e => updateField("gender", e.target.value)} className={getSelectClass("gender")}>
                              <option value="" disabled hidden>Select gender...</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                          <FieldError error={formErrors.gender} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.age ? "text-[#FF3B30]" : "text-white/40"}`}>AGE</label>
                          <input type="number" value={formData.age || ""} onChange={e => updateField("age", e.target.value)} className={getInputClass("age")} />
                          <FieldError error={formErrors.age} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Briefcase size={20} /> PROFESSIONAL DETAILS
                      </h2>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.role ? "text-[#FF3B30]" : "text-white/40"}`}>SPECIALIST ROLE</label>
                          <div className="relative">
                            <select value={formData.role || ""} onChange={e => updateField("role", e.target.value)} className={getSelectClass("role")}>
                              <option value="" disabled hidden>Select role...</option>
                              <option value="captain">Captain</option>
                              <option value="navigator">Navigator</option>
                              <option value="chief_engineer">Chief Engineer</option>
                              <option value="deck_officer">Deck Officer</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                          <FieldError error={formErrors.role} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.origin ? "text-[#FF3B30]" : "text-white/40"}`}>ORIGIN CITY / COUNTRY</label>
                          <input type="text" value={formData.origin || ""} onChange={e => updateField("origin", e.target.value)} className={getInputClass("origin")} />
                          <FieldError error={formErrors.origin} />
                        </div>
                        <div className="col-span-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.contact ? "text-[#FF3B30]" : "text-white/40"}`}>CONTACT NUMBER</label>
                          <input type="text" value={formData.contact || ""} onChange={e => updateField("contact", e.target.value)} className={getInputClass("contact")} />
                          <FieldError error={formErrors.contact} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "vessel" && (
                  <div className="flex flex-col gap-10">
                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Users size={20} /> VESSEL SPECIFICATIONS
                      </h2>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div className="col-span-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.name ? "text-[#FF3B30]" : "text-white/40"}`}>VESSEL NAME</label>
                          <input type="text" value={formData.name || ""} onChange={e => updateField("name", e.target.value)} className={getInputClass("name")} />
                          <FieldError error={formErrors.name} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-1 block font-mono ${formErrors.capacity ? "text-[#FF3B30]" : "text-white/40"}`}>CAPACITY</label>
                          <div className={`flex gap-2 items-center relative border-b transition-colors ${formErrors.capacity ? 'border-[#FF3B30]' : 'border-white/20 focus-within:border-[#B026FF]'}`}>
                            <input type="number" value={formData.capacity || ""} onChange={e => updateField("capacity", e.target.value)} className="w-full bg-transparent border-none pb-3 text-[18px] text-white outline-none" />
                            <select value={formData.capacityUnit || "TONNES"} onChange={e => updateField("capacityUnit", e.target.value)} className="bg-[#1a1b22] border-none rounded py-1 px-3 mb-2 text-xs font-bold text-[#E5B5FF] appearance-none outline-none pr-7 cursor-pointer">
                              <option value="TONNES">TONNES</option>
                              <option value="KG">KG</option>
                              <option value="CBM">CBM</option>
                            </select>
                          </div>
                          <FieldError error={formErrors.capacity} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-1 block font-mono ${formErrors.type ? "text-[#FF3B30]" : "text-white/40"}`}>VESSEL TYPE</label>
                          <input type="text" value={formData.type || ""} onChange={e => updateField("type", e.target.value)} className={getInputClass("type")} />
                          <FieldError error={formErrors.type} />
                        </div>
                        <div className="col-span-2">
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.crewLead ? "text-[#FF3B30]" : "text-white/40"}`}>ASSIGNED CREW LEAD</label>
                          <input type="text" value={formData.crewLead || ""} onChange={e => updateField("crewLead", e.target.value)} className={getInputClass("crewLead")} />
                          <FieldError error={formErrors.crewLead} />
                        </div>
                        <div>
                          <label className={`text-[12px] font-bold tracking-[3px] uppercase mb-3 block font-mono ${formErrors.status ? "text-[#FF3B30]" : "text-white/40"}`}>OPERATIONAL STATUS</label>
                          <div className="relative">
                            <select value={formData.status || "Active"} onChange={e => updateField("status", e.target.value)} className={getSelectClass("status")}>
                              <option value="Active">Active</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Docked">Docked</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                          <FieldError error={formErrors.status} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner Error Umum di bawah Form */}
                {generalError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-14 w-full bg-[#FF3B30]/5 border border-[#FF3B30]/20 p-5 rounded-lg flex items-center gap-3">
                    <AlertCircle size={20} className="text-[#FF3B30]" />
                    <p className="text-[#FF3B30] text-xs font-mono font-bold uppercase tracking-[2px]">{generalError}</p>
                  </motion.div>
                )}

                <div className={`${generalError ? 'mt-6' : 'mt-14'} flex gap-4`}>
                  <button type="button" onClick={() => setViewMode("table")} className="px-6 py-4 rounded-md font-bold text-white/50 border border-white/10 hover:bg-white/5 uppercase tracking-widest w-1/3 transition-colors">CANCEL</button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-4 rounded-md font-grotesk font-bold text-[16px] text-white tracking-[3px] uppercase bg-gradient-to-r from-[#B026FF] to-[#a2d2ff] hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(176,38,255,0.2)] disabled:opacity-50">
                    {isLoading ? "PROCESSING..." : (editingId ? "SAVE CHANGES" : "SUBMIT REQUEST")}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="absolute top-0 left-0 w-full min-h-screen bg-[#0a0a0c] z-50 text-white font-inter selection:bg-[#B026FF] selection:text-white pb-10 flex flex-col overflow-x-hidden">
      <AdminNavbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white/50">Loading Control Center...</div>}>
        <AdminControlContent />
      </Suspense>
    </div>
  );
}