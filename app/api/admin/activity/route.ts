import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

const ACTION_MAP: Record<string, {
  type: "user" | "transaction";
  action: "approve" | "suspend" | "add_credits" | "approve_payment" | "reject_payment";
  title: string;
  icon: string;
  color: string;
}> = {
  approve_transaction: {
    type: "transaction",
    action: "approve_payment",
    title: "Transaksi Disetujui",
    icon: "CheckCircle",
    color: "bg-emerald-100 text-emerald-600",
  },
  reject_transaction: {
    type: "transaction",
    action: "reject_payment",
    title: "Transaksi Ditolak",
    icon: "AlertCircle",
    color: "bg-red-100 text-red-600",
  },
  approve_user: {
    type: "user",
    action: "approve",
    title: "Pengguna Disetujui",
    icon: "UserCheck",
    color: "bg-blue-100 text-blue-600",
  },
  suspend_user: {
    type: "user",
    action: "suspend",
    title: "Pengguna Ditangguhkan",
    icon: "UserX",
    color: "bg-orange-100 text-orange-600",
  },
  add_credits: {
    type: "transaction",
    action: "add_credits",
    title: "Kredit Ditambahkan",
    icon: "CreditCard",
    color: "bg-violet-100 text-violet-600",
  },
};

const DEFAULT_MAPPING = {
  type: "user" as const,
  action: "approve" as const,
  title: "Aktivitas Admin",
  icon: "AlertCircle",
  color: "bg-slate-100 text-slate-600",
};

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function buildDescription(action: string, metadata: Record<string, unknown> | null): string {
  if (!metadata) return "";
  const m = metadata as Record<string, unknown>;

  switch (action) {
    case "approve_transaction":
      return `Paket ${m.package_name || "unknown"} — ${m.credits_added || 0} kredit`;
    case "reject_transaction":
      return `Alasan: ${m.reason || "Tidak ada alasan"}`;
    case "approve_user":
      return `ID Pengguna: ${(m.user_id as string || "").slice(0, 8)}...`;
    case "suspend_user":
      return `ID Pengguna: ${(m.user_id as string || "").slice(0, 8)}...`;
    case "add_credits":
      return `${m.credits_added || 0} kredit ditambahkan`;
    default:
      return JSON.stringify(metadata).slice(0, 100);
  }
}

export async function GET(request: NextRequest) {
  try {
    // STEP 1: Cookie-based auth client
    const { supabase: sessionClient, responseHeaders } =
      await createSupabaseRouteHandlerClient();

    const {
      data: { user },
      error: authError,
    } = await sessionClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: responseHeaders }
      );
    }

    const { data: userData } = await sessionClient
      .from("users")
      .select("email, role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.email !== "agrianwahab10@gmail.com") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403, headers: responseHeaders }
      );
    }

    // STEP 2: Service role client for DB operations (bypass RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500, headers: responseHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: logs, error: logsError } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (logsError) {
      console.error("Failed to fetch admin logs:", logsError);
      return NextResponse.json(
        { error: "Failed to fetch activity logs" },
        { status: 500 }
      );
    }

    const activities = (logs || []).map((log) => {
      const mapping = ACTION_MAP[log.action] || DEFAULT_MAPPING;

      return {
        id: log.id,
        type: mapping.type,
        action: mapping.action,
        title: mapping.title,
        description: buildDescription(log.action, log.metadata),
        time: getRelativeTime(log.created_at),
        icon: mapping.icon,
        color: mapping.color,
      };
    });

    return NextResponse.json(
      { success: true, activities },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("Activity endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
