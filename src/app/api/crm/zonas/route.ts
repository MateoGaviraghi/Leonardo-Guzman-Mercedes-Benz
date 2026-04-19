import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getZonas } from "@/lib/crm/queries";

export const dynamic = "force-dynamic";

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET /api/crm/zonas?all=1  (all=1 para mostrar también las desactivadas)
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const showAll = request.nextUrl.searchParams.get("all") === "1";
  try {
    const zonas = await getZonas(supabase, { onlyActive: !showAll });
    return NextResponse.json({ success: true, zonas });
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

// POST /api/crm/zonas   body: { name, slug? }
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre de la zona es obligatorio" },
        { status: 400 }
      );
    }
    const slug =
      typeof body.slug === "string" && body.slug.trim()
        ? slugify(body.slug)
        : slugify(name);
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "El slug no puede estar vacío" },
        { status: 400 }
      );
    }
    // Reservar rutas que chocarían con static routes
    if (["login", "zonas", "nueva"].includes(slug)) {
      return NextResponse.json(
        {
          success: false,
          error: `El slug "${slug}" está reservado. Usá otro nombre.`,
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("crm_zonas")
      .insert({ name, slug, is_active: true } as never)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, zona: data });
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
