const BASE_URL = "https://api.openalex.org";

function buildParams(): Record<string, string> {
  const params: Record<string, string> = {};
  const email = process.env.OPENALEX_EMAIL;
  if (email) params.mailto = email;
  return params;
}

export async function searchAuthor(
  name: string,
  institution?: string,
): Promise<Record<string, unknown> | null> {
  const params = new URLSearchParams({
    ...buildParams(),
    search: name,
  });
  if (institution) {
    params.set("filter", `last_known_institutions.display_name:${institution}`);
  }
  const res = await fetch(`${BASE_URL}/authors?${params}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] ?? null;
}

export async function getWorksByAuthor(
  openalexAuthorId: string,
  maxResults = 50,
): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams({
    ...buildParams(),
    filter: `author.id:${openalexAuthorId}`,
    sort: "publication_date:desc",
    per_page: String(Math.min(maxResults, 50)),
  });
  const res = await fetch(`${BASE_URL}/works?${params}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export async function ping(): Promise<{
  ok: boolean;
  latencyMs: number;
}> {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/works?per_page=1&${new URLSearchParams(buildParams())}`, {
      signal: AbortSignal.timeout(10000),
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
