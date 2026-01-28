import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Obtener un vehículo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Vehículo no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      vehicle: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT - Actualizar vehículo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Convertir camelCase a snake_case para Supabase
    const vehicleData = {
      name: body.name,
      category: body.category,
      brand: body.brand,
      is_amg: body.is_amg,
      fuel_type: body.fuel_type || body.fuelType,
      subtitle: body.subtitle,
      aspecto_1_valor: body.aspecto1Valor,
      aspecto_1_label: body.aspecto1Label,
      aspecto_2_valor: body.aspecto2Valor,
      aspecto_2_label: body.aspecto2Label,
      aspecto_3_valor: body.aspecto3Valor,
      aspecto_3_label: body.aspecto3Label,
      aspecto_4_valor: body.aspecto4Valor,
      aspecto_4_label: body.aspecto4Label,
      exterior_1_title: body.exterior1Title,
      exterior_1_description: body.exterior1Description,
      exterior_2_title: body.exterior2Title,
      exterior_2_description: body.exterior2Description,
      exterior_3_title: body.exterior3Title,
      exterior_3_description: body.exterior3Description,
      exterior_4_title: body.exterior4Title,
      exterior_4_description: body.exterior4Description,
      exterior_5_title: body.exterior5Title,
      exterior_5_description: body.exterior5Description,
      exterior_6_title: body.exterior6Title,
      exterior_6_description: body.exterior6Description,
      exterior_7_title: body.exterior7Title,
      exterior_7_description: body.exterior7Description,
      exterior_8_title: body.exterior8Title,
      exterior_8_description: body.exterior8Description,
      exterior_9_title: body.exterior9Title,
      exterior_9_description: body.exterior9Description,
      exterior_10_title: body.exterior10Title,
      exterior_10_description: body.exterior10Description,
      interior_1_title: body.interior1Title,
      interior_1_description: body.interior1Description,
      interior_2_title: body.interior2Title,
      interior_2_description: body.interior2Description,
      interior_3_title: body.interior3Title,
      interior_3_description: body.interior3Description,
      interior_4_title: body.interior4Title,
      interior_4_description: body.interior4Description,
      interior_5_title: body.interior5Title,
      interior_5_description: body.interior5Description,
      interior_6_title: body.interior6Title,
      interior_6_description: body.interior6Description,
      interior_7_title: body.interior7Title,
      interior_7_description: body.interior7Description,
      interior_8_title: body.interior8Title,
      interior_8_description: body.interior8Description,
      interior_9_title: body.interior9Title,
      interior_9_description: body.interior9Description,
      interior_10_title: body.interior10Title,
      interior_10_description: body.interior10Description,
      specs_consumo: body.specsConsumo
        ? JSON.stringify(body.specsConsumo)
        : null,
      specs_motorizacion: body.specsMotorizacion
        ? JSON.stringify(body.specsMotorizacion)
        : null,
      specs_potencia: body.specsPotencia
        ? JSON.stringify(body.specsPotencia)
        : null,
      specs_dimensiones: body.specsDimensiones
        ? JSON.stringify(body.specsDimensiones)
        : null,
      specs_performance: body.specsPerformance
        ? JSON.stringify(body.specsPerformance)
        : null,
      specs_carroceria: body.specsCarroceria
        ? JSON.stringify(body.specsCarroceria)
        : null,
      specs_chasis: body.specsChasis ? JSON.stringify(body.specsChasis) : null,
      specs_cantidades: body.specsCantidades
        ? JSON.stringify(body.specsCantidades)
        : null,
      specs_bateria_carga: body.specsBateriaCarga
        ? JSON.stringify(body.specsBateriaCarga)
        : null,
      equipment_general_title: body.equipmentGeneralTitle,
      equipment_general_description: body.equipmentGeneralDescription,
      equip_exterior: body.equipExterior
        ? JSON.stringify(body.equipExterior)
        : null,
      equip_interior: body.equipInterior
        ? JSON.stringify(body.equipInterior)
        : null,
      equip_multimedia: body.equipMultimedia
        ? JSON.stringify(body.equipMultimedia)
        : null,
      equip_asistencia: body.equipAsistencia
        ? JSON.stringify(body.equipAsistencia)
        : null,
      equip_confort: body.equipConfort
        ? JSON.stringify(body.equipConfort)
        : null,
      equip_tren_rodaje: body.equipTrenRodaje
        ? JSON.stringify(body.equipTrenRodaje)
        : null,
      equip_seguridad: body.equipSeguridad
        ? JSON.stringify(body.equipSeguridad)
        : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase as any)
      .from("vehicles")
      .update(vehicleData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vehículo actualizado exitosamente",
      vehicle: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar vehículo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vehículo eliminado exitosamente",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
