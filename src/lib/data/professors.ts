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

export interface ProfessorEducationEntry {
  id: string;
  professor_id: string;
  institution_name: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  display_order: number;
  created_at: string;
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

// ---------------------------------------------------------------------------
// Hexagon evidence types
// ---------------------------------------------------------------------------

export interface HexagonEvidenceItem {
  type: string;
  label: string;
  detail: string | null;
  source_url: string | null;
  signal_strength?: string;
}

export interface HexagonDimension {
  score: number;
  summary: string;
  evidence: HexagonEvidenceItem[];
}

// ---------------------------------------------------------------------------
// Single-professor detail
// ---------------------------------------------------------------------------

export interface ProfessorDetail extends ProfessorRow {
  preferred_name: string | null;
  lab_page_url: string | null;
  external_profile_urls: Record<string, string | null> | null;
  institution_id: string | null;
  department_id: string | null;
  source_confidence: number | null;
  // derived features (hexagon)
  funding_strength_score: number | null;
  industry_opensource_score: number | null;
  mentorship_culture_score: number | null;
  research_activity_score_hex: number | null;
  scholar_interests: string[] | null;
  hexagon_raw_signals: Record<string, unknown> | null;
  hexagon_source_urls: Record<string, unknown> | null;
  hexagon_evidence: Record<string, HexagonDimension> | null;
  enrichment_data: Record<string, unknown> | null;
  cv_education_summary: string | null;
  cv_awards_count: number | null;
  recent_topics_summary: string | null;
  recent_activity_score: number | null;
  funding_signal_score: number | null;
  normalized_name: string | null;
  // related
  education: ProfessorEducationEntry[];
  topics: Array<{ name: string; topic_type: string; weight: number }>;
  signals: Array<{
    signal_type: string;
    signal_level: string;
    confidence_score: number;
    source_url: string | null;
    source_text_snippet: string | null;
    detected_at: string;
  }>;
}

export async function getProfessorById(
  id: string,
): Promise<ProfessorDetail | null> {
  if (!supabase) return null;

  // Fetch professor with all related data
  const { data, error } = await supabase
    .from("professors")
    .select(
      `
      id, full_name, preferred_name, normalized_name, title, academic_rank,
      email_public, faculty_page_url, lab_page_url, external_profile_urls,
      institution_id, department_id, is_active, source_confidence,
      created_at, updated_at,
      institutions(name),
      departments(name),
      professor_derived_features(
        scholar_h_index, scholar_citation_count, cv_parsed, enriched_at,
        research_impact_score, recruiting_signal_score_hex, topic_embedding,
        funding_strength_score, industry_opensource_score, mentorship_culture_score,
        research_activity_score_hex, scholar_interests, hexagon_raw_signals,
        hexagon_source_urls, hexagon_evidence, enrichment_data, cv_education_summary,
        cv_awards_count, recent_topics_summary, recent_activity_score,
        funding_signal_score
      ),
      professor_topics(
        weight,
        topics(name, topic_type)
      ),
      recruiting_signals(
        signal_type, signal_level, confidence_score,
        source_url, source_text_snippet, detected_at
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getProfessorById error:", error);
    return null;
  }

  const row = data as Record<string, unknown>;
  const inst = row.institutions as Record<string, unknown> | null;
  const dept = row.departments as Record<string, unknown> | null;
  const featArr = row.professor_derived_features;
  const feat = Array.isArray(featArr)
    ? (featArr[0] as Record<string, unknown> | undefined)
    : (featArr as Record<string, unknown> | null);

  const rawTopics = (row.professor_topics ?? []) as Array<
    Record<string, unknown>
  >;
  const topics = rawTopics.map((pt) => {
    const t = pt.topics as Record<string, unknown> | null;
    return {
      name: (t?.name as string) ?? "Unknown",
      topic_type: (t?.topic_type as string) ?? "topic",
      weight: (pt.weight as number) ?? 0,
    };
  });

  // Fetch structured education entries
  const { data: eduData } = await supabase
    .from("professor_education_entries")
    .select("*")
    .eq("professor_id", id)
    .order("display_order");

  const education: ProfessorEducationEntry[] = (eduData ?? []).map(
    (e: Record<string, unknown>) => ({
      id: e.id as string,
      professor_id: e.professor_id as string,
      institution_name: (e.institution_name as string) ?? null,
      degree: (e.degree as string) ?? null,
      field_of_study: (e.field_of_study as string) ?? null,
      start_year: (e.start_year as number) ?? null,
      end_year: (e.end_year as number) ?? null,
      display_order: (e.display_order as number) ?? 0,
      created_at: e.created_at as string,
    }),
  );

  const rawSignals = (row.recruiting_signals ?? []) as Array<
    Record<string, unknown>
  >;
  const signals = rawSignals.map((s) => ({
    signal_type: (s.signal_type as string) ?? "",
    signal_level: (s.signal_level as string) ?? "",
    confidence_score: (s.confidence_score as number) ?? 0,
    source_url: (s.source_url as string) ?? null,
    source_text_snippet: (s.source_text_snippet as string) ?? null,
    detected_at: (s.detected_at as string) ?? "",
  }));

  return {
    id: row.id as string,
    full_name: row.full_name as string,
    preferred_name: (row.preferred_name as string) ?? null,
    email_public: (row.email_public as string) ?? null,
    title: (row.title as string) ?? null,
    academic_rank: (row.academic_rank as string) ?? null,
    faculty_page_url: (row.faculty_page_url as string) ?? null,
    lab_page_url: (row.lab_page_url as string) ?? null,
    external_profile_urls:
      (row.external_profile_urls as Record<string, string | null>) ?? null,
    institution_id: (row.institution_id as string) ?? null,
    department_id: (row.department_id as string) ?? null,
    is_active: row.is_active as boolean,
    source_confidence: (row.source_confidence as number) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    institution_name: (inst?.name as string) ?? null,
    department_name: (dept?.name as string) ?? null,
    scholar_h_index: (feat?.scholar_h_index as number) ?? null,
    scholar_citation_count: (feat?.scholar_citation_count as number) ?? null,
    cv_parsed: (feat?.cv_parsed as boolean) ?? null,
    enriched_at: (feat?.enriched_at as string) ?? null,
    research_impact_score: (feat?.research_impact_score as number) ?? null,
    recruiting_signal_score_hex:
      (feat?.recruiting_signal_score_hex as number) ?? null,
    topic_embedding: feat?.topic_embedding ?? null,
    funding_strength_score: (feat?.funding_strength_score as number) ?? null,
    industry_opensource_score:
      (feat?.industry_opensource_score as number) ?? null,
    mentorship_culture_score:
      (feat?.mentorship_culture_score as number) ?? null,
    research_activity_score_hex:
      (feat?.research_activity_score_hex as number) ?? null,
    scholar_interests: (feat?.scholar_interests as string[]) ?? null,
    hexagon_raw_signals:
      (feat?.hexagon_raw_signals as Record<string, unknown>) ?? null,
    hexagon_source_urls:
      (feat?.hexagon_source_urls as Record<string, unknown>) ?? null,
    hexagon_evidence:
      (feat?.hexagon_evidence as Record<string, HexagonDimension>) ?? null,
    enrichment_data:
      (feat?.enrichment_data as Record<string, unknown>) ?? null,
    cv_education_summary: (feat?.cv_education_summary as string) ?? null,
    cv_awards_count: (feat?.cv_awards_count as number) ?? null,
    recent_topics_summary: (feat?.recent_topics_summary as string) ?? null,
    recent_activity_score: (feat?.recent_activity_score as number) ?? null,
    funding_signal_score: (feat?.funding_signal_score as number) ?? null,
    normalized_name: (row.normalized_name as string) ?? null,
    education,
    topics,
    signals,
  };
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
