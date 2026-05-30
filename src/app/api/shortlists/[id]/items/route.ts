import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockShortlistItems } from "@/lib/mock-data/shortlists";

// GET /api/shortlists/[id]/items — list items for a shortlist
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!supabase) {
    return Response.json(mockShortlistItems[id] ?? []);
  }

  const { data, error } = await supabase
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

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((row: Record<string, unknown>) => {
    const prof = row.professors as Record<string, unknown>;
    const inst = prof?.institutions as Record<string, unknown> | null;
    const dept = prof?.departments as Record<string, unknown> | null;
    const feat = Array.isArray(prof?.professor_derived_features)
      ? (prof.professor_derived_features[0] as Record<string, unknown> | undefined)
      : (prof?.professor_derived_features as Record<string, unknown> | null);

    return {
      id: row.id,
      shortlist_id: row.shortlist_id,
      professor_id: row.professor_id,
      bucket: row.bucket ?? null,
      priority: row.priority,
      contact_status: row.contact_status ?? "not_contacted",
      user_note: row.user_note,
      created_at: row.created_at,
      updated_at: row.updated_at,
      professor_name: prof?.full_name ?? "Unknown",
      professor_email: prof?.email_public ?? null,
      institution_name: inst?.name ?? null,
      department_name: dept?.name ?? null,
      title: prof?.title ?? null,
      scholar_h_index: feat?.scholar_h_index ?? null,
      scholar_citation_count: feat?.scholar_citation_count ?? null,
      research_impact_score: feat?.research_impact_score ?? null,
      research_activity_score_hex: feat?.research_activity_score_hex ?? null,
      funding_strength_score: feat?.funding_strength_score ?? null,
      recruiting_signal_score_hex: feat?.recruiting_signal_score_hex ?? null,
      industry_opensource_score: feat?.industry_opensource_score ?? null,
      mentorship_culture_score: feat?.mentorship_culture_score ?? null,
    };
  });

  return Response.json(items);
}

// POST /api/shortlists/[id]/items — add a professor to a shortlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!supabase) {
    return Response.json({ error: "Database not connected" }, { status: 503 });
  }

  const body = await request.json();
  const { professor_id, bucket, user_note } = body;

  if (!professor_id) {
    return Response.json(
      { error: "professor_id is required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("shortlist_items")
    .insert({
      shortlist_id: id,
      professor_id,
      bucket: bucket ?? null,
      user_note: user_note ?? null,
    })
    .select()
    .single();

  if (error) {
    // Unique constraint violation = already in shortlist
    if (error.code === "23505") {
      return Response.json(
        { error: "Professor is already in this shortlist" },
        { status: 409 },
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Touch shortlist updated_at
  await supabase
    .from("shortlists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);

  return Response.json(data, { status: 201 });
}
