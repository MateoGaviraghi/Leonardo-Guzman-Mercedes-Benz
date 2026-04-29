// ============================================================================
// Helper para importar un vehículo desde un JSON pegado en el admin form.
//
// Acepta dos formatos:
//   1. snake_case (shape DB / Database["public"]["Tables"]["vehicles"]) —
//      lo que devuelve el endpoint o lo que extraemos con IA.
//   2. camelCase (shape frontend / interfaz Vehicle) — útil si alguien
//      arma el JSON manualmente desde el código.
//
// Siempre devuelve un Partial<Vehicle> en camelCase, listo para mergear
// directo en el formData de VehicleForm/TruckForm con:
//
//   setFormData((prev) => ({ ...prev, ...data }));
//
// El usuario decide los campos que quiere "rellenar de un saque" — el resto
// del formulario se preserva.
// ============================================================================

import type { Vehicle } from "@/data/vehicles";
import { parseVehicleFromDB } from "@/lib/parseVehicle";

export type ImportResult = {
  data: Partial<Vehicle>;
  /** Total de campos top-level que se pisaron en formData. */
  fieldsLoaded: number;
  /** Warnings legibles (no errores fatales): falta name, etc. */
  warnings: string[];
};

// Heurística: si tiene cualquier key con guión bajo en el patrón conocido del
// schema DB, asumimos snake_case y pasamos por parseVehicleFromDB.
function looksLikeDBShape(obj: Record<string, unknown>): boolean {
  const snakeCasePatterns =
    /^(aspecto_|exterior_\d|interior_\d|color_\d|specs_|equip_(exterior|interior|multimedia|asistencia|confort|tren_rodaje|seguridad|variantes|carga|equipamiento|puesto)|equipment_general|truck_|fuel_type|is_amg|created_at|updated_at)/;
  return Object.keys(obj).some((k) => snakeCasePatterns.test(k));
}

/**
 * Normaliza un JSON crudo (string o objeto) al shape de `Partial<Vehicle>`.
 * Lanza Error con mensaje legible si el JSON es inválido o no es un objeto.
 */
export function normalizeVehicleJson(raw: unknown): ImportResult {
  // Aceptar string crudo (lo que viene del textarea) o ya parseado.
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) throw new Error("El JSON está vacío.");
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      throw new Error(
        "JSON inválido: " +
          (e instanceof Error ? e.message : "no se pudo parsear")
      );
    }
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("El JSON debe ser un objeto, no un array ni un valor primitivo.");
  }

  const obj = parsed as Record<string, unknown>;

  // Si vienen campos snake_case, parseVehicleFromDB los pasa a camelCase
  // (y además parsea los JSONB stringificados como specs_*, equip_*).
  // Cloneamos antes para no mutar el input del caller.
  let normalized: Partial<Vehicle>;
  if (looksLikeDBShape(obj)) {
    const clone = JSON.parse(JSON.stringify(obj));
    normalized = parseVehicleFromDB(clone) as Partial<Vehicle>;
  } else {
    // Asumimos camelCase directo. No tocamos.
    normalized = obj as Partial<Vehicle>;
  }

  // Filtrar metadatos que NO deben sobreescribir el formData del usuario.
  // El id solo se setea si es edición; created_at/updated_at los maneja la DB.
  const blacklist: Array<keyof Vehicle | "created_at" | "updated_at" | "id"> = [
    "id",
    "created_at" as never,
    "updated_at" as never,
  ];
  for (const key of blacklist) {
    delete (normalized as Record<string, unknown>)[key as string];
  }

  // Warnings: campos críticos faltantes o flags que el user puede haber omitido
  const warnings: string[] = [];
  if (!normalized.name || typeof normalized.name !== "string") {
    warnings.push("falta 'name'");
  }
  if (!normalized.category || typeof normalized.category !== "string") {
    warnings.push("falta 'category'");
  }

  const fieldsLoaded = Object.keys(normalized).filter((k) => {
    const v = (normalized as Record<string, unknown>)[k];
    return v !== undefined && v !== null && v !== "";
  }).length;

  return { data: normalized, fieldsLoaded, warnings };
}
