import { supabase } from "@/lib/supabase";

export interface ProfessorRow {
  id: string;
  full_name: string;
  email_public: string | null;
  title: string | null;
  academic_rank: string | null;
  faculty_page_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  institution_name: string | null;
  department_name: string | null;
  // derived features
  scholar_h_index: number | null;
  scholar_citation_count: number | null;
  cv_parsed: boolean | null;
  enriched_at: string | null;
  research_impact_score: number | null;
  recruiting_signal_score_hex: number | null;
  topic_embedding: unknown;
}

export interface ProfessorListResult {
  professors: ProfessorRow[];
  total: number;
}

export async function getProfessors(opts: {
  page?: number;
  perPage?: number;
  search?: string;
  institution?: string;
}): Promise<ProfessorListResult | null> {
  if (!supabase) return null;

  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("professors")
    .select(
      `
      id, full_name, email_public, title, academic_rank,
      faculty_page_url, is_active, created_at, updated_at,
      institutions!inner(name),
      departments(name),
      professor_derived_features(
        scholar_h_index, scholar_citation_count, cv_parsed, enriched_at,
        research_impact_score, recruiting_signal_score_hex, topic_embedding
      )
    `,
      { count: "exact" },
    )
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (opts.search) {
    query = query.ilike("full_name", `%${opts.search}%`);
  }
  if (opts.institution) {
    query = query.eq("institutions.name", opts.institution);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("getProfessors error:", error);
    return null;
  }

  const professors: ProfessorRow[] = (data ?? []).map((row: Record<string, unknown>) => {
    const inst = row.institutions as Record<string, unknown> | null;
    const dept = row.departments as Record<string, unknown> | null;
    const feat = Array.isArray(row.professor_derived_features)
      ? (row.professor_derived_features[0] as Record<string, unknown> | undefined)
      : (row.professor_derived_features as Record<string, unknown> | null);
    return {
      id: row.id as string,
      full_name: row.full_name as string,
      email_public: row.email_public as string | null,
      title: row.title as string | null,
      academic_rank: row.academic_rank as string | null,
      faculty_page_url: row.faculty_page_url as string | null,
      is_active: row.is_active as boolean,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      institution_name: (inst?.name as string) ?? null,
      department_name: (dept?.name as string) ?? null,
      scholar_h_index: (feat?.scholar_h_index as number) ?? null,
      scholar_citation_count: (feat?.scholar_citation_count as number) ?? null,
      cv_parsed: (feat?.cv_parsed as boolean) ?? null,
      enriched_at: (feat?.enriched_at as string) ?? null,
      research_impact_score: (feat?.research_impact_score as number) ?? null,
      recruiting_signal_score_hex: (feat?.recruiting_signal_score_hex as number) ?? null,
      topic_embedding: feat?.topic_embedding ?? null,
    };
  });

  return { professors, total: count ?? 0 };
}

export async function getProfessorStats(): Promise<{
  total: number;
  withEmbedding: number;
  withSignals: number;
  withPapers: number;
  institutions: string[];
} | null> {
  if (!supabase) return null;

  const [totalRes, embRes, sigRes, papRes, instRes] = await Promise.all([
    supabase.from("professors").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("professor_derived_features")
      .select("professor_id", { count: "exact", head: true })
      .not("topic_embedding", "is", null),
    supabase
      .from("recruiting_signals")
      .select("professor_id", { count: "exact", head: true }),
    supabase
      .from("paper_authors")
      .select("professor_id", { count: "exact", head: true })
      .not("professor_id", "is", null),
    supabase
      .from("institutions")
      .select("name")
      .order("name"),
  ]);

  return {
    total: totalRes.count ?? 0,
    withEmbedding: embRes.count ?? 0,
    withSignals: sigRes.count ?? 0,
    withPapers: papRes.count ?? 0,
    institutions: (instRes.data ?? []).map((r: Record<string, unknown>) => r.name as string),
  };
}
