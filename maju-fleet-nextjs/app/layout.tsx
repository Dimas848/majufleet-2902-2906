import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// REVISI METADATA AGAR MENDUKUNG TEMPLATE OTOMATIS
export const metadata: Metadata = {
  title: {
    default: "Maju Fleet — Maritime Logistics", // Judul bawaan jika halaman lain tidak punya metadata
    template: "%s | Maju Fleet"               // Pola gabungan otomatis (cth: Booking | Maju Fleet)
  },
  description: "Intelligent maritime logistics powered by real-time telemetry, AI-driven insights, and global satellite connectivity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-bg-dark">
        <Navbar />
        {/* HAPUS pt-[68px] DI SINI */}
        <main className="flex-1">{children}</main> 
        <Footer />
      </body>
    </html>
  );
}