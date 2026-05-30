import { supabase } from "@/lib/supabase";
import type {
  CandidateProfile,
  CandidateProfileFull,
  CandidateEducationEntry,
  CandidateExperience,
  CandidatePublication,
  CandidateSkill,
  ResumeParseResult,
} from "@/types/candidate";

// ---------------------------------------------------------------------------
// Candidate profiles – paginated list
// ---------------------------------------------------------------------------

export interface CandidateListResult {
  candidates: CandidateProfileFull[];
  total: number;
}

export async function getCandidateProfiles(opts: {
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<CandidateListResult | null> {
  if (!supabase) return null;

  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("candidate_profiles")
    .select(
      `
      id, user_id, resume_file_url, parsed_resume_text,
      research_interest_text, target_countries, target_disciplines,
      prefers_theory_level, prefers_interdisciplinary,
      require_funding_signal, candidate_embedding, notes,
      created_at, updated_at,
      users!inner(email, full_name)
    `,
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (opts.search) {
    query = query.ilike("users.full_name", `%${opts.search}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("getCandidateProfiles error:", error);
    return null;
  }

  const profiles: CandidateProfileFull[] = (data ?? []).map(
    (row: Record<string, unknown>) => {
      const user = row.users as Record<string, unknown> | null;
      return {
        id: row.id as string,
        user_id: row.user_id as string,
        resume_file_url: row.resume_file_url as string | null,
        parsed_resume_text: row.parsed_resume_text as string | null,
        research_interest_text: row.research_interest_text as string | null,
        target_countries: (row.target_countries as string[]) ?? [],
        target_disciplines: (row.target_disciplines as string[]) ?? [],
        prefers_theory_level: row.prefers_theory_level as number | null,
        prefers_interdisciplinary:
          (row.prefers_interdisciplinary as boolean) ?? false,
        require_funding_signal:
          (row.require_funding_signal as boolean) ?? false,
        candidate_embedding: row.candidate_embedding ?? null,
        notes: row.notes as string | null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        user_email: (user?.email as string) ?? undefined,
        user_full_name: (user?.full_name as string) ?? undefined,
        education: [],
        experiences: [],
        publications: [],
        skills: [],
      };
    },
  );

  return { candidates: profiles, total: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Single profile by user_id – with all sub-entities
// ---------------------------------------------------------------------------

export async function getCandidateProfileByUserId(
  userId: string,
): Promise<CandidateProfileFull | null> {
  if (!supabase) return null;

  const { data: profileData, error: profileError } = await supabase
    .from("candidate_profiles")
    .select(
      `
      id, user_id, resume_file_url, parsed_resume_text,
      research_interest_text, target_countries, target_disciplines,
      prefers_theory_level, prefers_interdisciplinary,
      require_funding_signal, candidate_embedding, notes,
      created_at, updated_at,
      users!inner(email, full_name)
    `,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("getCandidateProfileByUserId error:", profileError);
    return null;
  }
  if (!profileData) return null;

  const row = profileData as Record<string, unknown>;
  const user = row.users as Record<string, unknown> | null;
  const profileId = row.id as string;

  // Fetch sub-entities in parallel
  const [eduRes, expRes, pubRes, skillRes] = await Promise.all([
    supabase
      .from("candidate_education_entries")
      .select("*")
      .eq("candidate_profile_id", profileId)
      .order("display_order"),
    supabase
      .from("candidate_experiences")
      .select("*")
      .eq("candidate_profile_id", profileId)
      .order("display_order"),
    supabase
      .from("candidate_publications")
      .select("*")
      .eq("candidate_profile_id", profileId)
      .order("publication_year", { ascending: false }),
    supabase
      .from("candidate_skills")
      .select("*")
      .eq("candidate_profile_id", profileId)
      .order("skill_name"),
  ]);

  return {
    id: profileId,
    user_id: row.user_id as string,
    resume_file_url: row.resume_file_url as string | null,
    parsed_resume_text: row.parsed_resume_text as string | null,
    research_interest_text: row.research_interest_text as string | null,
    target_countries: (row.target_countries as string[]) ?? [],
    target_disciplines: (row.target_disciplines as string[]) ?? [],
    prefers_theory_level: row.prefers_theory_level as number | null,
    prefers_interdisciplinary:
      (row.prefers_interdisciplinary as boolean) ?? false,
    require_funding_signal: (row.require_funding_signal as boolean) ?? false,
    candidate_embedding: row.candidate_embedding ?? null,
    notes: row.notes as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    user_email: (user?.email as string) ?? undefined,
    user_full_name: (user?.full_name as string) ?? undefined,
    education: (eduRes.data ?? []) as CandidateEducationEntry[],
    experiences: (expRes.data ?? []) as CandidateExperience[],
    publications: (pubRes.data ?? []) as CandidatePublication[],
    skills: (skillRes.data ?? []) as CandidateSkill[],
  };
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function getCandidateStats(): Promise<{
  total: number;
  withResume: number;
  withEmbedding: number;
} | null> {
  if (!supabase) return null;

  const [totalRes, resumeRes, embRes] = await Promise.all([
    supabase
      .from("candidate_profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("candidate_profiles")
      .select("id", { count: "exact", head: true })
      .not("resume_file_url", "is", null),
    supabase
      .from("candidate_profiles")
      .select("id", { count: "exact", head: true })
      .not("candidate_embedding", "is", null),
  ]);

  return {
    total: totalRes.count ?? 0,
    withResume: resumeRes.count ?? 0,
    withEmbedding: embRes.count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Upsert profile
// ---------------------------------------------------------------------------

export async function upsertCandidateProfile(
  userId: string,
  data: Partial<
    Omit<CandidateProfile, "id" | "user_id" | "created_at" | "updated_at">
  >,
): Promise<CandidateProfile | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("candidate_profiles")
    .upsert(
      { user_id: userId, ...data, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("upsertCandidateProfile error:", error);
    return null;
  }
  return result as CandidateProfile;
}

// ---------------------------------------------------------------------------
// Education CRUD
// ---------------------------------------------------------------------------

export async function createEducationEntry(
  profileId: string,
  data: Omit<CandidateEducationEntry, "id" | "candidate_profile_id" | "created_at">,
): Promise<CandidateEducationEntry | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("candidate_education_entries")
    .insert({ candidate_profile_id: profileId, ...data })
    .select()
    .single();

  if (error) {
    console.error("createEducationEntry error:", error);
    return null;
  }
  return result as CandidateEducationEntry;
}

export async function updateEducationEntry(
  id: string,
  data: Partial<
    Omit<CandidateEducationEntry, "id" | "candidate_profile_id" | "created_at">
  >,
): Promise<CandidateEducationEntry | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("candidate_education_entries")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateEducationEntry error:", error);
    return null;
  }
  return result as CandidateEducationEntry;
}

export async function deleteEducationEntry(id: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from("candidate_education_entries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteEducationEntry error:", error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Experience CRUD
// ---------------------------------------------------------------------------

export async function createExperience(
  profileId: string,
  data: Omit<CandidateExperience, "id" | "candidate_profile_id" | "created_at">,
): Promise<CandidateExperience | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("candidate_experiences")
    .insert({ candidate_profile_id: profileId, ...data })
    .select()
    .single();

  if (error) {
    console.error("createExperience error:", error);
    return null;
  }
  return result as CandidateExperience;
}

export async function updateExperience(
  id: string,
  data: Partial<
    Omit<CandidateExperience, "id" | "candidate_profile_id" | "created_at">
  >,
): Promise<CandidateExperience | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("candidate_experiences")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateExperience error:", error);
    return null;
  }
  return result as CandidateExperience;
}

export async function deleteExperience(id: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from("candidate_experiences")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteExperience error:", error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Publication CRUD
// ---------------------------------------------------------------------------

export async function createPublication(
  profileId: string,
  data: Omit<CandidatePublication, "id" | "candidate_profile_id" | "created_at">,
): Promise<CandidatePublication | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("candidate_publications")
    .insert({ candidate_profile_id: profileId, ...data })
    .select()
    .single();

  if (error) {
    console.error("createPublication error:", error);
    return null;
  }
  return result as CandidatePublication;
}

export async function updatePublication(
  id: string,
  data: Partial<
    Omit<CandidatePublication, "id" | "candidate_profile_id" | "created_at">
  >,
): Promise<CandidatePublication | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("candidate_publications")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updatePublication error:", error);
    return null;
  }
  return result as CandidatePublication;
}

export async function deletePublication(id: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from("candidate_publications")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deletePublication error:", error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Skill CRUD
// ---------------------------------------------------------------------------

export async function createSkill(
  profileId: string,
  data: Omit<CandidateSkill, "id" | "candidate_profile_id" | "created_at">,
): Promise<CandidateSkill | null> {
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("candidate_skills")
    .insert({ candidate_profile_id: profileId, ...data })
    .select()
    .single();

  if (error) {
    console.error("createSkill error:", error);
    return null;
  }
  return result as CandidateSkill;
}

export async function deleteSkill(id: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from("candidate_skills")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteSkill error:", error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Bulk insert from resume parse
// ---------------------------------------------------------------------------

export async function bulkInsertFromResumeParse(
  profileId: string,
  parseResult: ResumeParseResult,
): Promise<boolean> {
  if (!supabase) return false;

  try {
    // Insert education entries
    if (parseResult.education.length > 0) {
      const eduRows = parseResult.education.map((e, idx) => ({
        candidate_profile_id: profileId,
        institution_name: e.institution,
        degree: e.degree,
        field_of_study: e.field_of_study,
        start_year: e.start_year,
        end_year: e.end_year,
        gpa: e.gpa,
        display_order: idx,
      }));
      const { error: eduError } = await supabase
        .from("candidate_education_entries")
        .insert(eduRows);
      if (eduError) {
        console.error("bulkInsert education error:", eduError);
        return false;
      }
    }

    // Insert experiences
    if (parseResult.research_experiences.length > 0) {
      const expRows = parseResult.research_experiences.map((e, idx) => ({
        candidate_profile_id: profileId,
        title: e.title,
        organization: e.organization,
        experience_type: e.type,
        description: e.description,
        start_date: e.start_date,
        end_date: e.end_date,
        display_order: idx,
      }));
      const { error: expError } = await supabase
        .from("candidate_experiences")
        .insert(expRows);
      if (expError) {
        console.error("bulkInsert experiences error:", expError);
        return false;
      }
    }

    // Insert publications
    if (parseResult.publications.length > 0) {
      const pubRows = parseResult.publications.map((p) => ({
        candidate_profile_id: profileId,
        title: p.title,
        venue: p.venue,
        publication_year: p.year,
        authors: p.authors,
      }));
      const { error: pubError } = await supabase
        .from("candidate_publications")
        .insert(pubRows);
      if (pubError) {
        console.error("bulkInsert publications error:", pubError);
        return false;
      }
    }

    // Insert skills
    if (parseResult.skills.length > 0) {
      const skillRows = parseResult.skills.map((s) => ({
        candidate_profile_id: profileId,
        skill_name: s.name,
        skill_type: s.type,
      }));
      const { error: skillError } = await supabase
        .from("candidate_skills")
        .insert(skillRows);
      if (skillError) {
        console.error("bulkInsert skills error:", skillError);
        return false;
      }
    }

    // Update profile with summary as research interest text
    if (parseResult.summary) {
      await supabase
        .from("candidate_profiles")
        .update({
          research_interest_text: parseResult.summary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);
    }

    return true;
  } catch (err) {
    console.error("bulkInsertFromResumeParse error:", err);
    return false;
  }
}
