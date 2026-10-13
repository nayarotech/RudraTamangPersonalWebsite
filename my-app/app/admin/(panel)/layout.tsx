import type { Metadata } from "next";
import { AdminProvider } from "@/components/admin/AdminContext";
import { Shell } from "@/components/admin/Shell";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
