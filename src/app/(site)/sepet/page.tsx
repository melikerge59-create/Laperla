import type { Metadata } from "next";
import { SepetClient } from "@/components/site/SepetClient";

export const metadata: Metadata = {
  title: "Sepetim",
  description: "Sepetinizdeki ürünleri görüntüleyin ve sipariş özetinizi hazırlayın.",
};

export default function CartPage() {
  return (
    <section className="section white" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="lp-container">
        <SepetClient />
      </div>
    </section>
  );
}
