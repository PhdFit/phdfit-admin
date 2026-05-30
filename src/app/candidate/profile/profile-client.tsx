"use client";

import { useCallback, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GraduationCap,
  Briefcase,
  BookOpen,
  Wrench,
  Settings,
  LayoutDashboard,
  X,
} from "lucide-react";
import type {
  CandidateProfileFull,
  CandidateEducationEntry,
  CandidateExperience,
  CandidatePublication,
  CandidateSkill,
} from "@/types/candidate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ResumeUpload } from "@/components/candidate/resume-upload";
import { ProfileCompleteness } from "@/components/candidate/profile-completeness";
import { EducationForm } from "@/components/candidate/education-form";
import { ExperienceForm } from "@/components/candidate/experience-form";
import { PublicationForm } from "@/components/candidate/publication-form";
import { SkillForm } from "@/components/candidate/skill-form";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProfileClientProps {
  initialProfile: CandidateProfileFull | null;
  userId: string;
  dbConnected: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const THEORY_LEVELS = [
  { value: "1", label: "1 - Pure Theory" },
  { value: "2", label: "2 - Mostly Theory" },
  { value: "3", label: "3 - Balanced" },
  { value: "4", label: "4 - Mostly Applied" },
  { value: "5", label: "5 - Pure Applied" },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProfileClient({
  initialProfile,
  userId,
  dbConnected,
}: ProfileClientProps) {
  const [profile, setProfile] = useState<CandidateProfileFull | null>(
    initialProfile,
  );
  const [creating, setCreating] = useState(false);

  // Dialog states
  const [eduDialogOpen, setEduDialogOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<CandidateEducationEntry | null>(
    null,
  );
  const [expDialogOpen, setExpDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<CandidateExperience | null>(
    null,
  );
  const [pubDialogOpen, setPubDialogOpen] = useState(false);
  const [editingPub, setEditingPub] = useState<CandidatePublication | null>(
    null,
  );
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);

  // Preference save states
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  // Research interest states
  const [savingResearch, setSavingResearch] = useState(false);

  // Refresh profile data from server
  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/candidate/profile?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      }
    } catch {
      // silently fail — data may just be stale
    }
  }, [userId]);

  // Create profile if none exists
  const handleCreateProfile = useCallback(async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/candidate/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        await refreshProfile();
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }, [userId, refreshProfile]);

  // Delete sub-entity helpers
  const handleDeleteEducation = useCallback(
    async (id: string) => {
      await fetch(`/api/candidate/education?id=${id}`, { method: "DELETE" });
      await refreshProfile();
    },
    [refreshProfile],
  );

  const handleDeleteExperience = useCallback(
    async (id: string) => {
      await fetch(`/api/candidate/experiences?id=${id}`, { method: "DELETE" });
      await refreshProfile();
    },
    [refreshProfile],
  );

  const handleDeletePublication = useCallback(
    async (id: string) => {
      await fetch(`/api/candidate/publications?id=${id}`, {
        method: "DELETE",
      });
      await refreshProfile();
    },
    [refreshProfile],
  );

  const handleDeleteSkill = useCallback(
    async (id: string) => {
      await fetch(`/api/candidate/skills?id=${id}`, { method: "DELETE" });
      await refreshProfile();
    },
    [refreshProfile],
  );

  // Save research interests
  const handleSaveResearch = useCallback(
    async (text: string) => {
      setSavingResearch(true);
      try {
        await fetch("/api/candidate/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            research_interest_text: text,
          }),
        });
        await refreshProfile();
      } catch {
        // ignore
      } finally {
        setSavingResearch(false);
      }
    },
    [userId, refreshProfile],
  );

  // Save preferences
  const handleSavePreferences = useCallback(
    async (prefs: {
      target_countries: string[];
      target_disciplines: string[];
      prefers_theory_level: number | null;
      prefers_interdisciplinary: boolean;
      require_funding_signal: boolean;
    }) => {
      setSavingPrefs(true);
      setPrefsError(null);
      try {
        const res = await fetch("/api/candidate/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ...prefs }),
        });
        if (!res.ok) {
          throw new Error("Failed to save preferences");
        }
        await refreshProfile();
      } catch (err) {
        setPrefsError(
          err instanceof Error ? err.message : "Failed to save",
        );
      } finally {
        setSavingPrefs(false);
      }
    },
    [userId, refreshProfile],
  );

  // ---- No profile yet ----
  if (!profile) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          {!dbConnected ? (
            <p className="text-sm text-muted-foreground">
              Connect to Supabase to manage your candidate profile.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have a candidate profile yet.
              </p>
              <Button onClick={handleCreateProfile} disabled={creating}>
                {creating && <Loader2 className="size-4 animate-spin" />}
                Create Profile
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // ---- Profile exists ----
  return (
    <>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <LayoutDashboard className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="education">
            <GraduationCap className="size-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="experience">
            <Briefcase className="size-4" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="publications">
            <BookOpen className="size-4" />
            Publications
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Wrench className="size-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="size-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* ============ Overview Tab ============ */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <ResumeUpload
              profileId={profile.id}
              currentUrl={profile.resume_file_url}
              onUploaded={() => refreshProfile()}
              onParsed={() => refreshProfile()}
            />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Completeness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileCompleteness profile={profile} />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Research Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResearchInterestsEditor
                  text={profile.research_interest_text ?? ""}
                  saving={savingResearch}
                  onSave={handleSaveResearch}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============ Education Tab ============ */}
        <TabsContent value="education">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">
                Education
              </CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setEditingEdu(null);
                  setEduDialogOpen(true);
                }}
              >
                <Plus className="size-4" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              {profile.education.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No education entries yet. Click &quot;Add&quot; to get
                  started.
                </p>
              ) : (
                <div className="space-y-3">
                  {profile.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="flex items-start justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {edu.degree}
                          {edu.field_of_study
                            ? ` in ${edu.field_of_study}`
                            : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {edu.institution_name}
                          {edu.start_year || edu.end_year
                            ? ` (${edu.start_year ?? "?"} - ${edu.end_year ?? "present"})`
                            : ""}
                        </p>
                        {edu.gpa && (
                          <p className="text-xs text-muted-foreground">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditingEdu(edu);
                            setEduDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteEducation(edu.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <EducationForm
            profileId={profile.id}
            entry={editingEdu}
            open={eduDialogOpen}
            onOpenChange={setEduDialogOpen}
            onSaved={refreshProfile}
          />
        </TabsContent>

        {/* ============ Experience Tab ============ */}
        <TabsContent value="experience">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">
                Experience
              </CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setEditingExp(null);
                  setExpDialogOpen(true);
                }}
              >
                <Plus className="size-4" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              {profile.experiences.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No experience entries yet. Click &quot;Add&quot; to get
                  started.
                </p>
              ) : (
                <div className="space-y-3">
                  {profile.experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-start justify-between rounded-md border p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{exp.title}</p>
                          {exp.experience_type && (
                            <Badge variant="secondary">
                              {exp.experience_type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {exp.organization}
                          {exp.start_date || exp.end_date
                            ? ` (${exp.start_date ?? "?"} - ${exp.end_date ?? "present"})`
                            : ""}
                        </p>
                        {exp.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditingExp(exp);
                            setExpDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteExperience(exp.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <ExperienceForm
            profileId={profile.id}
            entry={editingExp}
            open={expDialogOpen}
            onOpenChange={setExpDialogOpen}
            onSaved={refreshProfile}
          />
        </TabsContent>

        {/* ============ Publications Tab ============ */}
        <TabsContent value="publications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">
                Publications
              </CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setEditingPub(null);
                  setPubDialogOpen(true);
                }}
              >
                <Plus className="size-4" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              {profile.publications.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No publications yet. Click &quot;Add&quot; to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {profile.publications.map((pub) => (
                    <div
                      key={pub.id}
                      className="flex items-start justify-between rounded-md border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{pub.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {[
                            pub.venue,
                            pub.publication_year?.toString(),
                          ]
                            .filter(Boolean)
                            .join(", ") || "No venue/year"}
                        </p>
                        {pub.authors.length > 0 && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {pub.authors.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditingPub(pub);
                            setPubDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeletePublication(pub.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <PublicationForm
            profileId={profile.id}
            entry={editingPub}
            open={pubDialogOpen}
            onOpenChange={setPubDialogOpen}
            onSaved={refreshProfile}
          />
        </TabsContent>

        {/* ============ Skills Tab ============ */}
        <TabsContent value="skills">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <Button
                size="sm"
                onClick={() => setSkillDialogOpen(true)}
              >
                <Plus className="size-4" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              {profile.skills.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No skills yet. Click &quot;Add&quot; to get started.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <SkillTag
                      key={skill.id}
                      skill={skill}
                      onRemove={() => handleDeleteSkill(skill.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <SkillForm
            profileId={profile.id}
            open={skillDialogOpen}
            onOpenChange={setSkillDialogOpen}
            onSaved={refreshProfile}
          />
        </TabsContent>

        {/* ============ Preferences Tab ============ */}
        <TabsContent value="preferences">
          <PreferencesEditor
            profile={profile}
            saving={savingPrefs}
            error={prefsError}
            onSave={handleSavePreferences}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkillTag({
  skill,
  onRemove,
}: {
  skill: CandidateSkill;
  onRemove: () => void;
}) {
  const typeColors: Record<string, string> = {
    language: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    framework:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    method:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    domain:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    tool: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  const colorClass =
    typeColors[skill.skill_type ?? ""] ?? typeColors.tool;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${colorClass}`}
    >
      {skill.skill_name}
      {skill.skill_type && (
        <span className="opacity-60">({skill.skill_type})</span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

function ResearchInterestsEditor({
  text,
  saving,
  onSave,
}: {
  text: string;
  saving: boolean;
  onSave: (text: string) => void;
}) {
  const [value, setValue] = useState(text);
  const dirty = value !== text;

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Describe your research interests, areas of focus, and what kind of PhD advisor you are looking for..."
        rows={5}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={!dirty || saving}
          onClick={() => onSave(value)}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}

function PreferencesEditor({
  profile,
  saving,
  error,
  onSave,
}: {
  profile: CandidateProfileFull;
  saving: boolean;
  error: string | null;
  onSave: (prefs: {
    target_countries: string[];
    target_disciplines: string[];
    prefers_theory_level: number | null;
    prefers_interdisciplinary: boolean;
    require_funding_signal: boolean;
  }) => void;
}) {
  const [countries, setCountries] = useState(
    profile.target_countries.join(", "),
  );
  const [disciplines, setDisciplines] = useState(
    profile.target_disciplines.join(", "),
  );
  const [theoryLevel, setTheoryLevel] = useState(
    profile.prefers_theory_level?.toString() ?? "",
  );
  const [interdisciplinary, setInterdisciplinary] = useState(
    profile.prefers_interdisciplinary,
  );
  const [fundingSignal, setFundingSignal] = useState(
    profile.require_funding_signal,
  );

  const handleSave = () => {
    onSave({
      target_countries: countries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      target_disciplines: disciplines
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      prefers_theory_level: theoryLevel ? parseInt(theoryLevel) : null,
      prefers_interdisciplinary: interdisciplinary,
      require_funding_signal: fundingSignal,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Search Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Countries</label>
          <Input
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            placeholder="e.g., USA, UK, Canada"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of countries
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Target Disciplines
          </label>
          <Input
            value={disciplines}
            onChange={(e) => setDisciplines(e.target.value)}
            placeholder="e.g., Computer Science, Statistics"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of disciplines
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Theory / Applied Preference
          </label>
          <Select value={theoryLevel} onValueChange={(v) => setTheoryLevel(v ?? "")}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              {THEORY_LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={interdisciplinary}
              onChange={(e) => setInterdisciplinary(e.target.checked)}
              className="rounded border-input"
            />
            Prefers interdisciplinary research
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={fundingSignal}
              onChange={(e) => setFundingSignal(e.target.checked)}
              className="rounded border-input"
            />
            Require funding signal
          </label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end">
          <Button disabled={saving} onClick={handleSave}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
