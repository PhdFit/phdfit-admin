import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // TODO: Replace with real auth check (Supabase Auth / NextAuth session)
  // For now, check for an admin_session cookie as a placeholder
  const session = request.cookies.get("admin_session")?.value;

  if (!session) {
    // In development, allow access without auth
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
