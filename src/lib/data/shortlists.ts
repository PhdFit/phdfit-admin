import { supabase } from "@/lib/supabase";
import type {
  Shortlist,
  ShortlistProfessorDetail,
  ShortlistBucket,
  ContactStatus,
} from "@/types/shortlist";

// ---------------------------------------------------------------------------
// getShortlists — list with professor count
// ---------------------------------------------------------------------------

export async function getShortlists(opts?: {
  userId?: string;
}): Promise<Shortlist[] | null> {
  if (!supabase) return null;

  let query = supabase
    .from("shortlists")
    .select("id, user_id, title, description, is_default, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (opts?.userId) {
    query = query.eq("user_id", opts.userId);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("getShortlists error:", error);
    return null;
  }

  // Get item counts per shortlist
  const shortlistIds = (data as Array<Record<string, unknown>>).map(
    (r) => r.id as string,
  );

  const { data: itemsData } = await supabase
    .from("shortlist_items")
    .select("shortlist_id")
    .in("shortlist_id", shortlistIds);

  const counts = new Map<string, number>();
  for (const r of itemsData ?? []) {
    const sid = (r as Record<string, unknown>).shortlist_id as string;
    counts.set(sid, (counts.get(sid) ?? 0) + 1);
  }

  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    description: row.description as string | null,
    is_default: (row.is_default as boolean) ?? false,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    professor_count: counts.get(row.id as string) ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// getShortlistById — with items + professor details + hexagon scores
// ---------------------------------------------------------------------------

export async function getShortlistById(id: string): Promise<{
  shortlist: Shortlist;
  items: ShortlistProfessorDetail[];
} | null> {
  if (!supabase) return null;

  // Fetch shortlist
  const { data: slData, error: slError } = await supabase
    .from("shortlists")
    .select("id, user_id, title, description, is_default, created_at, updated_at")
    .eq("id", id)
    .single();

  if (slError || !slData) {
    console.error("getShortlistById error:", slError);
    return null;
  }

  const sl = slData as Record<string, unknown>;

  // Fetch items with professor details
  const { data: itemsData, error: itemsError } = await supabase
    .from("shortlist_items")
    .select(
      `
      id, shortlist_id, professor_id, bucket, priority,
      contact_status, user_note, created_at, updated_at,
      professors!inner(
        full_name, email_public, title,
        institutions(name),
        departments(name),
        professor_derived_features(
          scholar_h_index, scholar_citation_count,
          research_impact_score, research_activity_score_hex,
          funding_strength_score, recruiting_signal_score_hex,
          industry_opensource_score, mentorship_culture_score
        )
      )
    `,
    )
    .eq("shortlist_id", id)
    .order("priority", { ascending: true, nullsFirst: false });

  if (itemsError) {
    console.error("getShortlistById items error:", itemsError);
    return null;
  }

  const items: ShortlistProfessorDetail[] = (
    (itemsData ?? []) as Array<Record<string, unknown>>
  ).map((row) => {
    const prof = row.professors as Record<string, unknown>;
    const inst = prof?.institutions as Record<string, unknown> | null;
    const dept = prof?.departments as Record<string, unknown> | null;
    const feat = Array.isArray(prof?.professor_derived_features)
      ? (prof.professor_derived_features[0] as Record<string, unknown> | undefined)
      : (prof?.professor_derived_features as Record<string, unknown> | null);

    return {
      id: row.id as string,
      shortlist_id: row.shortlist_id as string,
      professor_id: row.professor_id as string,
      bucket: (row.bucket as ShortlistBucket) ?? null,
      priority: row.priority as number | null,
      contact_status: (row.contact_status as ContactStatus) ?? "not_contacted",
      user_note: row.user_note as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      professor_name: (prof?.full_name as string) ?? "Unknown",
      professor_email: (prof?.email_public as string) ?? null,
      institution_name: (inst?.name as string) ?? null,
      department_name: (dept?.name as string) ?? null,
      title: (prof?.title as string) ?? null,
      scholar_h_index: (feat?.scholar_h_index as number) ?? null,
      scholar_citation_count: (feat?.scholar_citation_count as number) ?? null,
      research_impact_score: (feat?.research_impact_score as number) ?? null,
      research_activity_score_hex:
        (feat?.research_activity_score_hex as number) ?? null,
      funding_strength_score: (feat?.funding_strength_score as number) ?? null,
      recruiting_signal_score_hex:
        (feat?.recruiting_signal_score_hex as number) ?? null,
      industry_opensource_score:
        (feat?.industry_opensource_score as number) ?? null,
      mentorship_culture_score:
        (feat?.mentorship_culture_score as number) ?? null,
    };
  });

  return {
    shortlist: {
      id: sl.id as string,
      user_id: sl.user_id as string,
      title: sl.title as string,
      description: sl.description as string | null,
      is_default: (sl.is_default as boolean) ?? false,
      created_at: sl.created_at as string,
      updated_at: sl.updated_at as string,
      professor_count: items.length,
    },
    items,
  };
}

// ---------------------------------------------------------------------------
// getShortlistStats — aggregate stats for the admin overview
// ---------------------------------------------------------------------------

export async function getShortlistStats(): Promise<{
  totalShortlists: number;
  totalItems: number;
  avgItemsPerShortlist: number;
  bucketBreakdown: Record<string, number>;
} | null> {
  if (!supabase) return null;

  const [slRes, itemsRes] = await Promise.all([
    supabase
      .from("shortlists")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("shortlist_items")
      .select("id, bucket"),
  ]);

  if (slRes.error || itemsRes.error) {
    console.error(
      "getShortlistStats error:",
      slRes.error,
      itemsRes.error,
    );
    return null;
  }

  const totalShortlists = slRes.count ?? 0;
  const items = (itemsRes.data ?? []) as Array<Record<string, unknown>>;
  const totalItems = items.length;

  const bucketBreakdown: Record<string, number> = {
    reach: 0,
    target: 0,
    safer: 0,
    not_sure: 0,
    unset: 0,
  };
  for (const item of items) {
    const b = (item.bucket as string) ?? "unset";
    bucketBreakdown[b] = (bucketBreakdown[b] ?? 0) + 1;
  }

  return {
    totalShortlists,
    totalItems,
    avgItemsPerShortlist:
      totalShortlists > 0 ? totalItems / totalShortlists : 0,
    bucketBreakdown,
  };
}
