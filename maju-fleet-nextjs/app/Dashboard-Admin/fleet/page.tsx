import { Metadata } from "next";
import BookShipmentClient from "./FleetPage";

// Sesuai instruksi penugasan unguided, judul halaman memanfaatkan MetaData Next.js
export const metadata: Metadata = {
  title: "Fleet Menu",
  description: "Check your dashboard cargo shipment on Maju Fleet portal.",
};

export default function Page() {
  return <BookShipmentClient />;
}