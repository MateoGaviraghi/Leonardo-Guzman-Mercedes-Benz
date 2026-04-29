"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Vehicle } from "@/data/vehicles";
import { createSupabaseBrowser } from "@/lib/supabase-client";
import JsonImport from "@/components/admin/JsonImport";

type TruckSection = {
  title: string;
  type: "list" | "text" | "both";
  items: string[];
  content: string;
};

type TruckPdf = {
  name: string;
  url: string;
};

interface TruckFormProps {
  editVehicleId?: string;
  isEdit?: boolean;
}

export default function TruckForm({
  editVehicleId,
  isEdit = false,
}: TruckFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string>(editVehicleId || "");

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: "",
    category: "",
    brand: "Mercedes-Benz",
    is_amg: false,
    fuel_type: "diesel",
    subtitle: "",
    equipmentGeneralTitle: "",
    equipmentGeneralDescription: "",
    specsMotorizacion: [],
    specsPotencia: [],
    specsDimensiones: [],
    specsCantidades: [],
    specsPerformance: [],
    specsCarroceria: [],
    specsChasis: [],
    specsConsumo: [],
  });

  const [sections, setSections] = useState<TruckSection[]>([]);
  const [pdfs, setPdfs] = useState<TruckPdf[]>([]);
  const [uploadingPdf, setUploadingPdf] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Folder prefix for storage: use vehicleId if editing, or a stable session key for new trucks
  const storageFolderRef = useRef<string>(editVehicleId || crypto.randomUUID());

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
      const vehicle = data.vehicle;

      // Parse JSON fields
      const parseJson = (val: unknown) => {
        if (!val) return [];
        if (typeof val === "string") return JSON.parse(val);
        return val;
      };

      vehicle.specsMotorizacion = parseJson(vehicle.specs_motorizacion);
      vehicle.specsPotencia = parseJson(vehicle.specs_potencia);
      vehicle.specsDimensiones = parseJson(vehicle.specs_dimensiones);
      vehicle.specsCantidades = parseJson(vehicle.specs_cantidades);
      vehicle.specsPerformance = parseJson(vehicle.specs_performance);
      vehicle.specsCarroceria = parseJson(vehicle.specs_carroceria);
      vehicle.specsChasis = parseJson(vehicle.specs_chasis);
      vehicle.specsConsumo = parseJson(vehicle.specs_consumo);
      vehicle.equipmentGeneralTitle = vehicle.equipment_general_title || "";
      vehicle.equipmentGeneralDescription = vehicle.equipment_general_description || "";

      vehicle.aspecto1Valor = vehicle.aspecto_1_valor;
      vehicle.aspecto1Label = vehicle.aspecto_1_label;
      vehicle.aspecto2Valor = vehicle.aspecto_2_valor;
      vehicle.aspecto2Label = vehicle.aspecto_2_label;
      vehicle.aspecto3Valor = vehicle.aspecto_3_valor;
      vehicle.aspecto3Label = vehicle.aspecto_3_label;
      vehicle.aspecto4Valor = vehicle.aspecto_4_valor;
      vehicle.aspecto4Label = vehicle.aspecto_4_label;

      const rawSections = parseJson(vehicle.truck_sections);
      setSections(
        rawSections.map((s: Partial<TruckSection>) => ({
          title: s.title || "",
          type: s.type || "list",
          items: s.items || [],
          content: s.content || "",
        })),
      );

      const rawPdfs = parseJson(vehicle.truck_pdfs);
      setPdfs(
        rawPdfs.map((p: Partial<TruckPdf>) => ({
          name: p.name || "",
          url: p.url || "",
        })),
      );

      setVehicleId(vehicle.id);
      setFormData(vehicle);
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

      const payload = {
        ...formData,
        truckSections: sections.map((s) => ({
          title: s.title,
          type: s.type,
          ...(s.type === "list" ? { items: s.items } : { content: s.content }),
        })),
        truckPdfs: pdfs,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar");
      }

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
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // ---- Specs helpers ----
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
      [category]: (
        prev[category] as { valor: string; label: string }[]
      ).filter((_, i) => i !== index),
    }));
  };

  const updateSpecItem = (
    category: keyof Vehicle,
    index: number,
    field: "valor" | "label",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category] as { [key: string]: string }[]).map(
        (item, i) => (i === index ? { ...item, [field]: value } : item),
      ),
    }));
  };

  // ---- Sections helpers ----
  const addSection = () =>
    setSections((prev) => [
      ...prev,
      { title: "", type: "list", items: [""], content: "" },
    ]);

  const removeSection = (i: number) =>
    setSections((prev) => prev.filter((_, idx) => idx !== i));

  const updateSection = (
    i: number,
    field: keyof TruckSection,
    value: string,
  ) => {
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? {
              ...s,
              [field]: value,
              // reset items/content on type change
              ...(field === "type" && value === "list"
                ? { items: s.items.length ? s.items : [""] }
                : {}),
              ...(field === "type" && value === "text" ? { content: "" } : {}),
            }
          : s,
      ),
    );
  };

  const addListItem = (sectionIdx: number) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx ? { ...s, items: [...s.items, ""] } : s,
      ),
    );

  const removeListItem = (sectionIdx: number, itemIdx: number) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx
          ? { ...s, items: s.items.filter((_, j) => j !== itemIdx) }
          : s,
      ),
    );

  const updateListItem = (
    sectionIdx: number,
    itemIdx: number,
    value: string,
  ) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx
          ? {
              ...s,
              items: s.items.map((item, j) => (j === itemIdx ? value : item)),
            }
          : s,
      ),
    );

  // ---- PDFs helpers ----
  const addPdf = () =>
    setPdfs((prev) => [...prev, { name: "", url: "" }]);

  const removePdf = (i: number) =>
    setPdfs((prev) => prev.filter((_, idx) => idx !== i));

  const updatePdf = (i: number, field: keyof TruckPdf, value: string) =>
    setPdfs((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    );

  const handlePdfUpload = async (pdfIdx: number, file: File) => {
    setUploadingPdf(pdfIdx);
    try {
      const supabase = createSupabaseBrowser();
      const folder = storageFolderRef.current;
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const storagePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("fichas-tecnicas")
        .upload(storagePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("fichas-tecnicas")
        .getPublicUrl(storagePath);

      updatePdf(pdfIdx, "url", data.publicUrl);
    } catch (err) {
      alert(
        "Error al subir el PDF: " +
          (err instanceof Error ? err.message : "Error desconocido"),
      );
    } finally {
      setUploadingPdf(null);
    }
  };

  const SPEC_SECTIONS: { key: keyof Vehicle; label: string }[] = [
    { key: "specsMotorizacion", label: "Motorización" },
    { key: "specsPotencia", label: "Potencia" },
    { key: "specsDimensiones", label: "Dimensiones" },
    { key: "specsCantidades", label: "Cantidades, dimensiones y pesos" },
    { key: "specsPerformance", label: "Performance" },
    { key: "specsCarroceria", label: "Carrocería" },
    { key: "specsChasis", label: "Chasis" },
    { key: "specsConsumo", label: "Consumo y emisión" },
  ];

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        Cargando vehículo...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto p-8 space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? "Editar Camión" : "Crear Nuevo Camión"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Accelo · Atego · Actros · Arocs · Axor
            </p>
          </div>
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

        {/* IMPORTAR JSON (acelera la carga manual) */}
        <JsonImport
          onImport={(data) =>
            setFormData((prev) => ({ ...prev, ...data }))
          }
        />

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
                placeholder="ej: Arocs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Modelo <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900"
              >
                <option value="">Seleccionar...</option>
                <option value="accelo">Accelo</option>
                <option value="atego">Atego</option>
                <option value="actros">Actros</option>
                <option value="arocs">Arocs</option>
                <option value="axor">Axor</option>
              </select>
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

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Combustible
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type || "diesel"}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-gray-900"
              >
                <option value="diesel">Diésel</option>
                <option value="nafta">Nafta</option>
                <option value="gas">Gas</option>
              </select>
            </div>
          </div>

          {/* Hero text */}
          <div className="grid grid-cols-1 gap-3 pt-2 border-t">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Subtítulo del Hero
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-gray-900"
                placeholder="ej: Fuerza Todo Terreno."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Título principal (debajo del hero)
              </label>
              <input
                type="text"
                name="equipmentGeneralTitle"
                value={formData.equipmentGeneralTitle || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-gray-900"
                placeholder="ej: AROCS, POTENCIÁ TU FUERZA TODO TERRENO."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Descripción principal
              </label>
              <textarea
                name="equipmentGeneralDescription"
                value={formData.equipmentGeneralDescription || ""}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border rounded-md text-gray-900"
                placeholder="ej: El Arocs: robustez, versatilidad y seguridad..."
              />
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-xs text-gray-600">
            📸 Imagen hero: subir a{" "}
            <code className="bg-blue-100 px-1">/public/vehicles/{vehicleId || "[id]"}/hero.avif</code>
          </div>
        </section>

        {/* ASPECTOS DESTACADOS */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Aspectos Destacados
          </h2>
          <p className="text-xs text-gray-500">
            Datos clave del hero (ej: Carga útil, Motor, Potencia)
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-800">
                  Aspecto {num}
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name={`aspecto${num}Valor`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(formData as any)[`aspecto${num}Valor`] || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md text-gray-900"
                    placeholder="ej: 3.500 kg"
                  />
                  <input
                    type="text"
                    name={`aspecto${num}Label`}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(formData as any)[`aspecto${num}Label`] || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md text-gray-900"
                    placeholder="ej: Carga útil"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIONES */}
        <section className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Secciones de Contenido
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Cada sección tiene una imagen + título + contenido (lista o texto). Las imágenes van a{" "}
                <code className="bg-gray-100 px-1">/vehicles/{vehicleId || "[id]"}/sections/1.avif</code>,{" "}
                <code className="bg-gray-100 px-1">2.avif</code>, etc.
              </p>
            </div>
            <button
              type="button"
              onClick={addSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
            >
              + Agregar sección
            </button>
          </div>

          {sections.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">
              No hay secciones. Hacé clic en &quot;Agregar sección&quot; para comenzar.
            </p>
          )}

          {sections.map((section, sIdx) => (
            <div
              key={sIdx}
              className="border border-gray-200 rounded-lg p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">
                  Sección {sIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeSection(sIdx)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Título
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(sIdx, "title", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md text-gray-900"
                    placeholder="ej: Seguridad."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Tipo de contenido
                  </label>
                  <select
                    value={section.type}
                    onChange={(e) =>
                      updateSection(sIdx, "type", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md text-gray-900"
                  >
                    <option value="list">Solo lista</option>
                    <option value="text">Solo texto</option>
                    <option value="both">Texto + lista</option>
                  </select>
                </div>
              </div>

              {/* Descripción (visible en tipo "text" y "both") */}
              {(section.type === "text" || section.type === "both") && (
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Descripción
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      updateSection(sIdx, "content", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md text-gray-900"
                    placeholder="ej: Motor OM 460 de hasta 476 CV y 2.300 Nm..."
                  />
                </div>
              )}

              {/* Lista (visible en tipo "list" y "both") */}
              {(section.type === "list" || section.type === "both") && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">
                    Ítems de la lista
                  </label>
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          updateListItem(sIdx, iIdx, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                        placeholder="ej: ABS"
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(sIdx, iIdx)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        −
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(sIdx)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    + Agregar ítem
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-400">
                📸 Imagen: /public/vehicles/{vehicleId || "[id]"}/sections/{sIdx + 1}.avif
              </p>
            </div>
          ))}
        </section>

        {/* FICHAS TÉCNICAS */}
        <section className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Fichas Técnicas
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Un PDF por cada variante del modelo (ej: Arocs 2040 S, Arocs 3340 K)
              </p>
            </div>
            <button
              type="button"
              onClick={addPdf}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm whitespace-nowrap"
            >
              + Agregar PDF
            </button>
          </div>

          {pdfs.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">
              No hay fichas técnicas cargadas.
            </p>
          )}

          {pdfs.map((pdf, pIdx) => (
            <div
              key={pIdx}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">
                  Ficha {pIdx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePdf(pIdx)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Nombre del modelo
                </label>
                <input
                  type="text"
                  value={pdf.name}
                  onChange={(e) => updatePdf(pIdx, "name", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-gray-900"
                  placeholder="ej: Arocs 2040 S"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Archivo PDF
                </label>
                {/* Hidden file input */}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  ref={(el) => {
                    fileInputRefs.current[pIdx] = el;
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePdfUpload(pIdx, file);
                  }}
                />

                {pdf.url ? (
                  /* Already uploaded — show filename + option to replace */
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
                      <span className="text-red-500 font-bold text-xs">PDF</span>
                      <span className="text-sm text-gray-700 truncate">
                        {pdf.url.split("/").pop()}
                      </span>
                      <span className="text-green-600 text-xs ml-auto">✓ Subido</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[pIdx]?.click()}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 whitespace-nowrap"
                    >
                      Reemplazar
                    </button>
                  </div>
                ) : (
                  /* Not uploaded yet */
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[pIdx]?.click()}
                    disabled={uploadingPdf === pIdx}
                    className="w-full border-2 border-dashed border-gray-300 rounded-md py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                  >
                    {uploadingPdf === pIdx
                      ? "Subiendo..."
                      : "Hacé clic para seleccionar el PDF"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* ESPECIFICACIONES TÉCNICAS */}
        <section className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
            Especificaciones Técnicas
          </h2>
          <p className="text-xs text-gray-500">
            Solo las secciones con datos se muestran en el sitio.
          </p>

          {SPEC_SECTIONS.map(({ key, label }) => (
            <div key={key} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {label}
              </h3>
              {(
                (formData[key] as { valor: string; label: string }[]) || []
              ).map((item, index) => (
                <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={item.valor}
                    onChange={(e) =>
                      updateSpecItem(key, index, "valor", e.target.value)
                    }
                    placeholder="Valor (ej: 150 CV)"
                    className="px-3 py-2 border rounded-md text-gray-900"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        updateSpecItem(key, index, "label", e.target.value)
                      }
                      placeholder="Etiqueta (ej: Potencia máxima)"
                      className="flex-1 px-3 py-2 border rounded-md text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecItem(key, index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      −
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSpecItem(key)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                + Agregar item
              </button>
            </div>
          ))}
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
                ? "Actualizar Camión"
                : "Crear Camión"}
          </button>
        </div>
      </form>
    </div>
  );
}
