"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { BOARD_COLUMNS } from "@/types/crm";
import type { CrmCard, CardColumn, CrmZona } from "@/types/crm";
import { COLUMN_LABELS } from "@/lib/crm/constants";
import { isOverdue } from "@/lib/crm/date-logic";
import { apiMoveCard } from "@/lib/crm/client-api";
import { BoardColumn } from "./BoardColumn";
import { CrmCardItem } from "./Card";
import { EmptyState } from "./EmptyState";
import { useToast } from "./Toast";
import { ActiveFiltersBanner } from "./ActiveFiltersBanner";
import { NextContactPrompt } from "./NextContactPrompt";

type Props = {
  cards: CrmCard[];
  zona: CrmZona;
};

export function Board({ cards: serverCards, zona }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const query = (searchParams.get("q") ?? "").toLowerCase().trim();
  const onlyOverdue = searchParams.get("vencidas") === "1";

  // Copia local para drag optimista — se sincroniza con serverCards cuando
  // este cambia (después de router.refresh o al montar).
  const [cards, setCards] = useState<CrmCard[]>(serverCards);
  useEffect(() => {
    setCards(serverCards);
  }, [serverCards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const [draggingCard, setDraggingCard] = useState<CrmCard | null>(null);

  // Tras cambiar de columna (drag o Avanzar), abrimos un prompt para que el
  // usuario actualice la fecha de próximo contacto. Si no quiere, puede saltar.
  const [datePrompt, setDatePrompt] = useState<{
    card: CrmCard;
    targetColumn: CardColumn;
  } | null>(null);

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (onlyOverdue && !isOverdue(c.next_contact_at)) return false;
      if (!query) return true;
      const haystack = [
        c.client_name,
        c.client_phone ?? "",
        c.client_email ?? "",
        ...c.products.map((p) => p.name),
        ...c.interests.map((i) => i.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [cards, query, onlyOverdue]);

  const byColumn = useMemo(() => {
    const map = new Map<CardColumn, CrmCard[]>();
    for (const col of BOARD_COLUMNS) map.set(col, []);
    for (const c of filtered) {
      if (map.has(c.current_column)) {
        map.get(c.current_column)!.push(c);
      }
    }
    return map;
  }, [filtered]);

  const base = `/crm/${zona.slug}/pizarron`;

  const handleOpenCard = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("card", id);
    router.push(`${base}?${params.toString()}`, { scroll: false });
  };

  const handleAddCard = (column: CardColumn) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("card", "nuevo");
    params.set("col", column);
    router.push(`${base}?${params.toString()}`, { scroll: false });
  };

  // -------- drag & drop (con update optimista) --------

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as CrmCard | undefined;
    if (card) setDraggingCard(card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggingCard(null);
    if (!over) return;

    const sourceCard = active.data.current?.card as CrmCard | undefined;
    const targetColumn = over.data.current?.column as CardColumn | undefined;
    if (!sourceCard || !targetColumn) return;
    if (sourceCard.current_column === targetColumn) return;

    // 1. Optimistic: actualizar UI inmediatamente (sin esperar al servidor).
    setCards((prev) =>
      prev.map((c) =>
        c.id === sourceCard.id ? { ...c, current_column: targetColumn } : c
      )
    );

    // 2. Llamada al API en background.
    try {
      await apiMoveCard(sourceCard.id, {
        to_column: targetColumn,
        to_zone: "pizarron",
        reason: "Arrastrado al tablero",
      });
      toast.success(
        `${sourceCard.client_name}: movido a ${COLUMN_LABELS[targetColumn]}`
      );
      router.refresh();
      // 3. Pedir al usuario que actualice la fecha de próximo contacto
      setDatePrompt({
        card: { ...sourceCard, current_column: targetColumn },
        targetColumn,
      });
    } catch (e) {
      // 3. Error → rollback local y toast.
      setCards((prev) =>
        prev.map((c) =>
          c.id === sourceCard.id
            ? { ...c, current_column: sourceCard.current_column }
            : c
        )
      );
      toast.error(
        "No se pudo mover la tarjeta",
        e instanceof Error ? e.message : "Intentá de nuevo"
      );
    }
  };

  // -------- estados vacíos --------

  if (serverCards.length === 0) {
    return (
      <EmptyState
        title={`Todavía no hay clientes en ${zona.name}`}
        description="Agregá tu primer cliente para empezar. Cada tarjeta representa a un interesado que movés entre las 4 etapas."
        action={
          <button
            type="button"
            onClick={() => handleAddCard("contacto")}
            className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] text-base font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <UserPlus className="w-5 h-5" aria-hidden="true" />
            Agregar primer cliente
          </button>
        }
      />
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        title="No hay tarjetas que coincidan"
        description={
          query
            ? `Ningún cliente coincide con "${query}".`
            : "No hay tarjetas vencidas en este momento."
        }
      />
    );
  }

  return (
    <div>
      <ActiveFiltersBanner
        filteredCount={filtered.length}
        totalCount={cards.length}
      />

      {/* Desktop: 4 columnas con DnD — grid que ocupa todo el ancho disponible */}
      <div className="hidden md:block">
        <DndContext
          id="crm-board"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingCard(null)}
        >
          <div className="grid grid-cols-4 gap-3 lg:gap-4">
            {BOARD_COLUMNS.map((col) => (
              <BoardColumn
                key={col}
                column={col}
                cards={byColumn.get(col) ?? []}
                onOpenCard={handleOpenCard}
                onAddCard={handleAddCard}
                draggable
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
            {draggingCard ? (
              <CrmCardItem card={draggingCard} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Mobile: tabs + columna activa */}
      <div className="md:hidden">
        <MobileBoard
          byColumn={byColumn}
          onOpenCard={handleOpenCard}
          onAddCard={handleAddCard}
        />
      </div>

      {/* Prompt de "¿cuándo es el próximo contacto?" tras mover una card */}
      <NextContactPrompt
        card={datePrompt?.card ?? null}
        targetColumn={datePrompt?.targetColumn ?? null}
        onClose={() => setDatePrompt(null)}
      />
    </div>
  );
}

// ============================================================
// Mobile: tabs horizontales + una columna activa a la vez
// ============================================================

function MobileBoard({
  byColumn,
  onOpenCard,
  onAddCard,
}: {
  byColumn: Map<CardColumn, CrmCard[]>;
  onOpenCard: (id: string) => void;
  onAddCard: (col: CardColumn) => void;
}) {
  const [active, setActive] = useState<CardColumn>(BOARD_COLUMNS[0]);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Etapas del cliente"
        className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-4 overflow-x-auto custom-scrollbar"
      >
        {BOARD_COLUMNS.map((col) => {
          const count = byColumn.get(col)?.length ?? 0;
          const isActive = col === active;
          return (
            <button
              key={col}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(col)}
              className={[
                "inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0",
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              <span>{COLUMN_LABELS[col]}</span>
              <span
                className={[
                  "inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-bold tabular-nums",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-700",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <BoardColumn
        column={active}
        cards={byColumn.get(active) ?? []}
        onOpenCard={onOpenCard}
        onAddCard={onAddCard}
        draggable={false}
      />
    </div>
  );
}
