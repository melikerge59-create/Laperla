#!/usr/bin/env node
/**
 * .env ve .env.local yükler (local baskın). Gizli değerleri yazdırmaz.
 * Kullanım: npm run check:supabase
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function loadEnvFile(name) {
  const p = resolve(root, name);
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k) process.env[k] = v;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

function ok(cond, label) {
  const pass = Boolean(cond);
  console.log(pass ? `  OK  ${label}` : `  EKSIK  ${label}`);
  return pass;
}

console.log("La Perla — Supabase / DB ortam özeti\n");

const pg =
  /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL?.trim() ?? "") &&
  /^postgres(ql)?:\/\//i.test(process.env.DIRECT_URL?.trim() ?? "");
ok(pg, "DATABASE_URL + DIRECT_URL (postgresql://...)");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supUrl = url.includes("supabase.co") && url.startsWith("https://");
ok(supUrl, "NEXT_PUBLIC_SUPABASE_URL (https://xxx.supabase.co)");

const sr = (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "").length;
ok(sr > 30, "SUPABASE_SERVICE_ROLE_KEY (service_role, uzun jwt)");

const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "product-images";
console.log(`  —  Bucket (varsayılan): ${bucket}`);

console.log("\nStorage tam ise admin görsel yükleme Supabase’e gider; eksikse public/uploads kullanılır.");
console.log("Adımlar: docs/SUPABASE_STORAGE.md\n");

const all = pg && supUrl && sr > 30;
process.exit(all ? 0 : 2);
