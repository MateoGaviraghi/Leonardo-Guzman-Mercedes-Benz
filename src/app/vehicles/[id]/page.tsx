import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { parseVehicleFromDB } from "@/lib/parseVehicle";
import VehicleDetailClient from "./VehicleDetailClient";
import TruckDetailClient from "./TruckDetailClient";

export const revalidate = 60;

const TRUCK_CATEGORIES = ["accelo", "atego", "actros", "arocs", "axor"];

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  return <VehicleDetailClient vehicle={vehicle} />;
}
