import { NextRequest, NextResponse } from "next/server";
import {
  createPublication,
  updatePublication,
  deletePublication,
} from "@/lib/data/candidates";

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

    const entry = await createPublication(profileId, data);
    if (!entry) {
      return NextResponse.json(
        { error: "Failed to create publication" },
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 },
      );
    }

    const entry = await updatePublication(id, data);
    if (!entry) {
      return NextResponse.json(
        { error: "Failed to update publication" },
        { status: 500 },
      );
    }
    return NextResponse.json({ entry });
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

  const success = await deletePublication(id);
  if (!success) {
    return NextResponse.json(
      { error: "Failed to delete publication" },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
