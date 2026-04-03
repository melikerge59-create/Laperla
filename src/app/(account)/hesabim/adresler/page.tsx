import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AddressesPanel } from "@/components/account/AddressesPanel";
import { getOptionalUser } from "@/lib/auth-user";

export const metadata: Metadata = {
  title: "Adreslerim",
  description: "Teslimat adreslerinizi yönetin.",
};

export default async function AddressesPage() {
  const user = await getOptionalUser();
  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    redirect("/giris?next=/hesabim/adresler");
  }

  return (
    <div>
      <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 28 }}>Adreslerim</h3>
      <p style={{ margin: "10px 0 0 0", fontSize: 13, lineHeight: 1.65, color: "rgba(168, 90, 90, 0.85)" }}>
        Ödeme adımında kullanılacak teslimat adreslerinizi ekleyin veya düzenleyin.
      </p>
      <div style={{ marginTop: 20 }}>
        <AddressesPanel />
      </div>
    </div>
  );
}
