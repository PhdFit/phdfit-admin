import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockShortlists } from "@/lib/mock-data/shortlists";

// GET /api/shortlists — list all shortlists
export async function GET() {
  if (!supabase) {
    return Response.json(mockShortlists);
  }

  const { data, error } = await supabase
    .from("shortlists")
    .select("id, user_id, title, description, is_default, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Get item counts
  const ids = (data ?? []).map((r: Record<string, unknown>) => r.id as string);
  const { data: items } = await supabase
    .from("shortlist_items")
    .select("shortlist_id")
    .in("shortlist_id", ids);

  const counts = new Map<string, number>();
  for (const r of items ?? []) {
    const sid = (r as Record<string, unknown>).shortlist_id as string;
    counts.set(sid, (counts.get(sid) ?? 0) + 1);
  }

  const shortlists = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    is_default: row.is_default ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
    professor_count: counts.get(row.id as string) ?? 0,
  }));

  return Response.json(shortlists);
}

// POST /api/shortlists — create a new shortlist
export async function POST(request: NextRequest) {
  if (!supabase) {
    return Response.json({ error: "Database not connected" }, { status: 503 });
  }

  const body = await request.json();
  const { user_id, title, description } = body;

  if (!user_id || !title) {
    return Response.json(
      { error: "user_id and title are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("shortlists")
    .insert({ user_id, title, description: description ?? null })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
