const BASE_URL = "https://api.reporter.nih.gov/v2/projects/search";

export async function searchGrantsByPI(
  piName: string,
  institution = "",
  fromYear = 2020,
): Promise<Record<string, unknown>[]> {
  const currentYear = new Date().getFullYear();

  const body = {
    criteria: {
      pi_names: [{ any_name: piName }],
      fiscal_years: Array.from(
        { length: currentYear - fromYear + 1 },
        (_, i) => fromYear + i,
      ),
      ...(institution ? { org_names: [institution] } : {}),
    },
    offset: 0,
    limit: 50,
  };

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  const data = await res.json();

  const results = data?.results ?? [];
  // Deduplicate by base project number
  const seen = new Map<string, Record<string, unknown>>();
  for (const r of results) {
    const baseNum = String(r.project_num ?? "").replace(/-\d+$/, "");
    if (!seen.has(baseNum)) {
      seen.set(baseNum, {
        grant_id: r.project_num,
        title: r.project_title,
        abstract:
          typeof r.abstract_text === "string"
            ? r.abstract_text.slice(0, 500)
            : null,
        pi_name: r.contact_pi_name,
        start_date: r.project_start_date,
        end_date: r.project_end_date,
        institution: r.organization?.org_name,
        amount: r.award_amount ?? 0,
        agency: "NIH",
      });
    }
  }
  return [...seen.values()];
}

export async function ping(): Promise<{
  ok: boolean;
  latencyMs: number;
}> {
  const start = Date.now();
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        criteria: { fiscal_years: [2025] },
        offset: 0,
        limit: 1,
      }),
      signal: AbortSignal.timeout(10000),
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
