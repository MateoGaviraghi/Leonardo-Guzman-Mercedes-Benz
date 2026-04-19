"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MapPin,
  Loader2,
  EyeOff,
  Eye,
  Pencil,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { CrmZona } from "@/types/crm";
import { useToast } from "./Toast";

type Props = {
  initialZonas: CrmZona[];
};

export function ZonasAdmin({ initialZonas }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [zonas, setZonas] = useState<CrmZona[]>(initialZonas);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/crm/zonas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setZonas((prev) => [...prev, data.zona].sort((a, b) =>
        a.name.localeCompare(b.name)
      ));
      setNewName("");
      setCreating(false);
      toast.success("Zona creada", `La zona ${name} ya está disponible`);
      router.refresh();
    } catch (err) {
      toast.error(
        "No se pudo crear la zona",
        err instanceof Error ? err.message : "Intentá con otro nombre"
      );
    } finally {
      setSaving(false);
    }
  };

  const saveRename = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/zonas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setZonas((prev) =>
        prev.map((z) => (z.id === id ? { ...z, name } : z))
      );
      setEditingId(null);
      toast.success("Zona renombrada");
      router.refresh();
    } catch (err) {
      toast.error(
        "No se pudo renombrar",
        err instanceof Error ? err.message : "Intentá de nuevo"
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (zona: CrmZona) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/zonas/${zona.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !zona.is_active }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setZonas((prev) =>
        prev.map((z) =>
          z.id === zona.id ? { ...z, is_active: !z.is_active } : z
        )
      );
      toast.success(
        zona.is_active
          ? `Zona "${zona.name}" desactivada`
          : `Zona "${zona.name}" reactivada`
      );
      router.refresh();
    } catch (err) {
      toast.error(
        "Error",
        err instanceof Error ? err.message : "No se pudo cambiar el estado"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Crear nueva */}
      {!creating ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] text-base font-semibold text-slate-700 bg-white border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Agregar nueva zona
        </button>
      ) : (
        <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm">
          <label
            htmlFor="new-zona-name"
            className="block text-base font-semibold text-slate-800 mb-2"
          >
            Nombre de la zona
          </label>
          <input
            id="new-zona-name"
            type="text"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") create();
              if (e.key === "Escape") {
                setCreating(false);
                setNewName("");
              }
            }}
            placeholder="Ej: Sunchales, Rafaela, Santa Fe..."
            className="w-full px-3 py-3 min-h-[48px] text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            La URL se genera automáticamente (ej: &ldquo;Santa Fe&rdquo; →{" "}
            <code className="bg-slate-100 px-1 rounded">/crm/santa-fe</code>).
          </p>
          <div className="flex gap-2 mt-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setNewName("");
              }}
              disabled={saving}
              className="inline-flex items-center px-4 py-2.5 min-h-[44px] text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={create}
              disabled={saving || !newName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Crear zona
            </button>
          </div>
        </div>
      )}

      {/* Listado */}
      {zonas.length === 0 ? (
        <p className="text-center text-slate-500 py-8">
          Todavía no tenés zonas. Creá la primera arriba.
        </p>
      ) : (
        <ul className="space-y-2">
          {zonas.map((z) => {
            const isEditing = editingId === z.id;
            return (
              <li
                key={z.id}
                className={[
                  "bg-white border-2 rounded-lg px-4 py-3 shadow-sm transition-colors",
                  z.is_active
                    ? "border-slate-200"
                    : "border-slate-200 bg-slate-50 opacity-70",
                ].join(" ")}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex-shrink-0">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                  </span>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename(z.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-full px-2 py-2 text-base bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200"
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-900 truncate">
                          {z.name}
                          {!z.is_active && (
                            <span className="ml-2 text-xs font-medium text-slate-500">
                              (desactivada)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          <code className="bg-slate-100 px-1 rounded">
                            /crm/{z.slug}
                          </code>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveRename(z.id)}
                          disabled={saving}
                          title="Guardar cambios"
                          className="p-2 min-h-[40px] min-w-[40px] text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
                        >
                          <Check className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          title="Cancelar"
                          className="p-2 min-h-[40px] min-w-[40px] text-slate-500 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </>
                    ) : (
                      <>
                        {z.is_active && (
                          <Link
                            href={`/crm/${z.slug}/pizarron`}
                            title="Ir al pizarrón de esta zona"
                            className="p-2 min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-slate-600 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
                          >
                            <ExternalLink
                              className="w-4 h-4"
                              aria-hidden="true"
                            />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(z.id);
                            setEditingName(z.name);
                          }}
                          title="Renombrar"
                          className="p-2 min-h-[40px] min-w-[40px] text-slate-600 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(z)}
                          disabled={saving}
                          title={
                            z.is_active
                              ? "Desactivar (no aparece en el selector)"
                              : "Reactivar"
                          }
                          className="p-2 min-h-[40px] min-w-[40px] text-slate-600 bg-slate-50 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                          {z.is_active ? (
                            <EyeOff
                              className="w-4 h-4"
                              aria-hidden="true"
                            />
                          ) : (
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
