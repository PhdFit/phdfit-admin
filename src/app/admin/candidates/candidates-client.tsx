"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { CandidateProfileFull } from "@/types/candidate";
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
import { PageSizeSelector } from "@/components/admin/page-size-selector";

export interface CandidatesTableProps {
  candidates: CandidateProfileFull[];
}

export function CandidatesTable({ candidates }: CandidatesTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return candidates;
    return candidates.filter((c) => {
      const name = c.user_full_name?.toLowerCase() ?? "";
      const email = c.user_email?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q);
    });
  }, [candidates, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <>
      {/* Search */}
      <Card>
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead className="text-right">Skills</TableHead>
                <TableHead className="text-right">Publications</TableHead>
                <TableHead>Embedding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No candidates found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.user_full_name ?? "Unknown"}
                    </TableCell>
                    <TableCell>{c.user_email ?? "--"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.resume_file_url ? "default" : "secondary"
                        }
                      >
                        {c.resume_file_url ? "Uploaded" : "None"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.skills.length}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.publications.length}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.candidate_embedding != null
                            ? "default"
                            : "secondary"
                        }
                      >
                        {c.candidate_embedding != null ? "Yes" : "No"}
                      </Badge>
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
