import { ListChecks, Users, TrendingUp, BarChart3 } from "lucide-react";
import { isSupabaseConnected } from "@/lib/supabase";
import { getShortlists, getShortlistStats } from "@/lib/data/shortlists";
import { mockShortlists, mockShortlistItems } from "@/lib/mock-data/shortlists";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import ShortlistsClient from "./shortlists-client";
import type { Shortlist } from "@/types/shortlist";

// ---------------------------------------------------------------------------
// Stats shape
// ---------------------------------------------------------------------------

export interface ShortlistStatsData {
  totalShortlists: number;
  totalItems: number;
  avgItemsPerShortlist: number;
  bucketBreakdown: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Helpers — derive mock stats
// ---------------------------------------------------------------------------

function mockStatsFromData(shortlists: Shortlist[]): ShortlistStatsData {
  const totalShortlists = shortlists.length;
  const allItems = Object.values(mockShortlistItems).flat();
  const totalItems = allItems.length;

  const bucketBreakdown: Record<string, number> = {
    reach: 0,
    target: 0,
    safer: 0,
    not_sure: 0,
    unset: 0,
  };
  for (const item of allItems) {
    const b = item.bucket ?? "unset";
    bucketBreakdown[b] = (bucketBreakdown[b] ?? 0) + 1;
  }

  return {
    totalShortlists,
    totalItems,
    avgItemsPerShortlist:
      totalShortlists > 0 ? totalItems / totalShortlists : 0,
    bucketBreakdown,
  };
}

// ---------------------------------------------------------------------------
// Server Component
// ---------------------------------------------------------------------------

export default async function ShortlistsPage() {
  const connected = isSupabaseConnected();

  let shortlists: Shortlist[];
  let stats: ShortlistStatsData;

  if (connected) {
    const [dbShortlists, dbStats] = await Promise.all([
      getShortlists(),
      getShortlistStats(),
    ]);

    if (dbShortlists && dbStats) {
      shortlists = dbShortlists;
      stats = dbStats;
    } else {
      shortlists = mockShortlists;
      stats = mockStatsFromData(mockShortlists);
    }
  } else {
    shortlists = mockShortlists;
    stats = mockStatsFromData(mockShortlists);
  }

  return (
    <div className="space-y-6">
      {!connected && <NoDbBanner />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shortlists</h1>
      </div>

      <ShortlistsClient shortlists={shortlists} stats={stats} />
    </div>
  );
}
