import { supabase } from "@/lib/supabase";

export interface SnapshotRow {
  id: string;
  source_type: string;
  source_url: string;
  entity_type: string;
  entity_id: string | null;
  content_hash: string;
  fetched_at: string;
}

export async function getRecentSnapshots(
  limit = 50,
): Promise<SnapshotRow[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("source_snapshots")
    .select("id, source_type, source_url, entity_type, entity_id, content_hash, fetched_at")
    .order("fetched_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentSnapshots error:", error);
    return null;
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    source_type: row.source_type as string,
    source_url: row.source_url as string,
    entity_type: row.entity_type as string,
    entity_id: row.entity_id as string | null,
    content_hash: row.content_hash as string,
    fetched_at: row.fetched_at as string,
  }));
}

export async function getDataCoverage(): Promise<{
  total_professors: number;
  with_papers: number;
  with_embeddings: number;
  with_signals: number;
  with_grants: number;
} | null> {
  if (!supabase) return null;

  const [totalRes, paperRes, embRes, sigRes, grantRes] = await Promise.all([
    supabase.from("professors").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("paper_authors")
      .select("professor_id", { count: "exact", head: true })
      .not("professor_id", "is", null),
    supabase
      .from("professor_derived_features")
      .select("professor_id", { count: "exact", head: true })
      .not("topic_embedding", "is", null),
    supabase
      .from("recruiting_signals")
      .select("professor_id", { count: "exact", head: true })
      .not("professor_id", "is", null),
    supabase
      .from("grant_professors")
      .select("professor_id", { count: "exact", head: true }),
  ]);

  return {
    total_professors: totalRes.count ?? 0,
    with_papers: paperRes.count ?? 0,
    with_embeddings: embRes.count ?? 0,
    with_signals: sigRes.count ?? 0,
    with_grants: grantRes.count ?? 0,
  };
}
