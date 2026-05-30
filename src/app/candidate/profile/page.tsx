import { isSupabaseConnected } from "@/lib/supabase";
import { getCandidateProfileByUserId } from "@/lib/data/candidates";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import { ProfileClient } from "./profile-client";
import type { CandidateProfileFull } from "@/types/candidate";

// In production this would come from the auth session; for now accept a query param
// or use a hard-coded dev user ID.
async function getCurrentUserId(): Promise<string> {
  // TODO: Replace with real auth session lookup
  return process.env.DEV_CANDIDATE_USER_ID ?? "00000000-0000-0000-0000-000000000001";
}

export default async function CandidateProfilePage() {
  const connected = isSupabaseConnected();
  const userId = await getCurrentUserId();

  let profile: CandidateProfileFull | null = null;

  if (connected) {
    profile = await getCandidateProfileByUserId(userId);
  }

  return (
    <div className="space-y-6">
      {!connected && <NoDbBanner />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Profile</h1>
      </div>

      <ProfileClient
        initialProfile={profile}
        userId={userId}
        dbConnected={connected}
      />
    </div>
  );
}
