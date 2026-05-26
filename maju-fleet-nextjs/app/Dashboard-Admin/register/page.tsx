"use client";

import React, { useState, useEffect, Suspense } from "react";
import { 
  Hash, Users, MapPin, Package, RefreshCw, Briefcase, ChevronDown, 
  Search, Plus, Edit, Trash2, CheckCircle, Mail, Phone, Ship, Filter
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
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(activeTab === "fleet" ? { weightUnit: "KG", status: "PENDING", packageTypeId: "2", vesselId: "", captain: "" } : activeTab === "vessel" ? { capacityUnit: "TONNES" } : {});
    setViewMode("form");
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    const currentPackageId = item.items && item.items.length > 0 ? String(item.items[0].packageTypeId) : "2";
    setFormData({ ...item, packageTypeId: currentPackageId, vesselId: item.vesselId ? String(item.vesselId) : "" });
    setViewMode("form");
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this data permanently from Neon Database?");
    if (!confirmDelete) return;

    setIsLoading(true);
    const result = await deleteEntity(activeTab, id);
    if (result.success) {
      alert("Data successfully deleted from Neon database!");
      fetchNeonData(); 
      setViewMode("table");
    } else {
      alert("Error: Failed to delete data from server.");
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "fleet") {
      const senderEmail = formData.senderEmail ? String(formData.senderEmail).trim() : "";
      const recipientEmail = formData.recipientEmail ? String(formData.recipientEmail).trim() : "";

      if (!senderEmail.includes("@") || !recipientEmail.includes("@")) {
        alert("VALIDATION ERROR: Email Address must contain an '@' symbol!");
        return;
      }
    }

    setIsLoading(true);
    const result = await saveEntity(activeTab, formData, editingId);
    if (result.success) {
      alert("Data successfully synchronized with Neon Database!");
      setFormData({});
      setEditingId(null);
      fetchNeonData();
      setViewMode("table");
    } else {
      alert("Error: Failed to save data to Neon database.");
      setIsLoading(false);
    }
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
    if (s === "DELIVERED" || s === "ARRIVED") {
      return "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20 shadow-[0_0_10px_rgba(52,199,89,0.1)]";
    }
    if (s === "DELAYED" || s === "NOT DEPARTED YET") {
      return "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20 shadow-[0_0_10px_rgba(255,59,48,0.1)]";
    }
    if (s === "EN ROUTE") {
      return "bg-[#00E3FD]/10 text-[#00E3FD] border-[#00E3FD]/20 shadow-[0_0_10px_rgba(0,227,253,0.1)]";
    }
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
              {viewMode === "table" ? (
                <><Plus size={16} /> ADD NEW DATA</>
              ) : (
                <><Users size={16} /> VIEW DATA</>
              )}
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
                      if (fleetStatusFilter !== "ALL") {
                        filtered = filtered.filter(s => s.status === fleetStatusFilter);
                      }
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
                            <button type="button" onClick={() => handleDelete(s.id)} className="text-white/40 hover:text-red-400"><Trash2 size={18} /></button>
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
                            <button type="button" onClick={() => handleDelete(c.id)} className="text-white/40 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10">
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
                            <button type="button" onClick={() => handleDelete(c.id)} className="text-white/40 hover:text-red-400"><Trash2 size={18} /></button>
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
                            <button type="button" onClick={() => handleDelete(v.id)} className="text-white/40 hover:text-red-400"><Trash2 size={18} /></button>
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
              <form onSubmit={handleSave} className="w-full">
                {activeTab === "fleet" && (
                  <div className="flex flex-col gap-10">
                    <div className="mb-2">
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Hash size={20} /> TRACKING NUMBER & STATUS
                      </h2>
                      <div className="flex gap-6 items-end">
                        <div className="flex-1">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">TRACKING CODE</label>
                          <input type="text" readOnly value={formData.code || ""} className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF] transition-colors" />
                        </div>
                        {!editingId && (
                          <button type="button" onClick={() => generateCode('MJF-RND')} className="px-6 py-3 border border border-white/10 rounded text-white/60 text-[12px] font-bold tracking-[2px] uppercase hover:text-white hover:border-white/50 transition-colors flex items-center gap-2">
                            <RefreshCw size={16} /> GENERATE NEW
                          </button>
                        )}
                        <div className="flex-1">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">STATUS</label>
                          <div className="relative">
                            <select value={formData.status || "PENDING"} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#1a1b22] border-none rounded py-3 px-5 text-[16px] text-white/80 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF]">
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
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ASSIGNED VESSEL</label>
                          <div className="relative">
                            <select
                              value={formData.vesselId || ""}
                              onChange={e => {
                                const vId = e.target.value;
                                const selectedV = vessels.find(v => String(v.id) === vId);

                                // ✅ FIX: Cari crew yang namanya cocok dengan crewLead vessel (case-insensitive)
                                // Ini mencegah auto-select ke crew yang salah akibat perbedaan kapitalisasi
                                const matchedCrew = selectedV?.crewLead
                                  ? crews.find(
                                      c => c.name?.trim().toLowerCase() === selectedV.crewLead?.trim().toLowerCase()
                                    )
                                  : null;

                                setFormData({
                                  ...formData,
                                  vesselId: vId,
                                  // Jika ada crew yang cocok gunakan namanya, jika tidak kosongkan agar user pilih manual
                                  captain: matchedCrew ? matchedCrew.name : ""
                                });
                              }}
                              required
                              className="w-full bg-[#1a1b22] border-none rounded py-3.5 px-5 text-[16px] text-white/80 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF] cursor-pointer"
                            >
                              <option value="" disabled hidden>Select operational vessel...</option>
                              {vessels.map(v => (
                                <option key={v.id} value={v.id}>{v.name} ({v.type || "Cargo Fleet"})</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ASSIGNED CAPTAIN / CREW LEAD</label>
                          <div className="relative">
                            <select
                              value={formData.captain || ""}
                              onChange={e => setFormData({...formData, captain: e.target.value})}
                              required
                              className="w-full bg-[#1a1b22] border-none rounded py-3.5 px-5 text-[16px] text-white/80 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF] cursor-pointer"
                            >
                              <option value="" disabled hidden>Select captain on board...</option>
                              {crews.map(c => (
                                <option key={c.id} value={c.name}>{c.name} ({c.role ? c.role.replace(/_/g, ' ').toUpperCase() : "CREW"})</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <MapPin size={20} /> SENDER INFORMATION
                      </h2>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">NAME</label>
                          <input type="text" value={formData.senderName || ""} onChange={e => setFormData({...formData, senderName: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CONTACT</label>
                          <input type="text" value={formData.senderContact || ""} onChange={e => setFormData({...formData, senderContact: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">EMAIL ADDRESS</label>
                          <input type="email" value={formData.senderEmail || ""} onChange={e => setFormData({...formData, senderEmail: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ORIGIN ADDRESS</label>
                          <input type="text" value={formData.senderAddress || ""} onChange={e => setFormData({...formData, senderAddress: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">COUNTRY</label>
                          <input type="text" value={formData.senderCountry || ""} onChange={e => setFormData({...formData, senderCountry: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">PROVINCE / CITY</label>
                          <input type="text" value={formData.senderCity || ""} onChange={e => setFormData({...formData, senderCity: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <MapPin size={20} /> RECIPIENT INFORMATION
                      </h2>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">NAME</label>
                          <input type="text" value={formData.recipientName || ""} onChange={e => setFormData({...formData, recipientName: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CONTACT</label>
                          <input type="text" value={formData.recipientContact || ""} onChange={e => setFormData({...formData, recipientContact: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">EMAIL ADDRESS</label>
                          <input type="email" value={formData.recipientEmail || ""} onChange={e => setFormData({...formData, recipientEmail: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">DESTINATION ADDRESS</label>
                          <input type="text" value={formData.recipientAddress || ""} onChange={e => setFormData({...formData, recipientAddress: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">COUNTRY</label>
                          <input type="text" value={formData.recipientCountry || ""} onChange={e => setFormData({...formData, recipientCountry: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">PROVINCE / CITY</label>
                          <input type="text" value={formData.recipientCity || ""} onChange={e => setFormData({...formData, recipientCity: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Package size={20} /> CARGO DETAILS
                      </h2>
                      <div className="flex flex-col gap-8">
                        <div className="w-full">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ITEM DESCRIPTION</label>
                          <input type="text" value={formData.cargoDesc || ""} onChange={e => setFormData({...formData, cargoDesc: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
                          <div className="flex gap-2 items-end relative border-b border-[#B026FF]">
                            <div className="flex-1">
                              <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">WEIGHT</label>
                              <input type="number" value={formData.weight || ""} onChange={e => setFormData({...formData, weight: e.target.value})} required className="w-full bg-transparent border-none pb-3 text-[18px] text-white outline-none" />
                            </div>
                            <div className="relative mb-2">
                              <select value={formData.weightUnit || "KG"} onChange={e => setFormData({...formData, weightUnit: e.target.value})} className="bg-[#1a1b22] border-none rounded py-1 px-3 text-xs font-bold text-[#E5B5FF] appearance-none outline-none pr-7 cursor-pointer">
                                <option value="KG">KG</option>
                                <option value="TON">TON</option>
                                <option value="LBS">LBS</option>
                              </select>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#E5B5FF]/50"><ChevronDown size={12} /></div>
                            </div>
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">DIMENSIONS (CBM)</label>
                            <input type="number" value={formData.dimensions || ""} onChange={e => setFormData({...formData, dimensions: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CATEGORY</label>
                            <div className="relative">
                              <select value={formData.category || ""} onChange={e => setFormData({...formData, category: e.target.value})} required className="w-full bg-[#1a1b22] border-none rounded py-3.5 px-5 text-[16px] text-white/80 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF]">
                                <option value=" " disabled hidden>Select category...</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing</option>
                                <option value="food">Food & Beverage</option>
                                <option value="heavy">Heavy Machinery</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                            </div>
                          </div>
                          <div>
                            <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">PACKAGE TYPE (SERVICE)</label>
                            <div className="relative">
                              <select 
                                value={formData.packageTypeId || "2"} 
                                onChange={e => setFormData({...formData, packageTypeId: e.target.value})} 
                                required 
                                className="w-full bg-[#1a1b22] border-none rounded py-3.5 px-5 text-[16px] text-white/80 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF]"
                              >
                                <option value="1">MAJU ECONOMY</option>
                                <option value="2">MAJU STANDARD</option>
                                <option value="3">MAJU HEAVY</option>
                                <option value="4">MAJU EXPRESS</option>
                                <option value="5">MAJU VIP</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                            </div>
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
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CREW ID</label>
                          <input type="text" readOnly value={formData.code || ""} className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        {!editingId && (
                          <button type="button" onClick={() => generateCode('CRW')} className="px-6 py-3 border border-white/10 rounded text-white/60 text-[12px] font-bold tracking-[2px] uppercase hover:text-white hover:border-white/50 transition-colors flex items-center gap-2">
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
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">FULL NAME</label>
                          <input type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">EMAIL ADDRESS</label>
                          <input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">GENDER</label>
                          <div className="relative">
                            <select value={formData.gender || ""} onChange={e => setFormData({...formData, gender: e.target.value})} required className="w-full bg-[#1a1b22] border-none rounded py-3 px-5 text-[16px] text-white/80 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF]">
                              <option value="" disabled hidden>Select gender...</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">AGE</label>
                          <input type="number" value={formData.age || ""} onChange={e => setFormData({...formData, age: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="flex items-center gap-4 font-grotesk font-bold text-[#E5B5FF] uppercase tracking-[3px] mb-6 text-lg">
                        <Briefcase size={20} /> PROFESSIONAL DETAILS
                      </h2>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">SPECIALIST ROLE</label>
                          <div className="relative">
                            <select value={formData.role || ""} onChange={e => setFormData({...formData, role: e.target.value})} required className="w-full bg-[#1a1b22] border-none rounded py-3 px-5 text-[16px] text-white/80 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF]">
                              <option value="" disabled hidden>Select role...</option>
                              <option value="captain">Captain</option>
                              <option value="navigator">Navigator</option>
                              <option value="chief_engineer">Chief Engineer</option>
                              <option value="deck_officer">Deck Officer</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ORIGIN CITY / COUNTRY</label>
                          <input type="text" value={formData.origin || ""} onChange={e => setFormData({...formData, origin: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CONTACT NUMBER</label>
                          <input type="text" value={formData.contact || ""} onChange={e => setFormData({...formData, contact: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
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
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">VESSEL NAME</label>
                          <input type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div className="flex gap-2 items-end relative border-b border-white/20 focus-within:border-[#B026FF] transition-colors">
                          <div className="flex-1">
                            <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">CAPACITY</label>
                            <input type="number" value={formData.capacity || ""} onChange={e => setFormData({...formData, capacity: e.target.value})} required className="w-full bg-transparent border-none pb-3 text-[18px] text-white outline-none" />
                          </div>
                          <div className="relative mb-2">
                            <select value={formData.capacityUnit || "TONNES"} onChange={e => setFormData({...formData, capacityUnit: e.target.value})} className="bg-[#1a1b22] border-none rounded py-1 px-3 text-xs font-bold text-[#E5B5FF] appearance-none outline-none pr-7 cursor-pointer">
                              <option value="TONNES">TONNES</option>
                              <option value="KG">KG</option>
                              <option value="CBM">CBM</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#E5B5FF]/50"><ChevronDown size={12} /></div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">VESSEL TYPE</label>
                          <input type="text" value={formData.type || ""} onChange={e => setFormData({...formData, type: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">ASSIGNED CREW LEAD</label>
                          <input type="text" value={formData.crewLead || ""} onChange={e => setFormData({...formData, crewLead: e.target.value})} required className="w-full bg-transparent border-b border-white/20 pb-3 text-[18px] text-white outline-none focus:border-[#B026FF]" />
                        </div>
                        <div>
                          <label className="text-[12px] font-bold text-white/40 tracking-[3px] uppercase mb-3 block font-mono">OPERATIONAL STATUS</label>
                          <div className="relative">
                            <select value={formData.status || "Active"} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#1a1b22] border-none rounded py-3 px-5 text-[16px] text-white/80 appearance-none outline-none focus:ring-1 focus:ring-[#B026FF]">
                              <option value="Active">Active</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Docked">Docked</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"><ChevronDown size={20} /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-14 flex gap-4">
                  <button type="button" onClick={() => setViewMode("table")} className="px-6 py-4 rounded-md font-bold text-white/50 border border-white/10 hover:bg-white/5 uppercase tracking-widest w-1/3 transition-colors">CANCEL</button>
                  <button type="submit" className="flex-1 py-4 rounded-md font-grotesk font-bold text-[16px] text-white tracking-[3px] uppercase bg-gradient-to-r from-[#B026FF] to-[#a2d2ff] hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(176,38,255,0.2)]">
                    {editingId ? "SAVE CHANGES" : "SUBMIT DATA"}
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