import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isSupabaseConnected } from "@/lib/supabase";
import { getProfessorById } from "@/lib/data/professors";
import type { ProfessorDetail } from "@/lib/data/professors";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import { Button } from "@/components/ui/button";
import { ProfessorDetailClient } from "./professor-detail-client";

export default async function ProfessorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const connected = isSupabaseConnected();

  let professor: ProfessorDetail | null = null;

  if (connected) {
    professor = await getProfessorById(id);
  }

  if (!professor) {
    return (
      <div className="space-y-6">
        {!connected && <NoDbBanner />}
        <div className="flex items-center gap-3">
          <Link href="/admin/professors">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Professor not found</h1>
        </div>
        <p className="text-muted-foreground">
          The professor you are looking for does not exist or could not be
          loaded.{" "}
          <Link href="/admin/professors" className="underline">
            Back to Professors
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!connected && <NoDbBanner />}
      <ProfessorDetailClient professor={professor} />
    </div>
  );
}
