import {
  Users,
  FileText,
  BrainCircuit,
} from "lucide-react";
import { isSupabaseConnected } from "@/lib/supabase";
import { getCandidateProfiles, getCandidateStats } from "@/lib/data/candidates";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidatesTable } from "./candidates-client";
import type { CandidateProfileFull } from "@/types/candidate";

// ---------------------------------------------------------------------------
// Stats cards
// ---------------------------------------------------------------------------

interface StatsData {
  total: number;
  withResume: number;
  withEmbedding: number;
}

function StatCards({ stats }: { stats: StatsData }) {
  const items = [
    {
      label: "Total Candidates",
      value: stats.total.toLocaleString(),
      icon: Users,
    },
    {
      label: "With Resume",
      value: stats.withResume.toLocaleString(),
      icon: FileText,
    },
    {
      label: "With Embedding",
      value: stats.withEmbedding.toLocaleString(),
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
// Page
// ---------------------------------------------------------------------------

export default async function AdminCandidatesPage() {
  const connected = isSupabaseConnected();

  let candidates: CandidateProfileFull[] = [];
  let stats: StatsData = { total: 0, withResume: 0, withEmbedding: 0 };

  if (connected) {
    const [listResult, dbStats] = await Promise.all([
      getCandidateProfiles({ perPage: 500 }),
      getCandidateStats(),
    ]);

    if (listResult) {
      candidates = listResult.candidates;
    }
    if (dbStats) {
      stats = dbStats;
    }
  }

  return (
    <div className="space-y-6">
      {!connected && <NoDbBanner />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Candidates</h1>
      </div>

      <StatCards stats={stats} />

      <CandidatesTable candidates={candidates} />
    </div>
  );
}
