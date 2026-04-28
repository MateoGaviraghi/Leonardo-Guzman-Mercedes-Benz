import { supabase } from "@/lib/supabase";
import type { Vehicle } from "@/data/vehicles";
import VehiclesClient from "./VehiclesClient";

export const revalidate = 60;

export default async function VehiclesPage() {
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  // La DB devuelve filas snake_case con `string | null`. La interfaz `Vehicle`
  // del frontend declara los opcionales como `string | undefined`. Cast vía
  // unknown porque VehiclesClient sólo lee campos snake_case (id, name,
  // category, fuel_type, is_amg) y null/undefined se comportan igual en los
  // chequeos truthy del componente. La solución de fondo sería alinear
  // `Vehicle` con `string | null`, pero eso toca 9 archivos importadores —
  // se deja como deuda futura.
  return (
    <VehiclesClient
      vehicles={(vehicles ?? []) as unknown as Vehicle[]}
    />
  );
}
