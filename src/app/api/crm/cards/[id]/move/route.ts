import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { moveCard } from "@/lib/crm/actions";
import type { MoveCardPayload } from "@/types/crm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/crm/cards/[id]/move   body: MoveCardPayload
export async function POST(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = (await request.json()) as MoveCardPayload;
    if (!body.to_column) {
      return NextResponse.json(
        { success: false, error: "Falta el campo to_column" },
        { status: 400 }
      );
    }
    await moveCard(
      supabase,
      id,
      body.to_column,
      body.to_zone,
      user,
      body.reason,
      body.next_contact_at
    );
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
