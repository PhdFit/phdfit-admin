"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CandidatePublication } from "@/types/candidate";

interface PublicationFormProps {
  profileId: string;
  entry?: CandidatePublication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function PublicationForm({
  profileId,
  entry,
  open,
  onOpenChange,
  onSaved,
}: PublicationFormProps) {
  const isEdit = !!entry;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(entry?.title ?? "");
  const [venue, setVenue] = useState(entry?.venue ?? "");
  const [publicationYear, setPublicationYear] = useState(
    entry?.publication_year?.toString() ?? "",
  );
  const [url, setUrl] = useState(entry?.url ?? "");
  const [authorsText, setAuthorsText] = useState(
    entry?.authors?.join(", ") ?? "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    const authors = authorsText
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const body = {
      ...(isEdit ? { id: entry.id } : { profileId }),
      title: title.trim(),
      venue: venue || null,
      publication_year: publicationYear
        ? parseInt(publicationYear)
        : null,
      url: url || null,
      authors,
    };

    try {
      const res = await fetch("/api/candidate/publications", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Publication" : "Add Publication"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paper title"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue</label>
              <Input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g., NeurIPS 2024"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(e.target.value)}
                placeholder="2024"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Authors</label>
            <Input
              value={authorsText}
              onChange={(e) => setAuthorsText(e.target.value)}
              placeholder="Author 1, Author 2, ..."
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of author names
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://arxiv.org/abs/..."
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Publication"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
