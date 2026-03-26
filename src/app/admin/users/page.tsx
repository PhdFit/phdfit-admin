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
import type { User, AnalyticsOverview, SearchQuery } from "@/types/admin";
import {
  mockUsers,
  mockAnalyticsOverview,
  mockSearchQueries,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const planBadgeVariant: Record<
  User["plan"],
  { className: string; label: string }
> = {
  free: { className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", label: "Free" },
  pro: { className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", label: "Pro" },
  consultant: { className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", label: "Consultant" },
};

const statusBadgeVariant: Record<
  User["status"],
  { className: string; label: string }
> = {
  active: { className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", label: "Active" },
  inactive: { className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", label: "Inactive" },
  suspended: { className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", label: "Suspended" },
};

// ---------------------------------------------------------------------------
// KPI Cards
// ---------------------------------------------------------------------------

interface KpiItem {
  title: string;
  value: string;
  icon: ReactNode;
}

function KpiCards({ data }: { data: AnalyticsOverview }) {
  const kpis: KpiItem[] = [
    { title: "DAU", value: data.dau.toLocaleString(), icon: <Users className="h-4 w-4 text-muted-foreground" /> },
    { title: "WAU", value: data.wau.toLocaleString(), icon: <CalendarDays className="h-4 w-4 text-muted-foreground" /> },
    { title: "MAU", value: data.mau.toLocaleString(), icon: <CalendarDays className="h-4 w-4 text-muted-foreground" /> },
    { title: "Total Users", value: data.total_users.toLocaleString(), icon: <UserCheck className="h-4 w-4 text-muted-foreground" /> },
    { title: "Conversion Rate", value: `${data.conversion_rate}%`, icon: <TrendingUp className="h-4 w-4 text-muted-foreground" /> },
    { title: "7-Day Retention", value: `${data.retention_7d}%`, icon: <RotateCcw className="h-4 w-4 text-muted-foreground" /> },
    { title: "30-Day Retention", value: `${data.retention_30d}%`, icon: <RotateCcw className="h-4 w-4 text-muted-foreground" /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
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

function UserListTable({ users }: { users: User[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Searches Today</TableHead>
          <TableHead className="text-right">Shortlists</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
              No users found.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => {
            const plan = planBadgeVariant[user.plan];
            const status = statusBadgeVariant[user.status];
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name ?? <span className="text-muted-foreground italic">No name</span>}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={plan.className}>
                    {plan.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{user.searches_today}</TableCell>
                <TableCell className="text-right">{user.shortlist_count}</TableCell>
                <TableCell>{formatDateTime(user.last_active)}</TableCell>
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
// Page
// ---------------------------------------------------------------------------

export default function UsersPage() {
  const analytics: AnalyticsOverview = mockAnalyticsOverview;
  const allUsers: User[] = mockUsers;
  const searchQueries: SearchQuery[] = mockSearchQueries;

  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return allUsers;
    const q = search.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q))
    );
  }, [allUsers, search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management &amp; Analytics</h1>

      {/* KPI Cards */}
      <KpiCards data={analytics} />

      {/* Tabs: Users | Search Behavior */}
      <Tabs defaultValue="users">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="users">User List</TabsTrigger>
            <TabsTrigger value="search-behavior">Search Behavior</TabsTrigger>
          </TabsList>

          {/* Search bar (visible in users tab context but always present) */}
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
