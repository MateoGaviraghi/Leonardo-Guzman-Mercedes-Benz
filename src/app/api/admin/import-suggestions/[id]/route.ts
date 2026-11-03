import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Solo permitimos ids tipo uuid/slug: letras, números, guión y guión bajo.
// Cualquier "/", "\\" o ".." queda descartado de plano → sin path traversal.
const SAFE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * GET /api/admin/import-suggestions/[id]
 *
 * Lee el archivo local `{cwd}/.orq/carga/import-json/{id}.json` (formato
 * vehicle-shaped, el mismo que acepta `normalizeVehicleJson`) y lo devuelve
 * crudo para que el panel "Sugerencias oficiales" lo consuma.
 *
 * Feature LOCAL-ONLY por diseño: en producción la carpeta no existe, así que
 * la respuesta es 404 y el panel simplemente no se renderiza.
 *
 * La ruta queda protegida por el middleware de `/api/*` (proxy.ts).
 */
export async function GET(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  if (
    !id ||
    !SAFE_ID.test(id) ||
    id.includes("/") ||
    id.includes("\\") ||
    id.includes("..")
  ) {
    return NextResponse.json(
      { success: false, error: "id inválido" },
      { status: 400 }
    );
  }

  const filePath = path.join(
    process.cwd(),
    ".orq",
    "carga",
    "import-json",
    `${id}.json`
  );

  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    // No existe la carpeta o el archivo → sin sugerencias para este vehículo.
    return NextResponse.json(
      { success: false, error: "Sin sugerencias para este vehículo" },
      { status: 404 }
    );
  }

  try {
    const data = JSON.parse(raw);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "El archivo de sugerencias no es JSON válido" },
      { status: 422 }
    );
  }
}
