import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

const EDITABLE_FIELDS = [
  "full_name",
  "preferred_name",
  "title",
  "academic_rank",
  "email_public",
  "faculty_page_url",
  "lab_page_url",
  "external_profile_urls",
  "is_active",
] as const;

// PATCH /api/admin/professors/[id] — update a professor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!supabase) {
    return Response.json({ error: "Database not connected" }, { status: 503 });
  }

  // Validate that the professor exists
  const { data: existing, error: fetchError } = await supabase
    .from("professors")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return Response.json({ error: "Professor not found" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("professors")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
