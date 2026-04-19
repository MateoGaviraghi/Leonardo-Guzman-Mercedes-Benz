import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getCardById } from "@/lib/crm/queries";
import { deleteCard, updateCard } from "@/lib/crm/actions";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/crm/cards/[id]
export async function GET(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServer();

  try {
    const card = await getCardById(supabase, id);
    if (!card) {
      return NextResponse.json(
        { success: false, error: "Tarjeta no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, card });
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

// PATCH /api/crm/cards/[id]  —  body: UpdateCardPayload
export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = await request.json();
    await updateCard(supabase, id, body, user);
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

// DELETE /api/crm/cards/[id]
export async function DELETE(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServer();

  try {
    await deleteCard(supabase, id);
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
