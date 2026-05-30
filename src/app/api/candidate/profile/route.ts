import { NextRequest, NextResponse } from "next/server";
import {
  getCandidateProfileByUserId,
  upsertCandidateProfile,
} from "@/lib/data/candidates";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const profile = await getCandidateProfileByUserId(userId);
  if (!profile) {
    return NextResponse.json({ profile: null });
  }
  return NextResponse.json({ profile });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const profile = await upsertCandidateProfile(userId, data);
    if (!profile) {
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 },
      );
    }
    return NextResponse.json({ profile }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const profile = await upsertCandidateProfile(userId, data);
    if (!profile) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
