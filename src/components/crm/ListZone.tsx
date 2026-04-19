"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Undo2,
} from "lucide-react";
import type { CardZone, CrmCard, CrmZona } from "@/types/crm";
import { CrmCardItem } from "./Card";
import { EmptyState } from "./EmptyState";
import { ReturnToBoardModal } from "./ReturnToBoardModal";
import { ActiveFiltersBanner } from "./ActiveFiltersBanner";

/**
 * Vista tipo calendario: 12 columnas (una por mes) + selector de año.
 *
 *   Agenda → agrupa por mes de `next_contact_at`
 *   Ventas → agrupa por mes de `sold_at`
 *
 * El año activo se pasa como `?anio=YYYY` para que sea shareable.
 * Las cards se muestran en la columna del mes que corresponde, sólo si
 * pertenecen al año seleccionado.
 */

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type Props = {
  cards: CrmCard[];
  zone: CardZone;
  zona: CrmZona;
};

function getDateField(c: CrmCard, zone: CardZone): string | null {
  if (zone === "agenda") return c.next_contact_at;
  if (zone === "ventas") return c.sold_at;
  return null;
}

export function ListZone({ cards, zone, zona }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").toLowerCase().trim();
  const currentYear = new Date().getFullYear();
  const yearParam = searchParams.get("anio");
  const year = yearParam ? Number(yearParam) : currentYear;

  const [returningCard, setReturningCard] = useState<CrmCard | null>(null);

  // Filtrado por búsqueda (sobre todas las cards, sin importar el año)
  const filtered = useMemo(() => {
    if (!query) return cards;
    return cards.filter((c) => {
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
  }, [cards, query]);

  // Agrupar por mes dentro del año seleccionado
  const { byMonth, cardsSinFecha, yearHasAnyCard, availableYears } =
    useMemo(() => {
      const map = new Map<number, CrmCard[]>();
      for (let m = 0; m < 12; m++) map.set(m, []);
      const sinFecha: CrmCard[] = [];
      const years = new Set<number>();
      let hasAnyCard = false;

      for (const c of filtered) {
        const iso = getDateField(c, zone);
        if (!iso) {
          sinFecha.push(c);
          continue;
        }
        const d = new Date(iso);
        const cardYear = d.getFullYear();
        years.add(cardYear);
        if (cardYear !== year) continue;
        hasAnyCard = true;
        const monthIdx = d.getMonth();
        map.get(monthIdx)!.push(c);
      }

      // Ordenar cards dentro del mes (ascendente para agenda, descendente para ventas)
      for (const [m, list] of map.entries()) {
        list.sort((a, b) => {
          const av = getDateField(a, zone) ?? "";
          const bv = getDateField(b, zone) ?? "";
          return zone === "agenda"
            ? av.localeCompare(bv)
            : bv.localeCompare(av);
        });
        map.set(m, list);
      }

      // Años visibles: los del dataset + el actual + el próximo
      years.add(currentYear);
      years.add(currentYear + 1);

      return {
        byMonth: map,
        cardsSinFecha: sinFecha,
        yearHasAnyCard: hasAnyCard,
        availableYears: Array.from(years).sort((a, b) => a - b),
      };
    }, [filtered, year, zone, currentYear]);

  const setYear = (y: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("anio", String(y));
    router.replace(
      `/crm/${zona.slug}/${zone}?${params.toString()}`,
      { scroll: false }
    );
  };

  const handleOpenCard = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("card", id);
    router.push(`/crm/${zona.slug}/${zone}?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleReturnToBoard = (card: CrmCard) => setReturningCard(card);

  // ---------- estados vacíos ----------

  if (cards.length === 0) {
    return (
      <EmptyState
        title={
          zone === "agenda"
            ? "No hay clientes agendados"
            : "Todavía no hay ventas cerradas"
        }
        description={
          zone === "agenda"
            ? "Desde el pizarrón podés postergar tarjetas para agendarlas. Aparecerán acá en el mes correspondiente a su próximo contacto."
            : "Cuando cierres una venta desde el drawer de una tarjeta, pasará automáticamente a Ventas y quedará en el mes en que se vendió."
        }
        action={
          zone === "agenda" ? (
            <a
              href={`/crm/${zona.slug}/pizarron`}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[48px] text-base font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <UserPlus className="w-5 h-5" aria-hidden="true" />
              Ir al pizarrón
            </a>
          ) : undefined
        }
      />
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        title="No hay tarjetas que coincidan"
        description={`Ningún cliente en ${
          zone === "agenda" ? "Agenda" : "Ventas"
        } coincide con "${query}". Probá con otro término.`}
      />
    );
  }

  return (
    <>
      <ActiveFiltersBanner
        filteredCount={filtered.length}
        totalCount={cards.length}
        paramsToClear={["q"]}
      />

      {/* Selector de año */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="inline-flex items-center gap-1 bg-white border-2 border-slate-300 rounded-lg shadow-sm">
          <button
            type="button"
            onClick={() => setYear(year - 1)}
            aria-label="Año anterior"
            title={`Ver ${year - 1}`}
            className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-l-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="px-4 min-h-[44px] min-w-[84px] flex items-center justify-center gap-2 border-x border-slate-200">
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {year}
            </span>
            {year === currentYear && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Actual
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setYear(year + 1)}
            aria-label="Año siguiente"
            title={`Ver ${year + 1}`}
            className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-r-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Salto rápido a años conocidos */}
        {availableYears.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {availableYears.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={[
                  "inline-flex items-center px-3 py-1.5 min-h-[36px] text-sm font-semibold rounded-full border transition-colors tabular-nums",
                  y === year
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Si en ese año no hay ninguna card, explicamos */}
      {!yearHasAnyCard && (
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-600">
            No hay tarjetas en{" "}
            {zone === "agenda" ? "Agenda" : "Ventas"} del año{" "}
            <strong className="text-slate-900">{year}</strong>. Probá con otro
            año.
          </p>
        </div>
      )}

      {/* Grid de 12 meses — 2 cols mobile / 3 tablet / 4 laptop / 6 XL / 12 en pantallas muy anchas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-3">
        {MONTHS.map((monthName, idx) => {
          const monthCards = byMonth.get(idx) ?? [];
          return (
            <MonthColumn
              key={idx}
              monthName={monthName}
              monthShort={MONTHS_SHORT[idx]}
              cards={monthCards}
              zone={zone}
              isCurrentMonth={
                year === currentYear && idx === new Date().getMonth()
              }
              onOpenCard={handleOpenCard}
              onReturn={handleReturnToBoard}
            />
          );
        })}
      </div>

      {/* Cards sin fecha (siempre abajo) */}
      {cardsSinFecha.length > 0 && (
        <section className="mt-6">
          <header className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Sin fecha</h2>
            <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tabular-nums">
              {cardsSinFecha.length}
            </span>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {cardsSinFecha.map((card) => (
              <CardWithReturn
                key={card.id}
                card={card}
                onOpenCard={handleOpenCard}
                onReturn={() => handleReturnToBoard(card)}
              />
            ))}
          </div>
        </section>
      )}

      <ReturnToBoardModal
        card={returningCard}
        originZone={zone}
        onClose={() => setReturningCard(null)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------

function MonthColumn({
  monthName,
  monthShort,
  cards,
  zone,
  isCurrentMonth,
  onOpenCard,
  onReturn,
}: {
  monthName: string;
  monthShort: string;
  cards: CrmCard[];
  zone: CardZone;
  isCurrentMonth: boolean;
  onOpenCard: (id: string) => void;
  onReturn: (card: CrmCard) => void;
}) {
  const hasCards = cards.length > 0;
  return (
    <section
      aria-label={monthName}
      className={[
        "flex flex-col rounded-xl border-2 bg-white",
        // Altura fija: header + espacio para ~2 tarjetas. A partir de la 3ra
        // tarjeta aparece scroll vertical dentro de la columna.
        "h-[340px]",
        isCurrentMonth ? "border-slate-900 shadow-sm" : "border-slate-200",
      ].join(" ")}
    >
      <header className="px-3 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-slate-100">
        <h3
          className={[
            "text-base font-bold leading-tight truncate",
            isCurrentMonth ? "text-slate-900" : "text-slate-700",
          ].join(" ")}
        >
          <span className="hidden xl:inline">{monthName}</span>
          <span className="xl:hidden">{monthShort}</span>
          {isCurrentMonth && (
            <span className="ml-2 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
              Hoy
            </span>
          )}
        </h3>
        <span
          className={[
            "inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-bold tabular-nums",
            hasCards
              ? zone === "ventas"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-700"
              : "bg-slate-50 text-slate-400",
          ].join(" ")}
        >
          {cards.length}
        </span>
      </header>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
        {!hasCards ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Sin tarjetas
          </div>
        ) : (
          cards.map((card) => (
            <CardWithReturn
              key={card.id}
              card={card}
              onOpenCard={onOpenCard}
              onReturn={() => onReturn(card)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function CardWithReturn({
  card,
  onOpenCard,
  onReturn,
}: {
  card: CrmCard;
  onOpenCard: (id: string) => void;
  onReturn: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <CrmCardItem card={card} onOpen={onOpenCard} />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReturn();
        }}
        title="Devolver esta tarjeta al pizarrón"
        className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 min-h-[32px] text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 hover:border-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
      >
        <Undo2 className="w-3 h-3" aria-hidden="true" />
        Regresar al pizarrón
      </button>
    </div>
  );
}
