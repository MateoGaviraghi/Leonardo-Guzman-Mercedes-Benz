"use client";

import { useState } from "react";
import type { Vehicle } from "@/data/vehicles";
import { normalizeVehicleJson } from "@/lib/vehicles/import-json";

type Props = {
  onImport: (data: Partial<Vehicle>) => void;
};

/**
 * Bloque colapsable arriba de los formularios de admin (`/admin/nuevo`,
 * `/admin/editar/:id`, sus equivalentes de camión) que permite pegar un JSON
 * con la información del vehículo y popular el form de un saque, sin tener
 * que llenar 200 campos a mano.
 *
 * El JSON puede venir en snake_case (shape DB) o camelCase (shape frontend);
 * `normalizeVehicleJson` se encarga de unificar.
 *
 * El merge es por encima del formData actual: campos no presentes en el JSON
 * se preservan. Útil para llenar el grueso con un JSON y después editar los
 * detalles puntuales en la UI.
 */
export default function JsonImport({ onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    message: string;
  } | null>(null);

  function handleLoad() {
    try {
      const result = normalizeVehicleJson(raw);
      onImport(result.data);
      const warningTail =
        result.warnings.length > 0
          ? ` Avisos: ${result.warnings.join(", ")}.`
          : "";
      setFeedback({
        kind: "ok",
        message: `Cargados ${result.fieldsLoaded} campos al formulario.${warningTail}`,
      });
    } catch (e) {
      setFeedback({
        kind: "err",
        message: e instanceof Error ? e.message : "Error desconocido",
      });
    }
  }

  function handleClear() {
    setRaw("");
    setFeedback(null);
  }

  return (
    <section className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{open ? "▾" : "▸"}</span>
          <span>📋 Importar desde JSON (acelera la carga)</span>
        </span>
        <span className="text-xs font-normal text-blue-700">
          Pegá un JSON con los datos del vehículo y se autocompleta el formulario
        </span>
      </button>

      {open && (
        <div className="p-5 space-y-3 bg-white border-t border-blue-200">
          <div className="text-xs text-gray-600 leading-relaxed">
            <p>
              Acepta tanto <strong>snake_case</strong> (formato DB) como{" "}
              <strong>camelCase</strong> (formato frontend). Los campos del JSON
              sobreescriben los del formulario; el resto se mantiene.
            </p>
            <p className="mt-1">
              Para descripciones con bullets usá una línea por item con{" "}
              <code className="bg-gray-100 px-1 rounded">* item</code> o{" "}
              <code className="bg-gray-100 px-1 rounded">- item</code>.
            </p>
          </div>

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
            placeholder='{\n  "name": "Sprinter Furgón Mixto",\n  "category": "sprinter",\n  "aspecto_1_valor": "Hasta 4100 kg",\n  ...\n}'
            spellCheck={false}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleLoad}
              disabled={!raw.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cargar al formulario
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!raw && !feedback}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Limpiar
            </button>
            {feedback && (
              <p
                role={feedback.kind === "err" ? "alert" : "status"}
                className={`text-sm ${
                  feedback.kind === "ok"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {feedback.kind === "ok" ? "✓" : "✗"} {feedback.message}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
