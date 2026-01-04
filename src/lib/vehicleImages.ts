/**
 * Helper para construir rutas de imágenes basadas en convención de nombres
 * Las imágenes se guardan en /public/vehicles/{vehicleId}/{category}/{number}.jpg
 */

export interface VehicleImagePaths {
  hero: {
    video?: string;
    image?: string;
  };
  exterior: string[];
  colors: string[];
  interior: string[];
  equipment: string[];
}

/**
 * Genera las rutas de imágenes para un vehículo
 * @param vehicleId - ID del vehículo (ej: "test-vehicle")
 * @param options - Opciones para especificar qué imágenes existen
 */
export function getVehicleImagePaths(
  vehicleId: string,
  options?: {
    exteriorCount?: number; // Número de fotos de exterior (1-6)
    colorCount?: number; // Número de colores (1-5)
    interiorCount?: number; // Número de fotos de interior (1-6)
    equipmentCount?: number; // Número de equipamientos (1-8)
    hasHeroVideo?: boolean; // Si tiene video hero
    hasHeroImage?: boolean; // Si tiene imagen hero
    imageFormat?: "jpg" | "jpeg" | "png" | "webp" | "avif"; // Formato de imagen (default: avif)
  }
): VehicleImagePaths {
  const basePath = `/vehicles/${vehicleId}`;
  const format = options?.imageFormat || "avif";

  const paths: VehicleImagePaths = {
    hero: {},
    exterior: [],
    colors: [],
    interior: [],
    equipment: [],
  };

  // Hero
  if (options?.hasHeroVideo) {
    paths.hero.video = `${basePath}/hero.mp4`;
  }
  if (options?.hasHeroImage) {
    paths.hero.image = `${basePath}/hero.${format}`;
  }

  // Exterior (hasta 6 fotos)
  const exteriorCount = Math.min(options?.exteriorCount || 0, 6);
  for (let i = 1; i <= exteriorCount; i++) {
    paths.exterior.push(`${basePath}/exterior/${i}.${format}`);
  }

  // Colores (hasta 5)
  const colorCount = Math.min(options?.colorCount || 0, 5);
  for (let i = 1; i <= colorCount; i++) {
    paths.colors.push(`${basePath}/colors/${i}.${format}`);
  }

  // Interior (hasta 6 fotos)
  const interiorCount = Math.min(options?.interiorCount || 0, 6);
  for (let i = 1; i <= interiorCount; i++) {
    paths.interior.push(`${basePath}/interior/${i}.${format}`);
  }

  // Equipamiento (hasta 8)
  const equipmentCount = Math.min(options?.equipmentCount || 0, 8);
  for (let i = 1; i <= equipmentCount; i++) {
    paths.equipment.push(`${basePath}/equipment/${i}.${format}`);
  }

  return paths;
}

/**
 * Obtiene la ruta de una imagen específica
 */
export function getVehicleImage(
  vehicleId: string,
  category: "exterior" | "colors" | "interior" | "equipment",
  index: number,
  format: "jpg" | "jpeg" | "png" | "webp" | "avif" = "avif"
): string {
  return `/vehicles/${vehicleId}/${category}/${index}.${format}`;
}

/**
 * Obtiene la ruta del hero (video o imagen)
 */
export function getVehicleHero(
  vehicleId: string,
  type: "video" | "image",
  format: "jpg" | "jpeg" | "png" | "webp" | "avif" = "avif"
): string {
  return `/vehicles/${vehicleId}/hero.${type === "video" ? "mp4" : format}`;
}

/**
 * Verifica automáticamente qué imágenes existen contando los campos no-null
 * Útil para cuando obtienes datos de Supabase
 */
export function getImageCountsFromVehicle(vehicle: {
  exterior1Title?: string | null;
  exterior2Title?: string | null;
  exterior3Title?: string | null;
  exterior4Title?: string | null;
  exterior5Title?: string | null;
  exterior6Title?: string | null;
  interior1Title?: string | null;
  interior2Title?: string | null;
  interior3Title?: string | null;
  interior4Title?: string | null;
  interior5Title?: string | null;
  interior6Title?: string | null;
  equipMultimedia?: Array<{ title?: string; description?: string }> | null;
  equipAsistencia?: Array<{ title?: string; description?: string }> | null;
  equipConfort?: Array<{ title?: string; description?: string }> | null;
  equipTrenRodaje?: Array<{ title?: string; description?: string }> | null;
}) {
  const exteriorCount = [
    vehicle.exterior1Title,
    vehicle.exterior2Title,
    vehicle.exterior3Title,
    vehicle.exterior4Title,
    vehicle.exterior5Title,
    vehicle.exterior6Title,
  ].filter(Boolean).length;

  // Colors are static - 7 images
  const colorCount = 7;

  const interiorCount = [
    vehicle.interior1Title,
    vehicle.interior2Title,
    vehicle.interior3Title,
    vehicle.interior4Title,
    vehicle.interior5Title,
    vehicle.interior6Title,
  ].filter(Boolean).length;

  const equipmentCount =
    (vehicle.equipMultimedia?.length || 0) +
    (vehicle.equipAsistencia?.length || 0) +
    (vehicle.equipConfort?.length || 0) +
    (vehicle.equipTrenRodaje?.length || 0);

  return {
    exteriorCount,
    colorCount,
    interiorCount,
    equipmentCount,
  };
}
