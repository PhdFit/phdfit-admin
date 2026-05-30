import { NextRequest, NextResponse } from "next/server";
import { bulkInsertFromResumeParse } from "@/lib/data/candidates";
import { supabase } from "@/lib/supabase";
import type { ResumeParseResult } from "@/types/candidate";

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
    const { profileId, resumeUrl } = body;

    if (!profileId || !resumeUrl) {
      return NextResponse.json(
        { error: "profileId and resumeUrl are required" },
        { status: 400 },
      );
    }

    // Proxy to FastAPI resume parser
    const response = await fetch(`${PHDFIT_API_URL}/resume/parse`, {
      method: "POST",
      headers: {
        "x-api-key": process.env.PHDFIT_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_url: resumeUrl,
        professor_name: "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI parse error:", errorText);
      return NextResponse.json(
        { error: "Resume parsing failed" },
        { status: 502 },
      );
    }

    const parseResult: ResumeParseResult = await response.json();

    // Store parsed text on the profile
    await supabase
      .from("candidate_profiles")
      .update({
        parsed_resume_text: JSON.stringify(parseResult),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    // Clear existing sub-entities before bulk insert (idempotent re-parse)
    await Promise.all([
      supabase
        .from("candidate_education_entries")
        .delete()
        .eq("candidate_profile_id", profileId),
      supabase
        .from("candidate_experiences")
        .delete()
        .eq("candidate_profile_id", profileId),
      supabase
        .from("candidate_publications")
        .delete()
        .eq("candidate_profile_id", profileId),
      supabase
        .from("candidate_skills")
        .delete()
        .eq("candidate_profile_id", profileId),
    ]);

    // Bulk insert parsed data
    const success = await bulkInsertFromResumeParse(profileId, parseResult);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to save parsed data" },
        { status: 500 },
      );
    }

    return NextResponse.json({ parseResult, success: true });
  } catch (err) {
    console.error("Parse route error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }
}
