"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  PhoneCall,
  MapPin,
} from "lucide-react";
import type { CrmCard } from "@/types/crm";
import { COLUMN_COLORS, CONTACT_KIND_LABELS } from "@/lib/crm/constants";
import { daysOverdue, isOverdue, relativeDateLabel } from "@/lib/crm/date-logic";

/**
 * Card compacta estilo Trello / Asana — horizontal, densa, clickable en
 * cualquier parte. Click abre el drawer de detalle (donde se edita todo y
 * se hacen acciones como Avanzar, Vendido, Dar de baja). Draggable desde
 * cualquier punto de la card (no hace falta un "handle").
 */

type Props = {
  card: CrmCard;
  /** Llamado al click sobre la card (no se dispara durante un drag). */
  onOpen?: (id: string) => void;
  /** Si true, la card se puede arrastrar (desktop pizarrón). */
  draggable?: boolean;
  /** Si true, estamos renderizando dentro de <DragOverlay> → no useDraggable. */
  isOverlay?: boolean;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function CrmCardItem({
  card,
  onOpen,
  draggable = false,
  isOverlay = false,
}: Props) {
  // useDraggable debe llamarse siempre con el mismo shape (Rules of Hooks).
  // Cuando draggable=false se pasa `disabled: true` y el hook queda no-op.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    data: { card },
    disabled: !draggable || isOverlay,
  });

  const overdue = isOverdue(card.next_contact_at);
  const overdueD = daysOverdue(card.next_contact_at);
  const colors = COLUMN_COLORS[card.current_column];

  const productsText =
    card.products.length > 0 ? card.products.map((p) => p.name).join(" · ") : null;
  const interestsText =
    card.interests.length > 0 ? card.interests.map((i) => i.name).join(" · ") : null;

  const handleClick = () => {
    if (isDragging) return; // drag en curso, no disparar click
    onOpen?.(card.id);
  };

  return (
    <article
      ref={isOverlay ? undefined : setNodeRef}
      {...(draggable && !isOverlay ? attributes : {})}
      {...(draggable && !isOverlay ? listeners : {})}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${card.client_name}`}
      className={[
        "relative bg-white rounded-lg border-l-4 p-3 shadow-sm transition-colors select-none",
        "hover:border-slate-300 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1",
        overdue ? "border-l-red-500 border-y border-r border-red-200" : "border-y border-r border-slate-200",
        overdue ? "" : `border-l-4 ${colors.accent.replace("bg-", "border-l-")}`,
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && !isOverlay && "opacity-0",
        isOverlay && "shadow-2xl ring-2 ring-slate-400 rotate-1",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Línea 1: Nombre + chips derechos */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-base font-bold text-slate-900 leading-tight truncate flex-1 min-w-0">
          {card.client_name}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {card.contact_kind && (
            <span
              className={[
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                card.contact_kind === "llamada"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-teal-100 text-teal-800",
              ].join(" ")}
              title={CONTACT_KIND_LABELS[card.contact_kind]}
            >
              {card.contact_kind === "llamada" ? (
                <PhoneCall className="w-2.5 h-2.5" aria-hidden="true" />
              ) : (
                <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
              )}
              {CONTACT_KIND_LABELS[card.contact_kind]}
            </span>
          )}
          {overdue && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800"
              title={`Vencida hace ${overdueD} ${overdueD === 1 ? "día" : "días"}`}
            >
              <AlertTriangle className="w-2.5 h-2.5" aria-hidden="true" />
              Vencida
            </span>
          )}
        </div>
      </div>

      {/* Línea 2: Contacto (teléfono + email) */}
      {(card.client_phone || card.client_email) && (
        <div className="flex items-center gap-3 text-xs text-slate-600 mb-1 flex-wrap">
          {card.client_phone && (
            <a
              href={`tel:${card.client_phone}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 hover:text-slate-900 hover:underline"
            >
              <Phone className="w-3 h-3 text-slate-400" aria-hidden="true" />
              {card.client_phone}
            </a>
          )}
          {card.client_email && (
            <span
              className="inline-flex items-center gap-1 truncate max-w-[180px]"
              title={card.client_email}
            >
              <Mail className="w-3 h-3 text-slate-400" aria-hidden="true" />
              <span className="truncate">{card.client_email}</span>
            </span>
          )}
        </div>
      )}

      {/* Línea 3: Producto/interés + Fecha */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="min-w-0 flex-1">
          {productsText && (
            <span className="font-semibold text-slate-800 truncate block">
              {productsText}
            </span>
          )}
          {interestsText && (
            <span className="text-slate-500 truncate block">{interestsText}</span>
          )}
        </div>
        <span
          className={[
            "inline-flex items-center gap-1 flex-shrink-0 font-semibold whitespace-nowrap",
            overdue ? "text-red-700" : "text-slate-700",
          ].join(" ")}
          title={
            card.next_contact_at
              ? `Fecha: ${formatDate(card.next_contact_at)}`
              : "Sin fecha"
          }
        >
          <Calendar className="w-3 h-3" aria-hidden="true" />
          {card.next_contact_at
            ? relativeDateLabel(card.next_contact_at)
            : "Sin fecha"}
        </span>
      </div>

      {/* Column dot (barra vertical a la izquierda) — usamos border-l-4 + accent */}
      {!overdue && (
        <span
          aria-hidden="true"
          className={[
            "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
            colors.accent,
          ].join(" ")}
        />
      )}
    </article>
  );
}
