import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_BUCKET = "product-images";

export function supabaseStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_BUCKET;
}

/** Sunucu tarafı: yükleme / silme için service role (istemciye asla verilmez). */
export function supabaseAdminForStorage(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** `getPublicUrl` ile üretilen tam URL → bucket içi path. */
export function supabaseStorageObjectPathFromPublicUrl(imageUrl: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const bucket = supabaseStorageBucket();
  if (!base) return null;
  const prefix = `${base}/storage/v1/object/public/${bucket}/`;
  if (!imageUrl.startsWith(prefix)) return null;
  const objectPath = imageUrl.slice(prefix.length);
  if (!objectPath || objectPath.includes("..") || objectPath.includes("\\")) return null;
  return decodeURIComponent(objectPath);
}
