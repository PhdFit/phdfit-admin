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
import type { CandidateEducationEntry } from "@/types/candidate";

interface EducationFormProps {
  profileId: string;
  entry?: CandidateEducationEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EducationForm({
  profileId,
  entry,
  open,
  onOpenChange,
  onSaved,
}: EducationFormProps) {
  const isEdit = !!entry;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [institutionName, setInstitutionName] = useState(
    entry?.institution_name ?? "",
  );
  const [degree, setDegree] = useState(entry?.degree ?? "");
  const [fieldOfStudy, setFieldOfStudy] = useState(
    entry?.field_of_study ?? "",
  );
  const [startYear, setStartYear] = useState(
    entry?.start_year?.toString() ?? "",
  );
  const [endYear, setEndYear] = useState(entry?.end_year?.toString() ?? "");
  const [gpa, setGpa] = useState(entry?.gpa ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      ...(isEdit ? { id: entry.id } : { profileId }),
      institution_name: institutionName || null,
      degree: degree || null,
      field_of_study: fieldOfStudy || null,
      start_year: startYear ? parseInt(startYear) : null,
      end_year: endYear ? parseInt(endYear) : null,
      gpa: gpa || null,
      display_order: entry?.display_order ?? 0,
    };

    try {
      const res = await fetch("/api/candidate/education", {
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
            {isEdit ? "Edit Education" : "Add Education"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Institution</label>
            <Input
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g., MIT"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Degree</label>
              <Input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g., BS, MS, PhD"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Field of Study</label>
              <Input
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Year</label>
              <Input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="2020"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Year</label>
              <Input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GPA</label>
              <Input
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="3.9/4.0"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Education"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
