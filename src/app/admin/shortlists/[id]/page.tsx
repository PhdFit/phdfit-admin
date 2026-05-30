import { isSupabaseConnected } from "@/lib/supabase";
import { getShortlistById } from "@/lib/data/shortlists";
import {
  mockShortlists,
  mockShortlistItems,
} from "@/lib/mock-data/shortlists";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import ShortlistDetailClient from "./shortlist-detail-client";
import type { Shortlist, ShortlistProfessorDetail } from "@/types/shortlist";

// ---------------------------------------------------------------------------
// Server Component
// ---------------------------------------------------------------------------

export default async function ShortlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const connected = isSupabaseConnected();

  let shortlist: Shortlist | null = null;
  let items: ShortlistProfessorDetail[] = [];

  if (connected) {
    const result = await getShortlistById(id);
    if (result) {
      shortlist = result.shortlist;
      items = result.items;
    }
  }

  // Fall back to mock data
  if (!shortlist) {
    const mockSl = mockShortlists.find((s) => s.id === id);
    if (mockSl) {
      shortlist = mockSl;
      items = mockShortlistItems[id] ?? [];
    }
  }

  if (!shortlist) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Shortlist not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!connected && <NoDbBanner />}
      <ShortlistDetailClient shortlist={shortlist} items={items} />
    </div>
  );
}
