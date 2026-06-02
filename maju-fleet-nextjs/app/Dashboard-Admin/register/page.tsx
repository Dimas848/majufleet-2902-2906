import { Metadata } from "next";
import BookShipmentClient from "./ConsolePage";

// Sesuai instruksi penugasan unguided, judul halaman memanfaatkan MetaData Next.js
export const metadata: Metadata = {
  title: "Console Menu",
  description: "CRUD your cargo shipment on Maju Fleet portal.",
};

export default function Page() {
  return <BookShipmentClient />;
}