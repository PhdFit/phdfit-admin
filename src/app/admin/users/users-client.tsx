"use client";

import { type ReactNode, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserCheck,
  CalendarDays,
  TrendingUp,
  RotateCcw,
  Search,
  AlertTriangle,
} from "lucide-react";
import type { SearchQuery } from "@/types/admin";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** A row that can come from the DB (UserRow) or mock data (User). */
export interface UserDisplayRow {
  id: string;
  email: string;
  name: string | null;
  plan: "free" | "pro" | "consultant";
  shortlist_count: number;
  saved_search_count: number;
  created_at: string;
}

export interface UserStats {
  total: number;
  free: number;
  pro: number;
  consultant: number;
}

/** When using mock data we still have the old analytics shape. */
export interface MockAnalytics {
  dau: number;
  wau: number;
  mau: number;
  total_users: number;
  conversion_rate: number;
  retention_7d: number;
  retention_30d: number;
  avg_searches_per_user: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const planBadgeVariant: Record<
  UserDisplayRow["plan"],
  { className: string; label: string }
> = {
  free: {
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    label: "Free",
  },
  pro: {
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    label: "Pro",
  },
  consultant: {
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    label: "Consultant",
  },
};

// ---------------------------------------------------------------------------
// KPI Cards
// ---------------------------------------------------------------------------

interface KpiItem {
  title: string;
  value: string;
  icon: ReactNode;
}

function KpiCards({
  stats,
  mockAnalytics,
}: {
  stats: UserStats;
  mockAnalytics: MockAnalytics | null;
}) {
  const kpis: KpiItem[] = [];

  // Always show Total Users from real stats
  kpis.push({
    title: "Total Users",
    value: stats.total.toLocaleString(),
    icon: <UserCheck className="h-4 w-4 text-muted-foreground" />,
  });

  // Plan breakdown
  kpis.push({
    title: "Free",
    value: stats.free.toLocaleString(),
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  });
  kpis.push({
    title: "Pro",
    value: stats.pro.toLocaleString(),
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  });
  kpis.push({
    title: "Consultant",
    value: stats.consultant.toLocaleString(),
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  });

  if (mockAnalytics) {
    // Only show activity metrics when using mock data (not trackable from DB)
    kpis.push({
      title: "DAU",
      value: mockAnalytics.dau.toLocaleString(),
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
    });
    kpis.push({
      title: "WAU",
      value: mockAnalytics.wau.toLocaleString(),
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
    });
    kpis.push({
      title: "MAU",
      value: mockAnalytics.mau.toLocaleString(),
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
    });
    kpis.push({
      title: "Conversion Rate",
      value: `${mockAnalytics.conversion_rate}%`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    });
    kpis.push({
      title: "7-Day Retention",
      value: `${mockAnalytics.retention_7d}%`,
      icon: <RotateCcw className="h-4 w-4 text-muted-foreground" />,
    });
    kpis.push({
      title: "30-Day Retention",
      value: `${mockAnalytics.retention_30d}%`,
      icon: <RotateCcw className="h-4 w-4 text-muted-foreground" />,
    });
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            {kpi.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// User List Table
// ---------------------------------------------------------------------------

function UserListTable({ users }: { users: UserDisplayRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead className="text-right">Shortlists</TableHead>
          <TableHead className="text-right">Saved Searches</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              No users found.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => {
            const plan = planBadgeVariant[user.plan];
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name ?? (
                    <span className="text-muted-foreground italic">
                      No name
                    </span>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={plan.className}>
                    {plan.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.shortlist_count}
                </TableCell>
                <TableCell className="text-right">
                  {user.saved_search_count}
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// Search Behavior Panel
// ---------------------------------------------------------------------------

function SearchBehaviorTable({ queries }: { queries: SearchQuery[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Query</TableHead>
          <TableHead className="text-right">Count</TableHead>
          <TableHead className="text-right">Avg Results</TableHead>
          <TableHead>Zero Results</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {queries.map((q) => (
          <TableRow key={q.query}>
            <TableCell className="font-medium">{q.query}</TableCell>
            <TableCell className="text-right">{q.count}</TableCell>
            <TableCell className="text-right">{q.avg_results}</TableCell>
            <TableCell>
              {q.zero_results ? (
                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Yes
                </span>
              ) : (
                <span className="text-muted-foreground">No</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// Main Client Component
// ---------------------------------------------------------------------------

export interface UsersClientProps {
  users: UserDisplayRow[];
  stats: UserStats;
  searchQueries: SearchQuery[];
  /** Non-null only when showing mock data (Supabase not connected). */
  mockAnalytics: MockAnalytics | null;
}

export default function UsersClient({
  users,
  stats,
  searchQueries,
  mockAnalytics,
}: UsersClientProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q)),
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KpiCards stats={stats} mockAnalytics={mockAnalytics} />

      {/* Tabs: Users | Search Behavior */}
      <Tabs defaultValue="users">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="users">User List</TabsTrigger>
            <TabsTrigger value="search-behavior">Search Behavior</TabsTrigger>
          </TabsList>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Users{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredUsers.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserListTable users={filteredUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search-behavior" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Search Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchBehaviorTable queries={searchQueries} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
