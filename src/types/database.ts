// Auto-describir tipos del schema — reemplazar con `supabase gen types` en CI

export type UserRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  whatsapp_country_code: string;
  whatsapp_number: string;
  dni: string;
  birth_date: string; // ISO date
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  reputation_score: number;
  created_at: string;
};

export type ListingCategory =
  | "esquis"
  | "tabla_snowboard"
  | "botas"
  | "fijaciones"
  | "ropa"
  | "mochilas"
  | "antiparras"
  | "cascos"
  | "fundas_esquis"
  | "fundas_snowboard"
  | "accesorios";

export type ListingCondition = "nuevo" | "muy_bueno" | "bueno" | "aceptable";
export type ListingStatus = "active" | "paused" | "sold" | "deleted";
export type PriceType = "fixed" | "negotiable";

export type ListingRow = {
  id: string;
  user_id: string;
  title: string;
  category: ListingCategory;
  description: string;
  brand: string | null;
  size: string | null;
  seasons_used: number | null;
  condition: ListingCondition;
  price: number;
  price_type: PriceType;
  location: string;
  status: ListingStatus;
  relevance_score: number;
  created_at: string;
  updated_at: string;
};

export type ListingMediaRow = {
  id: string;
  listing_id: string;
  url: string;
  media_type: "photo" | "video";
  order: number;
  created_at: string;
};

export type TransactionStatus = "pending" | "completed" | "cancelled";
export type MpStatus = "pending" | "approved" | "rejected" | "refunded";

export type TransactionRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  platform_fee_pct: number;
  platform_fee_amount: number;
  seller_amount: number;
  mp_payment_id: string | null;
  mp_status: MpStatus | null;
  status: TransactionStatus;
  created_at: string;
  completed_at: string | null;
};

export type ContactExchangeRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  type: "fixed_purchase" | "negotiable_contact";
  email_sent: boolean;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  transaction_id: string | null;
  exchange_id: string | null;
  reviewer_id: string;
  reviewed_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  created_at: string;
};

// ─── Joined / enriched types ───

export type ListingWithMedia = ListingRow & {
  listing_media: ListingMediaRow[];
  users: Pick<UserRow, "id" | "first_name" | "last_name" | "reputation_score">;
};

export type ListingWithSeller = ListingRow & {
  users: Pick<UserRow, "id" | "first_name" | "last_name" | "reputation_score" | "whatsapp_country_code" | "whatsapp_number" | "email">;
  listing_media: ListingMediaRow[];
};
