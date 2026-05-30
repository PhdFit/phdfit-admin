import { supabase } from "@/lib/supabase";
import type { SavedSearch } from "@/types/shortlist";

// ---------------------------------------------------------------------------
// getSavedSearches
// ---------------------------------------------------------------------------

export async function getSavedSearches(opts?: {
  userId?: string;
}): Promise<SavedSearch[] | null> {
  if (!supabase) return null;

  let query = supabase
    .from("saved_searches")
    .select(
      `
      id, user_id, query_text, filters_json, sort_by, created_at,
      users!inner(email)
    `,
    )
    .order("created_at", { ascending: false });

  if (opts?.userId) {
    query = query.eq("user_id", opts.userId);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("getSavedSearches error:", error);
    return null;
  }

  return (data as Array<Record<string, unknown>>).map((row) => {
    const user = row.users as Record<string, unknown> | null;
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      query_text: row.query_text as string | null,
      filters_json: row.filters_json as Record<string, unknown> | null,
      sort_by: row.sort_by as string | null,
      created_at: row.created_at as string,
      user_email: (user?.email as string) ?? undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// getSavedSearchStats
// ---------------------------------------------------------------------------

export async function getSavedSearchStats(): Promise<{
  total: number;
  uniqueUsers: number;
  withFilters: number;
} | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, user_id, filters_json");

  if (error || !data) {
    console.error("getSavedSearchStats error:", error);
    return null;
  }

  const rows = data as Array<Record<string, unknown>>;
  const uniqueUsers = new Set(rows.map((r) => r.user_id as string)).size;
  const withFilters = rows.filter((r) => r.filters_json != null).length;

  return {
    total: rows.length,
    uniqueUsers,
    withFilters,
  };
}
