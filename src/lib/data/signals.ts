import { supabase } from "@/lib/supabase";

export interface SignalRow {
  id: string;
  professor_id: string | null;
  professor_name: string | null;
  institution_name: string | null;
  signal_type: string;
  source_url: string | null;
  source_text_snippet: string | null;
  signal_level: string;
  confidence_score: number;
  detected_at: string;
  expires_at: string | null;
}

export async function getSignals(opts?: {
  signalLevel?: string;
}): Promise<SignalRow[] | null> {
  if (!supabase) return null;

  let query = supabase
    .from("recruiting_signals")
    .select(
      `
      id, professor_id, signal_type, source_url,
      source_text_snippet, signal_level, confidence_score,
      detected_at, expires_at,
      professors(full_name, institutions(name))
    `,
    )
    .order("detected_at", { ascending: false })
    .limit(100);

  if (opts?.signalLevel) {
    query = query.eq("signal_level", opts.signalLevel);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getSignals error:", error);
    return null;
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const prof = row.professors as Record<string, unknown> | null;
    const inst = prof?.institutions as Record<string, unknown> | null;
    return {
      id: row.id as string,
      professor_id: row.professor_id as string | null,
      professor_name: (prof?.full_name as string) ?? null,
      institution_name: (inst?.name as string) ?? null,
      signal_type: row.signal_type as string,
      source_url: row.source_url as string | null,
      source_text_snippet: row.source_text_snippet as string | null,
      signal_level: row.signal_level as string,
      confidence_score: Number(row.confidence_score ?? 0),
      detected_at: row.detected_at as string,
      expires_at: row.expires_at as string | null,
    };
  });
}

export async function getSignalStats(): Promise<{
  total: number;
  high: number;
  some: number;
  none: number;
} | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("recruiting_signals")
    .select("signal_level");

  if (error || !data) return null;

  const rows = data as Array<Record<string, unknown>>;
  return {
    total: rows.length,
    high: rows.filter((r) => r.signal_level === "high").length,
    some: rows.filter((r) => r.signal_level === "some").length,
    none: rows.filter((r) => r.signal_level === "none").length,
  };
}
