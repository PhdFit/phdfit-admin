import { isSupabaseConnected } from "@/lib/supabase";
import { getSavedSearches, getSavedSearchStats } from "@/lib/data/saved-searches";
import { mockSavedSearches } from "@/lib/mock-data/shortlists";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import SavedSearchesClient from "./saved-searches-client";
import type { SavedSearch } from "@/types/shortlist";

// ---------------------------------------------------------------------------
// Stats shape
// ---------------------------------------------------------------------------

export interface SavedSearchStatsData {
  total: number;
  uniqueUsers: number;
  withFilters: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockStatsFromData(searches: SavedSearch[]): SavedSearchStatsData {
  const uniqueUsers = new Set(searches.map((s) => s.user_id)).size;
  const withFilters = searches.filter((s) => s.filters_json != null).length;
  return { total: searches.length, uniqueUsers, withFilters };
}

// ---------------------------------------------------------------------------
// Server Component
// ---------------------------------------------------------------------------

export default async function SavedSearchesPage() {
  const connected = isSupabaseConnected();

  let searches: SavedSearch[];
  let stats: SavedSearchStatsData;

  if (connected) {
    const [dbSearches, dbStats] = await Promise.all([
      getSavedSearches(),
      getSavedSearchStats(),
    ]);

    if (dbSearches && dbStats) {
      searches = dbSearches;
      stats = dbStats;
    } else {
      searches = mockSavedSearches;
      stats = mockStatsFromData(mockSavedSearches);
    }
  } else {
    searches = mockSavedSearches;
    stats = mockStatsFromData(mockSavedSearches);
  }

  return (
    <div className="space-y-6">
      {!connected && <NoDbBanner />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Searches</h1>
      </div>

      <SavedSearchesClient searches={searches} stats={stats} />
    </div>
  );
}
