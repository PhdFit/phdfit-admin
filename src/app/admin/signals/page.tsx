"use client";

import { useState } from "react";
import type { RecruitingSignal, SignalStatus } from "@/types/admin";
import { mockSignals } from "@/lib/mock-data";
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
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Target,
} from "lucide-react";

type TabFilter = "all" | "pending_review" | "confirmed" | "rejected";

function confidenceColor(confidence: number): string {
  if (confidence > 0.8) return "text-green-600 dark:text-green-400";
  if (confidence > 0.5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function confidenceBg(confidence: number): string {
  if (confidence > 0.8) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (confidence > 0.5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

function statusBadge(status: SignalStatus) {
  switch (status) {
    case "pending_review":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="mr-1 size-3" />
          Pending
        </Badge>
      );
    case "confirmed":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="mr-1 size-3" />
          Confirmed
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="mr-1 size-3" />
          Rejected
        </Badge>
      );
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

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<RecruitingSignal[]>(mockSignals);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    activeTab === "all"
      ? signals
      : signals.filter((s) => s.status === activeTab);

  const pendingCount = signals.filter((s) => s.status === "pending_review").length;
  const confirmedCount = signals.filter((s) => s.status === "confirmed").length;
  const rejectedCount = signals.filter((s) => s.status === "rejected").length;
  const reviewed = confirmedCount + rejectedCount;
  const accuracyRate = reviewed > 0 ? (confirmedCount / reviewed) * 100 : 0;

  function updateStatus(id: string, newStatus: SignalStatus) {
    setSignals((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: newStatus } : s
      )
    );
  }

  function toggleExpanded(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Signal Quality Review</h1>

      {/* Accuracy Stats Cards */}
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
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {pendingCount}
              </div>
              {pendingCount > 0 && (
                <Clock className="size-4 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {confirmedCount}
              </div>
              <CheckCircle2 className="size-4 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {rejectedCount}
              </div>
              <XCircle className="size-4 text-red-500" />
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
              {confirmedCount} / {reviewed} reviewed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs + Table */}
      <Tabs
        defaultValue="all"
        onValueChange={(value) => setActiveTab(value as TabFilter)}
      >
        <TabsList>
          <TabsTrigger value="all">
            All ({signals.length})
          </TabsTrigger>
          <TabsTrigger value="pending_review">
            Pending Review ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedCount})
          </TabsTrigger>
        </TabsList>

        {/* All tabs render the same table, filtered by activeTab state */}
        {(["all", "pending_review", "confirmed", "rejected"] as const).map(
          (tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8" />
                        <TableHead>Professor</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Signal Type</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Extracted Text</TableHead>
                        <TableHead>Detected At</TableHead>
                        <TableHead>Status</TableHead>
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
                          <SignalRow
                            key={signal.id}
                            signal={signal}
                            expanded={expandedId === signal.id}
                            onToggleExpand={() => toggleExpanded(signal.id)}
                            onConfirm={() =>
                              updateStatus(signal.id, "confirmed")
                            }
                            onReject={() =>
                              updateStatus(signal.id, "rejected")
                            }
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}

function SignalRow({
  signal,
  expanded,
  onToggleExpand,
  onConfirm,
  onReject,
}: {
  signal: RecruitingSignal;
  expanded: boolean;
  onToggleExpand: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer"
        onClick={onToggleExpand}
      >
        <TableCell>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="font-medium">{signal.professor_name}</TableCell>
        <TableCell>{signal.institution}</TableCell>
        <TableCell>{signalTypeBadge(signal.signal_type)}</TableCell>
        <TableCell>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${confidenceBg(signal.confidence)}`}
          >
            <Activity className="size-3" />
            {(signal.confidence * 100).toFixed(0)}%
          </span>
        </TableCell>
        <TableCell>
          <a
            href={signal.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="size-3" />
            Link
          </a>
        </TableCell>
        <TableCell className="max-w-[200px]">
          <span className="text-muted-foreground" title={signal.extracted_text}>
            {truncateText(signal.extracted_text, 50)}
          </span>
        </TableCell>
        <TableCell>{formatDate(signal.detected_at)}</TableCell>
        <TableCell>{statusBadge(signal.status)}</TableCell>
        <TableCell>
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {signal.status !== "confirmed" && (
              <Button
                size="xs"
                variant="ghost"
                className="text-green-600 hover:text-green-700 dark:text-green-400"
                onClick={onConfirm}
              >
                <CheckCircle2 className="size-3.5" />
                Confirm
              </Button>
            )}
            {signal.status !== "rejected" && (
              <Button
                size="xs"
                variant="ghost"
                className="text-red-600 hover:text-red-700 dark:text-red-400"
                onClick={onReject}
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
                <h4 className="text-sm font-semibold">Full Extracted Text</h4>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {signal.extracted_text}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <h4 className="text-sm font-semibold">Source URL</h4>
                  <a
                    href={signal.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <ExternalLink className="size-3" />
                    {signal.source_url}
                  </a>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Confidence Score</h4>
                  <p className={`mt-1 text-sm font-semibold ${confidenceColor(signal.confidence)}`}>
                    {(signal.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Detected</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(signal.detected_at)}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Reviewer Notes</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {signal.reviewer_notes ?? "No notes yet."}
                </p>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
