import { defineConfig, devices } from "@playwright/test";

/** CI’da 3000 çakışmasını önlemek için `PLAYWRIGHT_PORT=4173` (workflow’da ayarlı). */
const port = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const isCi = Boolean(process.env.CI);
/** DB kapalı olsa bile 200 döner; aksi halde Playwright ikinci `next dev` açmaya çalışır ve Next aynı dizinde çakışır. */
const webServerReadyUrl = `${baseURL.replace(/\/$/, "")}/robots.txt`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: isCi
    ? {
        command: "npm run start",
        url: webServerReadyUrl,
        timeout: 120_000,
        // `.env` içinde kalmış sqlite URL’ini taşırmamak için (GitHub Actions’taki Postgres kullanılır)
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          NODE_ENV: "production",
          PORT: port,
          DATABASE_URL: process.env.DATABASE_URL ?? "",
          DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
          AUTH_SECRET: process.env.AUTH_SECRET ?? "",
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? `http://127.0.0.1:${port}`,
        },
      }
    : {
        command: "npm run dev",
        url: webServerReadyUrl,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
