"use client";

import { useState } from "react";
import type { SignalRow } from "@/lib/data/signals";
import { isSafeUrl, formatDate } from "@/lib/utils";
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
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Target,
  Signal,
  SignalLow,
  SignalZero,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabFilter = "all" | "high" | "some" | "none";

interface SignalsClientProps {
  initialSignals: SignalRow[];
  initialStats: { total: number; high: number; some: number; none: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function confidenceColor(score: number): string {
  if (score > 0.8) return "text-green-600 dark:text-green-400";
  if (score > 0.5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function confidenceBg(score: number): string {
  if (score > 0.8)
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (score > 0.5)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

function signalLevelBadge(level: string) {
  switch (level) {
    case "high":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <Signal className="mr-1 size-3" />
          High
        </Badge>
      );
    case "some":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <SignalLow className="mr-1 size-3" />
          Some
        </Badge>
      );
    case "none":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <SignalZero className="mr-1 size-3" />
          None
        </Badge>
      );
    default:
      return <Badge variant="secondary">{level}</Badge>;
  }
}

function signalTypeBadge(type: string) {
  switch (type) {
    case "recruiting":
      return <Badge variant="secondary">Recruiting</Badge>;
    case "funding":
      return <Badge variant="outline">Funding</Badge>;
    case "collaboration":
      return <Badge variant="default">Collaboration</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Client Component
// ---------------------------------------------------------------------------

export function SignalsClient({ initialSignals, initialStats }: SignalsClientProps) {
  const [signals, setSignals] = useState<SignalRow[]>(initialSignals);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    activeTab === "all"
      ? signals
      : signals.filter((s) => s.signal_level === activeTab);

  // Recompute stats from local state (may differ from initialStats after
  // confirm/reject actions).
  const highCount = signals.filter((s) => s.signal_level === "high").length;
  const someCount = signals.filter((s) => s.signal_level === "some").length;
  const noneCount = signals.filter((s) => s.signal_level === "none").length;
  const reviewed = highCount + noneCount;
  const accuracyRate = reviewed > 0 ? (highCount / reviewed) * 100 : 0;

  // TODO: Wire up to a server action / API route to persist confirm/reject
  function confirmSignal(id: string) {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, signal_level: "high" } : s)),
    );
    setExpandedId(null);
  }

  // TODO: Wire up to a server action / API route to persist confirm/reject
  function rejectSignal(id: string) {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, signal_level: "none" } : s)),
    );
    setExpandedId(null);
  }

  function toggleExpanded(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {highCount}
              </div>
              <Signal className="size-4 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Some
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {someCount}
              </div>
              <SignalLow className="size-4 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              None
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {noneCount}
              </div>
              <SignalZero className="size-4 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accuracy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {reviewed > 0 ? `${accuracyRate.toFixed(1)}%` : "N/A"}
              </div>
              <Target className="size-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {highCount} / {reviewed} reviewed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs + Table */}
      <Tabs
        defaultValue="all"
        onValueChange={(value) => {
          setActiveTab(value as TabFilter);
          setExpandedId(null);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All ({signals.length})</TabsTrigger>
          <TabsTrigger value="high">High ({highCount})</TabsTrigger>
          <TabsTrigger value="some">Some ({someCount})</TabsTrigger>
          <TabsTrigger value="none">None ({noneCount})</TabsTrigger>
        </TabsList>

        {(["all", "high", "some", "none"] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead>Professor</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Signal Type</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Snippet</TableHead>
                      <TableHead>Detected At</TableHead>
                      <TableHead>Signal Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No signals found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((signal) => (
                        <SignalRowView
                          key={signal.id}
                          signal={signal}
                          expanded={expandedId === signal.id}
                          onToggleExpand={() => toggleExpanded(signal.id)}
                          onConfirm={() => confirmSignal(signal.id)}
                          onReject={() => rejectSignal(signal.id)}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

// ---------------------------------------------------------------------------
// Row sub-component
// ---------------------------------------------------------------------------

function SignalRowView({
  signal,
  expanded,
  onToggleExpand,
  onConfirm,
  onReject,
}: {
  signal: SignalRow;
  expanded: boolean;
  onToggleExpand: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const sourceUrl = signal.source_url ?? "";
  const snippet = signal.source_text_snippet ?? "";

  return (
    <>
      <TableRow className="cursor-pointer" onClick={onToggleExpand}>
        <TableCell>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="font-medium whitespace-nowrap">
          {signal.professor_name ?? "Unknown"}
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {signal.institution_name ?? "Unknown"}
        </TableCell>
        <TableCell>{signalTypeBadge(signal.signal_type)}</TableCell>
        <TableCell>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${confidenceBg(signal.confidence_score)}`}
          >
            <Activity className="size-3" />
            {(signal.confidence_score * 100).toFixed(0)}%
          </span>
        </TableCell>
        <TableCell>
          {isSafeUrl(sourceUrl) ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3" />
              Link
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">Invalid URL</span>
          )}
        </TableCell>
        <TableCell className="max-w-[180px]">
          <span
            className="block truncate text-muted-foreground"
            title={snippet}
          >
            {snippet}
          </span>
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {formatDate(signal.detected_at)}
        </TableCell>
        <TableCell>{signalLevelBadge(signal.signal_level)}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {signal.signal_level !== "high" && (
              <Button
                size="xs"
                variant="ghost"
                className="text-green-600 hover:text-green-700 dark:text-green-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm();
                }}
              >
                <CheckCircle2 className="size-3.5" />
                Confirm
              </Button>
            )}
            {signal.signal_level !== "none" && (
              <Button
                size="xs"
                variant="ghost"
                className="text-red-600 hover:text-red-700 dark:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
              >
                <XCircle className="size-3.5" />
                Reject
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded detail row */}
      {expanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={10} className="p-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">Full Source Text Snippet</h4>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {snippet || "No snippet available."}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <h4 className="text-sm font-semibold">Source URL</h4>
                  {isSafeUrl(sourceUrl) ? (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <ExternalLink className="size-3" />
                      {sourceUrl}
                    </a>
                  ) : (
                    <span className="mt-1 text-sm text-muted-foreground">
                      Invalid URL
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Confidence Score</h4>
                  <p
                    className={`mt-1 text-sm font-semibold ${confidenceColor(signal.confidence_score)}`}
                  >
                    {(signal.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Detected</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(signal.detected_at)}
                  </p>
                </div>
              </div>
              {signal.expires_at && (
                <div>
                  <h4 className="text-sm font-semibold">Expires</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(signal.expires_at)}
                  </p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
