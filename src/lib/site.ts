// src/lib/site.ts — constantes de negocio confirmadas (fuente: .fable/DATOS-NEGOCIO.md).
// Ningún componente hardcodea estos strings: se importan de acá.

export const SITE = {
  name: "Leonardo Guzman",
  nameTilde: "Leonardo Guzmán", // para metadata/alt
  role: "Promotor de Ventas",
  dealer: "Automotores Mega S.A.",
  dealerShort: "Automotores Mega",
  city: "Paraná, Entre Ríos",
  address: {
    line1: "Acceso Norte República de Entre Ríos 5660",
    line2: "E3100 Paraná, Entre Ríos · Argentina",
  },
  phoneDisplay: "+54 9 342 503-7000",
  phoneHref: "tel:+5493425037000",
  whatsapp: "https://wa.me/5493425037000",
  email: "leonardog@automotoresmega.com.ar",
  instagram: "https://www.instagram.com/leoguzmanmbenz/",
  facebook: "https://www.facebook.com/leo.guzman.667144",
} as const;

/** Construye un link wa.me con mensaje precargado. */
export function waLink(message: string): string {
  return `${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Mensaje genérico del chip flotante global. */
export const WA_GENERIC_MESSAGE =
  "Hola Leonardo. Quiero hacer una consulta sobre la gama Mercedes-Benz.";
