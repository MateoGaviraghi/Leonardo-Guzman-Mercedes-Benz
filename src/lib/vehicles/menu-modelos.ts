// Modelos del menú «Vehículos» del header (2026-11-10, Mateo: header 2 · Genesis).
// Lista fija y liviana: /api/vehicles trae 490 KB con todas las fichas y el menú
// tiene que abrir al instante. Mismo criterio que AMG_TARJETAS (D-049): cuando se
// carga o se oculta un auto en `vehicles`, se agrega o se saca su línea acá.
// Fotos: recortes oficiales sin fondo de mercedes-benz.com.ar (originales en
// carga/originales/menu-modelos/), normalizados a 900×420 en public/menu-modelos/.
// Vans, Sprinter, camiones y el AMG GT 63 (la web oficial tiene un solo recorte
// para los dos GT; el del GT 63 sale de una foto de estudio hecha con ChatGPT desde
// la oficial, carga/para-chatgpt/12-gt63-menu/) no tienen recorte oficial propio: se recortaron con rembg
// (isnet-general-use) desde nuestras fotos oficiales, revisados uno por uno
// (originales en carga/originales/menu-modelos/rembg/). Los 6 camiones salen
// de fotos de estudio hechas con ChatGPT desde nuestras fotos oficiales (mismo camión,
// solo tractor, trompa a la izquierda; carga/para-chatgpt/11-camiones-menu/).

export type PestanaMenu = "autos" | "suv" | "amg" | "vans" | "sprinter" | "camiones";
export type Combustible = "Nafta" | "Diésel" | "Híbrido" | "Eléctrico";

export interface ModeloMenu {
  nombre: string;
  pestana: PestanaMenu;
  href: string;
  foto: string;
  recorte: boolean; // true = recorte sin fondo; false = foto con fondo
  combustible: Combustible;
}

export const PESTANAS: { id: PestanaMenu; nombre: string; corto?: string; verTodos: string }[] = [
  { id: "autos", nombre: "Autos", verTodos: "/#gama-autos" },
  { id: "suv", nombre: "SUV", verTodos: "/#gama-suv" },
  { id: "amg", nombre: "Mercedes-AMG", corto: "AMG", verTodos: "/#gama-amg" },
  { id: "vans", nombre: "Vans", verTodos: "/#gama-vans" },
  { id: "sprinter", nombre: "Sprinter", verTodos: "/#gama-sprinter" },
  { id: "camiones", nombre: "Camiones", verTodos: "/#gama-camiones" },
];

const R = (slug: string) => `/menu-modelos/${slug}.webp`;
const v = (id: string) => `/vehicles/${id}`;

export const MODELOS_MENU: ModeloMenu[] = [
  // Autos
  { nombre: "Clase A Hatchback", pestana: "autos", href: v("e7a7cac6-5c3d-49cc-9d62-fae1d08eb720"), foto: R("clase-a"), recorte: true, combustible: "Nafta" },
  { nombre: "Clase C Sedán", pestana: "autos", href: v("1051a31f-87fb-413c-a5b7-2d9dfaabaa0f"), foto: R("clase-c"), recorte: true, combustible: "Nafta" },
  { nombre: "Clase E Sedán", pestana: "autos", href: v("662ffbf7-3dfa-4e16-98ab-3f042b3e1112"), foto: R("clase-e"), recorte: true, combustible: "Nafta" },
  { nombre: "Clase S", pestana: "autos", href: v("7eba156c-0097-4ee7-acfc-7a2b89d92598"), foto: R("clase-s"), recorte: true, combustible: "Nafta" },
  { nombre: "Mercedes-Maybach Clase S", pestana: "autos", href: v("d5a517b8-0203-46a4-9dd9-602ce58e8e85"), foto: R("maybach-clase-s"), recorte: true, combustible: "Nafta" },
  { nombre: "CLA Coupé", pestana: "autos", href: v("57bf8843-c98c-4351-9007-c5ceda1dba7e"), foto: R("cla"), recorte: true, combustible: "Nafta" },
  { nombre: "CLE Coupé", pestana: "autos", href: v("f05eb9e8-d811-4c3f-bdc8-c272747514b0"), foto: R("cle-coupe"), recorte: true, combustible: "Nafta" },
  { nombre: "CLE Cabriolet", pestana: "autos", href: v("2053dce5-0c14-4224-b942-e07985bd078e"), foto: R("cle-cabriolet"), recorte: true, combustible: "Nafta" },
  // SUV
  { nombre: "GLA", pestana: "suv", href: v("b0c0f52d-0d1e-4fb9-a3e6-e6a84b33d798"), foto: R("gla"), recorte: true, combustible: "Nafta" },
  { nombre: "GLB", pestana: "suv", href: v("c759dc70-80ba-4537-a3e7-d01f944f4dd3"), foto: R("glb"), recorte: true, combustible: "Nafta" },
  { nombre: "GLC SUV", pestana: "suv", href: v("f633e4c3-ca13-44e9-8ed6-dfa7337c15d1"), foto: R("glc"), recorte: true, combustible: "Nafta" },
  { nombre: "GLC Coupé", pestana: "suv", href: v("4d56e35d-70c2-4573-8170-3bb184f2eb57"), foto: R("glc-coupe"), recorte: true, combustible: "Nafta" },
  { nombre: "GLE SUV", pestana: "suv", href: v("5546b0dc-b9e8-4829-b4df-9ec4fc6e8427"), foto: R("gle"), recorte: true, combustible: "Nafta" },
  { nombre: "GLE Coupé", pestana: "suv", href: v("cd4cd260-158a-4999-9e51-e519e5cf6704"), foto: R("gle-coupe"), recorte: true, combustible: "Nafta" },
  { nombre: "Clase G", pestana: "suv", href: v("89ceb92d-c9d4-4fd1-940b-81fac745f9c9"), foto: R("clase-g"), recorte: true, combustible: "Nafta" },
  // Mercedes-AMG (filas propias + tarjetas AMG de D-049, que abren la ficha del modelo)
  { nombre: "Mercedes-AMG GT 43 Coupé", pestana: "amg", href: v("cd9b669a-9398-41ff-8f24-6dda7aa8241a"), foto: R("amg-gt-coupe"), recorte: true, combustible: "Nafta" },
  { nombre: "Mercedes-AMG GT 63 S E PERFORMANCE", pestana: "amg", href: v("f055ac99-c94c-4196-81d9-5d41548623aa"), foto: R("amg-gt-63"), recorte: true, combustible: "Híbrido" },
  { nombre: "Mercedes-AMG SL 63 S E PERFORMANCE", pestana: "amg", href: v("a8f27db4-f288-42ae-b7e0-bb6a6a56bf5c"), foto: R("amg-sl"), recorte: true, combustible: "Híbrido" },
  { nombre: "Mercedes-AMG Clase C Sedán", pestana: "amg", href: v("056daaea-0882-478d-a010-0bb9edd9074e"), foto: R("amg-clase-c"), recorte: true, combustible: "Nafta" },
  { nombre: "Mercedes-AMG Clase A Hatchback", pestana: "amg", href: v("e7a7cac6-5c3d-49cc-9d62-fae1d08eb720"), foto: R("amg-clase-a"), recorte: true, combustible: "Nafta" },
  { nombre: "Mercedes-AMG CLE Coupé", pestana: "amg", href: v("f05eb9e8-d811-4c3f-bdc8-c272747514b0"), foto: R("amg-cle-coupe"), recorte: true, combustible: "Nafta" },
  { nombre: "Mercedes-AMG GLC", pestana: "amg", href: v("f633e4c3-ca13-44e9-8ed6-dfa7337c15d1"), foto: R("amg-glc"), recorte: true, combustible: "Nafta" },
  { nombre: "Mercedes-AMG GLC Coupé", pestana: "amg", href: v("4d56e35d-70c2-4573-8170-3bb184f2eb57"), foto: R("amg-glc-coupe"), recorte: true, combustible: "Nafta" },
  { nombre: "Mercedes-AMG GLE", pestana: "amg", href: v("5546b0dc-b9e8-4829-b4df-9ec4fc6e8427"), foto: R("amg-gle"), recorte: true, combustible: "Nafta" },
  { nombre: "Mercedes-AMG GLE Coupé", pestana: "amg", href: v("cd4cd260-158a-4999-9e51-e519e5cf6704"), foto: R("amg-gle-coupe"), recorte: true, combustible: "Nafta" },
  { nombre: "Mercedes-AMG Clase G", pestana: "amg", href: v("89ceb92d-c9d4-4fd1-940b-81fac745f9c9"), foto: R("amg-clase-g"), recorte: true, combustible: "Nafta" },
  // Vans
  { nombre: "Vito Tourer", pestana: "vans", href: v("vito-tourer"), foto: R("vito-tourer"), recorte: true, combustible: "Diésel" },
  { nombre: "Vito Mixto", pestana: "vans", href: v("vito-mixto"), foto: R("vito-mixto"), recorte: true, combustible: "Diésel" },
  // Sprinter
  { nombre: "Sprinter Furgón", pestana: "sprinter", href: v("sprinter-furgon"), foto: R("sprinter-furgon"), recorte: true, combustible: "Nafta" },
  { nombre: "Sprinter Furgón Mixto", pestana: "sprinter", href: v("sprinter-furgon-mixto"), foto: R("sprinter-furgon-mixto"), recorte: true, combustible: "Nafta" },
  { nombre: "Sprinter Combi", pestana: "sprinter", href: v("sprinter-combi"), foto: R("sprinter-combi"), recorte: true, combustible: "Nafta" },
  { nombre: "Sprinter Chasis", pestana: "sprinter", href: v("sprinter-chasis"), foto: R("sprinter-chasis"), recorte: true, combustible: "Nafta" },
  // Camiones
  { nombre: "Accelo", pestana: "camiones", href: v("aec88be8-3542-4a41-86ef-9cd29d943486"), foto: R("accelo"), recorte: true, combustible: "Diésel" },
  { nombre: "Atego", pestana: "camiones", href: v("e04209a9-87e0-4f6c-adb4-b142f49caca4"), foto: R("atego"), recorte: true, combustible: "Diésel" },
  { nombre: "Actros", pestana: "camiones", href: v("ee10dd62-79cb-470b-9c6d-55dfa6314108"), foto: R("actros"), recorte: true, combustible: "Diésel" },
  { nombre: "Actros 2045 y 2545 ClassicSpace", pestana: "camiones", href: v("82bf00f8-f8bf-440a-9b47-bf6ff96523ed"), foto: R("actros-classicspace"), recorte: true, combustible: "Diésel" },
  { nombre: "Arocs", pestana: "camiones", href: v("ce2c5ad0-8218-4b3b-ad73-d4ed5793f24e"), foto: R("arocs"), recorte: true, combustible: "Diésel" },
  { nombre: "Axor", pestana: "camiones", href: v("ef86355b-4d25-4971-a9b4-cd13c0270721"), foto: R("axor"), recorte: true, combustible: "Diésel" },
];
