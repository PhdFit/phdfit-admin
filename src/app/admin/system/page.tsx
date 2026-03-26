import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, Clock, Database, Gauge } from "lucide-react";
import { pingAllServices, getDbTableCounts } from "@/lib/data/system";
import type { ServicePing } from "@/lib/data/system";
import { isSupabaseConnected } from "@/lib/supabase";
import { NoDbBanner } from "@/components/admin/no-db-banner";

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-3 w-3 shrink-0 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`}
      aria-label={ok ? "ok" : "down"}
    />
  );
}

function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

// ---------------------------------------------------------------------------
// Section: Service Status Cards
// ---------------------------------------------------------------------------

function ServiceStatusCards({ services }: { services: ServicePing[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Card key={service.name}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <StatusDot ok={service.ok} />
              {service.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted-foreground">Latency</p>
                <p className="font-semibold">
                  {formatLatency(service.latencyMs)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold">
                  {service.ok ? "OK" : "Down"}
                </p>
              </div>
            </div>
            {service.extra?.rateRemaining !== undefined && (
              <p className="mt-2 text-xs text-muted-foreground">
                Rate limit remaining:{" "}
                <span className="font-medium text-foreground">
                  {String(service.extra.rateRemaining)}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Database Table Counts
// ---------------------------------------------------------------------------

function DbTableSection({
  tables,
}: {
  tables: Array<{ table: string; count: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Tables
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table</TableHead>
              <TableHead className="text-right">Row Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((t) => (
              <TableRow key={t.table}>
                <TableCell className="font-medium">{t.table}</TableCell>
                <TableCell className="text-right">
                  {t.count.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Mock DB table data (used when Supabase is not connected)
// ---------------------------------------------------------------------------

const MOCK_TABLE_COUNTS: Array<{ table: string; count: number }> = [
  { table: "professors", count: 0 },
  { table: "institutions", count: 0 },
  { table: "departments", count: 0 },
  { table: "papers", count: 0 },
  { table: "grants", count: 0 },
  { table: "topics", count: 0 },
  { table: "recruiting_signals", count: 0 },
  { table: "users", count: 0 },
  { table: "source_snapshots", count: 0 },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SystemHealthPage() {
  const dbConnected = isSupabaseConnected();

  // External API pings always work (no Supabase dependency)
  const services = await pingAllServices();

  // DB table counts require Supabase
  const tableCounts = dbConnected
    ? await getDbTableCounts()
    : null;

  const now = new Date();
  const okCount = services.filter((s) => s.ok).length;

  return (
    <div className="space-y-6">
      {/* No-DB warning */}
      {!dbConnected && <NoDbBanner />}

      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h1 className="text-2xl font-bold">System Health</h1>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Last checked:{" "}
            {now.toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>

      {/* Overall summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {okCount}/{services.length}
              </span>
              <span className="text-sm text-muted-foreground">healthy</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {dbConnected ? "Connected" : "Not connected"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status Cards */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Service Status</h2>
        <ServiceStatusCards services={services} />
      </section>

      {/* Database Tables */}
      <section>
        <DbTableSection tables={tableCounts ?? MOCK_TABLE_COUNTS} />
      </section>
    </div>
  );
}
