import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import { isSupabaseConnected } from "@/lib/supabase";
import { getProfessorStats } from "@/lib/data/professors";
import { getUserStats } from "@/lib/data/users";
import { getDataCoverage } from "@/lib/data/crawler";
import { pingAllServices, type ServicePing } from "@/lib/data/system";
import {
  mockDataCoverage,
  mockAnalyticsOverview,
  mockServices,
} from "@/lib/mock-data";

function StatusDot({ ok }: { ok: boolean }) {
  const color = ok ? "bg-green-500" : "bg-red-500";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export default async function AdminOverview() {
  const connected = isSupabaseConnected();

  // ---------- Fetch real data or fall back to mock ----------

  let totalUsers = mockAnalyticsOverview.total_users;
  let totalProfessors = mockDataCoverage.total_professors;

  let coverage = {
    total_professors: mockDataCoverage.total_professors,
    with_papers: mockDataCoverage.with_papers,
    with_embeddings: mockDataCoverage.with_embeddings,
    with_signals: mockDataCoverage.with_signals,
    with_grants: mockDataCoverage.with_grants,
  };

  let services: ServicePing[] = mockServices.map((s) => ({
    name: s.name,
    ok: s.status === "healthy",
    latencyMs: s.latency_p95_ms,
  }));

  if (connected) {
    const [userStats, profStats, coverageData, pings] = await Promise.all([
      getUserStats(),
      getProfessorStats(),
      getDataCoverage(),
      pingAllServices(),
    ]);

    if (userStats) {
      totalUsers = userStats.total;
    }

    if (profStats) {
      totalProfessors = profStats.total;
    }

    if (coverageData) {
      coverage = coverageData;
    }

    services = pings;
  }

  const healthyCount = services.filter((s) => s.ok).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {!connected && <NoDbBanner />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Professors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProfessors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              LLM Cost (Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">N/A</div>
            <p className="text-xs text-muted-foreground">
              No billing data available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {services.map((s) => (
                <StatusDot key={s.name} ok={s.ok} />
              ))}
              <span className="text-sm text-muted-foreground">
                {healthyCount}/{services.length} healthy
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Coverage */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "With Papers", value: coverage.with_papers, total: coverage.total_professors },
              { label: "With Embeddings", value: coverage.with_embeddings, total: coverage.total_professors },
              { label: "With Signals", value: coverage.with_signals, total: coverage.total_professors },
              { label: "With Grants", value: coverage.with_grants, total: coverage.total_professors },
            ].map((item) => {
              const pct = item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : "0.0";
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">
                      {item.value}/{item.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Service Health Detail */}
        <Card>
          <CardHeader>
            <CardTitle>Service Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <StatusDot ok={s.ok} />
                  <span>{s.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {s.latencyMs}ms
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
