import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { parseVehicleFromDB } from "@/lib/parseVehicle";
import { pegarTextos } from "@/lib/texto";
import VehicleDetailClient from "./VehicleDetailClient";
import TruckDetailClient from "./TruckDetailClient";
import fotosVehiculos from "@/data/fotos-vehiculos.json";

// Armado de la página de un vehículo, compartido por la página pública
// (`/vehicles/[id]`) y la vista previa del admin (`/vehicles/vista-previa/[id]`)
// para que las dos muestren exactamente lo mismo. Acá no se mira la lista de
// ocultos: eso lo decide cada ruta.

const TRUCK_CATEGORIES = ["accelo", "atego", "actros", "arocs", "axor"];

/**
 * Fotos de colores de cada auto (`public/vehicles/<id>/colors/`: 1, 2, 3… correlativas,
 * hasta 15, con su formato). La lista la arma `scripts/lista-fotos.mjs` antes de cada
 * build y de cada `dev`: la página no mira el disco, porque hacerlo metía todas las
 * fotos dentro de la función de Vercel (297 MB, deploy rechazado el 2026-11-09).
 * Si un auto no tiene colores, la sección se oculta sin flash en cliente.
 */
const FOTOS: Record<
  string,
  { colores: { num: number; format: string }[]; hayColores: boolean }
> = fotosVehiculos;

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

  const colorImages = FOTOS[id]?.colores ?? [];
  const hasColorImages = FOTOS[id]?.hayColores ?? false;

  return (
    <VehicleDetailClient
      vehicle={pegarTextos(vehicle)}
      hasColorImages={hasColorImages}
      colorImages={colorImages}
    />
  );
}
