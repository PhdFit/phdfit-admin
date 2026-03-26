import { supabase } from "@/lib/supabase";

export interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  plan_type: string;
  auth_provider: string | null;
  created_at: string;
  updated_at: string;
  shortlist_count: number;
  saved_search_count: number;
}

export async function getUsers(): Promise<UserRow[] | null> {
  if (!supabase) return null;

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, full_name, plan_type, auth_provider, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error || !users) {
    console.error("getUsers error:", error);
    return null;
  }

  // Get shortlist and saved search counts per user
  const userIds = users.map((u: Record<string, unknown>) => u.id as string);

  const [slRes, ssRes] = await Promise.all([
    supabase
      .from("shortlists")
      .select("user_id")
      .in("user_id", userIds),
    supabase
      .from("saved_searches")
      .select("user_id")
      .in("user_id", userIds),
  ]);

  const slCounts = new Map<string, number>();
  for (const r of slRes.data ?? []) {
    const uid = (r as Record<string, unknown>).user_id as string;
    slCounts.set(uid, (slCounts.get(uid) ?? 0) + 1);
  }

  const ssCounts = new Map<string, number>();
  for (const r of ssRes.data ?? []) {
    const uid = (r as Record<string, unknown>).user_id as string;
    ssCounts.set(uid, (ssCounts.get(uid) ?? 0) + 1);
  }

  return users.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    email: row.email as string,
    full_name: row.full_name as string | null,
    plan_type: row.plan_type as string,
    auth_provider: row.auth_provider as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    shortlist_count: slCounts.get(row.id as string) ?? 0,
    saved_search_count: ssCounts.get(row.id as string) ?? 0,
  }));
}

export async function getUserStats(): Promise<{
  total: number;
  free: number;
  pro: number;
  consultant: number;
} | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("plan_type");

  if (error || !data) return null;

  const rows = data as Array<Record<string, unknown>>;
  return {
    total: rows.length,
    free: rows.filter((r) => r.plan_type === "free").length,
    pro: rows.filter((r) => r.plan_type === "pro").length,
    consultant: rows.filter((r) => r.plan_type === "consultant").length,
  };
}
