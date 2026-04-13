import { supabase } from "@/lib/supabase";
import VehiclesClient from "./VehiclesClient";

export const revalidate = 60;

export default async function VehiclesPage() {
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  return <VehiclesClient vehicles={vehicles || []} />;
}
