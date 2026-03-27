"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isSafeUrl } from "@/lib/utils";
import type { HexagonDimension, HexagonEvidenceItem } from "@/lib/data/professors";

const DIMENSION_LABELS: Record<string, { label: string; color: string }> = {
  research_impact: { label: "Research Impact", color: "bg-blue-500" },
  research_activity: { label: "Research Activity", color: "bg-emerald-500" },
  funding_strength: { label: "Funding Strength", color: "bg-amber-500" },
  recruiting_signal: { label: "Recruiting Signal", color: "bg-rose-500" },
  industry_opensource: { label: "Industry & OSS", color: "bg-purple-500" },
  mentorship_culture: { label: "Mentorship", color: "bg-cyan-500" },
};

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-600 dark:text-green-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function strengthBadge(strength: string | undefined) {
  if (!strength) return null;
  const variant =
    strength === "strong"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : strength === "moderate"
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${variant}`}>
      {strength}
    </span>
  );
}

function EvidenceItem({ item }: { item: HexagonEvidenceItem }) {
  return (
    <div className="flex items-start gap-2 rounded border p-2 text-sm">
      <Badge variant="outline" className="shrink-0 text-xs">
        {item.type}
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.label}</span>
          {strengthBadge(item.signal_strength)}
        </div>
        {item.detail && (
          <p className="mt-0.5 text-xs text-muted-foreground break-words">
            {item.detail}
          </p>
        )}
      </div>
      {item.source_url && isSafeUrl(item.source_url) && (
        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          title={item.source_url}
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </div>
  );
}

function DimensionCard({
  dimensionKey,
  dimension,
}: {
  dimensionKey: string;
  dimension: HexagonDimension;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = DIMENSION_LABELS[dimensionKey] ?? {
    label: dimensionKey,
    color: "bg-gray-500",
  };

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Score bar */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className={`text-xl font-bold tabular-nums ${scoreColor(dimension.score)}`}>
            {dimension.score}
          </span>
          <div className="h-1.5 w-12 rounded-full bg-muted">
            <div
              className={`h-1.5 rounded-full ${meta.color}`}
              style={{ width: `${dimension.score}%` }}
            />
          </div>
        </div>

        {/* Label + summary */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{meta.label}</span>
            {dimension.evidence.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dimension.evidence.length} evidence
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {dimension.summary}
          </p>
        </div>

        {/* Expand chevron */}
        {dimension.evidence.length > 0 && (
          <span className="shrink-0 text-muted-foreground">
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </span>
        )}
      </button>

      {/* Evidence list */}
      {expanded && dimension.evidence.length > 0 && (
        <div className="space-y-1.5 border-t px-3 py-2">
          {dimension.evidence.map((item, i) => (
            <EvidenceItem key={`${item.type}-${i}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HexagonEvidence({
  evidence,
}: {
  evidence: Record<string, HexagonDimension>;
}) {
  // Sort dimensions by the order defined in DIMENSION_LABELS
  const orderedKeys = Object.keys(DIMENSION_LABELS).filter(
    (k) => k in evidence,
  );
  // Add any extra keys not in our predefined list
  const extraKeys = Object.keys(evidence).filter(
    (k) => !DIMENSION_LABELS[k],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hexagon Scores & Evidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[...orderedKeys, ...extraKeys].map((key) => (
          <DimensionCard
            key={key}
            dimensionKey={key}
            dimension={evidence[key]}
          />
        ))}
      </CardContent>
    </Card>
  );
}
