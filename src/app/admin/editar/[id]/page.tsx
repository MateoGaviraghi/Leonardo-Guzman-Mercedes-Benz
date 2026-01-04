import VehicleForm from "@/components/VehicleForm";

interface EditVehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiculoPage({
  params,
}: EditVehiclePageProps) {
  const { id } = await params;
  return <VehicleForm editVehicleId={id} isEdit={true} />;
}
