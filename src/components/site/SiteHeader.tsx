import { getOptionalUser } from "@/lib/auth-user";
import { primaryGoogleWebClientId } from "@/lib/google-oauth";
import { formatTryFromKurus } from "@/lib/money";
import { getFreeShippingSubtotalThresholdCents } from "@/lib/shipping";
import { SiteHeaderClient } from "./SiteHeaderClient";

/** Sunucuda oturum + Google Client ID. */
export async function SiteHeader() {
  const googleClientId = primaryGoogleWebClientId();
  const dbUser = await getOptionalUser();
  const user =
    dbUser && (dbUser.role === "CUSTOMER" || dbUser.role === "ADMIN")
      ? { email: dbUser.email, name: dbUser.name, role: dbUser.role }
      : null;
  const freeThr = getFreeShippingSubtotalThresholdCents();
  const freeShippingPromo =
    freeThr != null ? `${formatTryFromKurus(freeThr)} ve üzeri ücretsiz kargo` : null;
  return (
    <SiteHeaderClient googleClientId={googleClientId} user={user} freeShippingPromo={freeShippingPromo} />
  );
}
