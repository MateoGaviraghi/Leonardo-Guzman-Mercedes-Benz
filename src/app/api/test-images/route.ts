import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Vehicle } from "@/data/vehicles";
import {
  getVehicleImagePaths,
  getImageCountsFromVehicle,
} from "@/lib/vehicleImages";

export async function GET() {
  try {
    // Obtener vehículo de prueba
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", "test-vehicle")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    // Mapear snake_case de Supabase a camelCase de TypeScript
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbData = data as any; // Cast necesario porque Supabase devuelve snake_case
    const vehicle: Vehicle = {
      id: dbData.id,
      name: dbData.name,
      category: dbData.category,
      brand: dbData.brand,
      is_amg: dbData.is_amg,
      aspecto1Valor: dbData.aspecto_1_valor,
      aspecto1Label: dbData.aspecto_1_label,
      aspecto2Valor: dbData.aspecto_2_valor,
      aspecto2Label: dbData.aspecto_2_label,
      aspecto3Valor: dbData.aspecto_3_valor,
      aspecto3Label: dbData.aspecto_3_label,
      aspecto4Valor: dbData.aspecto_4_valor,
      aspecto4Label: dbData.aspecto_4_label,
      exterior1Title: dbData.exterior_1_title,
      exterior1Description: dbData.exterior_1_description,
      exterior2Title: dbData.exterior_2_title,
      exterior2Description: dbData.exterior_2_description,
      exterior3Title: dbData.exterior_3_title,
      exterior3Description: dbData.exterior_3_description,
      exterior4Title: dbData.exterior_4_title,
      exterior4Description: dbData.exterior_4_description,
      exterior5Title: dbData.exterior_5_title,
      exterior5Description: dbData.exterior_5_description,
      exterior6Title: dbData.exterior_6_title,
      exterior6Description: dbData.exterior_6_description,
      interior1Title: dbData.interior_1_title,
      interior1Description: dbData.interior_1_description,
      interior2Title: dbData.interior_2_title,
      interior2Description: dbData.interior_2_description,
      interior3Title: dbData.interior_3_title,
      interior3Description: dbData.interior_3_description,
      interior4Title: dbData.interior_4_title,
      interior4Description: dbData.interior_4_description,
      interior5Title: dbData.interior_5_title,
      interior5Description: dbData.interior_5_description,
      interior6Title: dbData.interior_6_title,
      interior6Description: dbData.interior_6_description,
      specsConsumo: dbData.specs_consumo,
      specsMotorizacion: dbData.specs_motorizacion,
      specsPotencia: dbData.specs_potencia,
      specsDimensiones: dbData.specs_dimensiones,
      specsPerformance: dbData.specs_performance,
      specsCarroceria: dbData.specs_carroceria,
      specsChasis: dbData.specs_chasis,
      specsCantidades: dbData.specs_cantidades,
      equipmentGeneralTitle: dbData.equipment_general_title,
      equipmentGeneralDescription: dbData.equipment_general_description,
    };

    // Obtener conteo automático de imágenes basado en campos no-null
    const imageCounts = getImageCountsFromVehicle(vehicle);

    // Generar rutas de imágenes
    const imagePaths = getVehicleImagePaths("test-vehicle", {
      ...imageCounts,
      hasHeroImage: true,
      hasHeroVideo: false,
      imageFormat: "avif", // Formato por defecto
    });

    return NextResponse.json({
      success: true,
      message: "✅ Sistema de imágenes funcionando",
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        category: vehicle.category,
      },
      info: {
        totalImages: {
          exterior: imageCounts.exteriorCount,
          colors: imageCounts.colorCount,
          interior: imageCounts.interiorCount,
          equipment: imageCounts.equipmentCount,
        },
        imagePaths: {
          exterior: imagePaths.exterior,
          colors: imagePaths.colors,
          interior: imagePaths.interior,
          equipment: imagePaths.equipment,
        },
        nextSteps: [
          "1. Sube imágenes a /public/vehicles/" + vehicle.id + "/",
          "2. Usa los nombres: exterior/1.avif, colors/1.avif, etc.",
          "3. Las imágenes aparecerán automáticamente en el frontend",
        ],
      },
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
