import { Metadata } from "next";
import BookShipmentClient from "./MyShipmentClient";

// Sesuai instruksi penugasan unguided, judul halaman memanfaatkan MetaData Next.js
export const metadata: Metadata = {
  title: "Shipment Menu",
  description: "Check and trace your new cargo shipment on Maju Fleet portal.",
};

export default function Page() {
  return <BookShipmentClient />;
}