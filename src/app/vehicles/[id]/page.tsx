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

  // Oculto (lib/vehicles/hidden): un link viejo aterriza en la gama del inicio (el
  // catálogo ya no existe), no en el 404 por defecto de Next.
  if (!isPublicVehicle(id)) {
    redirect("/#gama");
  }

  return <VehicleDetailView id={id} />;
}
