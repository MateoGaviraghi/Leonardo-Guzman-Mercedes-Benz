import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import type { Vehicle } from "@/data/vehicles";
import { isPublicVehicle } from "@/lib/vehicles/hidden";
import VehiclesClient from "./VehiclesClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Vehículos — Leonardo Guzmán | Mercedes-Benz, Paraná",
  description:
    "Conocé el stock de vehículos Mercedes-Benz disponibles con Leonardo Guzmán en Automotores Mega S.A., Paraná, Entre Ríos.",
};

export default async function VehiclesPage() {
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  const visible = ((vehicles ?? []) as Vehicle[]).filter((v) =>
    isPublicVehicle(v.id)
  );

  return <VehiclesClient vehicles={visible} />;
}
