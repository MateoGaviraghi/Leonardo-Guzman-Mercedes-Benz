"use client";

import { UserPlus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import type { CrmCard, CardColumn } from "@/types/crm";
import { COLUMN_COLORS, COLUMN_LABELS } from "@/lib/crm/constants";
import { CrmCardItem } from "./Card";
import { EmptyColumn } from "./EmptyState";

type Props = {
  column: CardColumn;
  cards: CrmCard[];
  onOpenCard: (id: string) => void;
  onAddCard: (column: CardColumn) => void;
  /** true → las cards usan useDraggable + la columna es dropzone */
  draggable?: boolean;
};

export function BoardColumn({
  column,
  cards,
  onOpenCard,
  onAddCard,
  draggable = false,
}: Props) {
  const colors = COLUMN_COLORS[column];
  const label = COLUMN_LABELS[column];

  const { setNodeRef, isOver } = useDroppable({
    id: `col:${column}`,
    data: { column },
    disabled: !draggable,
  });

  return (
    <section
      ref={setNodeRef}
      aria-label={`Columna ${label}`}
      className={[
        "flex flex-col min-h-[70vh] rounded-xl border-2 transition-colors",
        colors.bg,
        isOver
          ? "border-slate-900 ring-4 ring-slate-900/10"
          : colors.border,
      ].join(" ")}
    >
      {/* Header de columna */}
      <header className="px-3 pt-3 pb-3 flex items-center justify-between gap-2 border-b border-slate-200/60">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={[
              "w-2.5 h-2.5 rounded-full flex-shrink-0",
              colors.accent,
            ].join(" ")}
            aria-hidden="true"
          />
          <h2
            className={[
              "text-base sm:text-lg font-bold truncate leading-tight",
              colors.text,
            ].join(" ")}
          >
            {label}
          </h2>
          <span
            className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 tabular-nums flex-shrink-0"
            aria-label={`${cards.length} tarjetas en ${label}`}
          >
            {cards.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAddCard(column)}
          title={`Agregar un cliente en ${label}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:border-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 shadow-sm"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Agregar</span>
        </button>
      </header>

      {/* Cards */}
      <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto custom-scrollbar">
        {cards.length === 0 ? (
          <EmptyColumn columnLabel={label} />
        ) : (
          cards.map((card) => (
            <CrmCardItem
              key={card.id}
              card={card}
              onOpen={onOpenCard}
              draggable={draggable}
            />
          ))
        )}
      </div>
    </section>
  );
}
