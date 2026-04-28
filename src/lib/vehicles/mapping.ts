// ============================================================================
// Mapping camelCase (frontend body) → snake_case (Supabase row).
//
// Esta es la frontera entre el modelo del frontend (interfaz `Vehicle` de
// `@/data/vehicles`, todo camelCase) y el schema real de la tabla `vehicles`
// (snake_case, espejo de `Database["public"]["Tables"]["vehicles"]`).
//
// Antes vivía duplicado entre `/api/vehicles/route.ts` y `[id]/route.ts`
// (~120 líneas idénticas, ya con drift sutil entre ambos). Centralizado acá:
// agregar/quitar columnas se hace una sola vez.
//
// Nota sobre JSONB: los campos `specs_*` y `equip_*` (excepto los TEXT del
// Sprinter) son JSONB en la DB pero el código histórico los guarda como
// string JSON.stringified (`parseVehicleFromDB` hace JSON.parse al leer).
// Mantenemos ese comportamiento para no migrar datos existentes en prod.
// ============================================================================

import type { Database } from "@/types/supabase";

export type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];
export type VehicleUpdate = Database["public"]["Tables"]["vehicles"]["Update"];

// El body que llega del admin form puede traer camelCase o snake_case según
// el campo (mezcla histórica). Lo tipamos lax — el helper extrae lo que conoce.
export type VehicleBody = Record<string, unknown>;

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function asBool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

// Serializa objetos/arrays a JSON string. Conserva null/undefined como null
// (la columna lo permite). Mantiene compat con datos existentes en prod.
function serializeJson(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  return JSON.stringify(v);
}

/**
 * Mapea un body camelCase a un row snake_case parcial, listo para
 * `.insert()` o `.update()` en la tabla `vehicles`.
 *
 * Devuelve un `VehicleUpdate` (todos los campos opcionales). Para crear un
 * vehículo nuevo, el caller debe agregar `id` y los obligatorios (name,
 * category) al resultado — TypeScript ya marca esos como required en
 * `VehicleInsert`.
 */
export function mapVehicleBodyToRow(body: VehicleBody): VehicleUpdate {
  const row: VehicleUpdate = {
    name: asString(body.name),
    category: asString(body.category),
    brand: asString(body.brand),
    is_amg: asBool(body.is_amg) ?? false,
    fuel_type: asString(body.fuel_type) ?? asString(body.fuelType),
    subtitle: asString(body.subtitle),

    // Aspectos 1-4 (valor + label)
    aspecto_1_valor: asString(body.aspecto1Valor),
    aspecto_1_label: asString(body.aspecto1Label),
    aspecto_2_valor: asString(body.aspecto2Valor),
    aspecto_2_label: asString(body.aspecto2Label),
    aspecto_3_valor: asString(body.aspecto3Valor),
    aspecto_3_label: asString(body.aspecto3Label),
    aspecto_4_valor: asString(body.aspecto4Valor),
    aspecto_4_label: asString(body.aspecto4Label),

    // Specs (JSONB stored as JSON string — ver nota arriba)
    specs_consumo: serializeJson(body.specsConsumo),
    specs_motorizacion: serializeJson(body.specsMotorizacion),
    specs_potencia: serializeJson(body.specsPotencia),
    specs_dimensiones: serializeJson(body.specsDimensiones),
    specs_performance: serializeJson(body.specsPerformance),
    specs_carroceria: serializeJson(body.specsCarroceria),
    specs_chasis: serializeJson(body.specsChasis),
    specs_cantidades: serializeJson(body.specsCantidades),
    specs_bateria_carga: serializeJson(body.specsBateriaCarga),

    // Equipamiento general (texto plano)
    equipment_general_title: asString(body.equipmentGeneralTitle),
    equipment_general_description: asString(body.equipmentGeneralDescription),

    // Equipamiento JSONB
    equip_exterior: serializeJson(body.equipExterior),
    equip_interior: serializeJson(body.equipInterior),
    equip_multimedia: serializeJson(body.equipMultimedia),
    equip_asistencia: serializeJson(body.equipAsistencia),
    equip_confort: serializeJson(body.equipConfort),
    equip_tren_rodaje: serializeJson(body.equipTrenRodaje),
    equip_seguridad: serializeJson(body.equipSeguridad),

    // Equip Sprinter — TEXT en la DB (no JSONB), pero el código histórico
    // guarda JSON-stringified igual.
    equip_variantes_carroceria: serializeJson(body.equipVariantesCarroceria),
    equip_carga: serializeJson(body.equipCarga),
    equip_variantes_compartimento: serializeJson(body.equipVariantesCompartimento),
    equip_equipamiento_compartimento: serializeJson(
      body.equipEquipamientoCompartimento
    ),
    equip_puesto_conduccion: serializeJson(body.equipPuestoConduccion),

    // Truck JSONB
    truck_sections: serializeJson(body.truckSections),
    truck_pdfs: serializeJson(body.truckPdfs),
  };

  // Exterior + interior 1-10 (4 campos por índice)
  // Cast al final porque los keys dinámicos no se infieren con keyof.
  const dynamic = row as unknown as Record<string, string | null | undefined>;
  for (let i = 1; i <= 10; i++) {
    dynamic[`exterior_${i}_title`] = asString(body[`exterior${i}Title`]);
    dynamic[`exterior_${i}_description`] = asString(
      body[`exterior${i}Description`]
    );
    dynamic[`interior_${i}_title`] = asString(body[`interior${i}Title`]);
    dynamic[`interior_${i}_description`] = asString(
      body[`interior${i}Description`]
    );
  }

  return row;
}
