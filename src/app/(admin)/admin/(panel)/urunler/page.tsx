import Link from "next/link";
import { AdminProductsClient } from "@/components/admin/AdminProductsClient";

export default async function AdminProductsPage() {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 26 }}>Ürünler</h2>
        <Link href="/admin/urunler/yeni" className="btn primary" style={{ display: "inline-flex", textDecoration: "none", fontSize: 14 }}>
          Yeni ürün
        </Link>
      </div>
      <AdminProductsClient />
    </div>
  );
}
