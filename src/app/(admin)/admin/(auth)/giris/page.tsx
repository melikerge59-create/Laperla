import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getOptionalUser } from "@/lib/auth-user";

export const metadata: Metadata = {
  title: "Yönetici girişi",
  description: "La Perla yönetim paneli girişi.",
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function AdminGirisPage({ searchParams }: Props) {
  const user = await getOptionalUser();
  const sp = await searchParams;
  if (user?.role === "ADMIN") {
    const n = sp.next;
    redirect(n && n.startsWith("/") && !n.startsWith("//") ? n : "/admin");
  }

  return (
    <Suspense fallback={<p className="m-desc">Yükleniyor…</p>}>
      <AdminLoginForm />
    </Suspense>
  );
}
