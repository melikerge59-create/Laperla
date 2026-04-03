import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  return (
    <div>
      <h2 style={{ margin: "0 0 12px 0", fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 26 }}>Kategoriler</h2>
      <AdminCategoriesClient />
    </div>
  );
}
