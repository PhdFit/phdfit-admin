// Types for the Candidate System — matches migrations 018-022

// === candidate_profiles (018) ===
export interface CandidateProfile {
  id: string;
  user_id: string;
  resume_file_url: string | null;
  parsed_resume_text: string | null;
  research_interest_text: string | null;
  target_countries: string[];
  target_disciplines: string[];
  prefers_theory_level: number | null; // 1 (theory) ~ 5 (applied)
  prefers_interdisciplinary: boolean;
  require_funding_signal: boolean;
  candidate_embedding: unknown;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// === candidate_education_entries (019) ===
export interface CandidateEducationEntry {
  id: string;
  candidate_profile_id: string;
  institution_name: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  gpa: string | null;
  display_order: number;
  created_at: string;
}

// === candidate_experiences (020) ===
export interface CandidateExperience {
  id: string;
  candidate_profile_id: string;
  title: string | null;
  organization: string | null;
  experience_type: string | null; // research, internship, project, work
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  display_order: number;
  created_at: string;
}

// === candidate_publications (021) ===
export interface CandidatePublication {
  id: string;
  candidate_profile_id: string;
  title: string;
  venue: string | null;
  publication_year: number | null;
  url: string | null;
  authors: string[];
  created_at: string;
}

// === candidate_skills (022) ===
export interface CandidateSkill {
  id: string;
  candidate_profile_id: string;
  skill_name: string;
  skill_type: string | null; // language, framework, method, domain, tool
  normalized_skill_name: string | null;
  confidence_score: number | null;
  created_at: string;
}

// === Resume parse result (matches resume_parse.txt prompt output) ===
export interface ResumeParseEducation {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number | null;
  end_year: number | null;
  gpa: string | null;
}

export interface ResumeParseExperience {
  title: string;
  organization: string;
  type: "research" | "internship" | "project" | "work";
  description: string;
  start_date: string | null;
  end_date: string | null;
}

export interface ResumeParsePublication {
  title: string;
  venue: string | null;
  year: number | null;
  authors: string[];
}

export interface ResumeParseSkill {
  name: string;
  type: "language" | "framework" | "method" | "domain" | "tool";
}

export interface ResumeParseResult {
  full_name: string;
  email: string | null;
  education: ResumeParseEducation[];
  research_experiences: ResumeParseExperience[];
  publications: ResumeParsePublication[];
  skills: ResumeParseSkill[];
  detected_topics: string[];
  detected_methods: string[];
  summary: string;
}

// === Composite type for profile with all sub-entities ===
export interface CandidateProfileFull extends CandidateProfile {
  education: CandidateEducationEntry[];
  experiences: CandidateExperience[];
  publications: CandidatePublication[];
  skills: CandidateSkill[];
  user_email?: string;
  user_full_name?: string;
}
