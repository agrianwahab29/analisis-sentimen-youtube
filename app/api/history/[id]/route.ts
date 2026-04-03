import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import type { AnalysisResult } from "@/lib/types/analysis-result";

/**
 * GET /api/history/[id] — one saved analysis row for the current user.
 * Requires `analysis_history.result_snapshot` (run migration after deploy).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: responseHeaders }
    );
  }

  const { id } = await params;

  const { data: row, error } = await supabase
    .from("analysis_history")
    .select(
      "id, created_at, video_url, video_title, video_id, total_comments, positive_count, negative_count, neutral_count, credits_used, is_premium, result_snapshot"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to load history", details: error.message },
      { status: 500, headers: responseHeaders }
    );
  }

  if (!row) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: responseHeaders }
    );
  }

  const snapshot = row.result_snapshot as AnalysisResult | null;

  if (!snapshot || typeof snapshot !== "object") {
    return NextResponse.json(
      {
        success: true,
        partial: true,
        created_at: row.created_at,
        video_url: row.video_url,
        video_title: row.video_title,
        video_id: row.video_id,
        total_comments: row.total_comments,
        positive_count: row.positive_count,
        negative_count: row.negative_count,
        neutral_count: row.neutral_count,
        credits_used: row.credits_used,
        is_premium: row.is_premium,
        message:
          "Detail penuh belum tersimpan untuk entri ini. Jalankan migrasi `analysis_history_result_snapshot.sql` di Supabase, lalu lakukan analisis baru.",
      },
      { headers: responseHeaders }
    );
  }

  return NextResponse.json(
    {
      success: true,
      fromHistory: true,
      created_at: row.created_at,
      video_url: row.video_url,
      is_premium: row.is_premium,
      ...snapshot,
    },
    { headers: responseHeaders }
  );
}
