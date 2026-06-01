import { Metadata } from "next";
import BookShipmentClient from "./BookShipmentClient";

// Sesuai instruksi penugasan unguided, judul halaman memanfaatkan MetaData Next.js
export const metadata: Metadata = {
  title: "Booking Menu",
  description: "Book your new cargo shipment on Maju Fleet portal.",
};

export default function Page() {
  return <BookShipmentClient />;
}