"use client";

import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white rounded-xl border-2 border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
        {icon ?? <Inbox className="w-7 h-7" aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-base text-slate-600 max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

export function EmptyColumn({ columnLabel }: { columnLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 text-slate-400">
      <div className="w-10 h-10 rounded-full bg-white/60 border border-slate-200 flex items-center justify-center mb-3">
        <Inbox className="w-5 h-5" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-slate-500">
        Sin tarjetas en {columnLabel}
      </p>
      <p className="text-xs text-slate-400 mt-1">
        Usá el botón de abajo para agregar
      </p>
    </div>
  );
}
