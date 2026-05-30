import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockSavedSearches } from "@/lib/mock-data/shortlists";

// GET /api/saved-searches — list all saved searches
export async function GET() {
  if (!supabase) {
    return Response.json(mockSavedSearches);
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .select(
      `
      id, user_id, query_text, filters_json, sort_by, created_at,
      users!inner(email)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const searches = (data ?? []).map((row: Record<string, unknown>) => {
    const user = row.users as Record<string, unknown> | null;
    return {
      id: row.id,
      user_id: row.user_id,
      query_text: row.query_text,
      filters_json: row.filters_json,
      sort_by: row.sort_by,
      created_at: row.created_at,
      user_email: user?.email ?? undefined,
    };
  });

  return Response.json(searches);
}

// POST /api/saved-searches — create a saved search
export async function POST(request: NextRequest) {
  if (!supabase) {
    return Response.json({ error: "Database not connected" }, { status: 503 });
  }

  const body = await request.json();
  const { user_id, query_text, filters_json, sort_by } = body;

  if (!user_id) {
    return Response.json(
      { error: "user_id is required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .insert({
      user_id,
      query_text: query_text ?? null,
      filters_json: filters_json ?? null,
      sort_by: sort_by ?? null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}

// DELETE /api/saved-searches?id=xxx — delete a saved search
export async function DELETE(request: NextRequest) {
  if (!supabase) {
    return Response.json({ error: "Database not connected" }, { status: 503 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "id parameter is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
