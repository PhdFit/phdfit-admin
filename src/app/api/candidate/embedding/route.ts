import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PHDFIT_API_URL = process.env.PHDFIT_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not connected" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { profileId } = body;

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 },
      );
    }

    // Proxy to FastAPI embedding endpoint
    const response = await fetch(
      `${PHDFIT_API_URL}/candidate/embedding`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.PHDFIT_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile_id: profileId }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI embedding error:", errorText);
      return NextResponse.json(
        { error: "Embedding generation failed" },
        { status: 502 },
      );
    }

    const result = await response.json();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Embedding route error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }
}
