import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import {
  mapVehicleBodyToRow,
  type VehicleInsert,
} from "@/lib/vehicles/mapping";

// GET — lista pública de vehículos. La policy "Enable read access for all
// users" en la tabla `vehicles` permite que el rol anon lea, así que sirve
// tanto en SSR autenticado como sin sesión.
export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      vehicles: data ?? [],
      count: data?.length ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST — crea un vehículo. El proxy.ts ya bloquea sin sesión.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const body = await request.json();

    if (!body.name || !body.category) {
      return NextResponse.json(
        { success: false, error: "Campos obligatorios: name, category" },
        { status: 400 }
      );
    }

    const row: VehicleInsert = {
      ...mapVehicleBodyToRow(body),
      // El frontend genera el slug en el form; si no llegó, usamos UUID.
      id: typeof body.id === "string" && body.id ? body.id : crypto.randomUUID(),
      // `name` y `category` son required en VehicleInsert — los re-aseguramos
      // tras el helper para que TS no infiera string|undefined.
      name: body.name,
      category: body.category,
    };

    const { data, error } = await supabase
      .from("vehicles")
      .insert(row)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vehículo creado exitosamente",
      vehicle: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
