import type { Vehicle } from "@/data/vehicles";

// Tarjetas AMG del catálogo que no son un auto propio (2026-11-10, Mateo:
// «Tarjeta AMG propia»). En mercedes-benz.com.ar estos AMG no tienen página:
// su «Más información» lleva a la página del modelo Mercedes-Benz, que trae el
// bloque Mercedes-AMG (ya cargado en Equipamiento › Exterior / Interior).
// Acá pasa lo mismo: cada tarjeta es una copia del modelo con nombre AMG,
// marcada como AMG y con foto propia en /public/vehicles/amg/<slug>/card.*,
// y abre la ficha del modelo.
const AMG_TARJETAS: readonly { modeloId: string; nombre: string; slug: string }[] = [
  { modeloId: "e7a7cac6-5c3d-49cc-9d62-fae1d08eb720", nombre: "Mercedes-AMG Clase A Hatchback", slug: "clase-a" },
  { modeloId: "f633e4c3-ca13-44e9-8ed6-dfa7337c15d1", nombre: "Mercedes-AMG GLC", slug: "glc" },
  { modeloId: "4d56e35d-70c2-4573-8170-3bb184f2eb57", nombre: "Mercedes-AMG GLC Coupé", slug: "glc-coupe" },
  { modeloId: "5546b0dc-b9e8-4829-b4df-9ec4fc6e8427", nombre: "Mercedes-AMG GLE", slug: "gle" },
  { modeloId: "cd4cd260-158a-4999-9e51-e519e5cf6704", nombre: "Mercedes-AMG GLE Coupé", slug: "gle-coupe" },
  { modeloId: "89ceb92d-c9d4-4fd1-940b-81fac745f9c9", nombre: "Mercedes-AMG Clase G", slug: "clase-g" },
  { modeloId: "f05eb9e8-d811-4c3f-bdc8-c272747514b0", nombre: "Mercedes-AMG CLE Coupé", slug: "cle-coupe" },
];

/** Vehículo del catálogo; `tarjetaAmg` = slug de la foto si es una tarjeta AMG. */
export type VehiculoCatalogo = Vehicle & { tarjetaAmg?: string };

/** Suma al catálogo las tarjetas AMG de los modelos que están en la lista. */
export function sumarTarjetasAmg(vehicles: Vehicle[]): VehiculoCatalogo[] {
  const extra: VehiculoCatalogo[] = [];
  for (const t of AMG_TARJETAS) {
    const modelo = vehicles.find((v) => v.id === t.modeloId);
    if (modelo) extra.push({ ...modelo, name: t.nombre, is_amg: true, tarjetaAmg: t.slug });
  }
  return [...vehicles, ...extra];
}
