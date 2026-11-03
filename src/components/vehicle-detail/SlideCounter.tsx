export function SlideCounter({ index, total, tone = "dark" }: { index: number; total: number; tone?: "dark" | "light" | "amg" }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const color = tone === "amg" ? "text-amg-teal" : tone === "light" ? "text-ink" : "text-white";
  return (
    <span data-chrome className={`font-mono text-xs tabular-nums tracking-[0.15em] ${color}`}>
      {pad(index + 1)} <span className="opacity-40">/</span> {pad(total)}
    </span>
  );
}
