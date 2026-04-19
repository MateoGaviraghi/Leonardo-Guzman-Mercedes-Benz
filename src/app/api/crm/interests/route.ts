import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getInterests } from "@/lib/crm/queries";

// GET /api/crm/interests
export async function GET() {
  const supabase = await createSupabaseServer();
  try {
    const interests = await getInterests(supabase);
    return NextResponse.json({ success: true, interests });
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

// POST /api/crm/interests  body: { name }
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  try {
    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, error: "Falta el nombre del interés" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("crm_interests")
      .insert({ name: body.name.trim() } as never)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, interest: data });
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
