import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Obtener todos los vehículos
export async function GET() {
  try {
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
      vehicles: data,
      count: data?.length || 0,
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

// POST - Crear nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar campos obligatorios
    if (!body.name || !body.category || !body.brand) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos obligatorios: name, category, brand",
        },
        { status: 400 }
      );
    }

    // Generar UUID automáticamente
    const vehicleId = crypto.randomUUID();

    // Convertir camelCase a snake_case para Supabase
    const vehicleData = {
      id: vehicleId,
      name: body.name,
      category: body.category,
      brand: body.brand,
      is_amg: body.is_amg || false,
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
      equipment_general_title: body.equipmentGeneralTitle,
      equipment_general_description: body.equipmentGeneralDescription,
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
    };

    const { data, error } = await supabase
      .from("vehicles")
      .insert(vehicleData as any)
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
