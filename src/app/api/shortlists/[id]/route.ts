import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// PATCH /api/shortlists/[id] — rename / update shortlist
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!supabase) {
    return Response.json({ error: "Database not connected" }, { status: 503 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.is_default !== undefined) updates.is_default = body.is_default;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("shortlists")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

// DELETE /api/shortlists/[id] — delete a shortlist
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!supabase) {
    return Response.json({ error: "Database not connected" }, { status: 503 });
  }

  const { error } = await supabase
    .from("shortlists")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
