"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// ==============================================================================
// 1. AUTHENTICATION & SESSION ACTIONS (LOGIN, REGISTER, COOKIES)
// ==============================================================================

/**
 * Pendaftaran akun Customer baru langsung ke database Neon
 */
export async function registerCustomer(formData: any) {
  try {
    // 1. Cek apakah email sudah terdaftar sebelumnya
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email }
    });

    if (existingUser) {
      return { success: false, message: "Email sudah terdaftar!" };
    }

    // 2. Simpan data customer baru ke tabel User (TANPA createdAt)
    const newUser = await prisma.user.create({
      data: {
        name: formData.name,
        email: formData.email,
        password: formData.password || "maju123", // Default password jika form belum menyediakan
        phone: formData.phone || null,
        address: formData.address || null,
        role: "customer", // Dikunci murni sebagai customer
        status: "Active"
      }
    });

    return { success: true, message: "Registrasi berhasil!" };
  } catch (error) {
    console.error("Error Register Customer:", error);
    return { success: false, message: "Gagal melakukan registrasi sistem." };
  }
}

/**
 * Login Customer dengan validasi Email dan Password
 */
export async function loginCustomer(email: string, password?: string) {
  try {
    // 1. Tolak jika form kosong
    if (!email || !password) {
      return { success: false, message: "Email dan Password harus diisi." };
    }

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    // 2. Validasi apakah user ditemukan dan rolenya adalah customer
    if (!user || user.role !== "customer") {
      return { success: false, message: "Email tidak ditemukan atau Anda bukan akun Customer!" };
    }

    // 3. Validasi Password
    if (user.password !== password) {
      return { success: false, message: "Password yang Anda masukkan salah!" };
    }

    // 4. Pasang session di Cookie selama 1 hari (24 Jam)
    const cookieStore = await cookies();
    cookieStore.set("session_user_id", String(user.id), { httpOnly: true, maxAge: 60 * 60 * 24 });
    cookieStore.set("session_user_name", user.name, { maxAge: 60 * 60 * 24 });

    return { success: true, message: "Access Authorized. Welcome back!" };
  } catch (error) {
    console.error("Error Login Customer:", error);
    return { success: false, message: "Terjadi kesalahan koneksi pada server." };
  }
}

/**
 * Login Administrator / Commander Override dengan validasi tingkat tinggi
 */
export async function loginAdmin(commanderId: string, masterKey: string) {
  // 1. Cek input kosong
  if (!commanderId || !masterKey) {
    return { success: false, message: "ACCESS DENIED: CREDENTIALS CANNOT BE EMPTY." };
  }

  try {
    // 2. Cari Admin di database berdasarkan Email (Commander ID)
    const adminUser = await prisma.user.findUnique({
      where: { email: commanderId }
    });

    // 3. Jika email tidak ketemu
    if (!adminUser) {
      return { success: false, message: "ACCESS DENIED: COMMANDER ID NOT FOUND IN DATABASE." };
    }

    // 4. Jika Master Key (Password) salah
    if (adminUser.password !== masterKey) {
      return { success: false, message: "ACCESS DENIED: INVALID MASTER KEY CLEARANCE." };
    }

    // 5. Jika dia punya akun, tapi BUKAN seorang administrator atau kapten
    if (adminUser.role !== "administrator" && adminUser.role !== "captain") {
      return { success: false, message: "ACCESS DENIED: INSUFFICIENT CLEARANCE LEVEL." };
    }

    // 6. Pasang Cookie Sesi Admin khusus selama 2 jam demi keamanan berkala
    const cookieStore = await cookies();
    cookieStore.set("admin_session_id", String(adminUser.id), { httpOnly: true, maxAge: 60 * 60 * 2 });
    cookieStore.set("admin_name", adminUser.name, { maxAge: 60 * 60 * 2 });

    return { success: true, message: "ACCESS AUTHORIZED." };
  } catch (error) {
    console.error("Admin Auth Error:", error);
    return { success: false, message: "CRITICAL SERVER ERROR DURING CLEARANCE CHECK." };
  }
}

/**
 * Mengambil informasi sesi cookie user aktif (untuk proteksi halaman dashboard)
 */
export async function getCurrentSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  const userName = cookieStore.get("session_user_name")?.value;

  if (!userId) return null;
  return { id: parseInt(userId), name: userName };
}


// ==============================================================================
// 2. ADMIN CORE ACTIONS (CRUD MASTER DATA FOR CONTROL CENTER)
// ==============================================================================

/**
 * Mengambil seluruh data master gabungan untuk ditampilkan di Control Center Admin
 */
export async function getAllData() {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        vessel: true,
        user: true,
        items: {
          include: {
            packageType: true 
          }
        }
      },
      orderBy: { id: "desc" }
    });

    const crews = await prisma.user.findMany({
      where: {
        NOT: { role: "customer" }
      },
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

/**
 * Menyimpan data Baru (Create) atau memperbarui data lama (Update) di Control Center Admin
 */
export async function saveEntity(entityType: string, data: any, editingId: number | null) {
  try {
    const isUpdating = editingId !== null;

    // --- SINKRONISASI SHIPMENT / FLEET ---
    if (entityType === "fleet") {
      const shipmentData = {
        status: data.status || "PENDING",
        captain: data.captain,
        senderName: data.senderName,
        senderContact: data.senderContact,
        senderEmail: data.senderEmail,
        senderAddress: data.senderAddress,
        senderCountry: data.senderCountry,
        senderCity: data.senderCity,
        recipientName: data.recipientName,
        recipientContact: data.recipientContact,
        recipientEmail: data.recipientEmail,
        recipientAddress: data.recipientAddress,
        recipientCountry: data.recipientCountry,
        recipientCity: data.recipientCity,
        cargoDesc: data.cargoDesc || data.itemDescription || "General Cargo", // Fallback dari form
        weight: parseFloat(data.weight || "0"),
        weightUnit: data.weightUnit || "KG",
        dimensions: parseFloat(data.dimensions || "0"),
        category: data.category,
      };

      if (isUpdating) {
        await prisma.shipment.update({
          where: { id: editingId },
          data: shipmentData,
        });
      } else {

        await prisma.shipment.create({
          data: {
            receipt_number: data.code || `MJF-${Math.floor(100000 + Math.random() * 900000)}`,
            userId: data.userId || 1, // Fallback ID jika tidak diinput manual
            ...shipmentData,
            items: {
              create: [
                {
                  description: data.cargoDesc || data.itemDescription || "General Cargo",
                  weight_kg: parseFloat(data.weight || "0"),
                  packageTypeId: data.packageTypeId || 1, // Fallback ke PackageType ID 1 (misal MAJU ECONOMY)
                }
              ]
            }
          },
        });
      }
    } 
    
    // --- SINKRONISASI CREW DATA ---
    else if (entityType === "crew") {
      const crewData = {
        name: data.name,
        email: data.email,
        phone: data.contact,
        role: data.role || "crew",
        gender: data.gender,
        age: parseInt(data.age || "0"),
        origin: data.origin,
      };

      if (isUpdating) {
        await prisma.user.update({
          where: { id: editingId },
          data: crewData,
        });
      } else {
        await prisma.user.create({
          data: crewData,
        });
      }
    }

    // --- SINKRONISASI VESSEL REGISTRY ---
    else if (entityType === "vessel") {
      const vesselData = {
        name: data.name,
        capacity: parseInt(data.capacity || "0"),
        capacityUnit: data.capacityUnit || "TONNES",
        type: data.type || "Cargo",
        crewLead: data.crewLead,
        status: data.status || "Active",
      };

      if (isUpdating) {
        await prisma.vessel.update({
          where: { id: editingId },
          data: vesselData,
        });
      } else {
        await prisma.vessel.create({
          data: vesselData,
        });
      }
    }

    // Revalidasi jalur agar tampilan web admin langsung ter-update seketika
    revalidatePath("/Dashboard-Admin/register");
    revalidatePath("/Dashboard-Admin/fleet");
    revalidatePath("/Dashboard-Admin/analytics");
    return { success: true };
  } catch (error) {
    console.error(`Gagal menyimpan data ${entityType} ke Neon:`, error);
    return { success: false };
  }
}

/**
 * Menghapus data permanen dari database cloud Neon berdasarkan entitasnya
 */
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

/**
 * Menarik data koordinat dari database Neon untuk dirender di Peta Pemantauan Digital
 */
export async function getMapVessels() {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        vessel: true,
        items: {
          include: { packageType: true }
        },
        details: {
          orderBy: { update_time: 'desc' },
          take: 1
        }
      }
    });

    return shipments.map((s: any) => {
      const latestDetail = s.details?.[0];
      const lat = latestDetail?.current_lat ?? 0;
      const lng = latestDetail?.current_lng ?? 0;

      // Konfigurasi warna penanda radar siber berdasarkan status armada
      let dotColor = "#00E3FD"; // Default: Cyan cerah
      let reason = "";

      if (s.status === "DELIVERED") {
        dotColor = "#34C759"; // Hijau stabil
      } else if (s.status === "DELAYED") {
        dotColor = "#FF3B30"; // Merah kritis
        reason = "Weather anomaly / Port congestion";
      } else if (s.status === "PENDING" || s.status === "NOT DEPARTED YET") {
        dotColor = "#FFCC00"; // Kuning stand-by
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
// 4. CUSTOMER DASHBOARD ACTIONS (FINANCIAL BILLING LOGS & HISTORY)
// ==============================================================================

/**
 * Menarik data logistik dan menghitung kalkulasi invoice keuangan otomatis per Customer
 */
export async function getCustomerBilling(userId: number) {
  try {
    const shipments = await prisma.shipment.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: { packageType: true }
        }
      },
      orderBy: { book_date: 'desc' }
    });

    let totalUnpaid = 0;
    let totalPaid = 0;
    let pendingCount = 0;

    const invoices = shipments.map((s: any) => {
      // 1. Ambil harga dasar kargo dari tabel PackageType hasil relasi
      const basePrice = s.items?.[0]?.packageType?.base_price ?? 1000000; 
      
      // Hitung kelipatan tonase kargo (per 1000 KG dianggap 1 slot kontainer)
      const weightFactor = s.weight && s.weight > 0 ? Math.ceil(s.weight / 1000) : 1;
      const freightCharge = basePrice * weightFactor;
      
      // 2. Tambahan biaya operasional logistik pelengkap
      const insurance = Math.round(freightCharge * 0.05); // Asuransi kargo (5%)
      const fuelSurcharge = Math.round(freightCharge * 0.08); // Biaya bahan bakar laut (8%)
      const grandTotal = freightCharge + insurance + fuelSurcharge;

      // 3. Klasifikasi status pembayaran berdasarkan posisi status logistik
      const isPaid = s.status === "DELIVERED" || s.status === "ARRIVED";
      const paymentStatus = isPaid ? "Paid" : "Pending";

      // Accumulate ringkasan finansial utama
      if (!isPaid) {
        totalUnpaid += grandTotal;
        pendingCount += 1;
      } else {
        totalPaid += grandTotal;
      }

      // Format tanggal rilis invoice agar ramah dibaca
      const formattedDate = new Date(s.book_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      return {
        id: `INV-${new Date(s.book_date).getFullYear()}-${1000 + s.id}`,
        ref: s.receipt_number,
        date: formattedDate,
        amount: grandTotal, 
        status: paymentStatus,
        items: [
          { desc: `Freight Charges (${s.cargoDesc || "Standard Logistical Cargo"})`, price: freightCharge },
          { desc: "Logistics Protection Insurance (5%)", price: insurance },
          { desc: "Fuel & Marine Surcharge (8%)", price: fuelSurcharge }
        ]
      };
    });

    return {
      success: true,
      invoices,
      summary: { totalUnpaid, totalPaid, pendingCount }
    };
  } catch (error) {
    console.error("Gagal memuat data billing dari Neon:", error);
    return { 
      success: false, 
      invoices: [], 
      summary: { totalUnpaid: 0, totalPaid: 0, pendingCount: 0 } 
    };
  }
}