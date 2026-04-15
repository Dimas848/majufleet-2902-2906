import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Maju Fleet — Maritime Logistics",
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
        <main className="flex-1 pt-[68px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
