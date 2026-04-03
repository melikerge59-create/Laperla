type SendOpts = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Mağaza bildirimi vb. */
  bcc?: string[];
};

/**
 * `RESEND_API_KEY` tanımlıysa Resend API; değilse geliştirmede konsola yazar (sipariş e-postaları için de kullanılabilir).
 */
export async function sendTransactionalEmail(opts: SendOpts): Promise<{ ok: boolean; mode: "resend" | "dev" }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim() || "La Perla <onboarding@resend.dev>";

  if (key) {
    const html = opts.html ?? opts.text.split("\n").map((l) => (l ? `<p>${escapeHtml(l)}</p>` : "<br/>")).join("");
    const payload: Record<string, unknown> = {
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html,
    };
    if (opts.bcc?.length) {
      payload.bcc = opts.bcc;
    }
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.error("[mail] Resend hata:", r.status, body);
      return { ok: false, mode: "resend" };
    }
    return { ok: true, mode: "resend" };
  }

  console.info("[mail] (dev, RESEND_API_KEY yok)\nTo:", opts.to, "\nSubject:", opts.subject, "\n---\n", opts.text);
  return { ok: true, mode: "dev" };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
