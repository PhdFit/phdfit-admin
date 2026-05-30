import { NextRequest, NextResponse } from "next/server";
import { createSkill, deleteSkill } from "@/lib/data/candidates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, ...data } = body;
    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 },
      );
    }

    const entry = await createSkill(profileId, data);
    if (!entry) {
      return NextResponse.json(
        { error: "Failed to create skill" },
        { status: 500 },
      );
    }
    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const success = await deleteSkill(id);
  if (!success) {
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
