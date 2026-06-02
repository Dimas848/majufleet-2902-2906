import { Metadata } from "next";
import BookShipmentClient from "./MapPage";

// Sesuai instruksi penugasan unguided, judul halaman memanfaatkan MetaData Next.js
export const metadata: Metadata = {
  title: "Map Menu",
  description: "Check your map shipment on Maju Fleet portal.",
};

export default function Page() {
  return <BookShipmentClient />;
}