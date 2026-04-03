import { createHash, randomBytes } from "crypto";

export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

/** URL güvenli tek kullanımlık sıfırlama anahtarı (plaintext yalnızca e-postada). */
export function createRawResetToken(): string {
  return randomBytes(32).toString("base64url");
}
