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

      // Helper que acepta string JSON (datos legacy) u objeto/array ya
      // parseado (lo que devuelve Supabase para columnas JSONB nativas).
      const parseJson = (val: unknown) => {
        if (val === null || val === undefined) return undefined;
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return undefined;
          }
        }
        return val;
      };

      const vehicle = data.vehicle;
      if (vehicle) {
        // Specs
        vehicle.specsConsumo = parseJson(vehicle.specs_consumo);
        vehicle.specsMotorizacion = parseJson(vehicle.specs_motorizacion);
        vehicle.specsPotencia = parseJson(vehicle.specs_potencia);

        // Equipamiento (categorías genéricas)
        vehicle.equipExterior = parseJson(vehicle.equip_exterior);
        vehicle.equipInterior = parseJson(vehicle.equip_interior);
        vehicle.equipMultimedia = parseJson(vehicle.equip_multimedia);
        vehicle.equipAsistencia = parseJson(vehicle.equip_asistencia);
        vehicle.equipConfort = parseJson(vehicle.equip_confort);
        vehicle.equipTrenRodaje = parseJson(vehicle.equip_tren_rodaje);
        vehicle.equipSeguridad = parseJson(vehicle.equip_seguridad);

        // Equipamiento Sprinter/Vito (categorías específicas de vans)
        vehicle.equipVariantesCarroceria = parseJson(
          vehicle.equip_variantes_carroceria
        );
        vehicle.equipCarga = parseJson(vehicle.equip_carga);
        vehicle.equipVariantesCompartimento = parseJson(
          vehicle.equip_variantes_compartimento
        );
        vehicle.equipEquipamientoCompartimento = parseJson(
          vehicle.equip_equipamiento_compartimento
        );
        vehicle.equipPuestoConduccion = parseJson(
          vehicle.equip_puesto_conduccion
        );

        // Autonomía / carga (eléctricos)
        vehicle.chargingTab1Content = parseJson(vehicle.charging_tab1_content);
        vehicle.chargingTab2Content = parseJson(vehicle.charging_tab2_content);

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
                const v = vehicle as unknown as Record<string, string | undefined>;
                const title = v[`exterior${num}Title`];
                const description = v[`exterior${num}Description`];
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
                const v = vehicle as unknown as Record<string, string | undefined>;
                const title = v[`interior${num}Title`];
                const description = v[`interior${num}Description`];
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

            {/* Seguridad */}
            {vehicle.equipSeguridad && vehicle.equipSeguridad.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Seguridad
                </h3>
                <div className="space-y-3">
                  {vehicle.equipSeguridad.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-gray-700">
                          {basePath}/equipment/seguridad/{index + 1}.[formato]
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${basePath}/equipment/seguridad/${index + 1}`
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

            {/* Variantes de la carrocería (Sprinter / Vito) */}
            {vehicle.equipVariantesCarroceria &&
              vehicle.equipVariantesCarroceria.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                    Variantes de la carrocería
                  </h3>
                  <div className="space-y-3">
                    {vehicle.equipVariantesCarroceria.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono text-gray-700">
                            {basePath}/equipment/variantes-carroceria/
                            {index + 1}.[formato]
                          </code>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${basePath}/equipment/variantes-carroceria/${index + 1}`
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

            {/* Acceso y carga (Sprinter / Vito) */}
            {vehicle.equipCarga && vehicle.equipCarga.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                  Acceso y carga
                </h3>
                <div className="space-y-3">
                  {vehicle.equipCarga.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-gray-700">
                          {basePath}/equipment/carga/{index + 1}.[formato]
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${basePath}/equipment/carga/${index + 1}`
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

            {/* Variantes del compartimento (Sprinter / Vito) */}
            {vehicle.equipVariantesCompartimento &&
              vehicle.equipVariantesCompartimento.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                    Variantes del compartimento
                  </h3>
                  <div className="space-y-3">
                    {vehicle.equipVariantesCompartimento.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono text-gray-700">
                            {basePath}/equipment/variantes-compartimento/
                            {index + 1}.[formato]
                          </code>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${basePath}/equipment/variantes-compartimento/${index + 1}`
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

            {/* Equipamiento del compartimento (Sprinter / Vito) */}
            {vehicle.equipEquipamientoCompartimento &&
              vehicle.equipEquipamientoCompartimento.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                    Equipamiento del compartimento
                  </h3>
                  <div className="space-y-3">
                    {vehicle.equipEquipamientoCompartimento.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <code className="text-sm font-mono text-gray-700">
                              {basePath}/equipment/equipamiento-compartimento/
                              {index + 1}.[formato]
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${basePath}/equipment/equipamiento-compartimento/${index + 1}`
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
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Puesto de conducción (Sprinter / Vito) */}
            {vehicle.equipPuestoConduccion &&
              vehicle.equipPuestoConduccion.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                    Puesto de conducción
                  </h3>
                  <div className="space-y-3">
                    {vehicle.equipPuestoConduccion.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono text-gray-700">
                            {basePath}/equipment/puesto-conduccion/
                            {index + 1}.[formato]
                          </code>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${basePath}/equipment/puesto-conduccion/${index + 1}`
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

          {/* AUTONOMÍA Y CARGA (Solo eléctricos) */}
          {(vehicle.chargingTab1Content || vehicle.chargingTab2Content) && (
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                ⚡ Autonomía y Carga (Solo Eléctricos)
              </h2>

              {/* Cards de simuladores */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Cards de Simuladores (con imagen de fondo)
                </h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <code className="text-gray-700">
                      {basePath}/autonomy/card1.[formato]
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(`${basePath}/autonomy/card1`)
                      }
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Copiar
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <code className="text-gray-700">
                      {basePath}/autonomy/card2.[formato]
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(`${basePath}/autonomy/card2`)
                      }
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Carga */}
              {vehicle.chargingTab1Content &&
                vehicle.chargingTab1Content.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                      Tab: Carga
                    </h3>
                    <div className="space-y-3">
                      {vehicle.chargingTab1Content.map((item, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <code className="text-sm font-mono text-gray-700">
                              {basePath}/autonomy/charging/{index + 1}.[formato]
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${basePath}/autonomy/charging/${index + 1}`
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

              {/* Tab Tecnología */}
              {vehicle.chargingTab2Content &&
                vehicle.chargingTab2Content.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">
                      Tab: Tecnología
                    </h3>
                    <div className="space-y-3">
                      {vehicle.chargingTab2Content.map((item, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <code className="text-sm font-mono text-gray-700">
                              {basePath}/autonomy/technology/{index + 1}
                              .[formato]
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${basePath}/autonomy/technology/${index + 1}`
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
          )}

          {/* RESUMEN */}
          <section className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">
              📋 Estructura Completa de Carpetas
            </h3>
            <pre className="bg-white p-4 rounded border text-xs overflow-x-auto">
              {`/public/vehicles/${vehicleId}/
  ├── hero/
  │   ├── hero.[formato]         (desktop)
  │   └── hero-mobile.[formato]  (mobile)
  ├── foto-card/
  │   └── card.[formato]
  ├── exterior/
  ├── colors/
  ├── interior/
  ├── dimensions/
  ├── equipment/
  │   ├── multimedia/
  │   ├── asistencia/
  │   ├── confort/
  │   ├── tren-rodaje/
  │   ├── seguridad/
  │   ├── variantes-carroceria/        (Sprinter / Vito)
  │   ├── carga/                       (Sprinter / Vito)
  │   ├── variantes-compartimento/     (Sprinter / Vito)
  │   ├── equipamiento-compartimento/  (Sprinter / Vito)
  │   └── puesto-conduccion/           (Sprinter / Vito)
  └── autonomy/ (solo eléctricos)
      ├── card1.[formato]
      ├── card2.[formato]
      ├── charging/
      └── technology/`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
