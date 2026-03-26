const BASE_URL = "https://api.nsf.gov/services/v1/awards.json";

export async function searchGrantsByPI(
  piName: string,
  institution = "",
  fromYear = 2020,
): Promise<Record<string, unknown>[]> {
  const nameParts = piName.trim().split(/\s+/);
  const lastName = nameParts[nameParts.length - 1];

  const params = new URLSearchParams({
    keyword: lastName,
    printFields:
      "id,title,abstractText,piFirstName,piLastName,startDate,expDate,awardeeName,fundsObligatedAmt",
    dateStart: `01/01/${fromYear}`,
  });

  const res = await fetch(`${BASE_URL}?${params}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  const awards = data?.response?.award ?? [];

  return awards
    .filter((a: Record<string, unknown>) => {
      const pi = `${a.piLastName}`.toLowerCase();
      return pi.includes(lastName.toLowerCase());
    })
    .map((a: Record<string, unknown>) => ({
      grant_id: a.id,
      title: a.title,
      abstract: typeof a.abstractText === "string"
        ? a.abstractText.slice(0, 500)
        : null,
      pi_name: `${a.piFirstName} ${a.piLastName}`,
      start_date: a.startDate,
      end_date: a.expDate,
      institution: a.awardeeName,
      amount: parseFloat(String(a.fundsObligatedAmt ?? "0")),
      agency: "NSF",
    }));
}

export async function ping(): Promise<{
  ok: boolean;
  latencyMs: number;
}> {
  const start = Date.now();
  try {
    const res = await fetch(
      `${BASE_URL}?keyword=test&printFields=id&resultCount=1`,
      { signal: AbortSignal.timeout(10000) },
    );
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
