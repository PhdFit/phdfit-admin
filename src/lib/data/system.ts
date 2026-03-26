import { supabase } from "@/lib/supabase";
import * as openalex from "@/lib/api/openalex";
import * as github from "@/lib/api/github";
import * as nsf from "@/lib/api/nsf";
import * as nih from "@/lib/api/nih";

export interface ServicePing {
  name: string;
  ok: boolean;
  latencyMs: number;
  extra?: Record<string, unknown>;
}

export async function pingAllServices(): Promise<ServicePing[]> {
  const results: ServicePing[] = [];

  // Ping Supabase
  const dbStart = Date.now();
  let dbOk = false;
  if (supabase) {
    try {
      const { error } = await supabase.from("institutions").select("id").limit(1);
      dbOk = !error;
    } catch {
      dbOk = false;
    }
  }
  results.push({
    name: "Supabase PostgreSQL",
    ok: dbOk,
    latencyMs: Date.now() - dbStart,
  });

  // Ping external APIs in parallel
  const [oaRes, ghRes, nsfRes, nihRes] = await Promise.all([
    openalex.ping(),
    github.ping(),
    nsf.ping(),
    nih.ping(),
  ]);

  results.push({ name: "OpenAlex API", ok: oaRes.ok, latencyMs: oaRes.latencyMs });
  results.push({
    name: "GitHub API",
    ok: ghRes.ok,
    latencyMs: ghRes.latencyMs,
    extra: ghRes.rateRemaining !== undefined ? { rateRemaining: ghRes.rateRemaining } : undefined,
  });
  results.push({ name: "NSF Award Search", ok: nsfRes.ok, latencyMs: nsfRes.latencyMs });
  results.push({ name: "NIH RePORTER", ok: nihRes.ok, latencyMs: nihRes.latencyMs });

  return results;
}

export async function getDbTableCounts(): Promise<
  Array<{ table: string; count: number }> | null
> {
  if (!supabase) return null;

  const tables = [
    "professors",
    "institutions",
    "departments",
    "papers",
    "grants",
    "topics",
    "recruiting_signals",
    "users",
    "source_snapshots",
  ];

  const results = await Promise.all(
    tables.map(async (table) => {
      const { count } = await supabase!
        .from(table)
        .select("id", { count: "exact", head: true });
      return { table, count: count ?? 0 };
    }),
  );

  return results;
}
