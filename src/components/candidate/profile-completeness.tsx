"use client";

import type { CandidateProfileFull } from "@/types/candidate";

function computeCompleteness(profile: CandidateProfileFull): {
  percentage: number;
  items: { label: string; done: boolean }[];
} {
  const items = [
    { label: "Resume uploaded", done: !!profile.resume_file_url },
    { label: "Research interests", done: !!profile.research_interest_text },
    { label: "Education entries", done: profile.education.length > 0 },
    { label: "Experience entries", done: profile.experiences.length > 0 },
    { label: "Skills added", done: profile.skills.length > 0 },
    { label: "Target countries set", done: profile.target_countries.length > 0 },
    {
      label: "Theory/applied preference",
      done: profile.prefers_theory_level != null,
    },
    { label: "Embedding generated", done: profile.candidate_embedding != null },
  ];
  const done = items.filter((i) => i.done).length;
  const percentage = Math.round((done / items.length) * 100);
  return { percentage, items };
}

function completenessColor(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function ProfileCompleteness({
  profile,
}: {
  profile: CandidateProfileFull;
}) {
  const { percentage, items } = computeCompleteness(profile);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Profile Completeness</span>
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={`h-2 rounded-full transition-all ${completenessColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            <span
              className={`inline-block size-2 rounded-full ${item.done ? "bg-green-500" : "bg-muted-foreground/30"}`}
            />
            <span
              className={
                item.done ? "text-foreground" : "text-muted-foreground"
              }
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
