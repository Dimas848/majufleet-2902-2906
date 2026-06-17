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

// ✅ SISTEM LOGIN GABUNGAN (SATU PINTU)
export async function loginUserUnified(email: string, password?: string) {
  try {
    if (!email || !password) return { success: false, message: "Email dan Password harus diisi." };

    const user = await prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      await recordAccessLog(email, "FAILED");
      return { success: false, message: "Email tidak ditemukan di sistem." };
    }

    if (user.password !== password) {
      await recordAccessLog(email, "FAILED_PASSWORD", user);
      return { success: false, message: "Password yang Anda masukkan salah!" };
    }

    const cookieStore = await cookies();

    // Deteksi Role User untuk menentukan jenis Cookie yang diset
    const isAdmin = user.role === "administrator" || user.role === "captain";

    if (isAdmin) {
      // Set Session untuk Admin (Max Age 2 Jam)
      cookieStore.set("admin_session_id", String(user.id), { httpOnly: true, maxAge: 60 * 60 * 2 });
      cookieStore.set("admin_name", user.name, { maxAge: 60 * 60 * 2 });
    } else if (user.role === "customer") {
      // Set Session untuk Customer (Max Age 24 Jam)
      cookieStore.set("session_user_id", String(user.id), { httpOnly: true, maxAge: 60 * 60 * 24 });
      cookieStore.set("session_user_name", user.name, { maxAge: 60 * 60 * 24 });
    } else {
      await recordAccessLog(email, "FAILED_ROLE", user);
      return { success: false, message: "Akses ditolak: Peran akun tidak dikenali." };
    }

    await recordAccessLog(email, "SUCCESS", user);

    return {
      success: true,
      message: "ACCESS AUTHORIZED.",
      role: isAdmin ? "admin" : "customer"
    };
  } catch (error) {
    console.error("Error Unified Login:", error);
    return { success: false, message: "Terjadi kesalahan koneksi pada server." };
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
        captain: true, // ✅ ikut ambil data kapten (relasi User)
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
      // ✅ captainId dikirim dari form (ID user yang berperan sebagai captain), bukan teks bebas
      const selectedCaptainId = data.captainId ? parseInt(data.captainId) : null;

      const shipmentData = {
        status: data.status || "PENDING",
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
          data: {
            ...shipmentData,
            // captainId boleh null (artinya "Awaiting Assignment" / belum ada kapten)
            captainId: selectedCaptainId,
          },
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
            // Hanya connect captain kalau ID-nya memang dipilih
            ...(selectedCaptainId ? { captain: { connect: { id: selectedCaptainId } } } : {}),
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
        // ✅ INTEGRASI FIX PASSWORD: Mengambil password form khusus crew, jika kosong default "maju123"
        password: data.password || "maju123",
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
        captain: true, // ✅ ikut ambil relasi captain (User)
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
        // ✅ s.captain sekarang object relasi User, ambil .name nya. Fallback ke "Awaiting Assignment" jika belum ada kapten
        crew: s.vessel?.crewLead || s.captain?.name || "Awaiting Assignment",
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
    // ✅ Field "captain" DIHAPUS dari create karena sekarang relasi ke User (captainId).
    // Biarkan captainId tetap null (artinya "Awaiting Assignment") sampai admin menugaskan kapten.
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
        // captain: dihapus — captainId otomatis null sampai di-assign

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
      await tx.shipment.update({
        where: { id: Number(shipmentId) },
        data: { status: "PENDING" } // 🔒 Ubah ke PENDING agar admin yang mengubahnya nanti ke NOT DEPARTED YET setelah kapal diisi
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
        captain: true, // ✅ ikut ambil relasi captain agar bisa ditampilkan di tracking
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

// ==============================================================================
// 5. ANALYTICS ACTIONS (NATIVE QUERY UNTUK DASHBOARD ADMIN)
// ==============================================================================

export async function getAnalyticsByTime(chartTimeFilter: "Day" | "Week" | "Month") {
  try {
    const now = new Date();
    let startDate = new Date();

    // Logika pemotongan waktu mundur
    if (chartTimeFilter === "Day") startDate.setDate(now.getDate() - 1);
    else if (chartTimeFilter === "Week") startDate.setDate(now.getDate() - 7);
    else if (chartTimeFilter === "Month") startDate.setDate(now.getDate() - 30);

    const data = await prisma.shipment.findMany({
      where: {
        book_date: { gte: startDate },
        NOT: { status: "CANCELED" } // Jangan hitung kargo yang dibatalkan
      },
      include: {
        items: { include: { packageType: true } },
        invoice: true
      },
      orderBy: { book_date: "asc" }
    });

    return data;
  } catch (error) {
    console.error("Gagal menarik data Analytics dinamis dari Neon:", error);
    return [];
  }
}

export async function updateUserProfile(userId: number, data: { name: string; phone: string; address: string; password?: string }) {
  try {
    const updateData: any = {
      name: data.name,
      phone: data.phone || null,
      address: data.address || null,
    };

    // Jika admin/crew mengisi kolom password baru, ikut masukkan ke database
    if (data.password && data.password.trim() !== "") {
      updateData.password = data.password;
    }

    await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
    });

    // Segarkan cache halaman setelah data berubah
    revalidatePath("/Dashboard-Admin/profile");
    return { success: true, message: "Profile core matrices synchronized successfully." };
  } catch (error) {
    console.error("Gagal mengupdate profil user:", error);
    return { success: false, message: "Database write fault encountered." };
  }
}

export async function changeUserPassword(userId: number, data: { oldPassword: string; newPassword: string }) {
  try {
    // 1. Cari user di database Neon
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return { success: false, message: "User node not found." };
    }

    // 2. Verifikasi apakah password lama yang dimasukkan sesuai
    if (user.password !== data.oldPassword) {
      return { success: false, message: "Current access key verification failed. Incorrect password." };
    }

    // 3. Jika cocok, update dengan password baru
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: data.newPassword }
    });

    return { success: true, message: "Access credentials updated successfully." };
  } catch (error) {
    console.error("Gagal memperbarui password:", error);
    return { success: false, message: "Database write fault encountered." };
  }
}