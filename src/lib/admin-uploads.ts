import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  supabaseAdminForStorage,
  supabaseStorageBucket,
  supabaseStorageObjectPathFromPublicUrl,
} from "@/lib/supabase-storage-server";

const PRODUCTS_SUBDIR = "products";
const MAX_BYTES = 5 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function uploadsProductsDir(): string {
  return path.join(process.cwd(), "public", "uploads", PRODUCTS_SUBDIR);
}

export function publicUrlForUploadedProductFile(filename: string): string {
  return `/uploads/${PRODUCTS_SUBDIR}/${filename}`;
}

/** Safe local filesystem path for a stored product image, or null if URL is not our upload. */
export function localFilePathFromProductImageUrl(url: string): string | null {
  const prefix = `/uploads/${PRODUCTS_SUBDIR}/`;
  if (!url.startsWith(prefix)) return null;
  const base = url.slice(prefix.length);
  if (!base || base.includes("..") || base.includes("/") || base.includes("\\")) return null;
  const full = path.join(uploadsProductsDir(), base);
  const dir = uploadsProductsDir();
  if (!full.startsWith(dir)) return null;
  return full;
}

export async function saveProductImageUpload(
  buffer: Buffer,
  mime: string,
): Promise<{ url: string; filename: string }> {
  const ext = MIME_EXT[mime];
  if (!ext) {
    throw new Error("Desteklenmeyen görsel türü (JPEG, PNG, WebP, GIF)");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("Dosya en fazla 5 MB olabilir");
  }
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;

  const supabase = supabaseAdminForStorage();
  if (supabase) {
    const bucket = supabaseStorageBucket();
    const objectPath = `${PRODUCTS_SUBDIR}/${filename}`;
    const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
      contentType: mime,
      upsert: false,
    });
    if (error) {
      throw new Error(error.message || "Supabase Storage yüklemesi başarısız");
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    if (!data.publicUrl) {
      throw new Error("Supabase public URL alınamadı");
    }
    return { filename, url: data.publicUrl };
  }

  const dir = uploadsProductsDir();
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, filename);
  await writeFile(full, buffer);
  return { filename, url: publicUrlForUploadedProductFile(filename) };
}

export async function tryRemoveUploadedFile(url: string): Promise<void> {
  const objectPath = supabaseStorageObjectPathFromPublicUrl(url);
  const supabase = supabaseAdminForStorage();
  if (objectPath && supabase) {
    const bucket = supabaseStorageBucket();
    await supabase.storage.from(bucket).remove([objectPath]);
    return;
  }

  const fp = localFilePathFromProductImageUrl(url);
  if (!fp) return;
  try {
    await unlink(fp);
  } catch {
    // ignore missing file
  }
}
