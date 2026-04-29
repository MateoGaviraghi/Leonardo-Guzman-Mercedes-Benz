// ============================================================================
// Renderer simple para descripciones con texto + bullets.
//
// Convención de la fuente (tipica de copy de equipamiento Mercedes-Benz):
//
//   Texto introductorio del feature.
//
//   * Punto destacado 1
//   * Punto destacado 2
//   * Punto destacado 3
//
//   Cierre o aclaración final.
//
// Render:
//   - Líneas que empiezan con `* ` o `- ` o `• ` → <li> dentro de un <ul>
//   - Resto → <p>
//   - Líneas en blanco separan bloques
//
// Si el texto no tiene bullets ni saltos, se comporta exactamente igual que
// un <p> plano (compat con todas las descripciones cargadas previamente).
//
// Sin dependencias externas a propósito — el parser cabe en pocas líneas.
// ============================================================================

import type { ReactNode } from "react";

type Props = {
  children: string | null | undefined;
  /** Clase aplicada al wrapper. Cae en cascada al <p> y <li>. */
  className?: string;
  /** Clase específica para los <li> si se quiere override. */
  listItemClassName?: string;
};

type Block =
  | { type: "para"; text: string }
  | { type: "list"; items: string[] };

const BULLET_RE = /^[*\-•]\s+(.+)$/;

function parseBlocks(text: string): Block[] {
  const lines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  let currentList: string[] | null = null;
  let currentPara: string[] | null = null;

  const flush = () => {
    if (currentList) {
      blocks.push({ type: "list", items: currentList });
      currentList = null;
    }
    if (currentPara) {
      const joined = currentPara.join(" ").trim();
      if (joined) blocks.push({ type: "para", text: joined });
      currentPara = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      continue;
    }
    const m = line.match(BULLET_RE);
    if (m) {
      if (currentPara) flush();
      if (!currentList) currentList = [];
      currentList.push(m[1]);
    } else {
      if (currentList) flush();
      if (!currentPara) currentPara = [];
      currentPara.push(line);
    }
  }
  flush();
  return blocks;
}

export function RichText({
  children,
  className,
  listItemClassName,
}: Props): ReactNode {
  if (!children) return null;
  const blocks = parseBlocks(children);

  // Caso simple: un solo párrafo, sin bullets → renderizamos como <p> plano
  // para no cambiar layout/spacing de las descripciones existentes.
  if (blocks.length === 1 && blocks[0].type === "para") {
    return <p className={className}>{blocks[0].text}</p>;
  }

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (block.type === "list") {
          return (
            <ul
              key={i}
              className={`list-disc pl-5 space-y-1 ${
                i > 0 ? "mt-2" : ""
              }`}
            >
              {block.items.map((item, j) => (
                <li key={j} className={listItemClassName}>
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
