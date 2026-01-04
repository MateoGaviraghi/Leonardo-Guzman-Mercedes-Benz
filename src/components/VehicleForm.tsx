"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Vehicle } from "@/data/vehicles";

interface VehicleFormProps {
  editVehicleId?: string;
  isEdit?: boolean;
}

export default function VehicleForm({
  editVehicleId,
  isEdit = false,
}: VehicleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string>(editVehicleId || "");
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: "",
    category: "",
    brand: "Mercedes-Benz",
    is_amg: false,
    specsConsumo: [],
    specsMotorizacion: [],
    specsPotencia: [],
    specsDimensiones: [],
    specsPerformance: [],
    specsCarroceria: [],
    specsChasis: [],
    specsCantidades: [],
    equipMultimedia: [],
    equipAsistencia: [],
    equipConfort: [],
    equipTrenRodaje: [],
  });

  useEffect(() => {
    if (isEdit && editVehicleId) {
      loadVehicle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editVehicleId, isEdit]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vehicles/${editVehicleId}`);
      if (!response.ok) throw new Error("Error al cargar vehículo");
      const data = await response.json();
      setVehicleId(data.vehicle.id);
      setFormData(data.vehicle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit ? `/api/vehicles/${editVehicleId}` : "/api/vehicles";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar");
      }

      // Guardar el ID generado para mostrar instrucciones
      if (!isEdit && result.vehicle?.id) {
        setVehicleId(result.vehicle.id);
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Manejar arrays de specs
  const addSpecItem = (category: keyof Vehicle) => {
    setFormData((prev) => ({
      ...prev,
      [category]: [
        ...((prev[category] as { valor: string; label: string }[]) || []),
        { valor: "", label: "" },
      ],
    }));
  };

  const removeSpecItem = (category: keyof Vehicle, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category] as { valor: string; label: string }[]).filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateSpecItem = (
    category: keyof Vehicle,
    index: number,
    field: "valor" | "label" | "title" | "description",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category] as { [key: string]: string }[]).map(
        (item, i) => (i === index ? { ...item, [field]: value } : item)
      ),
    }));
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        Cargando vehículo...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Editar Vehículo" : "Crear Nuevo Vehículo"}
          </h1>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Volver
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* INFORMACIÓN BÁSICA */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Información Básica
          </h2>

          {isEdit && vehicleId && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-medium">ID:</span> {vehicleId}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900"
                placeholder="ej: CLA 200 Progressive"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900"
              >
                <option value="">Seleccionar...</option>
                <optgroup label="🚗 Autos">
                  <option value="sedanes">Sedanes</option>
                  <option value="compactos">Compactos</option>
                  <option value="coupes">Coupés</option>
                  <option value="convertibles">Convertibles</option>
                  <option value="electricos">Eléctricos</option>
                  <option value="deportivos">Deportivos</option>
                </optgroup>
                <optgroup label="🚙 SUVs">
                  <option value="suvs">SUVs</option>
                  <option value="crossovers">Crossovers</option>
                </optgroup>
                <optgroup label="🚐 Comerciales">
                  <option value="vans">Vans</option>
                  <option value="sprinter">Sprinter</option>
                </optgroup>
                <optgroup label="🚛 Camiones">
                  <option value="trucks">Trucks / Camiones</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Categoría principal para la navegación del sitio
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand || "Mercedes-Benz"}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_amg"
              id="is_amg"
              checked={formData.is_amg || false}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label
              htmlFor="is_amg"
              className="text-sm font-medium text-gray-700"
            >
              Modelo AMG
            </label>
          </div>
        </section>

        {/* ASPECTOS DESTACADOS */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Aspectos Destacados
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-800">
                  Aspecto {num}
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">
                      Valor principal
                    </label>
                    <input
                      type="text"
                      name={`aspecto${num}Valor`}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(formData as any)[`aspecto${num}Valor`] || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md text-gray-900"
                      placeholder="ej: 163 CV"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600">
                      Etiqueta/descripción
                    </label>
                    <input
                      type="text"
                      name={`aspecto${num}Label`}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(formData as any)[`aspecto${num}Label`] || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md text-gray-900"
                      placeholder="ej: Potencia"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EXTERIOR */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Exterior
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="border-l-4 border-gray-400 pl-4 space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-700">
                  Imagen Exterior {num}
                </h3>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Título
                  </label>
                  <input
                    type="text"
                    name={`exterior${num}Title`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(formData as any)[`exterior${num}Title`] || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md text-gray-900"
                    placeholder="ej: Diseño frontal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Descripción
                  </label>
                  <textarea
                    name={`exterior${num}Description`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(formData as any)[`exterior${num}Description`] || ""}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md text-gray-900"
                    placeholder="Descripción de la imagen..."
                  />
                </div>
                <p className="text-xs text-gray-500">
                  📁 Subir: /public/vehicles/
                  {vehicleId || "[generado-al-guardar]"}/exterior/{num}.avif
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* COLORES */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Colores Disponibles
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>📸 Slider de Colores</strong>
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Los colores se muestran como un slider/carousel interactivo (sin
              texto). Simplemente sube imágenes del vehículo en diferentes
              colores.
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                📁 /public/vehicles/{vehicleId || "[generado-al-guardar]"}
                /colors/1.avif
              </p>
              <p>
                📁 /public/vehicles/{vehicleId || "[generado-al-guardar]"}
                /colors/2.avif
              </p>
              <p>
                📁 /public/vehicles/{vehicleId || "[generado-al-guardar]"}
                /colors/3.avif
              </p>
              <p className="text-gray-500 mt-2">
                (Continúa con 4.avif, 5.avif, etc. según los colores
                disponibles)
              </p>
            </div>
          </div>
        </section>

        {/* INTERIOR */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Interior
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="border-l-4 border-gray-400 pl-4 space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-700">
                  Imagen Interior {num}
                </h3>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Título
                  </label>
                  <input
                    type="text"
                    name={`interior${num}Title`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(formData as any)[`interior${num}Title`] || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md text-gray-900"
                    placeholder="ej: Habitáculo premium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Descripción
                  </label>
                  <textarea
                    name={`interior${num}Description`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(formData as any)[`interior${num}Description`] || ""}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md text-gray-900"
                    placeholder="Descripción de la imagen..."
                  />
                </div>
                <p className="text-xs text-gray-500">
                  📁 Subir: /public/vehicles/
                  {vehicleId || "[generado-al-guardar]"}/interior/{num}.avif
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ESPECIFICACIONES TÉCNICAS */}
        <section className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Especificaciones Técnicas
          </h2>

          {/* Consumo y emisión */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Consumo y emisión
            </h3>
            {(formData.specsConsumo || []).map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={item.valor}
                  onChange={(e) =>
                    updateSpecItem(
                      "specsConsumo",
                      index,
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="Valor principal (ej: 43 / 51)"
                  className="px-3 py-2 border rounded-md text-gray-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateSpecItem(
                        "specsConsumo",
                        index,
                        "label",
                        e.target.value
                      )
                    }
                    placeholder="Etiqueta/descripción"
                    className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecItem("specsConsumo", index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("specsConsumo")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Motorización */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Motorización
            </h3>
            {(formData.specsMotorizacion || []).map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={item.valor}
                  onChange={(e) =>
                    updateSpecItem(
                      "specsMotorizacion",
                      index,
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="Valor principal"
                  className="px-3 py-2 border rounded-md text-gray-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateSpecItem(
                        "specsMotorizacion",
                        index,
                        "label",
                        e.target.value
                      )
                    }
                    placeholder="Etiqueta/descripción"
                    className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecItem("specsMotorizacion", index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("specsMotorizacion")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Potencia y autonomía */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Potencia y autonomía
            </h3>
            {(formData.specsPotencia || []).map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={item.valor}
                  onChange={(e) =>
                    updateSpecItem(
                      "specsPotencia",
                      index,
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="Valor principal"
                  className="px-3 py-2 border rounded-md text-gray-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateSpecItem(
                        "specsPotencia",
                        index,
                        "label",
                        e.target.value
                      )
                    }
                    placeholder="Etiqueta/descripción"
                    className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecItem("specsPotencia", index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("specsPotencia")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Dimensiones */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Dimensiones
            </h3>
            {(formData.specsDimensiones || []).map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={item.valor}
                  onChange={(e) =>
                    updateSpecItem(
                      "specsDimensiones",
                      index,
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="Valor principal"
                  className="px-3 py-2 border rounded-md text-gray-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateSpecItem(
                        "specsDimensiones",
                        index,
                        "label",
                        e.target.value
                      )
                    }
                    placeholder="Etiqueta/descripción"
                    className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecItem("specsDimensiones", index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("specsDimensiones")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Performance */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Performance
            </h3>
            {(formData.specsPerformance || []).map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={item.valor}
                  onChange={(e) =>
                    updateSpecItem(
                      "specsPerformance",
                      index,
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="Valor principal"
                  className="px-3 py-2 border rounded-md text-gray-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateSpecItem(
                        "specsPerformance",
                        index,
                        "label",
                        e.target.value
                      )
                    }
                    placeholder="Etiqueta/descripción"
                    className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecItem("specsPerformance", index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("specsPerformance")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Carrocería */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Carrocería
            </h3>
            {(formData.specsCarroceria || []).map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={item.valor}
                  onChange={(e) =>
                    updateSpecItem(
                      "specsCarroceria",
                      index,
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="Valor principal"
                  className="px-3 py-2 border rounded-md text-gray-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateSpecItem(
                        "specsCarroceria",
                        index,
                        "label",
                        e.target.value
                      )
                    }
                    placeholder="Etiqueta/descripción"
                    className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecItem("specsCarroceria", index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("specsCarroceria")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Chasis */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Chasis</h3>
            {(formData.specsChasis || []).map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={item.valor}
                  onChange={(e) =>
                    updateSpecItem(
                      "specsChasis",
                      index,
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="Valor principal"
                  className="px-3 py-2 border rounded-md text-gray-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateSpecItem(
                        "specsChasis",
                        index,
                        "label",
                        e.target.value
                      )
                    }
                    placeholder="Etiqueta/descripción"
                    className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecItem("specsChasis", index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("specsChasis")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Cantidades, dimensiones y pesos */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Cantidades, dimensiones y pesos
            </h3>
            {(formData.specsCantidades || []).map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={item.valor}
                  onChange={(e) =>
                    updateSpecItem(
                      "specsCantidades",
                      index,
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="Valor principal"
                  className="px-3 py-2 border rounded-md text-gray-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateSpecItem(
                        "specsCantidades",
                        index,
                        "label",
                        e.target.value
                      )
                    }
                    placeholder="Etiqueta/descripción"
                    className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecItem("specsCantidades", index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    −
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("specsCantidades")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>
        </section>

        {/* DIMENSIONES (CAROUSEL) */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Dimensiones (Carousel de Diagramas)
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>📸 Carousel de Diagramas</strong>
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Sube imágenes con diagramas del vehículo mostrando las medidas
              (largo, ancho, alto, etc.). Se mostrarán en un slider/carousel.
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                📁 /public/vehicles/{vehicleId || "[generado-al-guardar]"}
                /dimensions/1.avif
              </p>
              <p>
                📁 /public/vehicles/{vehicleId || "[generado-al-guardar]"}
                /dimensions/2.avif
              </p>
              <p>
                📁 /public/vehicles/{vehicleId || "[generado-al-guardar]"}
                /dimensions/3.avif
              </p>
              <p className="text-gray-500 mt-2">
                (Continúa con 4.avif, 5.avif, etc. según sea necesario)
              </p>
            </div>
          </div>
        </section>

        {/* EQUIPAMIENTO */}
        <section className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Equipamiento
          </h2>

          {/* Título y Descripción General */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Información General
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Título General
                </label>
                <input
                  type="text"
                  name="equipmentGeneralTitle"
                  value={formData.equipmentGeneralTitle || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-gray-900"
                  placeholder="ej: Equipamiento destacado"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Descripción General
                </label>
                <textarea
                  name="equipmentGeneralDescription"
                  value={formData.equipmentGeneralDescription || ""}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md text-gray-900"
                  placeholder="Descripción general del equipamiento..."
                />
              </div>
            </div>
          </div>

          {/* Sistema de multimedias */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Sistema de multimedias
            </h3>
            {(formData.equipMultimedia || []).map((item, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) =>
                      updateSpecItem(
                        "equipMultimedia",
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Título (opcional)"
                    className="px-3 py-2 border rounded-md text-gray-900"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateSpecItem(
                          "equipMultimedia",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Descripción (opcional)"
                      className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecItem("equipMultimedia", index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      −
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  📁 /public/vehicles/{vehicleId || "[id]"}
                  /equipment/multimedia/{index + 1}.avif
                </p>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("equipMultimedia")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Sistemas de asistencia a la conducción */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Sistemas de asistencia a la conducción
            </h3>
            {(formData.equipAsistencia || []).map((item, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) =>
                      updateSpecItem(
                        "equipAsistencia",
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Título (opcional)"
                    className="px-3 py-2 border rounded-md text-gray-900"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateSpecItem(
                          "equipAsistencia",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Descripción (opcional)"
                      className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecItem("equipAsistencia", index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      −
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  📁 /public/vehicles/{vehicleId || "[id]"}
                  /equipment/asistencia/{index + 1}.avif
                </p>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("equipAsistencia")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Confort */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Confort
            </h3>
            {(formData.equipConfort || []).map((item, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) =>
                      updateSpecItem(
                        "equipConfort",
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Título (opcional)"
                    className="px-3 py-2 border rounded-md text-gray-900"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateSpecItem(
                          "equipConfort",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Descripción (opcional)"
                      className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecItem("equipConfort", index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      −
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  📁 /public/vehicles/{vehicleId || "[id]"}
                  /equipment/confort/{index + 1}.avif
                </p>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("equipConfort")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>

          {/* Tren de rodaje */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Tren de rodaje
            </h3>
            {(formData.equipTrenRodaje || []).map((item, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) =>
                      updateSpecItem(
                        "equipTrenRodaje",
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Título (opcional)"
                    className="px-3 py-2 border rounded-md text-gray-900"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateSpecItem(
                          "equipTrenRodaje",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Descripción (opcional)"
                      className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecItem("equipTrenRodaje", index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      −
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  📁 /public/vehicles/{vehicleId || "[id]"}
                  /equipment/tren-rodaje/{index + 1}.avif
                </p>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSpecItem("equipTrenRodaje")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Agregar item
            </button>
          </div>
        </section>

        {/* BOTONES */}
        <div className="flex gap-4 justify-end bg-white p-4 border-t rounded-md">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading
              ? "Guardando..."
              : isEdit
              ? "Actualizar Vehículo"
              : "Crear Vehículo"}
          </button>
        </div>

        {/* NOTA DE IMÁGENES */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <h3 className="font-semibold mb-2 text-gray-900">
            📸 Instrucciones para Imágenes
          </h3>
          <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
            <li>Guarda el vehículo primero para obtener el ID</li>
            <li>
              Crea la carpeta: /public/vehicles/
              {vehicleId || "[generado-al-guardar]"}/
            </li>
            <li>Dentro crea: exterior/, colors/, interior/, equipment/</li>
            <li>Nombra las imágenes con números: 1.avif, 2.avif, etc.</li>
            <li>Los campos con texto indican qué imágenes existen</li>
            <li>Formato recomendado: .avif (mejor compresión)</li>
          </ol>
        </div>
      </form>
    </div>
  );
}
