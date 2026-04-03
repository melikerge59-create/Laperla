import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export default async function AdminOrdersPage() {
  return (
    <div>
      <h2 style={{ margin: "0 0 12px 0", fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 26 }}>Siparişler</h2>
      <AdminOrdersClient />
    </div>
  );
}
