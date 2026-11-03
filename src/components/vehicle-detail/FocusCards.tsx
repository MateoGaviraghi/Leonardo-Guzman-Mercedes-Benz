"use client";

import type { ReactNode } from "react";

/**
 * Grupo de cards con foco por hover (solo pointer:fine + hover:hover): la card
 * bajo el cursor queda `opacity-100` + `scale-[1.03]`, las hermanas atenúan a
 * `DETAIL.focusDim` (0.5). En touch/reduced-motion no hay dim — tap = estado pleno.
 * Solo `opacity`/`transform`, sin glow/shadow.
 */
export function FocusCards({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`group/focus ${className}`}>{children}</div>;
}

export function FocusCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`transition-[opacity,transform] duration-[var(--dur-element)] ease-[var(--ease-secondary)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/focus:opacity-[0.5] [@media(hover:hover)_and_(pointer:fine)]:hover:!opacity-100 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.03] ${className}`}
    >
      {children}
    </div>
  );
}
