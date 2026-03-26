import {
  Upload,
  Users,
  BarChart3,
  AlertCircle,
  BrainCircuit,
} from "lucide-react";
import type { Professor } from "@/types/admin";
import { mockProfessors } from "@/lib/mock-data";
import { isSupabaseConnected } from "@/lib/supabase";
import { getProfessors, getProfessorStats } from "@/lib/data/professors";
import type { ProfessorRow } from "@/lib/data/professors";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfessorsTable } from "./professors-client";

// ---------------------------------------------------------------------------
// Helpers – map ProfessorRow to the Professor type used by the UI
// ---------------------------------------------------------------------------

function computeCompleteness(row: ProfessorRow): number {
  const fields = [
    row.scholar_h_index != null,
    row.topic_embedding != null,
    row.recruiting_signal_score_hex != null,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function mapRowToProfessor(row: ProfessorRow): Professor {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email_public,
    institution: row.institution_name ?? "Unknown",
    department: row.department_name ?? "Unknown",
    title: row.title ?? "",
    research_interests: [],
    h_index: row.scholar_h_index,
    paper_count: row.scholar_citation_count ?? 0,
    grant_count: 0,
    has_embedding: row.topic_embedding != null,
    has_signals: row.recruiting_signal_score_hex != null,
    data_completeness: computeCompleteness(row),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Stats cards (server-rendered, no interactivity needed)
// ---------------------------------------------------------------------------

interface StatsData {
  total: number;
  avgCompleteness: number;
  missingEmbeddings: number;
  missingSignals: number;
}

function DataCompletenessSummary({ stats }: { stats: StatsData }) {
  const items = [
    {
      label: "Total Professors",
      value: stats.total.toLocaleString(),
      icon: Users,
    },
    {
      label: "Avg Completeness",
      value: `${stats.avgCompleteness.toFixed(1)}%`,
      icon: BarChart3,
    },
    {
      label: "Missing Embeddings",
      value: stats.missingEmbeddings.toLocaleString(),
      icon: BrainCircuit,
    },
    {
      label: "Missing Signals",
      value: stats.missingSignals.toLocaleString(),
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <Card key={s.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <s.icon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{s.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers – derive stats from mock data
// ---------------------------------------------------------------------------

function mockStats(professors: Professor[]): StatsData {
  const total = professors.length;
  const avgCompleteness =
    total > 0
      ? professors.reduce((sum, p) => sum + p.data_completeness, 0) / total
      : 0;
  const missingEmbeddings = professors.filter((p) => !p.has_embedding).length;
  const missingSignals = professors.filter((p) => !p.has_signals).length;
  return { total, avgCompleteness, missingEmbeddings, missingSignals };
}

function uniqueInstitutions(professors: Professor[]): string[] {
  return Array.from(new Set(professors.map((p) => p.institution))).sort();
}

// ---------------------------------------------------------------------------
// Page (async Server Component)
// ---------------------------------------------------------------------------

export default async function ProfessorsPage() {
  const connected = isSupabaseConnected();

  let professors: Professor[];
  let stats: StatsData;
  let institutions: string[];

  if (connected) {
    // Fetch real data from Supabase in parallel
    const [listResult, dbStats] = await Promise.all([
      getProfessors({ perPage: 500 }),
      getProfessorStats(),
    ]);

    if (listResult && dbStats) {
      professors = listResult.professors.map(mapRowToProfessor);
      const avgCompleteness =
        professors.length > 0
          ? professors.reduce((sum, p) => sum + p.data_completeness, 0) /
            professors.length
          : 0;
      stats = {
        total: dbStats.total,
        avgCompleteness,
        missingEmbeddings: dbStats.total - dbStats.withEmbedding,
        missingSignals: dbStats.total - dbStats.withSignals,
      };
      institutions = dbStats.institutions;
    } else {
      // Supabase connected but query failed – fall back to mock
      professors = mockProfessors;
      stats = mockStats(mockProfessors);
      institutions = uniqueInstitutions(mockProfessors);
    }
  } else {
    // No Supabase connection – use mock data
    professors = mockProfessors;
    stats = mockStats(mockProfessors);
    institutions = uniqueInstitutions(mockProfessors);
  }

  return (
    <div className="space-y-6">
      {/* No-DB warning banner */}
      {!connected && <NoDbBanner />}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Professor Data Manager</h1>
        <Button variant="outline">
          <Upload className="size-4" />
          Import CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <DataCompletenessSummary stats={stats} />

      {/* Interactive table with search / filter / pagination */}
      <ProfessorsTable professors={professors} institutions={institutions} />
    </div>
  );
}
