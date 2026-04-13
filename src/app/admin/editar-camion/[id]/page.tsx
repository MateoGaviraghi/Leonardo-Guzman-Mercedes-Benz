"use client";

import TruckForm from "@/components/TruckForm";
import { use } from "react";

export default function EditarCamionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TruckForm editVehicleId={id} isEdit={true} />;
}
