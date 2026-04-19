import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getCardHistory } from "@/lib/crm/queries";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/crm/cards/[id]/history
export async function GET(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServer();

  try {
    const history = await getCardHistory(supabase, id);
    return NextResponse.json({ success: true, history });
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
