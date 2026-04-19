import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

type Ctx = { params: Promise<{ id: string }> };

// PATCH: renombrar / activar / desactivar
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServer();
  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) {
      update.name = body.name.trim();
    }
    if (typeof body.is_active === "boolean") {
      update.is_active = body.is_active;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: "Nada para actualizar" },
        { status: 400 }
      );
    }
    const { error } = await supabase
      .from("crm_zonas")
      .update(update as never)
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
