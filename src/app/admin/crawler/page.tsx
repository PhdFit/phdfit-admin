import { getRecentSnapshots, getDataCoverage } from "@/lib/data/crawler";
import type { SnapshotRow } from "@/lib/data/crawler";
import { isSupabaseConnected } from "@/lib/supabase";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import { CrawlerTabs } from "@/components/admin/crawler-tabs";
import { mockCronTasks, mockDataCoverage } from "@/lib/mock-data";
import type { DataCoverage } from "@/types/admin";

// ---------------------------------------------------------------------------
// Mock snapshots used when Supabase is not connected
// ---------------------------------------------------------------------------

const mockSnapshots: SnapshotRow[] = [
  {
    id: "snap-001",
    source_type: "faculty_page",
    source_url: "https://cs.stanford.edu/people/faculty",
    entity_type: "professor",
    entity_id: "prof-001",
    content_hash: "a1b2c3d4",
    fetched_at: "2026-03-24T02:35:00Z",
  },
  {
    id: "snap-002",
    source_type: "openalex",
    source_url: "https://api.openalex.org/works?filter=author.id:A12345",
    entity_type: "paper",
    entity_id: null,
    content_hash: "e5f6g7h8",
    fetched_at: "2026-03-25T02:10:00Z",
  },
  {
    id: "snap-003",
    source_type: "nsf",
    source_url: "https://api.nsf.gov/services/v1/awards.json?keyword=AI",
    entity_type: "grant",
    entity_id: null,
    content_hash: "i9j0k1l2",
    fetched_at: "2026-03-23T03:05:00Z",
  },
  {
    id: "snap-004",
    source_type: "lab_page",
    source_url: "https://people.csail.mit.edu/bwilliams/lab",
    entity_type: "professor",
    entity_id: "prof-002",
    content_hash: "m3n4o5p6",
    fetched_at: "2026-03-24T01:22:00Z",
  },
  {
    id: "snap-005",
    source_type: "faculty_page",
    source_url: "https://eecs.berkeley.edu/people/faculty",
    entity_type: "professor",
    entity_id: "prof-003",
    content_hash: "q7r8s9t0",
    fetched_at: "2026-03-22T14:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Server Component
// ---------------------------------------------------------------------------

export default async function CrawlerMonitorPage() {
  const connected = isSupabaseConnected();

  let snapshots: SnapshotRow[];
  let coverage: DataCoverage;

  if (connected) {
    const [snapshotResult, coverageResult] = await Promise.all([
      getRecentSnapshots(),
      getDataCoverage(),
    ]);

    snapshots = snapshotResult ?? mockSnapshots;

    if (coverageResult) {
      coverage = {
        ...coverageResult,
        avg_completeness: 0,
      };
    } else {
      coverage = mockDataCoverage;
    }
  } else {
    snapshots = mockSnapshots;
    coverage = mockDataCoverage;
  }

  // Cron tasks always use mock data (no cron table in DB)
  const cronTasks = mockCronTasks;

  return (
    <div>
      {!connected && <NoDbBanner />}
      <CrawlerTabs
        snapshots={snapshots}
        cronTasks={cronTasks}
        coverage={coverage}
      />
    </div>
  );
}
