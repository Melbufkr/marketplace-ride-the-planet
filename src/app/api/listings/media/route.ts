import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];

export async function POST(req: NextRequest) {
  // Verificar sesión
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const listingId = formData.get("listing_id") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
  }

  const isPhoto = ALLOWED_PHOTO_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isPhoto && !isVideo) {
    return NextResponse.json(
      { error: "Formato no permitido. Usá JPG, PNG, WEBP, MP4 o MOV." },
      { status: 400 }
    );
  }

  const maxSize = isVideo ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES;
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024);
    return NextResponse.json(
      { error: `El archivo supera el límite de ${mb} MB` },
      { status: 400 }
    );
  }

  // Path: {user_id}/{listing_id_o_temp}/{timestamp}_{filename}
  const folder = listingId ?? "temp";
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${user.id}/${folder}/${filename}`;

  const bytes = await file.arrayBuffer();
  const service = createServiceClient();

  const { error: uploadError } = await service.storage
    .from("listings-media")
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[media upload]", uploadError.message);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }

  const { data: { publicUrl } } = service.storage
    .from("listings-media")
    .getPublicUrl(path);

  return NextResponse.json({
    url: publicUrl,
    path,
    media_type: isVideo ? "video" : "photo",
  });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { path } = await req.json();
  if (!path || !path.startsWith(user.id + "/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const service = createServiceClient();
  const { error } = await service.storage.from("listings-media").remove([path]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
