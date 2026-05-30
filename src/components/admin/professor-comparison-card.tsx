"use client";

import { useState } from "react";
import { Trash2, Mail, Building2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  HexagonRadarChart,
  type HexagonScores,
} from "@/components/admin/hexagon-radar-chart";
import type {
  ShortlistProfessorDetail,
  ShortlistBucket,
  ContactStatus,
} from "@/types/shortlist";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BUCKET_STYLES: Record<
  ShortlistBucket | "none",
  { label: string; className: string }
> = {
  reach: {
    label: "Reach",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  target: {
    label: "Target",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  safer: {
    label: "Safer",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  not_sure: {
    label: "Not Sure",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  none: {
    label: "Unset",
    className:
      "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
};

const CONTACT_STYLES: Record<ContactStatus, { label: string; className: string }> =
  {
    not_contacted: {
      label: "Not Contacted",
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    drafted: {
      label: "Drafted",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    },
    sent: {
      label: "Sent",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    replied: {
      label: "Replied",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
  };

function extractHexagonScores(item: ShortlistProfessorDetail): HexagonScores {
  return {
    research_impact: item.research_impact_score ?? 0,
    research_activity: item.research_activity_score_hex ?? 0,
    funding_strength: item.funding_strength_score ?? 0,
    recruiting_signal: item.recruiting_signal_score_hex ?? 0,
    industry_opensource: item.industry_opensource_score ?? 0,
    mentorship_culture: item.mentorship_culture_score ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProfessorComparisonCardProps {
  item: ShortlistProfessorDetail;
  onUpdateNote?: (itemId: string, note: string) => void;
  onUpdateBucket?: (itemId: string, bucket: ShortlistBucket | null) => void;
  onUpdateContactStatus?: (itemId: string, status: ContactStatus) => void;
  onRemove?: (itemId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProfessorComparisonCard({
  item,
  onUpdateNote,
  onUpdateBucket,
  onUpdateContactStatus,
  onRemove,
}: ProfessorComparisonCardProps) {
  const [note, setNote] = useState(item.user_note ?? "");
  const [isEditingNote, setIsEditingNote] = useState(false);

  const bucketStyle = BUCKET_STYLES[item.bucket ?? "none"];
  const contactStyle = CONTACT_STYLES[item.contact_status];
  const scores = extractHexagonScores(item);

  const handleNoteSave = () => {
    onUpdateNote?.(item.id, note);
    setIsEditingNote(false);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base truncate">
              {item.professor_name}
            </CardTitle>
            <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
              {item.institution_name && (
                <span className="flex items-center gap-1">
                  <Building2 className="size-3 shrink-0" />
                  {item.institution_name}
                </span>
              )}
              {item.department_name && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="size-3 shrink-0" />
                  {item.department_name}
                </span>
              )}
              {item.professor_email && (
                <span className="flex items-center gap-1">
                  <Mail className="size-3 shrink-0" />
                  {item.professor_email}
                </span>
              )}
            </div>
          </div>

          {/* Remove button with confirmation dialog */}
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="shrink-0" />
              }
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
              <span className="sr-only">Remove</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Professor</DialogTitle>
                <DialogDescription>
                  Remove {item.professor_name} from this shortlist? This cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => onRemove?.(item.id)}
                >
                  Remove
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Badges */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline" className={bucketStyle.className}>
            {bucketStyle.label}
          </Badge>
          <Badge variant="outline" className={contactStyle.className}>
            {contactStyle.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {/* Radar chart */}
        <HexagonRadarChart
          scores={scores}
          className="mx-auto aspect-square w-full max-w-[220px]"
        />

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">H-Index</span>
            <span className="font-medium">
              {item.scholar_h_index ?? "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Citations</span>
            <span className="font-medium">
              {item.scholar_citation_count?.toLocaleString() ?? "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Impact</span>
            <span className="font-medium">
              {item.research_impact_score ?? "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recruiting</span>
            <span className="font-medium">
              {item.recruiting_signal_score_hex ?? "-"}
            </span>
          </div>
        </div>

        {/* Inline bucket + contact status editors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Bucket
            </label>
            <Select
              value={item.bucket ?? "none"}
              onValueChange={(val) => {
                if (val == null) return;
                const newBucket = val === "none" ? null : (val as ShortlistBucket);
                onUpdateBucket?.(item.id, newBucket);
              }}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unset</SelectItem>
                <SelectItem value="reach">Reach</SelectItem>
                <SelectItem value="target">Target</SelectItem>
                <SelectItem value="safer">Safer</SelectItem>
                <SelectItem value="not_sure">Not Sure</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Contact
            </label>
            <Select
              value={item.contact_status}
              onValueChange={(val) => {
                if (val == null) return;
                onUpdateContactStatus?.(item.id, val as ContactStatus);
              }}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_contacted">Not Contacted</SelectItem>
                <SelectItem value="drafted">Drafted</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Editable note */}
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Note
          </label>
          {isEditingNote ? (
            <div className="space-y-1.5">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="text-xs"
              />
              <div className="flex gap-1.5">
                <Button size="sm" onClick={handleNoteSave}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNote(item.user_note ?? "");
                    setIsEditingNote(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingNote(true)}
              className="w-full rounded-md border border-dashed border-border p-2 text-left text-xs text-muted-foreground hover:border-foreground/30 hover:bg-muted/50 transition-colors"
            >
              {item.user_note || "Click to add a note..."}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { BUCKET_STYLES, CONTACT_STYLES, extractHexagonScores };
