import { Separator } from "@/components/ui/separator";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-6">
        <span className="text-lg font-bold tracking-tight">PhdFit</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-muted-foreground">
          Candidate Profile
        </span>
      </header>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
