"use server";

import { PrismaClient, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ==============================================================================
// 1. AUTHENTICATION & SESSION ACTIONS (LOGIN, REGISTER, COOKIES, LOGS)
// ==============================================================================

// Helper untuk mencatat log otomatis
async function recordAccessLog(email: string, status: string, user?: any) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "127.0.0.1";
    // Ambil info device dari user-agent, potong max 50 karakter agar rapi
    const rawDevice = headersList.get("user-agent") || "Unknown Device";
    const device = rawDevice.split(" ")[0].substring(0, 50); 

    await prisma.accessLog.create({
      data: {
        userId: user ? user.id : null,
        name: user ? user.name : "Unknown User",
        email: email,
        role: user ? user.role : "unknown",
        ipAddress: ipAddress,
        device: device,
        location: "System / Online",
        status: status,
      }
    });
  } catch (error) {
    console.error("Gagal mencatat log:", error);
  }
}

export async function registerCustomer(formData: any) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email }
    });

    if (existingUser) {
      return { success: false, message: "Email sudah terdaftar!" };
    }

    await prisma.user.create({
      data: {
        name: formData.name,
        email: formData.email,
        password: formData.password || "maju123",
        phone: formData.phone || null,
        address: formData.address || null,
        role: "customer",
        status: "Active"
      }
    });

    return { success: true, message: "Registrasi berhasil!" };
  } catch (error) {
    console.error("Error Register Customer:", error);
    return { success: false, message: "Gagal melakukan registrasi sistem." };
  }
}

export async function loginCustomer(email: string, password?: string) {
  try {
    if (!email || !password) return { success: false, message: "Email dan Password harus diisi." };

    const user = await prisma.user.findUnique({ where: { email: email } });

    if (!user || user.role !== "customer") {
      await recordAccessLog(email, "FAILED"); // Catat log gagal
      return { success: false, message: "Email tidak ditemukan atau Anda bukan akun Customer!" };
    }

    if (user.password !== password) {
      await recordAccessLog(email, "FAILED_PASSWORD", user); // Catat log salah password
      return { success: false, message: "Password yang Anda masukkan salah!" };
    }

    const cookieStore = await cookies();
    cookieStore.set("session_user_id", String(user.id), { httpOnly: true, maxAge: 60 * 60 * 24 });
    cookieStore.set("session_user_name", user.name, { maxAge: 60 * 60 * 24 });

    await recordAccessLog(email, "SUCCESS", user); // Catat log sukses

    return { success: true, message: "Access Authorized. Welcome back!" };
  } catch (error) {
    console.error("Error Login Customer:", error);
    return { success: false, message: "Terjadi kesalahan koneksi pada server." };
  }
}

export async function loginAdmin(commanderId: string, masterKey: string) {
  if (!commanderId || !masterKey) return { success: false, message: "ACCESS DENIED." };

  try {
    const adminUser = await prisma.user.findUnique({ where: { email: commanderId } });

    if (!adminUser) {
      await recordAccessLog(commanderId, "FAILED");
      return { success: false, message: "ACCESS DENIED: USER NOT FOUND." };
    }

    if (adminUser.password !== masterKey) {
      await recordAccessLog(commanderId, "FAILED_PASSWORD", adminUser);
      return { success: false, message: "ACCESS DENIED: PASSWORD INVALID." };
    }

    if (adminUser.role !== "administrator" && adminUser.role !== "captain") {
      await recordAccessLog(commanderId, "FAILED_ROLE", adminUser);
      return { success: false, message: "ACCESS DENIED: ROLE NOT AUTHORIZED." };
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_session_id", String(adminUser.id), { httpOnly: true, maxAge: 60 * 60 * 2 });
    cookieStore.set("admin_name", adminUser.name, { maxAge: 60 * 60 * 2 });

    await recordAccessLog(commanderId, "SUCCESS", adminUser);

    return { success: true, message: "ACCESS AUTHORIZED." };
  } catch (error) {
    console.error("Admin Auth Error:", error);
    return { success: false, message: "SYSTEM ERROR." };
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  const userName = cookieStore.get("session_user_name")?.value;

  if (!userId) return null;
  return { id: parseInt(userId), name: userName };
}

// Fungsi Baru untuk Menarik Data Access Log ke UI Admin
export async function getSystemAccessLogs() {
  try {
    const logs = await prisma.accessLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Menampilkan 100 log terakhir agar tidak terlalu berat
    });
    return { success: true, logs };
  } catch (error) {
    console.error("Gagal mengambil data logs:", error);
    return { success: false, logs: [] };
  }
}

// ==============================================================================
// 2. ADMIN CORE ACTIONS (CRUD MASTER DATA FOR CONTROL CENTER)
// ==============================================================================

export async function getAllData() {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        vessel: true,
        user: true,
        items: { include: { packageType: true } }
      },
      orderBy: { id: "desc" }
    });

    const crews = await prisma.user.findMany({
      where: { NOT: { role: "customer" } },
      orderBy: { id: "desc" }
    });

    const customers = await prisma.user.findMany({
      where: { role: "customer" },
      orderBy: { id: "desc" }
    });

    const vessels = await prisma.vessel.findMany({
      orderBy: { id: "desc" }
    });

    return { shipments, crews, customers, vessels };
  } catch (error) {
    console.error("Gagal mengambil data dari Neon:", error);
    return { shipments: [], crews: [], customers: [], vessels: [] };
  }
}

export async function saveEntity(entityType: string, data: any, editingId: number | null) {
  try {
    const isUpdating = editingId !== null;

    if (entityType === "fleet") {
      const shipmentData = {
        status: data.status || "PENDING",
        captain: data.captain || "UNASSIGNED",
        senderName: data.senderName || null,
        senderContact: data.senderContact || null,
        senderEmail: data.senderEmail || null,
        senderAddress: data.senderAddress || null,
        senderCountry: data.senderCountry || null,
        senderCity: data.senderCity || "Jakarta",
        recipientName: data.recipientName || null,
        recipientContact: data.recipientContact || null,
        recipientEmail: data.recipientEmail || null,
        recipientAddress: data.recipientAddress || null,
        recipientCountry: data.recipientCountry || null,
        recipientCity: data.recipientCity || "Rotterdam",
        cargoDesc: data.cargoDesc || data.itemDescription || "General Cargo",
        weight: parseFloat(data.weight || "0"),
        weightUnit: data.weightUnit || "KG",
        dimensions: parseFloat(data.dimensions || "0"),
        category: data.category || "General",
      };

      if (isUpdating) {
        await prisma.shipment.update({
          where: { id: editingId },
          data: shipmentData,
        });
      } else {
        const selectedUserId = data.userId ? parseInt(data.userId) : 1;
        const selectedVesselId = data.vesselId ? parseInt(data.vesselId) : 1;
        const selectedPackageTypeId = data.packageTypeId ? parseInt(data.packageTypeId) : 2;

        await prisma.shipment.create({
          data: {
            receipt_number: data.code || `MJF-${Math.floor(100000 + Math.random() * 900000)}`,
            user: { connect: { id: selectedUserId } },
            vessel: { connect: { id: selectedVesselId } },
            ...shipmentData,
            items: {
              create: [
                {
                  description: data.cargoDesc || data.itemDescription || "General Cargo",
                  weight_kg: parseFloat(data.weight || "0"),
                  packageType: { connect: { id: selectedPackageTypeId } }
                }
              ]
            }
          },
        });
      }
    } else if (entityType === "crew") {
      const crewData = {
        name: data.name,
        email: data.email,
        phone: data.contact || null,
        role: data.role || "crew",
        gender: data.gender || null,
        age: data.age ? parseInt(data.age) : null,
        origin: data.origin || null,
      };

      if (isUpdating) {
        await prisma.user.update({
          where: { id: editingId },
          data: crewData,
        });
      } else {
        await prisma.user.create({ data: crewData });
      }
    } else if (entityType === "vessel") {
      const vesselData = {
        name: data.name,
        capacity: parseInt(data.capacity || "0"),
        capacityUnit: data.capacityUnit || "TONNES",
        type: data.type || "Cargo",
        crewLead: data.crewLead || null,
        status: data.status || "Active",
      };

      if (isUpdating) {
        await prisma.vessel.update({
          where: { id: editingId },
          data: vesselData,
        });
      } else {
        await prisma.vessel.create({ data: vesselData });
      }
    }

    revalidatePath("/Dashboard-Admin/register");
    revalidatePath("/Dashboard-Admin/fleet");
    revalidatePath("/Dashboard-Admin/analytics");
    return { success: true };
  } catch (error) {
    console.error(`Gagal menyimpan data ${entityType} ke Neon:`, error);
    return { success: false };
  }
}

export async function deleteEntity(entityType: string, id: number) {
  try {
    if (entityType === "fleet") {
      await prisma.shipment.delete({ where: { id } });
    } else if (entityType === "crew" || entityType === "customer") {
      await prisma.user.delete({ where: { id } });
    } else if (entityType === "vessel") {
      await prisma.vessel.delete({ where: { id } });
    }
    
    revalidatePath("/Dashboard-Admin/register");
    revalidatePath("/Dashboard-Admin/fleet");
    revalidatePath("/Dashboard-Admin/analytics");
    return { success: true };
  } catch (error) {
    console.error(`Gagal menghapus data ${entityType} dari Neon:`, error);
    return { success: false };
  }
}

// ==============================================================================
// 3. MAP ACTIONS (SINKRONISASI KOORDINAT REAL-TIME LEAFLET MAP)
// ==============================================================================

export async function getMapVessels() {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        vessel: true,
        items: { include: { packageType: true } },
        details: { orderBy: { update_time: 'desc' }, take: 1 }
      }
    });

  return shipments.map((s: any) => {
      const latestDetail = s.details?.[0];
      const lat = latestDetail?.current_lat ?? 0;
      const lng = latestDetail?.current_lng ?? 0;

      let dotColor = "#00E3FD";
      let reason = "";

      if (s.status === "DELIVERED") {
        dotColor = "#34C759";
      } else if (s.status === "DELAYED") {
        dotColor = "#FF3B30";
        reason = "Weather anomaly / Port congestion";
      } else if (s.status === "PENDING" || s.status === "NOT DEPARTED YET") {
        dotColor = "#FFCC00";
        reason = "Awaiting customs clearance";
      }

      return {
        id: s.receipt_number,
        name: s.vessel?.name || "Cargo Fleet Container",
        lat: lat,
        lng: lng,
        status: s.status,
        dotColor: dotColor,
        package: s.items?.[0]?.packageType?.name || "Standard Cargo Load",
        crew: s.vessel?.crewLead || s.captain || "Commander Unassigned",
        origin: s.senderCity || "Origin Hub",
        dest: s.recipientCity || "Destination Port",
        reason: reason
      };
    });
  } catch (error) {
    console.error("Gagal mengambil data koordinat peta:", error);
    return [];
  }
}

// ==============================================================================
// 4. CUSTOMER DASHBOARD ACTIONS (INTEGRATED BILLING, BOOKING, & TRACKING)
// ==============================================================================

export async function bookShipmentCustomer(formData: {
  userId: number;
  packageTypeString: string;
  senderCity: string;
  recipientCity: string;
  cargoDesc: string;
  category: string;
  weight: number;
  dimensions: number;
}) {
  try {
    const cleanUserId = Number(formData.userId);
    const cleanWeight = Number(formData.weight) || 0;
    const cleanDimensions = Number(formData.dimensions) || 0;

    const activeUser = await prisma.user.findUnique({
      where: { id: cleanUserId }
    });

    if (!activeUser) {
      return { success: false, message: "Akses ditolak: User ID tidak ditemukan." };
    }

    const packageMapping: Record<string, number> = {
      economy: 1,
      standard: 2,
      heavy: 3,
      express: 4,
      vip: 5
    };
    const packageTypeId = packageMapping[formData.packageTypeString] || 1;

    // SINKRONISASI LIST HARGA PER KG SESUAI BROSUR
    const pricingMapping: Record<string, number> = {
      economy: 59000,
      standard: 70000,
      heavy: 120000, 
      express: 90000,
      vip: 150000    
    };
    
    const basePricePerKg = pricingMapping[formData.packageTypeString] || 70000;
    
    // 💡 Kalkulasi Total Tagihan (Berat KG x Harga Brosur Paket)
    const freightCharge = basePricePerKg * cleanWeight;
    const insurance = Math.round(freightCharge * 0.05);
    const fuelSurcharge = Math.round(freightCharge * 0.08);
    const grandTotal = freightCharge + insurance + fuelSurcharge;

    const originInput = formData.senderCity ? formData.senderCity.toLowerCase() : "";
    const destInput = formData.recipientCity ? formData.recipientCity.toLowerCase() : "";

    let originId = 1; 
    let destId = 3;   

    if (originInput.includes("jakarta") || originInput.includes("priok")) originId = 1;
    if (originInput.includes("rotterdam")) originId = 2;
    if (destInput.includes("singapo") || destInput.includes("singapu")) destId = 3;
    if (destInput.includes("tokyo")) destId = 4;

    const receiptNumber = `MJF-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 🔥 CREATE BERSARANG (NESTED CREATE): Membuat Shipment, Items, dan Invoice sekaligus!
    await prisma.shipment.create({
      data: {
        receipt_number: receiptNumber,
        status: "PENDING",
        userId: cleanUserId,
        vesselId: 1, 
        originId: originId, 
        destId: destId,     
        cargoDesc: formData.cargoDesc,
        category: formData.category,
        weight: cleanWeight,
        weightUnit: "KG",
        dimensions: cleanDimensions,
        book_date: new Date(),
        
        senderName: activeUser.name,
        senderEmail: activeUser.email,
        senderContact: activeUser.phone || "08123456789",
        senderCity: formData.senderCity,
        senderAddress: activeUser.address || "Hub Logistik Utama",
        senderCountry: "Indonesia",

        recipientName: "PT Global Logistics Partner",
        recipientContact: "021998877",
        recipientEmail: "partner@majufleet.com",
        recipientAddress: "Port Warehouse Zone Alpha",
        recipientCity: formData.recipientCity,
        recipientCountry: "Destination Country",
        captain: "Awaiting Assignment",

        items: {
          create: [
            {
              description: formData.cargoDesc,
              weight_kg: cleanWeight,
              packageTypeId: packageTypeId,
            }
          ]
        },
        invoice: {
          create: {
            invoiceNumber: invoiceNumber,
            amount: grandTotal,
            status: "Pending"
          }
        }
      }
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/myshipments");
    return { success: true, message: "Booking kargo berhasil terdaftar!" };

  } catch (error) {
    console.error("❌ CRITICAL DATABASE CRASH REPORT:", error);
    return { success: false, message: "Terjadi kesalahan internal pada transaksi database." };
  }
}

export async function confirmInvoicePayment(invoiceId: number, shipmentId: number) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Ubah status Invoice jadi Paid
      await tx.invoice.update({
        where: { id: Number(invoiceId) },
        data: { status: "Paid" }
      });

      // 2. Ubah status Kargo jadi Siap Berangkat
      await tx.shipment.update({
        where: { id: Number(shipmentId) },
        data: { status: "NOT DEPARTED YET" }
      });
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/myshipments");
    return { success: true };
  } catch (error) {
    console.error("Gagal konfirmasi pembayaran:", error);
    return { success: false };
  }
}

export async function getCustomerBilling(userId: number) {
  try {
    // Pastikan userId dikonversi ke Number
    const uId = Number(userId);
    
    const dbInvoices = await prisma.invoice.findMany({
      where: { shipment: { userId: uId } },
      include: {
        shipment: {
          include: {
            items: { include: { packageType: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // DEBUG: Cek apakah data benar-benar ditemukan
    console.log(`Found ${dbInvoices.length} invoices for user ${uId}`);

    if (dbInvoices.length === 0) return { success: true, invoices: [], summary: { totalUnpaid: 0, totalPaid: 0, pendingCount: 0 } };

    let totalUnpaid = 0;
    let totalPaid = 0;
    let pendingCount = 0;

    const invoices = dbInvoices.map((inv: any) => {
      const s = inv.shipment;
      // Gunakan fallback agar tidak crash jika shipment/items null
      const cleanWeight = s?.weight || 0;
      const amount = Number(inv.amount); // Pastikan angka (BigInt/String jadi Number)

      if (inv.status !== "Paid" && s?.status !== "CANCELED") {
        totalUnpaid += amount;
        pendingCount += 1;
      } else if (inv.status === "Paid" && s?.status !== "CANCELED") {
        totalPaid += amount;
      }

      return {
        id: inv.id,
        invoiceNumString: inv.invoiceNumber,
        shipmentId: inv.shipmentId,
        ref: s?.receipt_number || "UNKNOWN",
        date: new Date(inv.createdAt).toLocaleDateString('id-ID'),
        amount: amount, 
        status: s?.status === "CANCELED" ? "Canceled" : inv.status,
        items: [
          { desc: `Freight Charges (${s?.cargoDesc || "Cargo load"}) - ${cleanWeight} KG`, price: amount }
        ]
      };
    });

    return { success: true, invoices, summary: { totalUnpaid, totalPaid, pendingCount } };
  } catch (error) {
    console.error("DEBUG ERROR: Gagal memuat billing:", error);
    return { success: false, invoices: [], summary: { totalUnpaid: 0, totalPaid: 0, pendingCount: 0 } };
  }
}

export async function trackShipmentCustomer(receiptNumber: string) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { receipt_number: receiptNumber },
      include: {
        vessel: true,
        items: { include: { packageType: true } },
        details: { orderBy: { update_time: "desc" }, take: 1 }
      }
    });

    if (!shipment) return { success: false };
    return { success: true, data: shipment };
  } catch (error) {
    console.error("Tracking Error:", error);
    return { success: false };
  }
}

export async function getCustomerShipments(userId: number) {
  try {
    const dbShipments = await prisma.shipment.findMany({
      where: { userId: Number(userId) },
      include: {
        vessel: true,
        items: { include: { packageType: true } }
      },
      orderBy: { book_date: 'desc' }
    });

    const shipments = dbShipments.map((s: any) => {
      const formattedDate = s.book_date 
        ? new Date(s.book_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        : "-";

      return {
        id: s.id,
        receipt_number: s.receipt_number,
        cargoDesc: s.cargoDesc || "General Cargo Load",
        senderCity: s.senderCity || "Origin Hub",
        recipientCity: s.recipientCity || "Destination Port",
        weight: s.weight ? Number(s.weight) : 0,
        status: s.status,
        date: formattedDate
      };
    });

    return { success: true, shipments };
  } catch (error) {
    console.error("Gagal memuat armada kargo customer:", error);
    return { success: false, shipments: [] };
  }
}

export async function cancelShipmentCustomer(invoiceId: number, shipmentId: number) {
  try {
    const cleanInvoiceId = Number(invoiceId);
    const cleanShipmentId = Number(shipmentId);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.invoice.delete({
        where: { id: cleanInvoiceId }
      });

      await tx.shipmentItem.deleteMany({
        where: { shipmentId: cleanShipmentId }
      });

      await tx.shipment.delete({
        where: { id: cleanShipmentId }
      });
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard/myshipments");
    
    return { success: true, message: "Transaksi berhasil dibatalkan dan dihapus bersih dari sistem." };
  } catch (error) {
    console.error("Gagal membatalkan transaksi customer:", error);
    return { success: false, message: "Terjadi kesalahan internal saat memproses pembatalan kargo." };
  }
}