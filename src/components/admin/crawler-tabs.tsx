"use client";

import { useState } from "react";
import type { CronTask, DataCoverage } from "@/types/admin";
import type { SnapshotRow } from "@/lib/data/crawler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSizeSelector } from "@/components/admin/page-size-selector";
import {
  Play,
  Clock,
  CheckCircle2,
  Pause,
  Database,
  FileText,
  Brain,
  Radar,
  FlaskConical,
  Users,
  BarChart3,
  Globe,
  Info,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sourceTypeBadge(sourceType: string) {
  switch (sourceType) {
    case "faculty_page":
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400">
          <Users className="mr-1 size-3" />
          Faculty Page
        </Badge>
      );
    case "lab_page":
      return (
        <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400">
          <FlaskConical className="mr-1 size-3" />
          Lab Page
        </Badge>
      );
    case "openalex":
      return (
        <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400">
          <FileText className="mr-1 size-3" />
          OpenAlex
        </Badge>
      );
    case "nsf":
      return (
        <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
          <Database className="mr-1 size-3" />
          NSF
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400">
          <Globe className="mr-1 size-3" />
          {sourceType}
        </Badge>
      );
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DataCoverageCards({ coverage }: { coverage: DataCoverage }) {
  const pctPapers = ((coverage.with_papers / coverage.total_professors) * 100).toFixed(1);
  const pctEmbeddings = ((coverage.with_embeddings / coverage.total_professors) * 100).toFixed(1);
  const pctSignals = ((coverage.with_signals / coverage.total_professors) * 100).toFixed(1);
  const pctGrants = ((coverage.with_grants / coverage.total_professors) * 100).toFixed(1);

  const cards = [
    { label: "Total Professors", value: coverage.total_professors.toLocaleString(), icon: Users },
    { label: "With Papers", value: `${pctPapers}%`, sub: `${coverage.with_papers} / ${coverage.total_professors}`, icon: FileText },
    { label: "With Embeddings", value: `${pctEmbeddings}%`, sub: `${coverage.with_embeddings} / ${coverage.total_professors}`, icon: Brain },
    { label: "With Signals", value: `${pctSignals}%`, sub: `${coverage.with_signals} / ${coverage.total_professors}`, icon: Radar },
    { label: "With Grants", value: `${pctGrants}%`, sub: `${coverage.with_grants} / ${coverage.total_professors}`, icon: Database },
    { label: "Avg Completeness", value: `${coverage.avg_completeness.toFixed(1)}%`, icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <c.icon className="size-4" />
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value}</div>
            {c.sub && (
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentSnapshotsTable({ snapshots }: { snapshots: SnapshotRow[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(snapshots.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = snapshots.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = snapshots.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, snapshots.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Snapshots</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source Type</TableHead>
              <TableHead>Source URL</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Fetched At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No snapshots found.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((snap) => (
                <TableRow key={snap.id}>
                  <TableCell>{sourceTypeBadge(snap.source_type)}</TableCell>
                  <TableCell className="max-w-[300px] truncate font-mono text-xs" title={snap.source_url}>
                    {snap.source_url}
                  </TableCell>
                  <TableCell className="text-sm">{snap.entity_type}</TableCell>
                  <TableCell className="text-xs">
                    {formatDateTime(snap.fetched_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <PageSizeSelector value={pageSize} onChange={(s) => { setPageSize(s); setPage(1); }} />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Showing {start}-{end} of {snapshots.length}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={safePage <= 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={safePage >= totalPages}>Next</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CronTasksTable({ tasks }: { tasks: CronTask[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Scheduled Cron Tasks</CardTitle>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="size-3" />
            Cron schedule is managed by pipeline
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {task.schedule}
                  </code>
                </TableCell>
                <TableCell className="text-xs">
                  {formatDateTime(task.last_run)}
                </TableCell>
                <TableCell className="text-xs">
                  {formatDateTime(task.next_run)}
                </TableCell>
                <TableCell>
                  {task.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="mr-1 size-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-500">
                      <Pause className="mr-1 size-3" />
                      Paused
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {task.last_status ? (
                    <Badge variant="outline" className="text-xs">
                      {task.last_status}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">--</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Client Component
// ---------------------------------------------------------------------------

export interface CrawlerTabsProps {
  snapshots: SnapshotRow[];
  cronTasks: CronTask[];
  coverage: DataCoverage;
}

export function CrawlerTabs({ snapshots, cronTasks, coverage }: CrawlerTabsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crawler &amp; Pipeline Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Monitor crawl snapshots, scheduled tasks, and data coverage.
          </p>
        </div>
        <Button>
          <Play className="mr-1.5 size-4" />
          Trigger Crawl
        </Button>
      </div>

      {/* Data Coverage Cards */}
      <DataCoverageCards coverage={coverage} />

      {/* Tabs for Snapshots / Cron */}
      <Tabs defaultValue="snapshots">
        <TabsList>
          <TabsTrigger value="snapshots">
            <Database className="mr-1.5 size-4" />
            Recent Snapshots
          </TabsTrigger>
          <TabsTrigger value="cron">
            <Clock className="mr-1.5 size-4" />
            Cron Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="snapshots">
          <RecentSnapshotsTable snapshots={snapshots} />
        </TabsContent>

        <TabsContent value="cron">
          <CronTasksTable tasks={cronTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
