import type { Metadata } from "next";
import { Suspense } from "react"; // ✅ 1. Import Suspense dari React
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  // 💡 SOLUSI FIX WARNING: Mengatur basis URL utama proyek Maju Fleet
  metadataBase: new URL("https://maju-fleet.vercel.app"),
  title: {
    default: "Maju Fleet — Maritime Logistics", 
    template: "%s | Maju Fleet" 
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
        {/* ✅ 2. Bungkus Navbar dengan Suspense boundary agar sukses build di Vercel */}
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        
        <main className="flex-1">{children}</main> 
        <Footer />
      </body>
    </html>
  );
}