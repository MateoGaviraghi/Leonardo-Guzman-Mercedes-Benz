import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { parseVehicleFromDB } from "@/lib/parseVehicle";
import VehicleDetailClient from "./VehicleDetailClient";
import TruckDetailClient from "./TruckDetailClient";

// Armado de la página de un vehículo, compartido por la página pública
// (`/vehicles/[id]`) y la vista previa del admin (`/vehicles/vista-previa/[id]`)
// para que las dos muestren exactamente lo mismo. Acá no se mira la lista de
// ocultos: eso lo decide cada ruta.

const TRUCK_CATEGORIES = ["accelo", "atego", "actros", "arocs", "axor"];

/**
 * Detecta server-side si existe `1.<formato>` en `public/vehicles/<id>/<subPath>/`.
 * Sirve para que el frontend oculte secciones (Colores, Dimensiones) cuando el
 * admin no subió imágenes — sin flash de "carga + desaparece" en cliente.
 */
function hasFirstImage(vehicleId: string, subPath: string): boolean {
  const formats = ["avif", "webp", "jpg", "jpeg", "png"];
  const dir = path.join(
    process.cwd(),
    "public",
    "vehicles",
    vehicleId,
    subPath
  );
  for (const format of formats) {
    try {
      if (fs.existsSync(path.join(dir, `1.${format}`))) return true;
    } catch {
      // ignore: en algunos runtimes `existsSync` puede tirar
    }
  }
  return false;
}

export default async function VehicleDetailView({ id }: { id: string }) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const vehicle = parseVehicleFromDB(data);
  const isTruck = TRUCK_CATEGORIES.includes(vehicle.category?.toLowerCase());

  if (isTruck) {
    return <TruckDetailClient vehicle={vehicle} />;
  }

  const hasColorImages = hasFirstImage(id, "colors");

  return (
    <VehicleDetailClient vehicle={vehicle} hasColorImages={hasColorImages} />
  );
}
