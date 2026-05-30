import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// PATCH /api/shortlists/[id]/items/[itemId] — update notes, bucket, contact_status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params;

  if (!supabase) {
    return Response.json({ error: "Database not connected" }, { status: 503 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.bucket !== undefined) updates.bucket = body.bucket;
  if (body.user_note !== undefined) updates.user_note = body.user_note;
  if (body.contact_status !== undefined)
    updates.contact_status = body.contact_status;
  if (body.priority !== undefined) updates.priority = body.priority;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("shortlist_items")
    .update(updates)
    .eq("id", itemId)
    .eq("shortlist_id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Touch shortlist updated_at
  await supabase
    .from("shortlists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);

  return Response.json(data);
}

// DELETE /api/shortlists/[id]/items/[itemId] — remove from shortlist
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params;

  if (!supabase) {
    return Response.json({ error: "Database not connected" }, { status: 503 });
  }

  const { error } = await supabase
    .from("shortlist_items")
    .delete()
    .eq("id", itemId)
    .eq("shortlist_id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Touch shortlist updated_at
  await supabase
    .from("shortlists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);

  return new Response(null, { status: 204 });
}
