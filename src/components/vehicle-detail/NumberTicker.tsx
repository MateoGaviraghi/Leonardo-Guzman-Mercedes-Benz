"use client";
import { useEffect, useRef, useState } from "react";
import { DETAIL } from "@/lib/motion-tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
// Anima SOLO el primer grupo numérico del string; el resto queda estático.
// Data-safe: en reposo / reduced-motion / al terminar → renderiza `value` verbatim.
const NUM = /(\d[\d.,]*)/; // primer grupo numérico contiguo
export function NumberTicker({ value }: { value: string }) {
  const reduced = usePrefersReducedMotion();
  const hasMatch = NUM.test(value);
  const [out, setOut] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);
  useEffect(() => {
    if (reduced || !hasMatch) return;
    const el = ref.current; if (!el) return;
    const m = value.match(NUM);
    if (!m) return;
    let rafId = 0;
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting || ran.current) return;
      ran.current = true; io.disconnect();
      const raw = m[1];
      const target = Number(raw.replace(/\./g, "").replace(",", "."));
      const dec = (raw.split(/[.,]/)[1] || "").length;
      const t0 = performance.now(); const dur = DETAIL.ticker * 1000;
      const ease = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)); // expo.out ≈ EASE.primary
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const cur = target * ease(p);
        const fmt = cur.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        setOut(value.replace(NUM, p >= 1 ? raw : fmt));
        if (p < 1) rafId = requestAnimationFrame(tick); else setOut(value);
      };
      rafId = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(rafId); };
  }, [value, reduced, hasMatch]);
  const display = reduced || !hasMatch ? value : out;
  return <span ref={ref} className="tabular-nums [text-wrap:balance]">{display}</span>;
}
