import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "storage";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("⚠️  Supabase storage not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env");
}

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export async function uploadToSupabase(buffer, filename, folder = "uploads") {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  try {
    const ext = path.extname(filename) || ".jpg";
    const fileName = `${Date.now()}_${crypto.randomBytes(8).toString("hex")}${ext}`;
    const objectPath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(objectPath, buffer, {
        contentType: "application/octet-stream",
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: publicData } = supabase
      .storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(objectPath);

    return {
      objectPath,
      publicUrl: publicData.publicUrl
    };
  } catch (err) {
    console.error("Supabase upload error:", err.message);
    throw err;
  }
}

export function buildSupabasePublicUrl(objectPath) {
  if (!SUPABASE_URL || !SUPABASE_BUCKET) return objectPath;
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodeURIComponent(objectPath)}`;
}

