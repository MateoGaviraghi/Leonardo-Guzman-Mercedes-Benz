"use client";

import { useEffect, useState } from "react";
import type { Vehicle } from "@/data/vehicles";

type Props = {
  vehicleId: string;
  formData: Partial<Vehicle>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Vehicle>>>;
};

type SuggestionItem = { title: string; description: string };

type FamilyKind = "array" | "scalarSlots" | "single";

type Family = {
  id: string;
  label: string;
  kind: FamilyKind;
  /** camelKey del array (kind "array"), base de slots (kind "scalarSlots"),
   *  o key del título escalar (kind "single"). */
  target: string;
  items: SuggestionItem[];
};

const MAX_SLOTS = 12;

const norm = (v: unknown) =>
  typeof v === "string" ? v.trim().toLowerCase() : "";

// Lee una key tolerando camelCase o snake_case en el archivo crudo.
function pick(src: Record<string, unknown>, camel: string, snake: string): unknown {
  if (src[camel] !== undefined) return src[camel];
  if (src[snake] !== undefined) return src[snake];
  return undefined;
}

// Familias de arrays equip_* (title/description).
const ARRAY_FAMILIES: { id: string; label: string; camel: string; snake: string }[] = [
  { id: "equipExterior", label: "Exterior", camel: "equipExterior", snake: "equip_exterior" },
  { id: "equipInterior", label: "Interior", camel: "equipInterior", snake: "equip_interior" },
  { id: "equipMultimedia", label: "Sistema de multimedias", camel: "equipMultimedia", snake: "equip_multimedia" },
  { id: "equipAsistencia", label: "Asistencia a la conducción", camel: "equipAsistencia", snake: "equip_asistencia" },
  { id: "equipConfort", label: "Confort", camel: "equipConfort", snake: "equip_confort" },
  { id: "equipTrenRodaje", label: "Tren de rodaje", camel: "equipTrenRodaje", snake: "equip_tren_rodaje" },
  { id: "equipSeguridad", label: "Seguridad", camel: "equipSeguridad", snake: "equip_seguridad" },
  { id: "equipVariantesCarroceria", label: "Variantes de carrocería", camel: "equipVariantesCarroceria", snake: "equip_variantes_carroceria" },
  { id: "equipCarga", label: "Carga", camel: "equipCarga", snake: "equip_carga" },
  { id: "equipVariantesCompartimento", label: "Variantes de compartimento", camel: "equipVariantesCompartimento", snake: "equip_variantes_compartimento" },
  { id: "equipEquipamientoCompartimento", label: "Equipamiento de compartimento", camel: "equipEquipamientoCompartimento", snake: "equip_equipamiento_compartimento" },
  { id: "equipPuestoConduccion", label: "Puesto de conducción", camel: "equipPuestoConduccion", snake: "equip_puesto_conduccion" },
];

function toItem(raw: unknown): SuggestionItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title : "";
  const description = typeof o.description === "string" ? o.description : "";
  if (!title.trim() && !description.trim()) return null;
  return { title, description };
}

// Convierte el JSON crudo del archivo en una lista de familias con ítems.
function buildFamilies(src: Record<string, unknown>): Family[] {
  const families: Family[] = [];

  // 1) Arrays equip_*
  for (const f of ARRAY_FAMILIES) {
    const val = pick(src, f.camel, f.snake);
    if (Array.isArray(val)) {
      const items = val.map(toItem).filter((x): x is SuggestionItem => x !== null);
      if (items.length > 0) {
        families.push({ id: f.id, label: f.label, kind: "array", target: f.camel, items });
      }
    }
  }

  // 2) Slots escalares exterior_N / interior_N (imágenes)
  for (const base of ["exterior", "interior"] as const) {
    const items: SuggestionItem[] = [];
    for (let n = 1; n <= MAX_SLOTS; n++) {
      const title = pick(src, `${base}${n}Title`, `${base}_${n}_title`);
      const description = pick(src, `${base}${n}Description`, `${base}_${n}_description`);
      const item = toItem({ title, description });
      if (item) items.push(item);
    }
    if (items.length > 0) {
      families.push({
        id: `slots_${base}`,
        label: base === "exterior" ? "Exterior (imágenes)" : "Interior (imágenes)",
        kind: "scalarSlots",
        target: base,
        items,
      });
    }
  }

  // 3) Equipamiento general (escalar único)
  const genTitle = pick(src, "equipmentGeneralTitle", "equipment_general_title");
  const genDesc = pick(src, "equipmentGeneralDescription", "equipment_general_description");
  const genItem = toItem({ title: genTitle, description: genDesc });
  if (genItem) {
    families.push({
      id: "equipmentGeneral",
      label: "Equipamiento general",
      kind: "single",
      target: "equipmentGeneralTitle",
      items: [genItem],
    });
  }

  return families;
}

// ¿El ítem ya está cargado en el form (por título normalizado)?
function isLoaded(family: Family, item: SuggestionItem, formData: Partial<Vehicle>): boolean {
  const t = norm(item.title);
  if (family.kind === "array") {
    if (!t) return false;
    const arr = (formData[family.target as keyof Vehicle] as SuggestionItem[] | undefined) || [];
    return arr.some((x) => norm(x.title) === t);
  }
  if (family.kind === "scalarSlots") {
    if (!t) return false;
    const fd = formData as Record<string, unknown>;
    for (let n = 1; n <= MAX_SLOTS; n++) {
      if (norm(fd[`${family.target}${n}Title`]) === t) return true;
    }
    return false;
  }
  // single
  const fd = formData as Record<string, unknown>;
  return norm(fd[family.target]) !== "";
}

export default function ImportSuggestions({ vehicleId, formData, setFormData }: Props) {
  const [families, setFamilies] = useState<Family[] | null>(null);
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/import-suggestions/${vehicleId}`);
        if (!res.ok) {
          if (!cancelled) setFamilies(null);
          return;
        }
        const json = await res.json();
        const src = json?.data;
        if (!src || typeof src !== "object" || Array.isArray(src)) {
          if (!cancelled) setFamilies(null);
          return;
        }
        const built = buildFamilies(src as Record<string, unknown>);
        if (!cancelled) setFamilies(built.length > 0 ? built : null);
      } catch {
        if (!cancelled) setFamilies(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  if (!families) return null;

  const keyOf = (familyId: string, index: number) => `${familyId}#${index}`;

  const toggleSelected = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Ítems seleccionados y NO cargados de una familia.
  const pickSelected = (family: Family): { items: SuggestionItem[]; keys: string[] } => {
    const items: SuggestionItem[] = [];
    const keys: string[] = [];
    family.items.forEach((item, i) => {
      const key = keyOf(family.id, i);
      if (selected.has(key) && !isLoaded(family, item, formData)) {
        items.push(item);
        keys.push(key);
      }
    });
    return { items, keys };
  };

  // Aplica los ítems de una familia al formData. Devuelve mensaje de overflow (o null).
  const applyFamily = (family: Family, items: SuggestionItem[]): string | null => {
    if (items.length === 0) return null;

    if (family.kind === "array") {
      setFormData((prev) => {
        const arr = ((prev[family.target as keyof Vehicle] as SuggestionItem[] | undefined) || []).slice();
        return { ...prev, [family.target]: [...arr, ...items] };
      });
      return null;
    }

    if (family.kind === "scalarSlots") {
      const fd = formData as Record<string, unknown>;
      const patch: Record<string, string> = {};
      // Slots ya ocupados (según formData actual) para no pisarlos.
      const occupied = new Set<number>();
      for (let n = 1; n <= MAX_SLOTS; n++) {
        if (norm(fd[`${family.target}${n}Title`]) || norm(fd[`${family.target}${n}Description`])) {
          occupied.add(n);
        }
      }
      let overflow = 0;
      for (const item of items) {
        let placed = false;
        for (let n = 1; n <= MAX_SLOTS; n++) {
          if (occupied.has(n)) continue;
          patch[`${family.target}${n}Title`] = item.title;
          patch[`${family.target}${n}Description`] = item.description;
          occupied.add(n);
          placed = true;
          break;
        }
        if (!placed) overflow++;
      }
      if (Object.keys(patch).length > 0) {
        setFormData((prev) => ({ ...prev, ...patch }));
      }
      return overflow > 0
        ? `${family.label}: no hay slots libres para ${overflow} ítem(s) (no se pisó nada).`
        : null;
    }

    // single
    const fd = formData as Record<string, unknown>;
    if (norm(fd[family.target]) !== "") {
      return `${family.label}: ya hay contenido cargado (no se pisó nada).`;
    }
    const item = items[0];
    setFormData((prev) => ({
      ...prev,
      equipmentGeneralTitle: item.title,
      equipmentGeneralDescription: item.description,
    }));
    return null;
  };

  const handleAddFamily = (family: Family) => {
    const { items, keys } = pickSelected(family);
    if (items.length === 0) {
      setNotice(`${family.label}: no hay ítems seleccionados para agregar.`);
      return;
    }
    const msg = applyFamily(family, items);
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.delete(k));
      return next;
    });
    setNotice(msg || `${family.label}: agregados ${items.length} ítem(s).`);
  };

  const handleAddAll = () => {
    const messages: string[] = [];
    let total = 0;
    const usedKeys: string[] = [];
    for (const family of families) {
      const { items, keys } = pickSelected(family);
      if (items.length === 0) continue;
      const msg = applyFamily(family, items);
      total += items.length;
      usedKeys.push(...keys);
      if (msg) messages.push(msg);
    }
    setSelected((prev) => {
      const next = new Set(prev);
      usedKeys.forEach((k) => next.delete(k));
      return next;
    });
    if (total === 0) {
      setNotice("No hay ítems seleccionados para agregar.");
    } else {
      setNotice(
        `Agregados ${total} ítem(s) al formulario.` +
          (messages.length > 0 ? ` ${messages.join(" ")}` : "")
      );
    }
  };

  const totalItems = families.reduce((acc, f) => acc + f.items.length, 0);

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{open ? "▾" : "▸"}</span>
          <span>✅ Sugerencias oficiales · {totalItems} ítems</span>
        </span>
        <span className="text-xs font-normal text-amber-700">
          Revisá y elegí qué agregar al formulario (nada se guarda hasta que apretás Guardar)
        </span>
      </button>

      {open && (
        <div className="p-5 space-y-4 bg-white border-t border-amber-200">
          {notice && (
            <p role="status" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {notice}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddAll}
              className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700"
            >
              Agregar todos los seleccionados
            </button>
            <p className="text-xs text-gray-500">
              El checkbox arranca DESmarcado — vos elegís ítem por ítem.
            </p>
          </div>

          {families.map((family) => (
            <div key={family.id} className="border border-gray-200 rounded-md">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">
                  {family.label} · {family.items.length} ítems
                </h3>
                <button
                  type="button"
                  onClick={() => handleAddFamily(family)}
                  className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Agregar seleccionados a {family.label}
                </button>
              </div>
              <ul className="divide-y divide-gray-100">
                {family.items.map((item, i) => {
                  const key = keyOf(family.id, i);
                  const loaded = isLoaded(family, item, formData);
                  const isExpanded = expanded.has(key);
                  return (
                    <li key={key} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected.has(key)}
                          disabled={loaded}
                          onChange={() => toggleSelected(key)}
                          className="mt-1 w-4 h-4 disabled:opacity-40"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${loaded ? "text-gray-400 line-through" : "text-gray-900"}`}>
                              {item.title || "(sin título)"}
                            </span>
                            {loaded && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                ya cargado
                              </span>
                            )}
                            {item.description && (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(key)}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {isExpanded ? "ocultar descripción" : "ver descripción"}
                              </button>
                            )}
                          </div>
                          {isExpanded && item.description && (
                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
