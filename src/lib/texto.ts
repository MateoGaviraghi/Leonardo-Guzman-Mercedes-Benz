// Saltos de línea (regla de Mateo, 2026-10-26): un renglón nunca termina en una
// palabra corta de enlace («de», «la», «y», «con», «para», «más»…). `pegar` une cada
// una con la palabra que sigue mediante un espacio duro (U+00A0), así el navegador
// las pasa juntas al renglón siguiente. Solo para mostrar: lo guardado no cambia.

const ENLACE =
  "lo|la|el|los|las|le|les|de|del|y|e|o|u|ni|con|para|más|por|en|a|al|un|una|unos|unas|que|tu|tus|su|sus|sin|se|es|mi|te";

const RE = new RegExp(
  `(?<=^|[\\s\\u00a0(«"“¿¡])(${ENLACE})[ \\t]+(?=\\S)`,
  "giu"
);

// «Mercedes-AMG», «Mercedes-Benz», «Mercedes-Maybach»: guion que no se corta (U+2011).
const MARCA = /Mercedes-(AMG|Benz|Maybach)/g;

// Las dos últimas palabras de cada párrafo van juntas: nunca una sola en el último
// renglón (refuerzo de `text-wrap: pretty`, que no siempre lo evita).
const ULTIMAS = /[ \t]+(\S+)[ \t]*$/gmu;

export function pegar(texto: string): string {
  return texto
    .replace(RE, "$1 ")
    .replace(MARCA, "Mercedes‑$1")
    .replace(ULTIMAS, " $1");
}

// Campos de texto que se muestran (títulos, descripciones, etiquetas, valores).
// Ids, rutas, links, categoría, marca y nombre quedan intactos.
const CAMPO = /(title|description|label|valor|subtitle|content|items)$/i;

function recorrer(valor: unknown, aplicar: boolean): unknown {
  if (typeof valor === "string") return aplicar ? pegar(valor) : valor;
  if (Array.isArray(valor)) return valor.map((v) => recorrer(v, aplicar));
  if (valor && typeof valor === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor)) out[k] = recorrer(v, CAMPO.test(k));
    return out;
  }
  return valor;
}

/** Devuelve una copia del vehículo con `pegar` aplicado a sus textos visibles. */
export function pegarTextos<T extends object>(vehiculo: T): T {
  return recorrer(vehiculo, false) as T;
}
