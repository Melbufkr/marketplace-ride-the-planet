import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await req.formData();
  const front = formData.get("front") as File | null;
  const back  = formData.get("back")  as File | null;

  if (!front || !back) {
    return NextResponse.json({ error: "Se requieren ambas fotos" }, { status: 400 });
  }

  if (front.size > 10 * 1024 * 1024 || back.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Cada foto debe pesar menos de 10 MB" }, { status: 400 });
  }

  const service = createServiceClient();

  // Subir frente
  const frontExt  = front.name.split(".").pop() ?? "jpg";
  const frontPath = `${user.id}/front.${frontExt}`;
  const { error: frontErr } = await service.storage
    .from("dni-documents")
    .upload(frontPath, front, { upsert: true, contentType: front.type });

  if (frontErr) {
    return NextResponse.json({ error: "Error subiendo frente del DNI" }, { status: 500 });
  }

  // Subir dorso
  const backExt  = back.name.split(".").pop() ?? "jpg";
  const backPath = `${user.id}/back.${backExt}`;
  const { error: backErr } = await service.storage
    .from("dni-documents")
    .upload(backPath, back, { upsert: true, contentType: back.type });

  if (backErr) {
    return NextResponse.json({ error: "Error subiendo dorso del DNI" }, { status: 500 });
  }

  // Guardar o actualizar registro en dni_verifications
  const { error: dbErr } = await service
    .from("dni_verifications")
    .upsert(
      {
        user_id:   user.id,
        front_url: frontPath,
        back_url:  backPath,
        status:    "pending",
        reviewer_notes: null,
        reviewed_at: null,
      },
      { onConflict: "user_id" }
    );

  if (dbErr) {
    return NextResponse.json({ error: "Error guardando verificación" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
