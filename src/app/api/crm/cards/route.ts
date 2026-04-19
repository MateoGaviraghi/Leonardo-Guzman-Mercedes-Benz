import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createCard } from "@/lib/crm/actions";
import { getCardsByZone } from "@/lib/crm/queries";
import type { CardZone } from "@/types/crm";

// GET /api/crm/cards?zone=pizarron&zona_id=<uuid>
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const zone = (request.nextUrl.searchParams.get("zone") ?? "pizarron") as CardZone;
  const zonaId = request.nextUrl.searchParams.get("zona_id");

  if (!zonaId) {
    return NextResponse.json(
      { success: false, error: "Falta el parámetro zona_id" },
      { status: 400 }
    );
  }

  try {
    const cards = await getCardsByZone(supabase, zone, zonaId);
    return NextResponse.json({ success: true, cards });
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

// POST /api/crm/cards  —  body: CreateCardPayload
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = await request.json();

    if (!body.client_name || typeof body.client_name !== "string") {
      return NextResponse.json(
        { success: false, error: "El nombre del cliente es obligatorio" },
        { status: 400 }
      );
    }

    const id = await createCard(supabase, body, user);
    return NextResponse.json({ success: true, id });
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
