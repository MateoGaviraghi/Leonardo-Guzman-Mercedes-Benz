// Arma src/data/fotos-vehiculos.json: qué fotos de colores tiene cada auto en
// public/vehicles/<id>/colors/. Corre antes de `next build` y de `next dev`.
//
// Por qué existe: la página de un auto miraba la carpeta con `fs` en cada pedido,
// y eso hacía que Vercel metiera todas las fotos de public/vehicles dentro de la
// función (297 MB, límite 250 → deploy rechazado el 2026-11-09). Con esta lista
// la página no toca el disco y la función queda liviana.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirAutos = path.join(raiz, "public", "vehicles");
const salida = path.join(raiz, "src", "data", "fotos-vehiculos.json");

// Mismo orden de formatos que usaba la página.
const FORMATOS_CARRUSEL = ["jpg", "png", "avif", "webp"];
const FORMATOS_PRIMERA = ["avif", "webp", "jpg", "jpeg", "png"];

const lista = {};
const ids = fs.existsSync(dirAutos)
  ? fs.readdirSync(dirAutos, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

for (const id of ids) {
  const dir = path.join(dirAutos, id, "colors");
  const existe = (archivo) => fs.existsSync(path.join(dir, archivo));
  const colores = [];
  for (let num = 1; num <= 15; num++) {
    const format = FORMATOS_CARRUSEL.find((f) => existe(`${num}.${f}`));
    if (!format) break;
    colores.push({ num, format });
  }
  const hayColores = colores.length > 0 || FORMATOS_PRIMERA.some((f) => existe(`1.${f}`));
  if (hayColores) lista[id] = { colores, hayColores };
}

fs.writeFileSync(salida, JSON.stringify(lista, null, 2) + "\n");
console.log(`lista-fotos: ${Object.keys(lista).length} autos con colores → src/data/fotos-vehiculos.json`);

// Arma src/data/formatos-fotos.json: el formato de cada foto de cada auto
// ({ "<id>": { "exterior/1": "jpg", "hero/hero-mobile": "jpg", … } }). Con esto
// MultiFormatImage pide el archivo que existe y no prueba avif → webp → jpg
// (cada intento fallido era un 404). Si una foto tiene dos formatos, gana el
// primero de este orden, el mismo que probaba MultiFormatImage.
const ORDEN = ["avif", "webp", "jpg", "jpeg", "png"];
const salidaFormatos = path.join(raiz, "src", "data", "formatos-fotos.json");
const formatos = {};
let cuenta = 0;

function recorrer(dir, rel, mapa) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      recorrer(path.join(dir, e.name), rel ? `${rel}/${e.name}` : e.name, mapa);
      continue;
    }
    const punto = e.name.lastIndexOf(".");
    if (punto < 1) continue;
    const ext = e.name.slice(punto + 1).toLowerCase();
    if (!ORDEN.includes(ext)) continue;
    const clave = (rel ? `${rel}/` : "") + e.name.slice(0, punto);
    const previo = mapa[clave];
    if (!previo) cuenta++;
    if (!previo || ORDEN.indexOf(ext) < ORDEN.indexOf(previo)) mapa[clave] = ext;
  }
}

for (const id of ids) {
  const mapa = {};
  recorrer(path.join(dirAutos, id), "", mapa);
  if (Object.keys(mapa).length) {
    formatos[id] = Object.fromEntries(Object.entries(mapa).sort(([a], [b]) => a.localeCompare(b)));
  }
}

fs.writeFileSync(salidaFormatos, JSON.stringify(formatos, null, 1) + "\n");
console.log(`lista-fotos: ${cuenta} fotos con su formato → src/data/formatos-fotos.json`);
