"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Vehicle } from "@/data/vehicles";

export default function GuiaImagenesPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (!response.ok) throw new Error("Error al cargar vehículo");
      const data = await response.json();

      // Parsear campos JSON si vienen como strings
      const vehicle = data.vehicle;
      if (vehicle) {
        // Parsear especificaciones (JSONB arrays)
        if (typeof vehicle.specs_consumo === "string")
          vehicle.specsConsumo = JSON.parse(vehicle.specs_consumo);
        else vehicle.specsConsumo = vehicle.specs_consumo;

        if (typeof vehicle.specs_motorizacion === "string")
          vehicle.specsMotorizacion = JSON.parse(vehicle.specs_motorizacion);
        else vehicle.specsMotorizacion = vehicle.specs_motorizacion;

        if (typeof vehicle.specs_potencia === "string")
          vehicle.specsPotencia = JSON.parse(vehicle.specs_potencia);
        else vehicle.specsPotencia = vehicle.specs_potencia;

        // Parsear equipamiento (JSONB arrays)
        if (typeof vehicle.equip_exterior === "string")
          vehicle.equipExterior = JSON.parse(vehicle.equip_exterior);
        else vehicle.equipExterior = vehicle.equip_exterior;

        if (typeof vehicle.equip_interior === "string")
          vehicle.equipInterior = JSON.parse(vehicle.equip_interior);
        else vehicle.equipInterior = vehicle.equip_interior;

        if (typeof vehicle.equip_multimedia === "string")
          vehicle.equipMultimedia = JSON.parse(vehicle.equip_multimedia);
        else vehicle.equipMultimedia = vehicle.equip_multimedia;

        if (typeof vehicle.equip_asistencia === "string")
          vehicle.equipAsistencia = JSON.parse(vehicle.equip_asistencia);
        else vehicle.equipAsistencia = vehicle.equip_asistencia;

        if (typeof vehicle.equip_confort === "string")
          vehicle.equipConfort = JSON.parse(vehicle.equip_confort);
        else vehicle.equipConfort = vehicle.equip_confort;

        if (typeof vehicle.equip_tren_rodaje === "string")
          vehicle.equipTrenRodaje = JSON.parse(vehicle.equip_tren_rodaje);
        else vehicle.equipTrenRodaje = vehicle.equip_tren_rodaje;

        // Convertir snake_case a camelCase para campos simples
        vehicle.aspecto1Valor = vehicle.aspecto_1_valor;
        vehicle.exterior1Title = vehicle.exterior_1_title;
        vehicle.exterior1Description = vehicle.exterior_1_description;
        vehicle.exterior2Title = vehicle.exterior_2_title;
        vehicle.exterior2Description = vehicle.exterior_2_description;
        vehicle.exterior3Title = vehicle.exterior_3_title;
        vehicle.exterior3Description = vehicle.exterior_3_description;
        vehicle.exterior4Title = vehicle.exterior_4_title;
        vehicle.exterior4Description = vehicle.exterior_4_description;
        vehicle.exterior5Title = vehicle.exterior_5_title;
        vehicle.exterior5Description = vehicle.exterior_5_description;
        vehicle.exterior6Title = vehicle.exterior_6_title;
        vehicle.exterior6Description = vehicle.exterior_6_description;
        vehicle.exterior7Title = vehicle.exterior_7_title;
        vehicle.exterior7Description = vehicle.exterior_7_description;
        vehicle.exterior8Title = vehicle.exterior_8_title;
        vehicle.exterior8Description = vehicle.exterior_8_description;
        vehicle.exterior9Title = vehicle.exterior_9_title;
        vehicle.exterior9Description = vehicle.exterior_9_description;
        vehicle.exterior10Title = vehicle.exterior_10_title;
        vehicle.exterior10Description = vehicle.exterior_10_description;
        vehicle.interior1Title = vehicle.interior_1_title;
        vehicle.interior1Description = vehicle.interior_1_description;
        vehicle.interior2Title = vehicle.interior_2_title;
        vehicle.interior2Description = vehicle.interior_2_description;
        vehicle.interior3Title = vehicle.interior_3_title;
        vehicle.interior3Description = vehicle.interior_3_description;
        vehicle.interior4Title = vehicle.interior_4_title;
        vehicle.interior4Description = vehicle.interior_4_description;
        vehicle.interior5Title = vehicle.interior_5_title;
        vehicle.interior5Description = vehicle.interior_5_description;
        vehicle.interior6Title = vehicle.interior_6_title;
        vehicle.interior6Description = vehicle.interior_6_description;
        vehicle.interior7Title = vehicle.interior_7_title;
        vehicle.interior7Description = vehicle.interior_7_description;
        vehicle.interior8Title = vehicle.interior_8_title;
        vehicle.interior8Description = vehicle.interior_8_description;
        vehicle.interior9Title = vehicle.interior_9_title;
        vehicle.interior9Description = vehicle.interior_9_description;
        vehicle.interior10Title = vehicle.interior_10_title;
        vehicle.interior10Description = vehicle.interior_10_description;
      }

      setVehicle(vehicle);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        Cargando guía...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        Vehículo no encontrado
      </div>
    );
  }

  const basePath = `/public/vehicles/${vehicleId}`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Guía de Imágenes: {vehicle.name}
          </h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Volver
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
          <p className="text-sm text-gray-700">
            <strong>📁 ID del vehículo:</strong>{" "}
            <code className="bg-white px-2 py-1 rounded">{vehicleId}</code>
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Crea esta estructura de carpetas en tu proyecto y sube las imágenes
            con los nombres exactos que se muestran abajo.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            <strong>📌 Formatos aceptados:</strong> .jpg, .jpeg, .png, .webp,
            .avif
          </p>
        </div>

        <div className="space-y-6">
          {/* ASPECTOS DESTACADOS */}
          {vehicle.aspecto1Valor && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                ✨ Aspectos Destacados (sin imágenes)
              </h2>
              <p className="text-sm text-gray-600">
                Los aspectos destacados no requieren imágenes, solo los textos
                que ya ingresaste.
              </p>
            </section>
          )}

          {/* EXTERIOR */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              🚗 Exterior
            </h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const title = (vehicle as any)[`exterior${num}Title`];
                const description = (vehicle as any)[
                  `exterior${num}Description`
                ];
                if (!title && !description) return null;
                return (
                  <div
                    key={num}
                    className="bg-gray-50 p-3 rounded border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono text-gray-700">
                        {basePath}/exterior/{num}.[formato]
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(`${basePath}/exterior/${num}`)
                        }
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Copiar
                      </button>
                    </div>
                    {title && (
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        📌 {title}
                      </p>
                    )}
                    {description && (
                      <p className="text-xs text-gray-600">{description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* COLORES */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              🎨 Colores (Carousel)
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Sube todas las variantes de color del vehículo:
            </p>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <code className="text-gray-700">
                  {basePath}/colors/1.[formato]
                </code>
                <button
                  onClick={() => copyToClipboard(`${basePath}/colors/1`)}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Copiar
                </button>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <code className="text-gray-700">
                  {basePath}/colors/2.[formato]
                </code>
                <button
                  onClick={() => copyToClipboard(`${basePath}/colors/2`)}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Copiar
                </button>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <code className="text-gray-700">
                  {basePath}/colors/3.[formato]
                </code>
                <button
                  onClick={() => copyToClipboard(`${basePath}/colors/3`)}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Continúa con 4.[formato], 5.[formato], etc. según los colores
                disponibles
              </p>
            </div>
          </section>

          {/* INTERIOR */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              🪑 Interior
            </h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const title = (vehicle as any)[`interior${num}Title`];
                const description = (vehicle as any)[
                  `interior${num}Description`
                ];
                if (!title && !description) return null;
                return (
                  <div
                    key={num}
                    className="bg-gray-50 p-3 rounded border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono text-gray-700">
                        {basePath}/interior/{num}.[formato]
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(`${basePath}/interior/${num}`)
                        }
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Copiar
                      </button>
                    </div>
                    {title && (
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        📌 {title}
                      </p>
                    )}
                    {description && (
                      <p className="text-xs text-gray-600">{description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ESPECIFICACIONES TÉCNICAS */}
          {(vehicle.specsConsumo ||
            vehicle.specsMotorizacion ||
            vehicle.specsPotencia) && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                📊 Especificaciones Técnicas (sin imágenes)
              </h2>
              <p className="text-sm text-gray-600">
                Las especificaciones técnicas no requieren imágenes, solo los
                valores y etiquetas que ingresaste.
              </p>
            </section>
          )}

          {/* DIMENSIONES */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              📐 Dimensiones (Diagramas)
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Sube imágenes con diagramas mostrando las medidas del vehículo:
            </p>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <code className="text-gray-700">
                  {basePath}/dimensions/1.[formato]
                </code>
                <button
                  onClick={() => copyToClipboard(`${basePath}/dimensions/1`)}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Copiar
                </button>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <code className="text-gray-700">
                  {basePath}/dimensions/2.[formato]
                </code>
                <button
                  onClick={() => copyToClipboard(`${basePath}/dimensions/2`)}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Continúa con 3.[formato], 4.[formato], etc. según sea necesario
              </p>
            </div>
          </section>

          {/* EQUIPAMIENTO */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              🔧 Equipamiento
            </h2>

            {/* Exterior */}
            {vehicle.equipExterior && vehicle.equipExterior.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Exterior
                </h3>
                <div className="space-y-3">
                  {vehicle.equipExterior.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-gray-700">
                          {basePath}/equipment/exterior/{index + 1}.[formato]
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${basePath}/equipment/exterior/${index + 1}`
                            )
                          }
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Copiar
                        </button>
                      </div>
                      {item.title && (
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          📌 {item.title}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interior */}
            {vehicle.equipInterior && vehicle.equipInterior.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Interior
                </h3>
                <div className="space-y-3">
                  {vehicle.equipInterior.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-gray-700">
                          {basePath}/equipment/interior/{index + 1}.[formato]
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${basePath}/equipment/interior/${index + 1}`
                            )
                          }
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Copiar
                        </button>
                      </div>
                      {item.title && (
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          📌 {item.title}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Multimedia */}
            {vehicle.equipMultimedia && vehicle.equipMultimedia.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Sistema de multimedias
                </h3>
                <div className="space-y-3">
                  {vehicle.equipMultimedia.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-gray-700">
                          {basePath}/equipment/multimedia/{index + 1}.[formato]
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${basePath}/equipment/multimedia/${index + 1}`
                            )
                          }
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Copiar
                        </button>
                      </div>
                      {item.title && (
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          📌 {item.title}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Asistencia */}
            {vehicle.equipAsistencia && vehicle.equipAsistencia.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Sistemas de asistencia a la conducción
                </h3>
                <div className="space-y-3">
                  {vehicle.equipAsistencia.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-gray-700">
                          {basePath}/equipment/asistencia/{index + 1}.[formato]
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${basePath}/equipment/asistencia/${index + 1}`
                            )
                          }
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Copiar
                        </button>
                      </div>
                      {item.title && (
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          📌 {item.title}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confort */}
            {vehicle.equipConfort && vehicle.equipConfort.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Confort
                </h3>
                <div className="space-y-3">
                  {vehicle.equipConfort.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-gray-700">
                          {basePath}/equipment/confort/{index + 1}.[formato]
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${basePath}/equipment/confort/${index + 1}`
                            )
                          }
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Copiar
                        </button>
                      </div>
                      {item.title && (
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          📌 {item.title}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tren de rodaje */}
            {vehicle.equipTrenRodaje && vehicle.equipTrenRodaje.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Tren de rodaje
                </h3>
                <div className="space-y-3">
                  {vehicle.equipTrenRodaje.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-gray-700">
                          {basePath}/equipment/tren-rodaje/{index + 1}.[formato]
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${basePath}/equipment/tren-rodaje/${index + 1}`
                            )
                          }
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Copiar
                        </button>
                      </div>
                      {item.title && (
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          📌 {item.title}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* RESUMEN */}
          <section className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">
              📋 Estructura Completa de Carpetas
            </h3>
            <pre className="bg-white p-4 rounded border text-xs overflow-x-auto">
              {`/public/vehicles/${vehicleId}/
  ├── exterior/
  ├── colors/
  ├── interior/
  ├── dimensions/
  └── equipment/
      ├── multimedia/
      ├── asistencia/
      ├── confort/
      └── tren-rodaje/`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
