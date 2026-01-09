// ========================================
// NUEVA ESTRUCTURA SIMPLIFICADA
// ========================================
// Backend (Supabase) = SOLO TEXTO
// Frontend (Next.js) = SOLO IMÁGENES en /public/vehicles/
// Relación por nombre: exterior1Caption -> /vehicles/{id}/exterior/1.jpg
// ========================================

export interface SpecItem {
  label: string;
  value: string;
}

/**
 * Estructura de vehículo simplificada
 * - Backend guarda solo texto/datos
 * - Frontend maneja imágenes por convención de nombres
 * - Todos los campos opcionales excepto id, name, category, brand, is_amg
 */
export interface Vehicle {
  // ========== OBLIGATORIO ==========
  id: string; // Slug único: "cla-200-progressive"
  name: string; // Nombre display: "CLA 200 Progressive"
  category: string; // "Autos" | "SUV" | "Eléctricos"
  brand: string; // "Mercedes-Benz"
  is_amg: boolean; // true si es modelo AMG, false si es normal

  // ========== HERO ==========
  subtitle?: string; // Subtítulo del hero (opcional)

  // ========== ASPECTOS GENERALES (4 items en hero) ==========
  // Cada aspecto tiene valor + etiqueta (ej: "163 CV" + "Potencia")
  aspecto1Valor?: string; // Ej: "163 CV"
  aspecto1Label?: string; // Ej: "Potencia"
  aspecto2Valor?: string; // Ej: "270 Nm"
  aspecto2Label?: string; // Ej: "Par motor"
  aspecto3Valor?: string; // Ej: "8,4 s"
  aspecto3Label?: string; // Ej: "Aceleración en 0 a 100 km/h"
  aspecto4Valor?: string; // Ej: "229 km/h"
  aspecto4Label?: string; // Ej: "Velocidad máxima"

  // ========== EXTERIOR (hasta 10 imágenes) ==========
  // Cada imagen tiene título + descripción (igual que equipamiento)
  exterior1Title?: string; // Ej: "Diseño frontal"
  exterior1Description?: string; // Descripción de la imagen 1
  exterior2Title?: string;
  exterior2Description?: string;
  exterior3Title?: string;
  exterior3Description?: string;
  exterior4Title?: string;
  exterior4Description?: string;
  exterior5Title?: string;
  exterior5Description?: string;
  exterior6Title?: string;
  exterior6Description?: string;
  exterior7Title?: string;
  exterior7Description?: string;
  exterior8Title?: string;
  exterior8Description?: string;
  exterior9Title?: string;
  exterior9Description?: string;
  exterior10Title?: string;
  exterior10Description?: string;

  // ========== COLORES (5 opciones) ==========
  // Solo imágenes - el frontend las muestra en un slider
  // No hay título ni descripción - solo cambio visual del color
  // Frontend busca: /vehicles/{id}/colors/1.avif, 2.avif, 3.avif, etc.

  // ========== INTERIOR (hasta 10 imágenes) ==========
  // Cada imagen tiene título + descripción
  interior1Title?: string; // Ej: "Habitáculo premium"
  interior1Description?: string; // Descripción de la imagen 1
  interior2Title?: string;
  interior2Description?: string;
  interior3Title?: string;
  interior3Description?: string;
  interior4Title?: string;
  interior4Description?: string;
  interior5Title?: string;
  interior5Description?: string;
  interior6Title?: string;
  interior6Description?: string;
  interior7Title?: string;
  interior7Description?: string;
  interior8Title?: string;
  interior8Description?: string;
  interior9Title?: string;
  interior9Description?: string;
  interior10Title?: string;
  interior10Description?: string;

  // ========== ESPECIFICACIONES TÉCNICAS ==========
  // 9 categorías, cada una con array de items { valor, label }
  // Consumo y emisión
  specsConsumo?: { valor: string; label: string }[];
  // Motorización
  specsMotorizacion?: { valor: string; label: string }[];
  // Potencia y autonomía
  specsPotencia?: { valor: string; label: string }[];
  // Dimensiones
  specsDimensiones?: { valor: string; label: string }[];
  // Performance
  specsPerformance?: { valor: string; label: string }[];
  // Carrocería
  specsCarroceria?: { valor: string; label: string }[];
  // Chasis
  specsChasis?: { valor: string; label: string }[];
  // Cantidades, dimensiones y pesos
  specsCantidades?: { valor: string; label: string }[];
  // Batería y carga (para vehículos eléctricos)
  specsBateriaCarga?: { valor: string; label: string }[];

  // ========== DIMENSIONES ==========
  // Carousel de imágenes (diagramas del vehículo con medidas)
  // Frontend busca: /vehicles/{id}/dimensions/1.avif, 2.avif, etc.
  // Sin campos de texto - solo imágenes

  // ========== EQUIPAMIENTO ==========
  // Título y descripción general
  equipmentGeneralTitle?: string;
  equipmentGeneralDescription?: string;

  // 5 categorías fijas, cada una con array de items { title?, description? }
  // Frontend busca imágenes: /vehicles/{id}/equipment/multimedia/1.avif, 2.avif...
  // Sistema de multimedias
  equipMultimedia?: { title?: string; description?: string }[];
  // Sistemas de asistencia a la conducción
  equipAsistencia?: { title?: string; description?: string }[];
  // Confort
  equipConfort?: { title?: string; description?: string }[];
  // Tren de rodaje
  equipTrenRodaje?: { title?: string; description?: string }[];
  // Seguridad
  equipSeguridad?: { title?: string; description?: string }[];
}

// ========================================
// DATOS DE VEHÍCULOS
// ========================================
// TODO: Estos datos serán migrados a Supabase en Fase 1
// Por ahora dejamos vacío para el build limpio

export const vehicleData: Record<string, Vehicle> = {};
