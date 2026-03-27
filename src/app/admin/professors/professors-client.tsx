"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Professor } from "@/types/admin";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSizeSelector } from "@/components/admin/page-size-selector";

const COMPLETENESS_RANGES = [
  { label: "All", min: 0, max: 100 },
  { label: "0-25%", min: 0, max: 25 },
  { label: "26-50%", min: 26, max: 50 },
  { label: "51-75%", min: 51, max: 75 },
  { label: "76-100%", min: 76, max: 100 },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function completenessColor(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function CompletenessBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${completenessColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{value}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProfessorsTableProps {
  professors: Professor[];
  institutions: string[];
}

// ---------------------------------------------------------------------------
// Client Component
// ---------------------------------------------------------------------------

export function ProfessorsTable({
  professors,
  institutions,
}: ProfessorsTableProps) {
  const [search, setSearch] = useState("");
  const [institution, setInstitution] = useState("all");
  const [completenessRange, setCompletenessRange] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Derive the selected range bounds
  const selectedRange =
    COMPLETENESS_RANGES.find((r) => r.label === completenessRange) ??
    COMPLETENESS_RANGES[0];

  // Filter professors
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return professors.filter((p) => {
      // text search
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.institution.toLowerCase().includes(q) &&
        !p.department.toLowerCase().includes(q)
      ) {
        return false;
      }
      // institution filter
      if (institution !== "all" && p.institution !== institution) {
        return false;
      }
      // completeness filter
      if (
        p.data_completeness < selectedRange.min ||
        p.data_completeness > selectedRange.max
      ) {
        return false;
      }
      return true;
    });
  }, [professors, search, institution, selectedRange]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  // Reset to page 1 when filters change
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleInstitution = (value: string | null) => {
    setInstitution(value ?? "all");
    setPage(1);
  };
  const handleCompletenessRange = (value: string | null) => {
    setCompletenessRange(value ?? "All");
    setPage(1);
  };

  return (
    <>
      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, institution, or department..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Institution Filter */}
            <Select value={institution} onValueChange={handleInstitution}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="All Institutions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Completeness Filter */}
            <Select
              value={completenessRange}
              onValueChange={handleCompletenessRange}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Data Completeness" />
              </SelectTrigger>
              <SelectContent>
                {COMPLETENESS_RANGES.map((r) => (
                  <SelectItem key={r.label} value={r.label}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Professor Table */}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">H-Index</TableHead>
                <TableHead className="text-right">Papers</TableHead>
                <TableHead>Data Completeness</TableHead>
                <TableHead>Signals</TableHead>
                <TableHead>Embedding</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No professors found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/professors/${p.id}`} className="hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{p.institution}</TableCell>
                    <TableCell>{p.department}</TableCell>
                    <TableCell className="text-right">
                      {p.h_index ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.paper_count}
                    </TableCell>
                    <TableCell>
                      <CompletenessBar value={p.data_completeness} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.has_signals ? "default" : "secondary"}
                      >
                        {p.has_signals ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.has_embedding ? "default" : "secondary"}
                      >
                        {p.has_embedding ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/professors/${p.id}`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="size-3.5" />
                          <span className="sr-only">Edit {p.name}</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Showing {(safePage - 1) * pageSize + 1}&ndash;
                {Math.min(safePage * pageSize, filtered.length)} of{" "}
                {filtered.length}
              </span>
              <div className="flex items-center gap-3">
                <PageSizeSelector value={pageSize} onChange={(s) => { setPageSize(s); setPage(1); }} />
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                <span className="px-2 text-sm">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
