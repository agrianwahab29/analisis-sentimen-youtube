import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID analisis diperlukan" },
        { status: 400 }
      );
    }

    // Verify the analysis belongs to the user before deleting
    const { data: analysis, error: fetchError } = await supabase
      .from("analysis_history")
      .select("id, user_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching analysis:", fetchError);
      return NextResponse.json(
        { error: "Gagal memverifikasi analisis" },
        { status: 500 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        { error: "Analisis tidak ditemukan" },
        { status: 404 }
      );
    }

    if (analysis.user_id !== user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk menghapus analisis ini" },
        { status: 403 }
      );
    }

    // Delete the analysis
    const { error: deleteError } = await supabase
      .from("analysis_history")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting analysis:", deleteError);
      return NextResponse.json(
        { error: "Gagal menghapus analisis" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Analisis berhasil dihapus",
    });

  } catch (error) {
    console.error("Delete analysis error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus analisis" },
      { status: 500 }
    );
  }
}
