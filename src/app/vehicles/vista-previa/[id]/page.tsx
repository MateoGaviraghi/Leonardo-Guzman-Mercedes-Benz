import type { Metadata } from "next";
import VehicleDetailView from "../../[id]/VehicleDetailView";

// Vista previa del admin: el vehículo tal cual se ve en la web, incluidos los
// ocultos de `lib/vehicles/hidden` (para revisar textos y fotos antes de
// publicarlo). Vive bajo /vehicles para heredar navbar, footer y hero
// full-bleed igual que la página pública; la sesión la exige `src/proxy.ts`.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vista previa",
  robots: { index: false, follow: false },
};

export default async function VehiclePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VehicleDetailView id={id} />;
}
