"use client";

import { useState } from "react";
import {
  DollarSign,
  CalendarDays,
  CalendarRange,
  Zap,
  Cpu,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PageSizeSelector } from "@/components/admin/page-size-selector";
import type { LLMUsageEntry, LLMCostSummary } from "@/types/admin";
import { mockLLMUsage, mockLLMCostSummary } from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

function purposeLabel(purpose: string): string {
  return purpose
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Distinct colours for purpose badges */
function purposeVariant(
  purpose: string,
): "default" | "secondary" | "outline" | "destructive" {
  const map: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    fit_explain: "default",
    topic_tag: "secondary",
    resume_parse: "outline",
    paper_summary: "destructive",
    embedding: "secondary",
  };
  return map[purpose] ?? "outline";
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

interface ModelBreakdown {
  model: string;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalRequests: number;
}

interface PurposeBreakdown {
  purpose: string;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalRequests: number;
}

function aggregateByModel(entries: LLMUsageEntry[]): ModelBreakdown[] {
  const map = new Map<string, ModelBreakdown>();
  for (const e of entries) {
    const existing = map.get(e.model);
    if (existing) {
      existing.totalCost += e.cost_usd;
      existing.totalInputTokens += e.input_tokens;
      existing.totalOutputTokens += e.output_tokens;
      existing.totalRequests += e.request_count;
    } else {
      map.set(e.model, {
        model: e.model,
        totalCost: e.cost_usd,
        totalInputTokens: e.input_tokens,
        totalOutputTokens: e.output_tokens,
        totalRequests: e.request_count,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalCost - a.totalCost);
}

function aggregateByPurpose(entries: LLMUsageEntry[]): PurposeBreakdown[] {
  const map = new Map<string, PurposeBreakdown>();
  for (const e of entries) {
    const existing = map.get(e.purpose);
    if (existing) {
      existing.totalCost += e.cost_usd;
      existing.totalInputTokens += e.input_tokens;
      existing.totalOutputTokens += e.output_tokens;
      existing.totalRequests += e.request_count;
    } else {
      map.set(e.purpose, {
        purpose: e.purpose,
        totalCost: e.cost_usd,
        totalInputTokens: e.input_tokens,
        totalOutputTokens: e.output_tokens,
        totalRequests: e.request_count,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalCost - a.totalCost);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LLMCostMonitorPage() {
  const summary: LLMCostSummary = mockLLMCostSummary;
  const usage: LLMUsageEntry[] = mockLLMUsage;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalInputTokens = usage.reduce((s, e) => s + e.input_tokens, 0);
  const totalOutputTokens = usage.reduce((s, e) => s + e.output_tokens, 0);
  const totalCost = usage.reduce((s, e) => s + e.cost_usd, 0);
  const totalRequests = usage.reduce((s, e) => s + e.request_count, 0);

  const totalPages = Math.max(1, Math.ceil(usage.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedUsage = usage.slice((safePage - 1) * pageSize, safePage * pageSize);
  const start = usage.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, usage.length);

  const byModel = aggregateByModel(usage);
  const byPurpose = aggregateByPurpose(usage);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">LLM Cost &amp; Quality Monitor</h1>

      {/* ----------------------------------------------------------------- */}
      {/* 1. Cost Summary Cards                                             */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4" />
              Today&apos;s Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(summary.total_cost_today)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(summary.total_cost_week)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarRange className="size-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(summary.total_cost_month)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Zap className="size-4" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.cache_hit_rate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Cpu className="size-4" />
              Top Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {summary.top_model}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="size-4" />
              Top Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {purposeLabel(summary.top_purpose)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2 / 3 / 4 — Tabs: Usage Table, By Model, By Purpose              */}
      {/* ----------------------------------------------------------------- */}
      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="usage">Usage Table</TabsTrigger>
          <TabsTrigger value="by-model">Cost by Model</TabsTrigger>
          <TabsTrigger value="by-purpose">Cost by Purpose</TabsTrigger>
        </TabsList>

        {/* ---------- Usage Table ---------- */}
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>LLM Usage Entries</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="text-right">Input Tokens</TableHead>
                    <TableHead className="text-right">Output Tokens</TableHead>
                    <TableHead className="text-right">Cost (USD)</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedUsage.map((entry, idx) => (
                    <TableRow key={`${entry.date}-${entry.model}-${entry.purpose}-${idx}`}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.model}
                      </TableCell>
                      <TableCell>
                        <Badge variant={purposeVariant(entry.purpose)}>
                          {purposeLabel(entry.purpose)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatTokens(entry.input_tokens)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatTokens(entry.output_tokens)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCost(entry.cost_usd)}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.request_count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold">
                      Totals
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatTokens(totalInputTokens)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatTokens(totalOutputTokens)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCost(totalCost)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {totalRequests.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              <div className="flex items-center justify-between border-t px-4 py-3">
                <PageSizeSelector value={pageSize} onChange={(s) => { setPageSize(s); setPage(1); }} />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Showing {start}-{end} of {usage.length}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={safePage <= 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={safePage >= totalPages}>Next</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Cost by Model ---------- */}
        <TabsContent value="by-model">
          <Card>
            <CardHeader>
              <CardTitle>Cost by Model</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Input Tokens</TableHead>
                    <TableHead className="text-right">Output Tokens</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="w-48">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byModel.map((m) => {
                    const pct =
                      totalCost > 0
                        ? ((m.totalCost / totalCost) * 100).toFixed(1)
                        : "0";
                    return (
                      <TableRow key={m.model}>
                        <TableCell className="font-mono text-xs">
                          {m.model}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatTokens(m.totalInputTokens)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatTokens(m.totalOutputTokens)}
                        </TableCell>
                        <TableCell className="text-right">
                          {m.totalRequests.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCost(m.totalCost)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-xs text-muted-foreground">
                              {pct}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatTokens(totalInputTokens)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatTokens(totalOutputTokens)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {totalRequests.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCost(totalCost)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Cost by Purpose ---------- */}
        <TabsContent value="by-purpose">
          <Card>
            <CardHeader>
              <CardTitle>Cost by Purpose</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="text-right">Input Tokens</TableHead>
                    <TableHead className="text-right">Output Tokens</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="w-48">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byPurpose.map((p) => {
                    const pct =
                      totalCost > 0
                        ? ((p.totalCost / totalCost) * 100).toFixed(1)
                        : "0";
                    return (
                      <TableRow key={p.purpose}>
                        <TableCell>
                          <Badge variant={purposeVariant(p.purpose)}>
                            {purposeLabel(p.purpose)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatTokens(p.totalInputTokens)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatTokens(p.totalOutputTokens)}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.totalRequests.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCost(p.totalCost)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-xs text-muted-foreground">
                              {pct}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatTokens(totalInputTokens)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatTokens(totalOutputTokens)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {totalRequests.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCost(totalCost)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
