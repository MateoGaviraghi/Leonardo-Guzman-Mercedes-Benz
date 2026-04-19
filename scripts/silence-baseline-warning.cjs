/**
 * Silencia un falso-positivo de baseline-browser-mapping.
 * --------------------------------------------------------
 * El library compara su "dataDate" interna contra hoy y tira
 * console.warn si pasaron >2 meses — pero la data solo se refresca
 * cuando el maintainer publica una nueva versión. Aunque tengamos
 * la última versión publicada, la warning se dispara igual.
 *
 * No tiene flag de configuración. Por eso hacemos un preload global
 * vía NODE_OPTIONS=--require que patchea console.warn en CADA
 * proceso que Next.js o Turbopack levante (main + workers).
 *
 * Filtramos SOLO esa línea específica — el resto de warnings
 * pasan normalmente.
 */
const originalWarn = console.warn.bind(console);
console.warn = function (...args) {
  const first = args[0];
  if (
    typeof first === "string" &&
    first.includes("[baseline-browser-mapping]")
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
