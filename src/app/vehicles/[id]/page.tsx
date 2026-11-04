import { redirect } from "next/navigation";
import { isPublicVehicle } from "@/lib/vehicles/hidden";
import VehicleDetailView from "./VehicleDetailView";

export const revalidate = 60;

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Oculto (lib/vehicles/hidden): un link viejo aterriza en el catálogo, no
  // en el 404 por defecto de Next.
  if (!isPublicVehicle(id)) {
    redirect("/vehicles");
  }

  return <VehicleDetailView id={id} />;
}
