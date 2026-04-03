import { expect, test } from "@playwright/test";

test.describe("site smoke", () => {
  test("home loads with brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /LA PERLA/i })).toBeVisible();
  });

  test("catalog lists products", async ({ page }) => {
    await page.goto("/urunler");
    await expect(page.getByRole("heading", { name: /tüm.*ürünler/i })).toBeVisible();
    await expect(page.locator("article.card").first()).toBeVisible();
  });

  test("empty cart message", async ({ page }) => {
    await page.goto("/sepet");
    await expect(page.getByText(/sepetiniz boş/i)).toBeVisible();
  });

  test("legal pages respond", async ({ page }) => {
    await page.goto("/kvkk");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/iade-ve-degisim");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("unknown path shows 404", async ({ page }) => {
    await page.goto("/bu-yol-yok-12345");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("link", { name: /ana sayfaya dön/i })).toBeVisible();
  });

  test("security.txt responds", async ({ request }) => {
    const r = await request.get("/.well-known/security.txt");
    expect(r.ok()).toBeTruthy();
    expect(r.headers()["content-type"] ?? "").toMatch(/text\/plain/);
    const text = await r.text();
    expect(text).toMatch(/security/i);
  });
});
