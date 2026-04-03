import { AdminReturnRequestsClient } from "@/components/admin/AdminReturnRequestsClient";

export default async function AdminReturnRequestsPage() {
  return (
    <div>
      <h2 style={{ margin: "0 0 12px 0", fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 26 }}>
        İade / değişim talepleri
      </h2>
      <p className="m-desc" style={{ margin: "0 0 16px 0", fontSize: 13 }}>
        Müşteri taleplerinin durumunu güncelleyin. Sipariş detayı için bağlantıya tıklayın (yönetici olarak tüm siparişleri
        görüntüleyebilirsiniz).
      </p>
      <AdminReturnRequestsClient />
    </div>
  );
}
