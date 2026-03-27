"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
  ExternalLink,
  CheckCircle2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import type { ProfessorDetail } from "@/lib/data/professors";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProfessorDetailClientProps {
  professor: ProfessorDetail;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RANK_OPTIONS = [
  { value: "assistant", label: "Assistant Professor" },
  { value: "associate", label: "Associate Professor" },
  { value: "full", label: "Full Professor" },
  { value: "lecturer", label: "Lecturer" },
  { value: "emeritus", label: "Emeritus" },
] as const;

const PROFILE_URL_LABELS: Record<string, string> = {
  google_scholar: "Google Scholar",
  orcid: "ORCID",
  semantic_scholar: "Semantic Scholar",
  openalex: "OpenAlex",
};

function rankLabel(rank: string | null): string {
  if (!rank) return "Unknown";
  const found = RANK_OPTIONS.find((r) => r.value === rank);
  return found?.label ?? rank;
}

function scoreCard(label: string, value: number | null) {
  return (
    <div className="flex flex-col items-center rounded-lg border p-3">
      <span className="text-2xl font-bold">
        {value != null ? value.toFixed(2) : "--"}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editable form state
// ---------------------------------------------------------------------------

interface EditableFields {
  full_name: string;
  preferred_name: string;
  title: string;
  academic_rank: string;
  email_public: string;
  faculty_page_url: string;
  lab_page_url: string;
  is_active: boolean;
  external_profile_urls: Record<string, string>;
}

function toEditable(p: ProfessorDetail): EditableFields {
  const urls = p.external_profile_urls ?? {};
  return {
    full_name: p.full_name,
    preferred_name: p.preferred_name ?? "",
    title: p.title ?? "",
    academic_rank: p.academic_rank ?? "",
    email_public: p.email_public ?? "",
    faculty_page_url: p.faculty_page_url ?? "",
    lab_page_url: p.lab_page_url ?? "",
    is_active: p.is_active,
    external_profile_urls: {
      google_scholar: (urls.google_scholar as string) ?? "",
      orcid: (urls.orcid as string) ?? "",
      semantic_scholar: (urls.semantic_scholar as string) ?? "",
      openalex: (urls.openalex as string) ?? "",
    },
  };
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ProfessorDetailClient({
  professor: initialProfessor,
}: ProfessorDetailClientProps) {
  const router = useRouter();
  const [professor, setProfessor] = useState(initialProfessor);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditableFields>(() =>
    toEditable(initialProfessor),
  );
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const startEdit = useCallback(() => {
    setForm(toEditable(professor));
    setEditing(true);
    setSuccessMsg(false);
  }, [professor]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSuccessMsg(false);
    try {
      const body: Record<string, unknown> = {
        full_name: form.full_name,
        preferred_name: form.preferred_name || null,
        title: form.title || null,
        academic_rank: form.academic_rank || null,
        email_public: form.email_public || null,
        faculty_page_url: form.faculty_page_url || null,
        lab_page_url: form.lab_page_url || null,
        is_active: form.is_active,
        external_profile_urls: Object.fromEntries(
          Object.entries(form.external_profile_urls).map(([k, v]) => [
            k,
            v || null,
          ]),
        ),
      };

      const res = await fetch(`/api/admin/professors/${professor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }

      // Update local state
      setProfessor((prev) => ({
        ...prev,
        full_name: form.full_name,
        preferred_name: form.preferred_name || null,
        title: form.title || null,
        academic_rank: form.academic_rank || null,
        email_public: form.email_public || null,
        faculty_page_url: form.faculty_page_url || null,
        lab_page_url: form.lab_page_url || null,
        is_active: form.is_active,
        external_profile_urls: Object.fromEntries(
          Object.entries(form.external_profile_urls).map(([k, v]) => [
            k,
            v || null,
          ]),
        ),
        updated_at: new Date().toISOString(),
      }));

      setEditing(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      router.refresh();
    } catch (err) {
      console.error("Save failed:", err);
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [form, professor.id, router]);

  const updateField = useCallback(
    <K extends keyof EditableFields>(key: K, value: EditableFields[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateProfileUrl = useCallback((key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      external_profile_urls: { ...prev.external_profile_urls, [key]: value },
    }));
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/professors">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to Professors</span>
            </Button>
          </Link>
          <div>
            {editing ? (
              <Input
                value={form.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                className="text-2xl font-bold"
              />
            ) : (
              <h1 className="text-2xl font-bold">{professor.full_name}</h1>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {editing ? (
                <>
                  <Input
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Title"
                    className="w-48"
                  />
                  <Select
                    value={form.academic_rank || "none"}
                    onValueChange={(val) =>
                      updateField(
                        "academic_rank",
                        val === "none" || val == null ? "" : val,
                      )
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Academic Rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Rank</SelectItem>
                      {RANK_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  {professor.title && (
                    <span className="text-sm text-muted-foreground">
                      {professor.title}
                    </span>
                  )}
                  {professor.academic_rank && (
                    <Badge variant="secondary">
                      {rankLabel(professor.academic_rank)}
                    </Badge>
                  )}
                </>
              )}
              {professor.institution_name && (
                <Badge variant="outline">{professor.institution_name}</Badge>
              )}
              {professor.department_name && (
                <Badge variant="outline">{professor.department_name}</Badge>
              )}
              {editing ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(val) => updateField("is_active", val)}
                  />
                </div>
              ) : (
                <Badge
                  variant={professor.is_active ? "default" : "secondary"}
                >
                  {professor.is_active ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {successMsg && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="size-4" />
              Saved
            </span>
          )}
          {editing ? (
            <>
              <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                <X className="size-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="size-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={startEdit}>
              <Pencil className="size-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Contact & Links */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Preferred Name
                </label>
                <Input
                  value={form.preferred_name}
                  onChange={(e) =>
                    updateField("preferred_name", e.target.value)
                  }
                  placeholder="Preferred name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email_public}
                  onChange={(e) => updateField("email_public", e.target.value)}
                  placeholder="Public email"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Faculty Page URL
                </label>
                <Input
                  value={form.faculty_page_url}
                  onChange={(e) =>
                    updateField("faculty_page_url", e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Lab Page URL
                </label>
                <Input
                  value={form.lab_page_url}
                  onChange={(e) => updateField("lab_page_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {professor.preferred_name && (
                <div>
                  <span className="text-xs text-muted-foreground">
                    Preferred Name
                  </span>
                  <p className="text-sm">{professor.preferred_name}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground">Email</span>
                <p className="text-sm">
                  {professor.email_public ? (
                    <a
                      href={`mailto:${professor.email_public}`}
                      className="hover:underline"
                    >
                      {professor.email_public}
                    </a>
                  ) : (
                    "--"
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Faculty Page
                </span>
                <p className="text-sm">
                  {professor.faculty_page_url ? (
                    <a
                      href={professor.faculty_page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      Visit
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    "--"
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Lab Page</span>
                <p className="text-sm">
                  {professor.lab_page_url ? (
                    <a
                      href={professor.lab_page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      Visit
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    "--"
                  )}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* External Profile URLs */}
          <div>
            <h3 className="mb-2 text-sm font-medium">External Profiles</h3>
            {editing ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.entries(PROFILE_URL_LABELS).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-muted-foreground">
                      {label}
                    </label>
                    <Input
                      value={form.external_profile_urls[key] ?? ""}
                      onChange={(e) => updateProfileUrl(key, e.target.value)}
                      placeholder={`${label} URL`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(PROFILE_URL_LABELS).map(([key, label]) => {
                  const url =
                    professor.external_profile_urls?.[key];
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                      >
                        {label}
                        <ExternalLink className="ml-1 size-3" />
                      </Badge>
                    </a>
                  );
                })}
                {!professor.external_profile_urls &&
                  !Object.values(
                    professor.external_profile_urls ?? {},
                  ).some(Boolean) && (
                    <span className="text-sm text-muted-foreground">
                      No external profiles linked
                    </span>
                  )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Research Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Research Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {scoreCard("H-Index", professor.scholar_h_index)}
            {scoreCard("Citations", professor.scholar_citation_count)}
            {scoreCard("Research Impact", professor.research_impact_score)}
            {scoreCard(
              "Recruiting Signal",
              professor.recruiting_signal_score_hex,
            )}
            {scoreCard("Funding Strength", professor.funding_strength_score)}
            {scoreCard(
              "Industry & Open Source",
              professor.industry_opensource_score,
            )}
            {scoreCard("Mentorship Culture", professor.mentorship_culture_score)}
            {scoreCard(
              "Research Activity",
              professor.research_activity_score_hex,
            )}
          </div>

          {professor.scholar_interests &&
            professor.scholar_interests.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium">
                  Scholar Interests
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {professor.scholar_interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Topics */}
      <Card>
        <CardHeader>
          <CardTitle>
            Topics
            <Badge variant="secondary" className="ml-2">
              {professor.topics.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {professor.topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No topics associated.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {professor.topics
                .sort((a, b) => b.weight - a.weight)
                .map((t, i) => (
                  <div
                    key={`${t.name}-${i}`}
                    className="flex items-center gap-1"
                  >
                    <Badge
                      variant={
                        t.topic_type === "domain"
                          ? "default"
                          : t.topic_type === "method"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {t.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t.weight.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signals */}
      <Card>
        <CardHeader>
          <CardTitle>
            Recruiting Signals
            <Badge variant="secondary" className="ml-2">
              {professor.signals.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {professor.signals.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
              No recruiting signals detected.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Snippet</TableHead>
                  <TableHead>Detected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professor.signals.map((s, i) => (
                  <TableRow key={`${s.signal_type}-${i}`}>
                    <TableCell>
                      <Badge variant="outline">{s.signal_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.signal_level === "strong"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {s.signal_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(s.confidence_score * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell>
                      {s.source_url ? (
                        <a
                          href={s.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm hover:underline"
                        >
                          Link
                          <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        "--"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {s.source_text_snippet ?? "--"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(s.detected_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <span className="text-xs text-muted-foreground">Created</span>
              <p className="text-sm">{formatDate(professor.created_at)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Updated</span>
              <p className="text-sm">{formatDate(professor.updated_at)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Enriched</span>
              <p className="text-sm">
                {formatDate(professor.enriched_at)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Source Confidence
              </span>
              <p className="text-sm">
                {professor.source_confidence != null
                  ? `${(professor.source_confidence * 100).toFixed(1)}%`
                  : "--"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
