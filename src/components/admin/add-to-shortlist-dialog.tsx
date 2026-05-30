"use client";

import { type ReactNode, useState, useEffect } from "react";
import { Plus, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Shortlist, ShortlistBucket } from "@/types/shortlist";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AddToShortlistDialogProps {
  professorId: string;
  professorName: string;
  trigger?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddToShortlistDialog({
  professorId,
  professorName,
  trigger,
}: AddToShortlistDialogProps) {
  const [open, setOpen] = useState(false);
  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedShortlistId, setSelectedShortlistId] = useState<string>("");
  const [bucket, setBucket] = useState<ShortlistBucket | "none">("none");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch shortlists when dialog opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSelectedShortlistId("");
    setBucket("none");
    setNote("");

    fetch("/api/shortlists")
      .then((res) => res.json())
      .then((data: Shortlist[]) => {
        setShortlists(data);
        // Pre-select the first shortlist if available
        if (data.length > 0) {
          setSelectedShortlistId(data[0].id);
        }
      })
      .catch(() => setError("Failed to load shortlists"))
      .finally(() => setLoading(false));
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedShortlistId) {
      setError("Please select a shortlist");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/shortlists/${selectedShortlistId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            professor_id: professorId,
            bucket: bucket === "none" ? null : bucket,
            user_note: note || null,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to add professor");
        return;
      }

      setSuccess(true);
      setTimeout(() => setOpen(false), 800);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            <span />
          ) : (
            <Button variant="outline" size="sm" />
          )
        }
      >
        {trigger ?? (
          <>
            <ListPlus className="size-4" />
            Add to Shortlist
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Shortlist</DialogTitle>
          <DialogDescription>
            Add {professorName} to one of your shortlists.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading shortlists...
            </p>
          )}

          {!loading && shortlists.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No shortlists found. Create one first.
            </p>
          )}

          {!loading && shortlists.length > 0 && (
            <>
              {/* Shortlist selector */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Shortlist
                </label>
                <Select
                  value={selectedShortlistId}
                  onValueChange={(val) => setSelectedShortlistId(val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a shortlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {shortlists.map((sl) => (
                      <SelectItem key={sl.id} value={sl.id}>
                        {sl.title} ({sl.professor_count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bucket selector */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Bucket (optional)
                </label>
                <Select value={bucket} onValueChange={(v) => setBucket((v ?? "none") as ShortlistBucket | "none")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No bucket</SelectItem>
                    <SelectItem value="reach">Reach</SelectItem>
                    <SelectItem value="target">Target</SelectItem>
                    <SelectItem value="safer">Safer</SelectItem>
                    <SelectItem value="not_sure">Not Sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Note (optional)
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this professor..."
                  rows={2}
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Added successfully!
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              loading ||
              shortlists.length === 0 ||
              !selectedShortlistId ||
              success
            }
          >
            <Plus className="size-4" />
            {submitting ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
