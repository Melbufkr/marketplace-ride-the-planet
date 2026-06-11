import { createClient } from "@/lib/supabase/server";
export {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CONDITION_LABELS,
  formatPrice,
} from "@/lib/listings-helpers";
import type {
  ListingCategory,
  ListingCondition,
  ListingStatus,
  PriceType,
  ListingWithMedia,
  ListingWithSeller,
} from "@/types/database";

// ─── Tipos de filtros ────────────────────────────────────

export interface ListingsFilter {
  category?: ListingCategory[];
  condition?: ListingCondition[];
  price_type?: PriceType;
  price_min?: number;
  price_max?: number;
  location?: string;
  search?: string;
}

export type ListingsSort =
  | "relevance"
  | "newest"
  | "price_asc"
  | "price_desc";

export interface ListingsParams {
  filter?: ListingsFilter;
  sort?: ListingsSort;
  page?: number;
  pageSize?: number;
}

export interface ListingsResult {
  listings: ListingWithMedia[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Queries ─────────────────────────────────────────────

export async function getFeaturedListings(limit = 8): Promise<ListingWithMedia[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_media ( id, url, media_type, order ),
      users!listings_user_id_fkey ( id, first_name, last_name, reputation_score )
    `)
    .eq("status", "active")
    .order("relevance_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getFeaturedListings]", error.message);
    return [];
  }

  return (data ?? []) as unknown as ListingWithMedia[];
}

export async function getListings({
  filter = {},
  sort = "newest",
  page = 1,
  pageSize = 20,
}: ListingsParams = {}): Promise<ListingsResult> {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      `*, listing_media ( id, url, media_type, order ), users!listings_user_id_fkey ( id, first_name, last_name, reputation_score )`,
      { count: "exact" }
    )
    .eq("status", "active");

  // Filtros
  if (filter.category?.length) {
    query = query.in("category", filter.category);
  }
  if (filter.condition?.length) {
    query = query.in("condition", filter.condition);
  }
  if (filter.price_type) {
    query = query.eq("price_type", filter.price_type);
  }
  if (filter.price_min !== undefined) {
    query = query.gte("price", filter.price_min);
  }
  if (filter.price_max !== undefined) {
    query = query.lte("price", filter.price_max);
  }
  if (filter.location) {
    query = query.ilike("location", `%${filter.location}%`);
  }
  if (filter.search) {
    query = query.or(
      `title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`
    );
  }

  // Orden
  switch (sort) {
    case "relevance":
      query = query.order("relevance_score", { ascending: false });
      break;
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Paginación
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[getListings]", error.message);
    return { listings: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count ?? 0;
  return {
    listings: (data ?? []) as unknown as ListingWithMedia[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getListingById(id: string): Promise<ListingWithSeller | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_media ( id, url, media_type, order ),
      users!listings_user_id_fkey ( id, first_name, last_name, reputation_score, whatsapp_country_code, whatsapp_number, email )
    `)
    .eq("id", id)
    .neq("status", "deleted")
    .single();

  if (error) {
    console.error("[getListingById]", error.message);
    return null;
  }

  return data as unknown as ListingWithSeller;
}
