"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HexagonScores {
  research_impact: number;
  research_activity: number;
  funding_strength: number;
  recruiting_signal: number;
  industry_opensource: number;
  mentorship_culture: number;
}

interface HexagonRadarChartProps {
  scores: HexagonScores;
  compareScores?: HexagonScores;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DIMENSIONS = [
  { key: "research_impact", label: "Impact" },
  { key: "research_activity", label: "Activity" },
  { key: "funding_strength", label: "Funding" },
  { key: "recruiting_signal", label: "Recruiting" },
  { key: "industry_opensource", label: "Industry" },
  { key: "mentorship_culture", label: "Mentoring" },
] as const;

function buildChartData(
  scores: HexagonScores,
  compareScores?: HexagonScores,
) {
  return DIMENSIONS.map((d) => ({
    dimension: d.label,
    score: scores[d.key] ?? 0,
    ...(compareScores ? { compare: compareScores[d.key] ?? 0 } : {}),
  }));
}

const chartConfig: ChartConfig = {
  score: {
    label: "Score",
    color: "hsl(220, 70%, 50%)",
  },
  compare: {
    label: "Compare",
    color: "hsl(340, 65%, 50%)",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HexagonRadarChart({
  scores,
  compareScores,
  className,
}: HexagonRadarChartProps) {
  const data = buildChartData(scores, compareScores);

  return (
    <ChartContainer
      config={chartConfig}
      className={className}
    >
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="var(--color-score)"
          fill="var(--color-score)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        {compareScores && (
          <Radar
            name="Compare"
            dataKey="compare"
            stroke="var(--color-compare)"
            fill="var(--color-compare)"
            fillOpacity={0.15}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}
        <ChartTooltip
          content={<ChartTooltipContent />}
        />
      </RadarChart>
    </ChartContainer>
  );
}
