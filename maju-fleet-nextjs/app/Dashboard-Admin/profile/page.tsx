import { Metadata } from "next";
import ProfileContent from "./ProfileContent";

// ✅ MENAMBAHKAN METADATA UNTUK JUDUL TAB BROWSER
export const metadata: Metadata = {
  title: "Maju Fleet - Profile",
  description: "Maju Fleet Central Command User Profile Dashboard",
};

export default function ProfilePage() {
  return <ProfileContent />;
}