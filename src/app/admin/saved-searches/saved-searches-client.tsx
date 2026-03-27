"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  Bookmark,
  Users,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { SavedSearch } from "@/types/shortlist";
import type { SavedSearchStatsData } from "./page";
import { formatDate } from "@/lib/utils";
import { PageSizeSelector } from "@/components/admin/page-size-selector";

// ---------------------------------------------------------------------------
// KPI Cards
// ---------------------------------------------------------------------------

function KpiCards({ stats }: { stats: SavedSearchStatsData }) {
  const kpis = [
    {
      title: "Total Saved Searches",
      value: stats.total.toLocaleString(),
      icon: <Bookmark className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Unique Users",
      value: stats.uniqueUsers.toLocaleString(),
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "With Filters",
      value: stats.withFilters.toLocaleString(),
      icon: <Filter className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            {kpi.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete dialog
// ---------------------------------------------------------------------------

function DeleteSearchDialog({
  search,
  onDelete,
}: {
  search: SavedSearch;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" />}
      >
        <Trash2 className="size-3.5 text-destructive" />
        <span className="sr-only">Delete</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Saved Search</DialogTitle>
          <DialogDescription>
            Delete the saved search &quot;{search.query_text ?? "untitled"}&quot;? This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(search.id);
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Filters display
// ---------------------------------------------------------------------------

function FiltersDisplay({
  filters,
}: {
  filters: Record<string, unknown> | null;
}) {
  if (!filters) return <span className="text-muted-foreground">-</span>;

  const entries = Object.entries(filters);
  if (entries.length === 0)
    return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([key, val]) => (
        <Badge key={key} variant="secondary" className="text-xs">
          {key}: {Array.isArray(val) ? val.join(", ") : String(val)}
        </Badge>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Client Component
// ---------------------------------------------------------------------------

export interface SavedSearchesClientProps {
  searches: SavedSearch[];
  stats: SavedSearchStatsData;
}

export default function SavedSearchesClient({
  searches: initialSearches,
  stats,
}: SavedSearchesClientProps) {
  const router = useRouter();
  const [searches, setSearches] = useState(initialSearches);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDelete = async (id: string) => {
    // Optimistic update
    setSearches((prev) => prev.filter((s) => s.id !== id));

    try {
      await fetch(`/api/saved-searches?id=${id}`, {
        method: "DELETE",
      });
    } catch {
      router.refresh();
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return searches;
    const q = search.toLowerCase();
    return searches.filter(
      (s) =>
        s.query_text?.toLowerCase().includes(q) ||
        s.user_email?.toLowerCase().includes(q),
    );
  }, [searches, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KpiCards stats={stats} />

      {/* Search bar */}
      <div className="relative w-full sm:w-72">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by query or user..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Saved Searches{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({filtered.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Filters</TableHead>
                <TableHead>Sort By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No saved searches found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="max-w-[200px] font-medium">
                      {s.query_text || (
                        <span className="italic text-muted-foreground">
                          Empty query
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.user_email ?? s.user_id}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <FiltersDisplay filters={s.filters_json} />
                    </TableCell>
                    <TableCell>
                      {s.sort_by ? (
                        <Badge variant="outline" className="text-xs">
                          {s.sort_by.replace(/_/g, " ")}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(s.created_at)}</TableCell>
                    <TableCell>
                      <DeleteSearchDialog
                        search={s}
                        onDelete={handleDelete}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filtered.length > pageSize && (
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
                  <span className="sr-only">Previous</span>
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
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
