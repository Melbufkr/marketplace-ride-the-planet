import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendDniApprovedEmail, sendDniRejectedEmail } from "@/lib/resend/emails";
import { createNotification } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar que es admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id: verificationId } = await params;
  const { action, notes } = await req.json(); // action: "approve" | "reject"

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const service = createServiceClient();

  // Leer la verificación para obtener el user_id
  const { data: verification } = await service
    .from("dni_verifications")
    .select("user_id")
    .eq("id", verificationId)
    .single();



  if (!verification) return NextResponse.json({ error: "Verificación no encontrada" }, { status: 404 });

  const newStatus = action === "approve" ? "approved" : "rejected";

  // Actualizar verificación
  await service
    .from("dni_verifications")
    .update({
      status: newStatus,
      reviewer_notes: notes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", verificationId);

  // Si aprobado, marcar dni_verified en users
  if (action === "approve") {
    await service
      .from("users")
      .update({ dni_verified: true })
      .eq("id", verification.user_id);
  } else {
    await service
      .from("users")
      .update({ dni_verified: false })
      .eq("id", verification.user_id);
  }

  // Notificar al usuario por email
  const { data: userData } = await service
    .from("users")
    .select("first_name, email")
    .eq("id", verification.user_id)
    .single();

  if (userData) {
    if (action === "approve") {
      sendDniApprovedEmail({ user: userData }).catch(console.error);
      createNotification({
        userId: verification.user_id,
        type: "dni_approved",
        title: "¡Identidad verificada!",
        body: "Tu DNI fue aprobado. Ya podés publicar, comprar y contactar vendedores.",
        link: "/perfil",
      }).catch(console.error);
    } else {
      sendDniRejectedEmail({ user: userData, notes: notes ?? null }).catch(console.error);
      createNotification({
        userId: verification.user_id,
        type: "dni_rejected",
        title: "Verificación de identidad",
        body: notes ? `No pudimos verificar tu DNI: ${notes}` : "No pudimos verificar tu DNI. Por favor subí nuevas fotos.",
        link: "/perfil",
      }).catch(console.error);
    }
  }

  return NextResponse.json({ ok: true });
}
