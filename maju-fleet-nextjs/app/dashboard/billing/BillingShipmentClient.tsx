"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, CheckCircle2, FileText, XCircle, AlertCircle, X, Trash } from "lucide-react";
import UserNavbar from "@/components/usernavbar";
// Import official Server Actions from backend actions.ts
import { getCustomerBilling, confirmInvoicePayment, getCurrentSession, cancelShipmentCustomer } from "@/app/lib/actions";

function BillingHistorySkeleton() {
  return (
    <main className="flex-1 py-10 px-6 md:px-10 relative overflow-hidden animate-pulse">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B026FF]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BDF4FF]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1000px] mx-auto relative z-10">
        <div className="mb-10 border-b border-white/5 pb-6">
          <div className="h-10 w-72 bg-white/10 rounded mb-4"></div>
          <div className="h-4 w-96 bg-white/5 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#121317]/60 border border-white/5 rounded-xl p-6 h-[100px] flex flex-col justify-between">
              <div className="h-3 w-32 bg-white/10 rounded"></div>
              <div className="h-8 w-40 bg-white/20 rounded"></div>
            </div>
          ))}
        </div>

        <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
        <div className="bg-[#121317]/40 border border-[#B026FF]/20 rounded-xl overflow-hidden mb-12">
          <div className="h-12 border-b border-white/5 bg-[#1a1b20]/50"></div>
          <div className="p-4 flex justify-between items-center border-b border-white/5">
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-4 w-32 bg-white/5 rounded"></div>
            <div className="h-4 w-28 bg-white/5 rounded"></div>
            <div className="h-4 w-32 bg-white/10 rounded"></div>
            <div className="h-8 w-32 bg-[#B026FF]/20 rounded"></div>
          </div>
        </div>

        <div className="h-6 w-48 bg-white/10 rounded mb-6"></div>
        <div className="bg-[#121317]/40 border border-white/5 rounded-xl overflow-hidden">
          <div className="h-12 border-b border-white/5 bg-[#1a1b20]/50"></div>
          {[1, 2].map((i) => (
            <div key={i} className="p-4 flex justify-between items-center border-b border-white/5">
              <div className="h-4 w-24 bg-white/10 rounded"></div>
              <div className="h-4 w-32 bg-white/5 rounded"></div>
              <div className="h-4 w-28 bg-white/5 rounded"></div>
              <div className="h-4 w-24 bg-white/10 rounded"></div>
              <div className="h-4 w-20 bg-[#10B981]/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function BillingHistoryPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalUnpaid: 0, totalPaid: 0, pendingCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // ✅ STATE BARU: Custom Toast System
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // ✅ STATE BARU: Custom Cancel Confirmation Modal
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; invoiceId: number | null; shipmentId: number | null }>({
    isOpen: false,
    invoiceId: null,
    shipmentId: null
  });

  // Auto-dismiss toast system after 4 seconds
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
    async function loadBillingData() {
      try {
        const session = await getCurrentSession();
        if (session) {
          const res = await getCustomerBilling(session.id);
          if (res.success) {
            setInvoices(res.invoices);
            setSummary(res.summary);
          }
        }
      } catch (error) {
        console.error("Financial data sync error:", error);
        showNotification("error", "SYNC ERROR", "Failed to compile latest financial stream records.");
      } finally {
        setIsLoading(false);
      }
    }
    loadBillingData();
  }, []);

  // Handler for secure instant payment confirmation
  const handlePayment = async () => {
    if (!selectedInvoice) return;
    setIsSubmitting(true);

    try {
      const res = await confirmInvoicePayment(selectedInvoice.id, selectedInvoice.shipmentId);
      if (res.success) {
        showNotification("success", "PAYMENT CONFIRMED", "Transaction validated successfully. Fleet deployment protocol initialized.");
        setShowInvoiceDetail(false);
        // Gives 1.5s for user to look at the beautiful success toast notification before page reload
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showNotification("error", "PAYMENT REFUSED", "System rejected invoice clearance validation token.");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "NETWORK FAULT", "Cyberconnection timeout while reaching Neon payment core server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Triggers the custom cancellation verification modal layout sequence
  const handleCancelBookingClick = () => {
    if (!selectedInvoice) return;
    setCancelModal({
      isOpen: true,
      invoiceId: selectedInvoice.id,
      shipmentId: selectedInvoice.shipmentId
    });
  };

  // Executes actual permanent record deletion pipeline inside database node
  const executeCancelBooking = async () => {
    if (!cancelModal.invoiceId || !cancelModal.shipmentId) return;

    const currentInvoiceId = cancelModal.invoiceId;
    const currentShipmentId = cancelModal.shipmentId;

    setCancelModal({ isOpen: false, invoiceId: null, shipmentId: null });
    setIsSubmitting(true);
    
    try {
      const res = await cancelShipmentCustomer(currentInvoiceId, currentShipmentId);
      if (res.success) {
        showNotification("success", "MANIFEST PURGED", "Shipment manifest order sequence canceled and wiped permanently.");
        setShowInvoiceDetail(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showNotification("error", "CANCELLATION FAULT", res.message || "Database terminal rejected the termination command packet.");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "CONNECTION FAULT", "Pipeline terminal connection broken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return "Rp " + value.toLocaleString("id-ID");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col relative overflow-x-hidden">
      
      <UserNavbar />

      {/* === CUSTOM TOAST NOTIFICATION COMPONENT AREA === */}
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
              {toast.type === "success" ? <CheckCircle2 size={22} className="text-[#34C759]" /> : <AlertCircle size={22} className="text-[#FF3B30]" />}
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

      {/* === CUSTOM DESTRUCTIVE CANCELLATION MODAL CENTER === */}
      <AnimatePresence>
        {cancelModal.isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setCancelModal({ isOpen: false, invoiceId: null, shipmentId: null })}
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
                
                <h3 className="font-grotesk font-bold text-white text-xl tracking-[1px] uppercase mb-2">ABORT FREIGHT SHIPMENT</h3>
                <p className="text-[#FF3B30]/80 font-mono text-[10px] tracking-[2px] uppercase mb-4 font-bold">
                  MANIFEST TERMINATION SEQUENCING
                </p>
                
                <p className="text-white/60 font-inter text-[13px] leading-relaxed mb-8">
                  Are you absolutely certain you want to cancel and permanently delete this shipment booking request sequence? This operational command packet is irreversible.
                </p>
                
                <div className="flex gap-4 w-full">
                  <button 
                    type="button" 
                    onClick={() => setCancelModal({ isOpen: false, invoiceId: null, shipmentId: null })}
                    className="flex-1 py-3 border border-white/10 rounded text-white/60 hover:text-white hover:bg-white/5 font-mono text-[11px] font-bold tracking-[2px] uppercase transition-colors"
                  >
                    ABORT
                  </button>
                  <button 
                    type="button" 
                    onClick={executeCancelBooking}
                    className="flex-1 py-3 bg-[#FF3B30]/10 border border-[#FF3B30]/40 text-[#FF3B30] rounded font-mono text-[11px] font-bold tracking-[2px] uppercase hover:bg-[#FF3B30] hover:text-white shadow-[0_0_15px_rgba(255,59,48,0.2)] transition-all"
                  >
                    CONFIRM CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <BillingHistorySkeleton />
      ) : (
        <main className="flex-1 py-10 px-6 md:px-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B026FF]/5 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#BDF4FF]/5 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-[1000px] mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
              <div className="mb-10 border-b border-white/5 pb-6">
                <h1 className="text-white font-grotesk font-bold text-3xl md:text-4xl tracking-[-1px] uppercase mb-2">BILLING & <span className="text-[#B026FF]">HISTORY</span></h1>
                <p className="text-white/50 font-inter text-[14px]">Manage your pending invoices and view transaction logs for all deployments.</p>
              </div>

              {/* Financial Summaries Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#121317] border border-[#B026FF]/20 rounded-xl p-6">
                  <p className="text-white/40 font-grotesk text-[10px] uppercase tracking-[2px] mb-2">Total Unpaid Amount</p>
                  <p className="text-[#E5B5FF] font-inter font-bold text-2xl">{formatCurrency(summary.totalUnpaid)}</p>
                </div>
                <div className="bg-[#121317] border border-white/5 rounded-xl p-6">
                  <p className="text-white/40 font-grotesk text-[10px] uppercase tracking-[2px] mb-2">Pending Invoices</p>
                  <p className="text-white font-inter font-bold text-2xl">{summary.pendingCount} <span className="text-[14px] text-white/30 font-normal">deployment</span></p>
                </div>
                <div className="bg-[#121317] border border-white/5 rounded-xl p-6">
                  <p className="text-white/40 font-grotesk text-[10px] uppercase tracking-[2px] mb-2">Total Completed</p>
                  <p className="text-white font-inter font-bold text-2xl">{formatCurrency(summary.totalPaid)}</p>
                </div>
              </div>

              <h3 className="text-white font-grotesk text-[16px] uppercase tracking-[2px] mb-6 flex items-center gap-2"><CreditCard size={18} className="text-[#B026FF]" /> Pending Invoices</h3>
              <div className="bg-[#121317]/80 backdrop-blur-sm border border-[#B026FF]/20 rounded-xl overflow-hidden mb-12">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1a1b20] text-white/50 font-grotesk text-[10px] uppercase tracking-[2px] border-b border-white/5">
                        <th className="p-4">Invoice ID</th>
                        <th className="p-4">Shipment Ref</th>
                        <th className="p-4">Date Issued</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-white font-inter text-[13px]">
                      {invoices.filter(i => i.status === "Pending").map(invoice => (
                        <tr key={invoice.id} className="border-b border-white/5 hover:bg-[#B026FF]/5 transition-colors">
                          <td className="p-4 font-mono text-[#E5B5FF]">{invoice.invoiceNumString}</td>
                          <td className="p-4 text-white/70">{invoice.ref}</td>
                          <td className="p-4 text-white/70">{invoice.date}</td>
                          <td className="p-4 font-bold">{formatCurrency(invoice.amount)}</td>
                          <td className="p-4">
                            <button onClick={() => {setSelectedInvoice(invoice); setShowInvoiceDetail(true);}} className="bg-[#B026FF] hover:bg-[#9a1ce6] text-white px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all">Confirm Payment</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 className="text-white font-grotesk text-[16px] uppercase tracking-[2px] mb-6">Payment History</h3>
              <div className="bg-[#121317]/80 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#1a1b20] text-white/50 font-grotesk text-[10px] uppercase tracking-[2px] border-b border-white/5">
                        <th className="p-4">Invoice ID</th>
                        <th className="p-4">Shipment Ref</th>
                        <th className="p-4">Date Paid</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-white font-inter text-[13px]">
                      {invoices.filter(i => i.status === "Paid").map(invoice => (
                        <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {setSelectedInvoice(invoice); setShowInvoiceDetail(true);}}>
                          <td className="p-4 font-mono text-white/40">{invoice.invoiceNumString}</td>
                          <td className="p-4 text-white/70">{invoice.ref}</td>
                          <td className="p-4 text-white/70">{invoice.date}</td>
                          <td className="p-4">{formatCurrency(invoice.amount)}</td>
                          <td className="p-4"><span className="text-[#10B981] flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold"><CheckCircle2 size={12}/> Success</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      )}

      {/* Invoice Details Sliding UI Overlay Popover */}
      <AnimatePresence>
        {showInvoiceDetail && selectedInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInvoiceDetail(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-[500px] bg-[#0d0d11] border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(176,38,255,0.1)] z-10 my-auto overflow-hidden">
              <button onClick={() => setShowInvoiceDetail(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><XCircle size={24} /></button>
              <div className="absolute top-0 left-0 w-full h-[4px] bg-[#B026FF]/20" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-white font-grotesk font-bold text-2xl uppercase tracking-wider mb-1">Invoice Detail</h2>
                  <p className="text-white/40 font-mono text-[12px]">{selectedInvoice.invoiceNumString}</p>
                </div>
                <div className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${selectedInvoice.status === "Pending" ? "border-orange-500/50 text-orange-500 bg-orange-500/5" : "border-[#10B981]/50 text-[#10B981] bg-[#10B981]/5"}`}>
                  {selectedInvoice.status}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[11px] uppercase tracking-wider border-b border-white/5 pb-2">
                  <span className="text-white/40">Shipment Ref</span>
                  <span className="text-white font-mono">{selectedInvoice.ref}</span>
                </div>
                <div className="bg-[#121317] rounded-lg p-4 space-y-3">
                  {selectedInvoice.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-[12px]">
                      <span className="text-white/60">{item.desc}</span>
                      <span className="text-white font-mono">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                  <div className="pt-3 mt-1 border-t border-white/10 flex justify-between items-end">
                    <span className="text-white/40 font-grotesk text-[10px] uppercase">Grand Total</span>
                    <span className="text-[#B026FF] font-inter font-bold text-xl">{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.status === "Pending" ? (
                <div className="space-y-4">
                  <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-lg flex gap-3">
                    <AlertCircle size={20} className="text-orange-500 shrink-0" />
                    <p className="text-[11px] text-orange-500/80 leading-relaxed uppercase tracking-wider">
                      Make payment to the Maju Fleet account to process your cargo delivery to the next stage.
                    </p>
                  </div>
                  
                  {/* Custom Cancel Sequence button linked directly with custom verification window */}
                  <button 
                    onClick={handleCancelBookingClick}
                    disabled={isSubmitting}
                    className="w-full bg-transparent border border-red-500/40 hover:bg-red-500/10 text-red-400 py-3.5 rounded-lg font-grotesk font-bold text-[12px] uppercase tracking-[2px] transition-all disabled:opacity-30"
                  >
                    {isSubmitting ? "Processing Clearance..." : "Cancel & Delete Shipment"}
                  </button>

                  <button 
                    onClick={handlePayment} 
                    disabled={isSubmitting}
                    className="w-full bg-[#B026FF] py-4 rounded-lg text-white font-grotesk font-bold text-[14px] uppercase tracking-[3px] shadow-[0_0_20px_rgba(176,38,255,0.3)] hover:bg-[#9a1ce6] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing Clearance..." : "Proceed to Pay"}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowInvoiceDetail(false)} className="w-full border border-white/10 py-4 rounded-lg text-white/50 font-grotesk font-bold text-[14px] uppercase tracking-[3px] hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                  <FileText size={16} /> Download PDF Receipt
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}