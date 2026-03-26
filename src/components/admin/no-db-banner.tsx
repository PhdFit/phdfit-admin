import { AlertTriangle } from "lucide-react";

export function NoDbBanner() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
      <AlertTriangle className="size-4 shrink-0" />
      <span>
        Supabase not connected. Showing mock data. Set{" "}
        <code className="rounded bg-yellow-100 px-1 dark:bg-yellow-900">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        and{" "}
        <code className="rounded bg-yellow-100 px-1 dark:bg-yellow-900">
          SUPABASE_SERVICE_ROLE_KEY
        </code>{" "}
        in <code className="rounded bg-yellow-100 px-1 dark:bg-yellow-900">.env.local</code> to
        connect.
      </span>
    </div>
  );
}
