import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  mockDataCoverage,
  mockAnalyticsOverview,
  mockLLMCostSummary,
  mockServices,
  mockResources,
} from "@/lib/mock-data";

function StatusDot({ status }: { status: string }) {
  const color =
    status === "healthy"
      ? "bg-green-500"
      : status === "degraded"
        ? "bg-yellow-500"
        : "bg-red-500";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export default function AdminOverview() {
  const coverage = mockDataCoverage;
  const analytics = mockAnalyticsOverview;
  const llm = mockLLMCostSummary;
  const services = mockServices;
  const resources = mockResources;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              DAU / MAU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.dau} / {analytics.mau}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Professors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coverage.total_professors}
            </div>
            <p className="text-xs text-muted-foreground">
              {coverage.avg_completeness.toFixed(1)}% avg completeness
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              LLM Cost (Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${llm.total_cost_month.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {llm.cache_hit_rate}% cache hit
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
                <StatusDot key={s.name} status={s.status} />
              ))}
              <span className="text-sm text-muted-foreground">
                {services.filter((s) => s.status === "healthy").length}/
                {services.length} healthy
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Coverage + Resources */}
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
              const pct = ((item.value / item.total) * 100).toFixed(1);
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

        <Card>
          <CardHeader>
            <CardTitle>Free Tier Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resources.map((r) => (
              <div key={r.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{r.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {r.current} / {r.limit} {r.unit}
                    </span>
                    {r.percentage > 80 && (
                      <Badge variant="destructive" className="text-xs">
                        Warning
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${r.percentage > 80 ? "bg-destructive" : r.percentage > 60 ? "bg-yellow-500" : "bg-primary"}`}
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
