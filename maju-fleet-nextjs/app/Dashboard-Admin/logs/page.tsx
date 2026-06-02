import { Metadata } from "next";
import BookShipmentClient from "./LogPage";

// Sesuai instruksi penugasan unguided, judul halaman memanfaatkan MetaData Next.js
export const metadata: Metadata = {
  title: "Log Menu",
  description: "Check your daily log on Maju Fleet system.",
};

export default function Page() {
  return <BookShipmentClient />;
}