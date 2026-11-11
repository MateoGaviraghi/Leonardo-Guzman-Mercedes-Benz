// Estrella de Mercedes-Benz con brillo de metal.
// Mateo (2026-11-10): el metal líquido en vivo (WebGL) a veces quedaba como un cuadrado
// blanco, o desaparecía al abrir el menú y volvía. Ahora la estrella es el logo real,
// presente desde el primer cuadro (sin saltos), y un brillo de metal la cruza despacio
// cada 6 s, recortado con la forma exacta del logo. Es CSS puro: no depende de la placa
// de video ni se vuelve a montar. Con movimiento reducido queda quieta.
export function EstrellaMetal({ className = "" }: { className?: string }) {
  return (
    <span className={`group/estrella relative block ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mercedes-benz.png" alt="" className="absolute inset-0 h-full w-full object-contain" />
      <span
        className="absolute inset-0 overflow-hidden"
        style={{
          WebkitMaskImage: "url(/logo-mercedes-benz.png)",
          maskImage: "url(/logo-mercedes-benz.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      >
        <span className="estrella-brillo" />
      </span>
    </span>
  );
}
