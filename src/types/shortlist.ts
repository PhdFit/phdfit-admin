// Types for the Shortlist System
// Based on migrations 024, 025, 026, 028, 031

// ---------------------------------------------------------------------------
// Enums / union types
// ---------------------------------------------------------------------------

export type ShortlistBucket = "reach" | "target" | "safer" | "not_sure";

export type ContactStatus =
  | "not_contacted"
  | "drafted"
  | "sent"
  | "replied";

// ---------------------------------------------------------------------------
// Shortlist (migration 024 + 031)
// ---------------------------------------------------------------------------

export interface Shortlist {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  /** Derived: number of items in this shortlist */
  professor_count: number;
}

// ---------------------------------------------------------------------------
// Shortlist Item (migration 025)
// ---------------------------------------------------------------------------

export interface ShortlistItem {
  id: string;
  shortlist_id: string;
  professor_id: string;
  bucket: ShortlistBucket | null;
  priority: number | null;
  contact_status: ContactStatus;
  user_note: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Professor details enriched with hexagon scores (for comparison view)
// Based on professors table + professor_derived_features (migration 028)
// ---------------------------------------------------------------------------

export interface ShortlistProfessorDetail extends ShortlistItem {
  /** Professor fields */
  professor_name: string;
  professor_email: string | null;
  institution_name: string | null;
  department_name: string | null;
  title: string | null;
  /** Derived features / hexagon scores (0-100 each) */
  scholar_h_index: number | null;
  scholar_citation_count: number | null;
  research_impact_score: number | null;
  research_activity_score_hex: number | null;
  funding_strength_score: number | null;
  recruiting_signal_score_hex: number | null;
  industry_opensource_score: number | null;
  mentorship_culture_score: number | null;
}

// ---------------------------------------------------------------------------
// Saved Search (migration 026 + 031)
// ---------------------------------------------------------------------------

export interface SavedSearch {
  id: string;
  user_id: string;
  query_text: string | null;
  filters_json: Record<string, unknown> | null;
  sort_by: string | null;
  created_at: string;
  /** Derived: user email or name for display in admin */
  user_email?: string;
}
