import { createServiceClient } from "@/lib/supabase/server";

export type NotificationType =
  | "contact_received"
  | "purchase_completed"
  | "sale_completed"
  | "transaction_cancelled"
  | "dni_approved"
  | "dni_rejected";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const service = createServiceClient();
  await service.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link ?? null,
  });
}
