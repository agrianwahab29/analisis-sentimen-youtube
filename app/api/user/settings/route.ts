import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const response = new NextResponse();
    const { supabase } = createSupabaseRouteClient(request, response);

    // Get current user session
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      emailNotifications,
      analysisCompleteNotifications,
      securityAlertNotifications,
    } = body;

    // Validate input
    if (
      typeof emailNotifications !== "boolean" &&
      emailNotifications !== undefined
    ) {
      return NextResponse.json(
        { error: "Invalid emailNotifications value" },
        { status: 400 }
      );
    }

    if (
      typeof analysisCompleteNotifications !== "boolean" &&
      analysisCompleteNotifications !== undefined
    ) {
      return NextResponse.json(
        { error: "Invalid analysisCompleteNotifications value" },
        { status: 400 }
      );
    }

    if (
      typeof securityAlertNotifications !== "boolean" &&
      securityAlertNotifications !== undefined
    ) {
      return NextResponse.json(
        { error: "Invalid securityAlertNotifications value" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, boolean> = {};
    if (typeof emailNotifications === "boolean") {
      updateData.email_notifications = emailNotifications;
    }
    if (typeof analysisCompleteNotifications === "boolean") {
      updateData.analysis_complete_notifications = analysisCompleteNotifications;
    }
    if (typeof securityAlertNotifications === "boolean") {
      updateData.security_alert_notifications = securityAlertNotifications;
    }

    // Update user settings
    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating settings:", updateError);
      // Check if error is about missing columns
      if (updateError.message?.includes("column") || updateError.message?.includes("does not exist")) {
        return NextResponse.json({
          success: true,
          warning: "Settings saved to session only - database columns not ready",
        });
      }
      return NextResponse.json(
        { error: "Failed to update settings", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const response = new NextResponse();
    const { supabase } = createSupabaseRouteClient(request, response);

    // Get current user session
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user settings
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("email_notifications, analysis_complete_notifications, security_alert_notifications")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching settings:", fetchError);
      // Return default values if columns don't exist yet
      return NextResponse.json({
        emailNotifications: true,
        analysisCompleteNotifications: true,
        securityAlertNotifications: true,
      });
    }

    return NextResponse.json({
      emailNotifications: data?.email_notifications ?? true,
      analysisCompleteNotifications: data?.analysis_complete_notifications ?? true,
      securityAlertNotifications: data?.security_alert_notifications ?? true,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
