"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ListChecks,
  Users,
  TrendingUp,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Search,
  Star,
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
import { Textarea } from "@/components/ui/textarea";
import type { Shortlist } from "@/types/shortlist";
import type { ShortlistStatsData } from "./page";
import { formatDate } from "@/lib/utils";
import { PageSizeSelector } from "@/components/admin/page-size-selector";

// ---------------------------------------------------------------------------
// KPI Cards
// ---------------------------------------------------------------------------

function KpiCards({ stats }: { stats: ShortlistStatsData }) {
  const kpis = [
    {
      title: "Total Shortlists",
      value: stats.totalShortlists.toLocaleString(),
      icon: <ListChecks className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Total Professors Saved",
      value: stats.totalItems.toLocaleString(),
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Avg per Shortlist",
      value: stats.avgItemsPerShortlist.toFixed(1),
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Target Bucket",
      value: (stats.bucketBreakdown.target ?? 0).toLocaleString(),
      icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
// Create Shortlist Dialog
// ---------------------------------------------------------------------------

function CreateShortlistDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/shortlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "admin", // Admin-created shortlists
          title: title.trim(),
          description: description.trim() || null,
        }),
      });
      setTitle("");
      setDescription("");
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        New Shortlist
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Shortlist</DialogTitle>
          <DialogDescription>
            Create a new shortlist to organize professors.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Top ML Advisors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || submitting}
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Rename Shortlist Dialog
// ---------------------------------------------------------------------------

function RenameShortlistDialog({
  shortlist,
}: {
  shortlist: Shortlist;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(shortlist.title);
  const [submitting, setSubmitting] = useState(false);

  const handleRename = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/shortlists/${shortlist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" />}
      >
        <Pencil className="size-3.5" />
        <span className="sr-only">Rename</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Shortlist</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Shortlist title"
          />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            onClick={handleRename}
            disabled={!title.trim() || submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete Shortlist Dialog
// ---------------------------------------------------------------------------

function DeleteShortlistDialog({
  shortlist,
}: {
  shortlist: Shortlist;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/shortlists/${shortlist.id}`, {
        method: "DELETE",
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

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
          <DialogTitle>Delete Shortlist</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{shortlist.title}&quot;? This
            will remove all {shortlist.professor_count} saved professors and
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Shortlist Table
// ---------------------------------------------------------------------------

function ShortlistTable({
  shortlists,
}: {
  shortlists: Shortlist[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Professors</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shortlists.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              No shortlists found.
            </TableCell>
          </TableRow>
        ) : (
          shortlists.map((sl) => (
            <TableRow key={sl.id}>
              <TableCell>
                <Link
                  href={`/admin/shortlists/${sl.id}`}
                  className="flex items-center gap-1.5 font-medium hover:underline"
                >
                  {sl.is_default && (
                    <Star className="size-3.5 fill-yellow-400 text-yellow-500" />
                  )}
                  {sl.title}
                </Link>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {sl.description ?? (
                  <span className="italic">No description</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">
                  {sl.professor_count}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(sl.updated_at)}</TableCell>
              <TableCell>{formatDate(sl.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-0.5">
                  <RenameShortlistDialog shortlist={sl} />
                  <DeleteShortlistDialog shortlist={sl} />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// Main Client Component
// ---------------------------------------------------------------------------

export interface ShortlistsClientProps {
  shortlists: Shortlist[];
  stats: ShortlistStatsData;
}

export default function ShortlistsClient({
  shortlists,
  stats,
}: ShortlistsClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    if (!search.trim()) return shortlists;
    const q = search.toLowerCase();
    return shortlists.filter(
      (sl) =>
        sl.title.toLowerCase().includes(q) ||
        sl.description?.toLowerCase().includes(q),
    );
  }, [shortlists, search]);

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

      {/* Search + Create */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter shortlists..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <CreateShortlistDialog />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <ShortlistTable shortlists={paginated} />

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
