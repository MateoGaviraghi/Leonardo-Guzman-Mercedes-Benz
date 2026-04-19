"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  Trash2,
  AlertCircle,
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  StickyNote,
  MoveRight,
  PhoneCall,
  MapPin,
  Trophy,
  CalendarClock,
  X,
  ArrowRight,
} from "lucide-react";
import { useToast } from "./Toast";
import { MultiSelectChips } from "./MultiSelectChips";
import { apiMoveCard } from "@/lib/crm/client-api";
import { todayIsoDate } from "@/lib/crm/date-logic";
import type {
  CardColumn,
  CardZone,
  ContactKind,
  CrmCard,
  CrmInterest,
  CrmProduct,
} from "@/types/crm";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  zonaId: string;
  initialColumn?: CardColumn;
  card?: CrmCard;
  products: CrmProduct[];
  interests: CrmInterest[];
  onSaved: () => void;
  onClosed: () => void;
};

export function CardForm({
  mode,
  zonaId,
  initialColumn,
  card,
  products,
  interests,
  onSaved,
  onClosed,
}: Props) {
  const router = useRouter();
  const toast = useToast();

  const initialValues = buildInitialValues(card, initialColumn);
  const [form, setForm] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(buildInitialValues(card, initialColumn));
  }, [card, initialColumn]);

  // Productos ordenados: autos → vans → trucks → otros (alfabético dentro de cada)
  const sortedProducts = useMemo(() => {
    const order: Record<string, number> = {
      auto: 0,
      van: 1,
      truck: 2,
      otros: 3,
    };
    return [...products].sort((a, b) => {
      const ka = order[a.kind] ?? 99;
      const kb = order[b.kind] ?? 99;
      if (ka !== kb) return ka - kb;
      return a.name.localeCompare(b.name);
    });
  }, [products]);

  const isCreating = mode === "create";

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.client_name.trim()) {
      setError("El nombre del cliente es obligatorio");
      return;
    }

    setSaving(true);

    const payload = {
      zona_id: zonaId,
      client_name: form.client_name.trim(),
      client_phone: form.client_phone.trim() || null,
      client_email: form.client_email.trim() || null,
      current_column: form.current_column,
      current_zone: columnToZone(form.current_column),
      contact_kind: form.contact_kind,
      next_contact_at: form.next_contact_at || null,
      notes: form.notes.trim() || null,
      product_details: form.product_details.trim() || null,
      product_ids: form.product_ids,
      interest_ids: form.interest_ids,
    };

    try {
      const url = isCreating
        ? "/api/crm/cards"
        : `/api/crm/cards/${card!.id}`;
      const method = isCreating ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "No se pudo guardar");
      }
      toast.success(
        isCreating ? "Cliente creado correctamente" : "Cambios guardados"
      );
      router.refresh();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error(
        "No se pudo guardar",
        err instanceof Error ? err.message : "Intentá de nuevo en un momento"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    const ok = window.confirm(
      `¿Seguro que querés eliminar la tarjeta de ${card.client_name}?\n\nEsta acción no se puede deshacer.`
    );
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/crm/cards/${card.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "No se pudo eliminar");
      }
      toast.success("Tarjeta eliminada");
      router.refresh();
      onClosed();
    } catch (err) {
      toast.error(
        "No se pudo eliminar",
        err instanceof Error ? err.message : "Intentá de nuevo"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Acciones de cierre de operación
  // -------------------------------
  //  - VENTA          → zona Ventas (marca sold_at=hoy en el server)
  //  - POSTERGAR      → pide una fecha; si está a más de 20 días → Agenda,
  //                     si está a 20 días o menos → Contacto del pizarrón
  const POSTPONE_THRESHOLD_DAYS = 20;

  const [actionLoading, setActionLoading] = useState<"venta" | "postponer" | null>(
    null
  );
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [postponeDate, setPostponeDate] = useState<string>("");

  const handleMarkSold = async () => {
    if (!card) return;
    setActionLoading("venta");
    try {
      await apiMoveCard(card.id, {
        to_column: "ventas",
        to_zone: "ventas",
        reason: `Venta cerrada desde ${card.current_column}`,
      });
      toast.success(`¡Venta cerrada con ${card.client_name}!`);
      router.refresh();
      onClosed();
    } catch (err) {
      toast.error(
        "No se pudo registrar la venta",
        err instanceof Error ? err.message : "Intentá de nuevo"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePostpone = async () => {
    if (!card || !postponeDate) return;

    // Calcular días entre hoy (ART) y la fecha elegida
    const today = new Date(todayIsoDate());
    const target = new Date(postponeDate);
    const diffDays = Math.round(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      toast.error(
        "Fecha inválida",
        "No podés postergar a una fecha que ya pasó"
      );
      return;
    }

    // Regla: > 20 días → Agenda. <= 20 días → Contacto (vuelve al pizarrón)
    const goesToAgenda = diffDays > POSTPONE_THRESHOLD_DAYS;
    const toColumn = goesToAgenda ? "agenda" : "contacto";
    const toZone = goesToAgenda ? "agenda" : "pizarron";
    const destinoLabel = goesToAgenda ? "Agenda" : "Contacto (pizarrón)";

    setActionLoading("postponer");
    try {
      await apiMoveCard(card.id, {
        to_column: toColumn,
        to_zone: toZone,
        next_contact_at: postponeDate,
        reason: `Postergado ${diffDays} ${
          diffDays === 1 ? "día" : "días"
        } → ${destinoLabel}`,
      });
      toast.success(
        `${card.client_name} postergado a ${formatDMY(postponeDate)}`,
        goesToAgenda
          ? "Más de 20 días → pasó a Agenda"
          : "Hasta 20 días → volvió a Contacto"
      );
      router.refresh();
      onClosed();
    } catch (err) {
      toast.error(
        "No se pudo postergar",
        err instanceof Error ? err.message : "Intentá de nuevo"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 md:px-6 py-5 space-y-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-900"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Sección: Cliente */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
            Datos del cliente
          </h3>
          <div className="space-y-4">
            <Field
              id="client_name"
              label="Nombre y apellido"
              required
              icon={<UserIcon className="w-4 h-4" aria-hidden="true" />}
            >
              <input
                id="client_name"
                type="text"
                required
                value={form.client_name}
                onChange={(e) => setField("client_name", e.target.value)}
                placeholder="Ej: Juan Pérez"
                autoFocus={isCreating}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                id="client_phone"
                label="Teléfono"
                icon={<Phone className="w-4 h-4" aria-hidden="true" />}
              >
                <input
                  id="client_phone"
                  type="tel"
                  value={form.client_phone}
                  onChange={(e) => setField("client_phone", e.target.value)}
                  placeholder="11-5555-1234"
                  className={inputClass}
                />
              </Field>

              <Field
                id="client_email"
                label="Email"
                icon={<Mail className="w-4 h-4" aria-hidden="true" />}
              >
                <input
                  id="client_email"
                  type="email"
                  value={form.client_email}
                  onChange={(e) => setField("client_email", e.target.value)}
                  placeholder="cliente@email.com"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Sección: Productos e intereses */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
            Qué le interesa al cliente
          </h3>
          <div className="space-y-4">
            <MultiSelectChips
              label="Productos"
              placeholder="Elegí uno o más modelos..."
              options={sortedProducts}
              value={form.product_ids}
              onChange={(v) => setField("product_ids", v)}
              helpText="Mercedes-Benz específico que le interesa al cliente."
            />

            <Field
              id="product_details"
              label="Detalle del modelo"
              icon={<StickyNote className="w-4 h-4" aria-hidden="true" />}
              help='Escribí la versión exacta si hace falta. Ej: "Atego 1725", "Sprinter 515 Furgón", "Clase A 200 AMG Line".'
            >
              <input
                id="product_details"
                type="text"
                value={form.product_details}
                onChange={(e) => setField("product_details", e.target.value)}
                placeholder="Ej: Atego 1725, Sprinter 515, Clase A 200..."
                className={inputClass}
              />
            </Field>

            <MultiSelectChips
              label="Tipo de interés"
              placeholder="Elegí una o más categorías..."
              options={interests}
              value={form.interest_ids}
              onChange={(v) => setField("interest_ids", v)}
              helpText="Categoría del vehículo (utilitarios, livianos, etc.)."
            />
          </div>
        </section>

        {/* Sección: Fecha */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
            Fecha
          </h3>
          <Field
            id="next_contact_at"
            label="Fecha"
            icon={<Calendar className="w-4 h-4" aria-hidden="true" />}
            help="Si ya pasó, la tarjeta aparece marcada en rojo (vencida)."
          >
            <input
              id="next_contact_at"
              type="date"
              value={form.next_contact_at}
              onChange={(e) => setField("next_contact_at", e.target.value)}
              className={inputClass}
            />
          </Field>
        </section>

        {/* Sección: Estado */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
            Estado en el CRM
          </h3>
          <Field
            id="current_column"
            label="Columna / zona"
            icon={<MoveRight className="w-4 h-4" aria-hidden="true" />}
            help="Cambialo para mover la tarjeta a otra etapa o zona."
          >
            <select
              id="current_column"
              value={form.current_column}
              onChange={(e) =>
                setField("current_column", e.target.value as CardColumn)
              }
              className={inputClass}
            >
              <optgroup label="Pizarrón">
                <option value="contacto">Contacto</option>
                <option value="llamada_visita">Llamada / Visita</option>
                <option value="cotizar">Cotizar</option>
                <option value="seguimiento">Seguimiento</option>
              </optgroup>
              <optgroup label="Otras zonas">
                <option value="agenda">Agenda</option>
                <option value="ventas">Ventas</option>
              </optgroup>
            </select>
          </Field>

          {/* Toggle Llamada vs Visita — prominente si la columna es Llamada/Visita,
              también visible siempre (por si la tarjeta se originó en otra etapa). */}
          {form.current_column === "llamada_visita" && (
            <div className="mt-4">
              <ContactKindToggle
                value={form.contact_kind}
                onChange={(v) => setField("contact_kind", v)}
                prominent
              />
            </div>
          )}
        </section>

        {/* Sección: Notas */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
            Notas
          </h3>
          <Field
            id="notes"
            label="Observaciones libres"
            icon={<StickyNote className="w-4 h-4" aria-hidden="true" />}
          >
            <textarea
              id="notes"
              rows={4}
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Lo que necesites recordar sobre este cliente..."
              className={inputClass + " resize-y"}
            />
          </Field>
        </section>
      </div>

      {/* Acciones rápidas de cierre — solo en modo edit */}
      {!isCreating && card && (
        <div className="px-5 md:px-6 pb-3 pt-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            Cerrar operación
          </p>

          {/* Vista 1: dos botones principales (Venta / Postergar) */}
          {!postponeOpen && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleMarkSold}
                disabled={actionLoading !== null || saving || deleting}
                title="Registrar venta — la tarjeta se mueve a la zona Ventas"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3 min-h-[48px] text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1"
              >
                {actionLoading === "venta" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trophy className="w-4 h-4" aria-hidden="true" />
                )}
                Venta
              </button>
              <button
                type="button"
                onClick={() => {
                  setPostponeOpen(true);
                  setPostponeDate("");
                }}
                disabled={actionLoading !== null || saving || deleting}
                title="Postergar al cliente — elegí una fecha futura"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3 min-h-[48px] text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1"
              >
                <CalendarClock className="w-4 h-4" aria-hidden="true" />
                Postergar cliente
              </button>
            </div>
          )}

          {/* Vista 2: date picker inline con explicación de la regla */}
          {postponeOpen && (
            <div className="bg-white border-2 border-amber-300 rounded-lg p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Postergar a:
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-xs">
                    Si la fecha está a <strong>más de 20 días</strong>, la
                    tarjeta pasa a <strong>Agenda</strong>. Si está a{" "}
                    <strong>20 días o menos</strong>, vuelve a{" "}
                    <strong>Contacto</strong> del pizarrón.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPostponeOpen(false)}
                  aria-label="Cancelar"
                  disabled={actionLoading !== null}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="date"
                value={postponeDate}
                onChange={(e) => setPostponeDate(e.target.value)}
                min={todayIsoDate()}
                autoFocus
                className="w-full px-3 py-2.5 min-h-[44px] text-base bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-colors"
              />

              {/* Preview del destino según regla */}
              {postponeDate &&
                (() => {
                  const today = new Date(todayIsoDate());
                  const target = new Date(postponeDate);
                  const diff = Math.round(
                    (target.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  if (diff < 0) {
                    return (
                      <p className="text-xs text-red-700 font-semibold">
                        ⚠ Esa fecha ya pasó
                      </p>
                    );
                  }
                  const destino =
                    diff > POSTPONE_THRESHOLD_DAYS ? "Agenda" : "Contacto";
                  return (
                    <p className="text-xs text-slate-700 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold">
                        En {diff} {diff === 1 ? "día" : "días"}
                      </span>
                      <ArrowRight
                        className="w-3 h-3 text-slate-400"
                        aria-hidden="true"
                      />
                      <span className="font-bold text-slate-900">
                        {destino}
                      </span>
                    </p>
                  );
                })()}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setPostponeOpen(false)}
                  disabled={actionLoading !== null}
                  className="inline-flex items-center px-3 py-2 min-h-[40px] text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePostpone}
                  disabled={
                    actionLoading !== null ||
                    !postponeDate ||
                    new Date(postponeDate) < new Date(todayIsoDate())
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === "postponer" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CalendarClock className="w-4 h-4" aria-hidden="true" />
                  )}
                  Confirmar postergación
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer sticky con acciones */}
      <div className="flex items-center gap-3 px-5 md:px-6 py-4 border-t border-slate-200 bg-white">
        {!isCreating && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            title="Eliminar esta tarjeta de forma permanente"
            className="inline-flex items-center gap-2 px-4 py-3 min-h-[48px] text-sm font-semibold text-red-700 bg-white border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={onClosed}
          disabled={saving || deleting}
          className="inline-flex items-center px-4 py-3 min-h-[48px] text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={saving || deleting}
          className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] text-base font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors disabled:opacity-50 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isCreating ? "Crear cliente" : "Guardar cambios"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ----- helpers -----------------------------------------------------------

const inputClass =
  "w-full px-3 py-3 min-h-[48px] text-base bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-colors disabled:bg-slate-50 disabled:text-slate-500";

function Field({
  id,
  label,
  icon,
  required,
  help,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-base font-semibold text-slate-800 mb-2"
      >
        {icon && <span className="text-slate-500">{icon}</span>}
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {help && <p className="text-xs text-slate-500 mt-1.5">{help}</p>}
    </div>
  );
}

function columnToZone(col: CardColumn): CardZone {
  if (col === "agenda") return "agenda";
  if (col === "ventas") return "ventas";
  return "pizarron";
}

function formatDMY(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function buildInitialValues(card: CrmCard | undefined, initialColumn?: CardColumn) {
  return {
    client_name: card?.client_name ?? "",
    client_phone: card?.client_phone ?? "",
    client_email: card?.client_email ?? "",
    current_column:
      card?.current_column ?? initialColumn ?? ("contacto" as CardColumn),
    contact_kind: (card?.contact_kind ?? null) as ContactKind | null,
    next_contact_at: card?.next_contact_at ?? "",
    notes: card?.notes ?? "",
    product_details: card?.product_details ?? "",
    product_ids: card?.products.map((p) => p.id) ?? [],
    interest_ids: card?.interests.map((i) => i.id) ?? [],
  };
}

function ContactKindToggle({
  value,
  onChange,
  prominent,
}: {
  value: ContactKind | null;
  onChange: (v: ContactKind | null) => void;
  prominent?: boolean;
}) {
  return (
    <div>
      <label className="block text-base font-semibold text-slate-800 mb-2">
        ¿Cómo se hizo el contacto?
        {prominent && (
          <span className="ml-2 text-xs font-normal text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-2 py-0.5 align-middle">
            Importante
          </span>
        )}
      </label>
      <div
        role="radiogroup"
        aria-label="Tipo de contacto"
        className="grid grid-cols-2 gap-2"
      >
        <KindOption
          icon={<PhoneCall className="w-5 h-5" aria-hidden="true" />}
          label="Llamada"
          checked={value === "llamada"}
          onSelect={() => onChange("llamada")}
        />
        <KindOption
          icon={<MapPin className="w-5 h-5" aria-hidden="true" />}
          label="Visita"
          checked={value === "visita"}
          onSelect={() => onChange("visita")}
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 text-xs text-slate-500 hover:text-slate-800 underline"
        >
          Limpiar selección
        </button>
      )}
    </div>
  );
}

function KindOption({
  icon,
  label,
  checked,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={[
        "flex items-center gap-3 px-4 py-3 min-h-[56px] rounded-lg border-2 cursor-pointer transition-all",
        checked
          ? "border-slate-900 bg-slate-50 shadow-sm text-slate-900"
          : "border-slate-200 hover:border-slate-300 text-slate-700",
      ].join(" ")}
    >
      <input
        type="radio"
        name="contact-kind"
        value={label}
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={[
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
          checked
            ? "border-slate-900 bg-slate-900"
            : "border-slate-300 bg-white",
        ].join(" ")}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-white" />}
      </span>
      <span className="text-slate-500">{icon}</span>
      <span className="text-base font-semibold flex-1">{label}</span>
    </label>
  );
}

