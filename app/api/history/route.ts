import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    responseHeaders.forEach((v, k) => res.headers.set(k, v));
    return res;
  }

  // Parse query parameters for pagination and filtering
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const filter = searchParams.get("filter") || "all"; // all, premium, basic
  const search = searchParams.get("search") || "";

  // Calculate offset
  const offset = (page - 1) * limit;

  // Build base query
  let query = supabase
    .from("analysis_history")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  // Apply filter
  if (filter === "premium") {
    query = query.eq("is_premium", true);
  } else if (filter === "basic") {
    query = query.eq("is_premium", false);
  }

  // Apply search (video title or URL)
  if (search) {
    query = query.or(`video_title.ilike.%${search}%,video_url.ilike.%${search}%`);
  }

  // Apply ordering and pagination
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: history, error, count } = await query;

  if (error) {
    const res = NextResponse.json({ error: error.message }, { status: 500 });
    responseHeaders.forEach((v, k) => res.headers.set(k, v));
    return res;
  }

  // Calculate pagination metadata
  const totalPages = count ? Math.ceil(count / limit) : 0;

  const res = NextResponse.json({
    history: history ?? [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    filters: {
      applied: filter,
      search: search || null,
    },
  });

  responseHeaders.forEach((v, k) => res.headers.set(k, v));
  return res;
}
