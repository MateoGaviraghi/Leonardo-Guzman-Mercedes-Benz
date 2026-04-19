"use client";

import Image from "next/image";
import Link from "next/link";
import { ZoneSwitcher } from "./ZoneSwitcher";
import { GlobalSearch } from "./GlobalSearch";
import { OverdueBadge } from "./OverdueBadge";
import { LogoutButton } from "./LogoutButton";
import { ZonaSelector } from "./ZonaSelector";
import type { CrmZona } from "@/types/crm";

type Props = {
  userEmail: string;
  zonaActual: CrmZona;
  zonas: CrmZona[];
  counts: { pizarron: number; agenda: number; ventas: number };
  overdueCount: number;
};

export function CrmHeader({
  userEmail,
  zonaActual,
  zonas,
  counts,
  overdueCount,
}: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* Fila 1: logo + zona actual + email + logout */}
        <div className="h-16 flex items-center justify-between gap-3">
          <Link
            href={`/crm/${zonaActual.slug}/pizarron`}
            className="flex items-center gap-2.5 group min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            aria-label={`Ir al pizarrón de ${zonaActual.name}`}
          >
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src="/logo-mercedes-benz.png"
                alt=""
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors truncate">
                CRM Mercedes-Benz
              </span>
              <span className="hidden md:inline text-xs text-slate-500 truncate">
                Gestión de clientes y ventas
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ZonaSelector current={zonaActual} zonas={zonas} />
            <span
              className="hidden lg:inline text-sm text-slate-600 max-w-[180px] truncate"
              title={userEmail}
            >
              {userEmail}
            </span>
            <LogoutButton />
          </div>
        </div>

        {/* Fila 2: subsecciones de la zona + búsqueda + vencidas */}
        <div className="pb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto custom-scrollbar">
            <ZoneSwitcher zonaSlug={zonaActual.slug} counts={counts} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none lg:w-80 min-w-0">
              <GlobalSearch />
            </div>
            <OverdueBadge count={overdueCount} zonaSlug={zonaActual.slug} />
          </div>
        </div>
      </div>
    </header>
  );
}
