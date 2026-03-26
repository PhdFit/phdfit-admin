import { getUsers, getUserStats } from "@/lib/data/users";
import { isSupabaseConnected } from "@/lib/supabase";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import {
  mockUsers,
  mockAnalyticsOverview,
  mockSearchQueries,
} from "@/lib/mock-data";
import UsersClient from "./users-client";
import type { UserDisplayRow, UserStats, MockAnalytics } from "./users-client";

// ---------------------------------------------------------------------------
// Helpers — map DB rows / mock data into the display shape
// ---------------------------------------------------------------------------

function dbRowsToDisplay(
  rows: Awaited<ReturnType<typeof getUsers>>,
): UserDisplayRow[] | null {
  if (!rows) return null;
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.full_name,
    plan: (r.plan_type === "pro"
      ? "pro"
      : r.plan_type === "consultant"
        ? "consultant"
        : "free") as UserDisplayRow["plan"],
    shortlist_count: r.shortlist_count,
    saved_search_count: r.saved_search_count,
    created_at: r.created_at,
  }));
}

function mockUsersToDisplay(): UserDisplayRow[] {
  return mockUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    plan: u.plan,
    shortlist_count: u.shortlist_count,
    saved_search_count: 0,
    created_at: u.created_at,
  }));
}

function mockStatsFromOverview(): UserStats {
  // Derive a rough breakdown from mock data
  const free = mockUsers.filter((u) => u.plan === "free").length;
  const pro = mockUsers.filter((u) => u.plan === "pro").length;
  const consultant = mockUsers.filter((u) => u.plan === "consultant").length;
  return {
    total: mockAnalyticsOverview.total_users,
    free,
    pro,
    consultant,
  };
}

// ---------------------------------------------------------------------------
// Server Component (async) — fetch data, then render client shell
// ---------------------------------------------------------------------------

export default async function UsersPage() {
  const connected = isSupabaseConnected();

  let users: UserDisplayRow[];
  let stats: UserStats;
  let mockAnalytics: MockAnalytics | null = null;

  if (connected) {
    const [dbUsers, dbStats] = await Promise.all([getUsers(), getUserStats()]);

    const mappedUsers = dbRowsToDisplay(dbUsers);

    if (mappedUsers && dbStats) {
      users = mappedUsers;
      stats = dbStats;
    } else {
      // Supabase is configured but the query failed — fall back to mock
      users = mockUsersToDisplay();
      stats = mockStatsFromOverview();
      mockAnalytics = mockAnalyticsOverview;
    }
  } else {
    // No Supabase connection — pure mock mode
    users = mockUsersToDisplay();
    stats = mockStatsFromOverview();
    mockAnalytics = mockAnalyticsOverview;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management &amp; Analytics</h1>

      {!connected && <NoDbBanner />}

      <UsersClient
        users={users}
        stats={stats}
        searchQueries={mockSearchQueries}
        mockAnalytics={mockAnalytics}
      />
    </div>
  );
}
