import type { Metadata } from "next";
import { OdemeClient } from "@/components/site/OdemeClient";
import { getFreeShippingSubtotalThresholdCents, getShippingCents } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Ödeme",
  description: "Siparişinizi tamamlayın.",
};

export default function OdemePage() {
  const flatShippingCents = getShippingCents();
  const freeShippingThresholdCents = getFreeShippingSubtotalThresholdCents();
  return (
    <OdemeClient flatShippingCents={flatShippingCents} freeShippingThresholdCents={freeShippingThresholdCents} />
  );
}
