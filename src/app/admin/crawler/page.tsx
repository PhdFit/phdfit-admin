"use client";

import type { CrawlJob, CrawlJobStatus, CrawlJobType, CronTask, DataCoverage } from "@/types/admin";
import { mockCrawlJobs, mockCronTasks, mockDataCoverage } from "@/lib/mock-data";
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
import {
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pause,
  Database,
  FileText,
  Brain,
  Radar,
  FlaskConical,
  Users,
  BarChart3,
  Activity,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: CrawlJobStatus) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="mr-1 size-3" />
          Completed
        </Badge>
      );
    case "running":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Activity className="mr-1 size-3 animate-pulse" />
          Running
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="mr-1 size-3" />
          Failed
        </Badge>
      );
    case "queued":
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
          <Clock className="mr-1 size-3" />
          Queued
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-500">
          <Pause className="mr-1 size-3" />
          Cancelled
        </Badge>
      );
  }
}

function typeBadge(type: CrawlJobType) {
  switch (type) {
    case "faculty_page":
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400">
          <Users className="mr-1 size-3" />
          Faculty
        </Badge>
      );
    case "lab_page":
      return (
        <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400">
          <FlaskConical className="mr-1 size-3" />
          Lab Page
        </Badge>
      );
    case "paper_sync":
      return (
        <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400">
          <FileText className="mr-1 size-3" />
          Paper Sync
        </Badge>
      );
    case "grant_sync":
      return (
        <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
          <Database className="mr-1 size-3" />
          Grant Sync
        </Badge>
      );
    case "signal_detect":
      return (
        <Badge variant="outline" className="border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-400">
          <Radar className="mr-1 size-3" />
          Signal Detect
        </Badge>
      );
  }
}

function cronStatusBadge(status: CrawlJobStatus | null) {
  if (!status) {
    return (
      <span className="text-sm text-muted-foreground">--</span>
    );
  }
  return statusBadge(status);
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "--";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

function formatDate(dateStr: string | null): string {
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

function CrawlJobsTable({ jobs }: { jobs: CrawlJob[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Crawl Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Started At</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Processed</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-xs">{job.id}</TableCell>
                <TableCell>{typeBadge(job.type)}</TableCell>
                <TableCell>{statusBadge(job.status)}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={job.target}>
                  {job.target}
                </TableCell>
                <TableCell className="text-xs">
                  {formatDate(job.started_at)}
                </TableCell>
                <TableCell className="text-xs">
                  {formatDuration(job.duration_seconds)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {job.items_processed}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {job.items_failed > 0 ? (
                    <span className="text-red-600 dark:text-red-400">
                      {job.items_failed}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[220px] truncate text-xs text-red-600 dark:text-red-400" title={job.error_message ?? undefined}>
                  {job.error_message ?? (
                    <span className="text-muted-foreground">--</span>
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

function CronTasksTable({ tasks }: { tasks: CronTask[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Cron Tasks</CardTitle>
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
                  {formatDate(task.last_run)}
                </TableCell>
                <TableCell className="text-xs">
                  {formatDate(task.next_run)}
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
                <TableCell>{cronStatusBadge(task.last_status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CrawlerMonitorPage() {
  const jobs = mockCrawlJobs;
  const tasks = mockCronTasks;
  const coverage = mockDataCoverage;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crawler &amp; Pipeline Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Monitor crawl jobs, scheduled tasks, and data coverage.
          </p>
        </div>
        <Button>
          <Play className="mr-1.5 size-4" />
          Trigger Crawl
        </Button>
      </div>

      {/* Data Coverage Cards */}
      <DataCoverageCards coverage={coverage} />

      {/* Tabs for Jobs / Cron */}
      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">
            <AlertCircle className="mr-1.5 size-4" />
            Crawl Jobs
          </TabsTrigger>
          <TabsTrigger value="cron">
            <Clock className="mr-1.5 size-4" />
            Cron Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <CrawlJobsTable jobs={jobs} />
        </TabsContent>

        <TabsContent value="cron">
          <CronTasksTable tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
