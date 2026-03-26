import { getSignals, getSignalStats } from "@/lib/data/signals";
import type { SignalRow } from "@/lib/data/signals";
import { isSupabaseConnected } from "@/lib/supabase";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import { mockSignals } from "@/lib/mock-data";
import { SignalsClient } from "./signals-client";

/**
 * Map mock signals (old schema) to the SignalRow shape used by the client
 * component so the UI works identically regardless of data source.
 */
function mockToSignalRows(): SignalRow[] {
  return mockSignals.map((m) => ({
    id: m.id,
    professor_id: m.professor_id,
    professor_name: m.professor_name,
    institution_name: m.institution,
    signal_type: m.signal_type,
    source_url: m.source_url,
    source_text_snippet: m.extracted_text,
    // Map old status -> signal_level: pending_review->some, confirmed->high, rejected->none
    signal_level:
      m.status === "confirmed"
        ? "high"
        : m.status === "rejected"
          ? "none"
          : "some",
    confidence_score: m.confidence,
    detected_at: m.detected_at,
    expires_at: null,
  }));
}

export default async function SignalsPage() {
  const connected = isSupabaseConnected();

  let signals: SignalRow[];
  let stats: { total: number; high: number; some: number; none: number };

  if (connected) {
    const [dbSignals, dbStats] = await Promise.all([
      getSignals(),
      getSignalStats(),
    ]);

    if (dbSignals && dbStats) {
      signals = dbSignals;
      stats = dbStats;
    } else {
      // DB query failed -- fall back to mock
      signals = mockToSignalRows();
      stats = {
        total: signals.length,
        high: signals.filter((s) => s.signal_level === "high").length,
        some: signals.filter((s) => s.signal_level === "some").length,
        none: signals.filter((s) => s.signal_level === "none").length,
      };
    }
  } else {
    signals = mockToSignalRows();
    stats = {
      total: signals.length,
      high: signals.filter((s) => s.signal_level === "high").length,
      some: signals.filter((s) => s.signal_level === "some").length,
      none: signals.filter((s) => s.signal_level === "none").length,
    };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Signal Quality Review</h1>
      {!connected && <NoDbBanner />}
      <SignalsClient initialSignals={signals} initialStats={stats} />
    </div>
  );
}
