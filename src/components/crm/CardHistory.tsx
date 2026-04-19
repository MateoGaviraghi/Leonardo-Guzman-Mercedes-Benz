"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Plus,
  ArrowRightLeft,
  Pencil,
  Zap,
  User as UserIcon,
  Loader2,
  Inbox,
} from "lucide-react";
import type { CrmCardHistoryEntry, HistoryAction } from "@/types/crm";
import {
  historyDayKey,
  historyDayLabel,
  relativeTime,
} from "@/lib/crm/date-logic";

type Props = {
  cardId: string;
};

const ACTION_ICON: Record<HistoryAction, React.ReactNode> = {
  created: <Plus className="w-4 h-4" aria-hidden="true" />,
  moved_column: <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />,
  moved_zone: <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />,
  field_updated: <Pencil className="w-4 h-4" aria-hidden="true" />,
  note_added: <Pencil className="w-4 h-4" aria-hidden="true" />,
  auto_moved_by_date: <Zap className="w-4 h-4" aria-hidden="true" />,
};

const ACTION_ACCENT: Record<HistoryAction, string> = {
  created: "bg-emerald-100 text-emerald-700 border-emerald-200",
  moved_column: "bg-blue-100 text-blue-700 border-blue-200",
  moved_zone: "bg-slate-200 text-slate-800 border-slate-300",
  field_updated: "bg-slate-100 text-slate-700 border-slate-200",
  note_added: "bg-slate-100 text-slate-700 border-slate-200",
  auto_moved_by_date: "bg-amber-100 text-amber-700 border-amber-200",
};

type DayGroup = {
  key: string;
  label: string;
  entries: CrmCardHistoryEntry[];
};

function formatFullTime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} · ${hh}:${mi}`;
}

export function CardHistory({ cardId }: Props) {
  const [entries, setEntries] = useState<CrmCardHistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setError(null);
    fetch(`/api/crm/cards/${cardId}/history`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.history)) {
          setEntries(data.history);
        } else {
          setError(data?.error ?? "No se pudo cargar el historial");
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Error desconocido");
      });
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const groups = useMemo<DayGroup[]>(() => {
    if (!entries) return [];
    const map = new Map<string, CrmCardHistoryEntry[]>();
    for (const e of entries) {
      const key = historyDayKey(e.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).map(([key, list]) => ({
      key,
      label: historyDayLabel(key),
      entries: list,
    }));
  }, [entries]);

  if (error) {
    return (
      <div className="p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded">
        {error}
      </div>
    );
  }

  if (entries === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        <span className="text-sm">Cargando historial...</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12 text-slate-500">
        <Inbox className="w-10 h-10 text-slate-300 mb-3" aria-hidden="true" />
        <p className="text-sm font-medium">Sin movimientos todavía</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Los cambios que hagas acá van a aparecer como una línea de tiempo,
          agrupada por día.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.02 },
        },
      }}
      className="space-y-6"
    >
      {groups.map((g) => (
        <section key={g.key} aria-label={g.label}>
          <header className="sticky top-0 z-[1] -mx-5 md:-mx-6 px-5 md:px-6 py-1.5 bg-white/95 backdrop-blur-sm border-b border-slate-100 mb-3 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {g.label}
            </span>
            <span className="text-xs text-slate-400 tabular-nums">
              · {g.entries.length}{" "}
              {g.entries.length === 1 ? "cambio" : "cambios"}
            </span>
          </header>

          <ol className="relative border-l-2 border-slate-200 pl-5 space-y-4">
            {g.entries.map((e) => (
              <motion.li
                key={e.id}
                variants={{
                  hidden: { opacity: 0, x: -8 },
                  show: { opacity: 1, x: 0 },
                }}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "absolute -left-[30px] top-0.5 flex items-center justify-center w-8 h-8 rounded-full border-2",
                    ACTION_ACCENT[e.action_type],
                  ].join(" ")}
                >
                  {ACTION_ICON[e.action_type]}
                </span>
                <p className="text-sm text-slate-900 font-medium leading-snug">
                  {e.description}
                </p>
                <div className="mt-1 flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span
                    className="inline-flex items-center gap-1"
                    title={formatFullTime(e.created_at)}
                  >
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {relativeTime(e.created_at)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <UserIcon className="w-3 h-3" aria-hidden="true" />
                    {e.user_email ?? "sistema"}
                  </span>
                </div>
              </motion.li>
            ))}
          </ol>
        </section>
      ))}
    </motion.div>
  );
}
