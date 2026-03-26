const BASE_URL = "https://api.github.com";
const HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "PhdFitAdmin/1.0",
};

export async function getProfile(
  username: string,
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${BASE_URL}/users/${username}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function ping(): Promise<{
  ok: boolean;
  latencyMs: number;
  rateRemaining?: number;
}> {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/rate_limit`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    const rateRemaining = Number(res.headers.get("x-ratelimit-remaining") ?? 0);
    return { ok: res.ok, latencyMs: Date.now() - start, rateRemaining };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
