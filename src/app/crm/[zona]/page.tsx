import { redirect } from "next/navigation";

export default async function ZonaRootPage({
  params,
}: {
  params: Promise<{ zona: string }>;
}) {
  const { zona } = await params;
  redirect(`/crm/${zona}/pizarron`);
}
