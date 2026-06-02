import { Metadata } from "next";
import BookShipmentClient from "./AnalyticsPage";

// Sesuai instruksi penugasan unguided, judul halaman memanfaatkan MetaData Next.js
export const metadata: Metadata = {
  title: "Analytics Menu",
  description: "Check your daily analytics cargo shipment on Maju Fleet portal.",
};

export default function Page() {
  return <BookShipmentClient />;
}