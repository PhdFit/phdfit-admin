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
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Clock,
  Gauge,
  HardDrive,
  ListChecks,
  AlertTriangle,
} from "lucide-react";
import type { ServiceHealth, ResourceUsage, QueueStatus } from "@/types/admin";
import { mockServices, mockResources, mockQueues } from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function StatusDot({ status }: { status: ServiceHealth["status"] }) {
  const color =
    status === "healthy"
      ? "bg-green-500"
      : status === "degraded"
        ? "bg-yellow-500"
        : "bg-red-500";
  return (
    <span
      className={`inline-block h-3 w-3 shrink-0 rounded-full ${color}`}
      aria-label={status}
    />
  );
}

function StatusBadge({ status }: { status: ServiceHealth["status"] }) {
  const variant =
    status === "healthy"
      ? "secondary"
      : status === "degraded"
        ? "outline"
        : "destructive";
  return <Badge variant={variant}>{status}</Badge>;
}

function usageBarColor(percentage: number): string {
  if (percentage > 80) return "bg-red-500";
  if (percentage > 60) return "bg-yellow-500";
  return "bg-green-500";
}

function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

// ---------------------------------------------------------------------------
// Section: Service Status Cards
// ---------------------------------------------------------------------------

function ServiceStatusCards({ services }: { services: ServiceHealth[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Card key={service.name}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <StatusDot status={service.status} />
              {service.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">P95 Latency</p>
                <p className="font-semibold">
                  {formatLatency(service.latency_p95_ms)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Error Rate</p>
                <p className="font-semibold">{service.error_rate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Uptime</p>
                <p className="font-semibold">{service.uptime}%</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-end">
              <StatusBadge status={service.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Free Tier Resource Usage
// ---------------------------------------------------------------------------

function ResourceUsageSection({
  resources,
}: {
  resources: ResourceUsage[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Free Tier Resource Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((resource) => (
          <div key={resource.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{resource.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {resource.current} / {resource.limit} {resource.unit}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    resource.percentage > 80
                      ? "text-red-500"
                      : resource.percentage > 60
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {resource.percentage}%
                </span>
                {resource.percentage > 80 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Warning
                  </Badge>
                )}
              </div>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted">
              <div
                className={`h-2.5 rounded-full transition-all ${usageBarColor(resource.percentage)}`}
                style={{ width: `${Math.min(resource.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section: Task Queue Status
// ---------------------------------------------------------------------------

function QueueStatusSection({ queues }: { queues: QueueStatus[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Task Queue Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Queue Name</TableHead>
              <TableHead className="text-right">Pending</TableHead>
              <TableHead className="text-right">Processing</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead className="text-right">Throughput/min</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queues.map((queue) => (
              <TableRow key={queue.name}>
                <TableCell className="font-medium">{queue.name}</TableCell>
                <TableCell className="text-right">
                  {queue.pending > 0 ? (
                    <Badge variant="secondary">{queue.pending}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {queue.processing > 0 ? (
                    <Badge variant="default">{queue.processing}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {queue.failed > 0 ? (
                    <Badge variant="destructive">{queue.failed}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {queue.throughput_per_min}
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
// Page
// ---------------------------------------------------------------------------

export default function SystemHealthPage() {
  const services = mockServices;
  const resources = mockResources;
  const queues = mockQueues;

  // Use the most recent last_check from services as the page-level timestamp
  const lastChecked = services.length > 0 ? services[0].last_check : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h1 className="text-2xl font-bold">System Health</h1>
        </div>
        {lastChecked && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Last checked:{" "}
              {new Date(lastChecked).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Overall summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                {services.filter((s) => s.status === "healthy").length}/
                {services.length}
              </span>
              <span className="text-sm text-muted-foreground">healthy</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resource Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {resources.filter((r) => r.percentage > 80).length}
              </span>
              <span className="text-sm text-muted-foreground">
                above 80% usage
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Queue Failures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {queues.reduce((sum, q) => sum + q.failed, 0)}
              </span>
              <span className="text-sm text-muted-foreground">
                failed tasks
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

      {/* Free Tier Resource Usage */}
      <section>
        <ResourceUsageSection resources={resources} />
      </section>

      {/* Task Queue Status */}
      <section>
        <QueueStatusSection queues={queues} />
      </section>
    </div>
  );
}
