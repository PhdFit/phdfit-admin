"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutGrid,
  TableIcon,
  Search,
  ArrowUpDown,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ProfessorComparisonCard } from "@/components/admin/professor-comparison-card";
import {
  BUCKET_STYLES,
  CONTACT_STYLES,
} from "@/components/admin/professor-comparison-card";
import { ExportShortlistButton } from "@/components/admin/export-shortlist-button";
import type {
  Shortlist,
  ShortlistProfessorDetail,
  ShortlistBucket,
  ContactStatus,
} from "@/types/shortlist";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = "name" | "h_index" | "impact" | "recruiting" | "institution";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ShortlistDetailClientProps {
  shortlist: Shortlist;
  items: ShortlistProfessorDetail[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortItems(
  items: ShortlistProfessorDetail[],
  sortKey: SortKey,
  sortDir: SortDir,
): ShortlistProfessorDetail[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "name":
        cmp = a.professor_name.localeCompare(b.professor_name);
        break;
      case "h_index":
        cmp = (a.scholar_h_index ?? 0) - (b.scholar_h_index ?? 0);
        break;
      case "impact":
        cmp =
          (a.research_impact_score ?? 0) - (b.research_impact_score ?? 0);
        break;
      case "recruiting":
        cmp =
          (a.recruiting_signal_score_hex ?? 0) -
          (b.recruiting_signal_score_hex ?? 0);
        break;
      case "institution":
        cmp = (a.institution_name ?? "").localeCompare(
          b.institution_name ?? "",
        );
        break;
    }
    return sortDir === "desc" ? -cmp : cmp;
  });
  return sorted;
}

// ---------------------------------------------------------------------------
// Table View - Inline editing row
// ---------------------------------------------------------------------------

function TableViewRow({
  item,
  onUpdateBucket,
  onUpdateContactStatus,
  onUpdateNote,
  onRemove,
}: {
  item: ShortlistProfessorDetail;
  onUpdateBucket: (id: string, bucket: ShortlistBucket | null) => void;
  onUpdateContactStatus: (id: string, status: ContactStatus) => void;
  onUpdateNote: (id: string, note: string) => void;
  onRemove: (id: string) => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(item.user_note ?? "");

  const bucketStyle = BUCKET_STYLES[item.bucket ?? "none"];
  const contactStyle = CONTACT_STYLES[item.contact_status];

  return (
    <TableRow>
      <TableCell className="font-medium">
        {item.professor_name}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {item.institution_name ?? "-"}
      </TableCell>
      <TableCell className="text-right">
        {item.scholar_h_index ?? "-"}
      </TableCell>
      <TableCell className="text-right">
        {item.research_impact_score ?? "-"}
      </TableCell>
      <TableCell className="text-right">
        {item.recruiting_signal_score_hex ?? "-"}
      </TableCell>
      <TableCell>
        <Select
          value={item.bucket ?? "none"}
          onValueChange={(val) => {
            if (val == null) return;
            onUpdateBucket(item.id, val === "none" ? null : (val as ShortlistBucket));
          }}
        >
          <SelectTrigger size="sm" className="w-24">
            <Badge variant="outline" className={bucketStyle.className}>
              {bucketStyle.label}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unset</SelectItem>
            <SelectItem value="reach">Reach</SelectItem>
            <SelectItem value="target">Target</SelectItem>
            <SelectItem value="safer">Safer</SelectItem>
            <SelectItem value="not_sure">Not Sure</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          value={item.contact_status}
          onValueChange={(val) => {
            if (val == null) return;
            onUpdateContactStatus(item.id, val as ContactStatus);
          }}
        >
          <SelectTrigger size="sm" className="w-28">
            <Badge variant="outline" className={contactStyle.className}>
              {contactStyle.label}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_contacted">Not Contacted</SelectItem>
            <SelectItem value="drafted">Drafted</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="max-w-[180px]">
        {editingNote ? (
          <div className="space-y-1">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
              className="text-xs"
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => {
                  onUpdateNote(item.id, noteText);
                  setEditingNote(false);
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setNoteText(item.user_note ?? "");
                  setEditingNote(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingNote(true)}
            className="w-full truncate rounded border border-dashed border-transparent px-1 py-0.5 text-left text-xs text-muted-foreground hover:border-border"
          >
            {item.user_note || "Add note..."}
          </button>
        )}
      </TableCell>
      <TableCell>
        <Dialog>
          <DialogTrigger
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <Trash2 className="size-3.5 text-destructive" />
            <span className="sr-only">Remove</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Professor</DialogTitle>
              <DialogDescription>
                Remove {item.professor_name} from this shortlist?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => onRemove(item.id)}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ShortlistDetailClient({
  shortlist,
  items: initialItems,
}: ShortlistDetailClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [bucketFilter, setBucketFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // -----------------------------------------------------------------------
  // Mutation helpers (optimistic + API call)
  // -----------------------------------------------------------------------

  const patchItem = useCallback(
    async (itemId: string, patch: Record<string, unknown>) => {
      // Optimistic update
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, ...patch } : it,
        ),
      );

      try {
        await fetch(`/api/shortlists/${shortlist.id}/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      } catch {
        // Revert on failure
        router.refresh();
      }
    },
    [shortlist.id, router],
  );

  const handleUpdateNote = useCallback(
    (itemId: string, note: string) => {
      patchItem(itemId, { user_note: note });
    },
    [patchItem],
  );

  const handleUpdateBucket = useCallback(
    (itemId: string, bucket: ShortlistBucket | null) => {
      patchItem(itemId, { bucket });
    },
    [patchItem],
  );

  const handleUpdateContactStatus = useCallback(
    (itemId: string, contact_status: ContactStatus) => {
      patchItem(itemId, { contact_status });
    },
    [patchItem],
  );

  const handleRemove = useCallback(
    async (itemId: string) => {
      setItems((prev) => prev.filter((it) => it.id !== itemId));

      try {
        await fetch(
          `/api/shortlists/${shortlist.id}/items/${itemId}`,
          { method: "DELETE" },
        );
      } catch {
        router.refresh();
      }
    },
    [shortlist.id, router],
  );

  // -----------------------------------------------------------------------
  // Filtering + Sorting
  // -----------------------------------------------------------------------

  const filtered = useMemo(() => {
    let result = items;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (it) =>
          it.professor_name.toLowerCase().includes(q) ||
          it.institution_name?.toLowerCase().includes(q) ||
          it.department_name?.toLowerCase().includes(q),
      );
    }

    // Bucket filter
    if (bucketFilter !== "all") {
      if (bucketFilter === "unset") {
        result = result.filter((it) => !it.bucket);
      } else {
        result = result.filter((it) => it.bucket === bucketFilter);
      }
    }

    return sortItems(result, sortKey, sortDir);
  }, [items, search, bucketFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/shortlists">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{shortlist.title}</h1>
            {shortlist.description && (
              <p className="text-sm text-muted-foreground">
                {shortlist.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {items.length} professor{items.length !== 1 ? "s" : ""}
          </Badge>
          <ExportShortlistButton
            shortlistTitle={shortlist.title}
            items={filtered}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search professors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={bucketFilter} onValueChange={(val) => setBucketFilter(val ?? "all")}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Buckets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buckets</SelectItem>
                <SelectItem value="reach">Reach</SelectItem>
                <SelectItem value="target">Target</SelectItem>
                <SelectItem value="safer">Safer</SelectItem>
                <SelectItem value="not_sure">Not Sure</SelectItem>
                <SelectItem value="unset">Unset</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${sortKey}_${sortDir}`}
              onValueChange={(val) => {
                if (!val) return;
                const [k, d] = val.split("_") as [SortKey, SortDir];
                setSortKey(k);
                setSortDir(d);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <ArrowUpDown className="size-3.5" />
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
                <SelectItem value="h_index_desc">H-Index (High)</SelectItem>
                <SelectItem value="h_index_asc">H-Index (Low)</SelectItem>
                <SelectItem value="impact_desc">Impact (High)</SelectItem>
                <SelectItem value="impact_asc">Impact (Low)</SelectItem>
                <SelectItem value="recruiting_desc">
                  Recruiting (High)
                </SelectItem>
                <SelectItem value="recruiting_asc">
                  Recruiting (Low)
                </SelectItem>
                <SelectItem value="institution_asc">
                  Institution A-Z
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Grid View + Table View */}
      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">
            <LayoutGrid className="size-4" />
            Grid View
          </TabsTrigger>
          <TabsTrigger value="table">
            <TableIcon className="size-4" />
            Table View
          </TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid" className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
                No professors match your filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <ProfessorComparisonCard
                  key={item.id}
                  item={item}
                  onUpdateNote={handleUpdateNote}
                  onUpdateBucket={handleUpdateBucket}
                  onUpdateContactStatus={handleUpdateContactStatus}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort("name")}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Name{sortIndicator("name")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort("institution")}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Institution{sortIndicator("institution")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort("h_index")}
                        className="ml-auto flex items-center gap-1 hover:text-foreground"
                      >
                        H-Index{sortIndicator("h_index")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort("impact")}
                        className="ml-auto flex items-center gap-1 hover:text-foreground"
                      >
                        Impact{sortIndicator("impact")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort("recruiting")}
                        className="ml-auto flex items-center gap-1 hover:text-foreground"
                      >
                        Recruiting{sortIndicator("recruiting")}
                      </button>
                    </TableHead>
                    <TableHead>Bucket</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No professors match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((item) => (
                      <TableViewRow
                        key={item.id}
                        item={item}
                        onUpdateBucket={handleUpdateBucket}
                        onUpdateContactStatus={handleUpdateContactStatus}
                        onUpdateNote={handleUpdateNote}
                        onRemove={handleRemove}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
