import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getProducts } from "@/lib/crm/queries";

// GET /api/crm/products
export async function GET() {
  const supabase = await createSupabaseServer();
  try {
    const products = await getProducts(supabase);
    return NextResponse.json({ success: true, products });
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

// POST /api/crm/products  body: { name }
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  try {
    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, error: "Falta el nombre del producto" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("crm_products")
      .insert({ name: body.name.trim() } as never)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, product: data });
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
