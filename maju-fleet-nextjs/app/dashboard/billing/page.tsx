import { Metadata } from "next";
import BookShipmentClient from "./BillingShipmentClient";

// Sesuai instruksi penugasan unguided, judul halaman memanfaatkan MetaData Next.js
export const metadata: Metadata = {
  title: "Billing Menu",
  description: "Pay your new cargo shipment on Maju Fleet portal.",
};

export default function Page() {
  return <BookShipmentClient />;
}