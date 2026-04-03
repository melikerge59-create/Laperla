import { prisma } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/mail";
import { createRawResetToken, hashResetToken } from "@/lib/reset-token-hash";
import { absoluteUrl } from "@/lib/site-url";

function brandName(): string {
  return process.env.MAIL_BRAND_NAME?.trim() || "La Perla";
}

/** Kayıt veya profil “yeniden gönder” — hata fırlatmaz. */
export async function createAndSendEmailVerification(userId: string, email: string, name: string | null): Promise<void> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const raw = createRawResetToken();
  const tokenHash = hashResetToken(raw);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  const link = absoluteUrl(`/api/auth/verify-email?token=${encodeURIComponent(raw)}`);
  const greet = name?.trim() ? `Merhaba ${name.trim()},` : "Merhaba,";
  const text = `${greet}

${brandName()} hesabınız için e-posta doğrulama bağlantısı:

${link}

Bağlantı 24 saat geçerlidir. Bu talebi siz oluşturmadıysanız bu e-postayı yok sayın.

${brandName()}`;

  try {
    await sendTransactionalEmail({
      to: email,
      subject: `${brandName()} — E-posta doğrulama`,
      text,
    });
  } catch (e) {
    console.error("[email-verification-send]", e);
  }
}
