"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Kanban, CalendarClock, Trophy } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  zonaSlug: string;
  counts: { pizarron: number; agenda: number; ventas: number };
};

type Subsection = {
  key: "pizarron" | "agenda" | "ventas";
  label: string;
  icon: ReactNode;
  help: string;
};

const SUBSECTIONS: Subsection[] = [
  {
    key: "pizarron",
    label: "Pizarrón",
    icon: <Kanban className="w-5 h-5" aria-hidden="true" />,
    help: "Clientes activos en proceso",
  },
  {
    key: "agenda",
    label: "Agenda",
    icon: <CalendarClock className="w-5 h-5" aria-hidden="true" />,
    help: "Próximos contactos programados",
  },
  {
    key: "ventas",
    label: "Ventas",
    icon: <Trophy className="w-5 h-5" aria-hidden="true" />,
    help: "Ventas cerradas",
  },
];

export function ZoneSwitcher({ zonaSlug, counts }: Props) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del CRM"
      className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit"
    >
      {SUBSECTIONS.map((sub) => {
        const href = `/crm/${zonaSlug}/${sub.key}`;
        const isActive = pathname.startsWith(href);
        const count = counts[sub.key];
        return (
          <Link
            key={sub.key}
            href={href}
            title={sub.help}
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-md text-sm sm:text-base font-semibold transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1",
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60",
            ].join(" ")}
          >
            <span className="flex-shrink-0" aria-hidden="true">
              {sub.icon}
            </span>
            <span className="whitespace-nowrap">{sub.label}</span>
            <span
              className={[
                "inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold tabular-nums flex-shrink-0",
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-700",
              ].join(" ")}
              aria-label={`${count} tarjetas`}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
