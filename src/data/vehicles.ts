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

  // ========== ASPECTOS GENERALES (4 items en hero) ==========
  aspecto1?: string; // Ej: "163 CV"
  aspecto2?: string; // Ej: "270 Nm"
  aspecto3?: string; // Ej: "0-100 en 8.4s"
  aspecto4?: string; // Ej: "229 km/h"

  // ========== EXTERIOR ==========
  exteriorDescription?: string; // Descripción general del exterior
  // Captions para cada foto (frontend busca /vehicles/{id}/exterior/1.jpg, 2.jpg, etc)
  exterior1Caption?: string;
  exterior2Caption?: string;
  exterior3Caption?: string;
  exterior4Caption?: string;
  exterior5Caption?: string;
  exterior6Caption?: string;

  // ========== COLORES ==========
  // Frontend maneja automáticamente: /vehicles/{id}/colors/1.jpg, 2.jpg, etc
  color1Name?: string; // Ej: "Blanco Polar"
  color2Name?: string;
  color3Name?: string;
  color4Name?: string;
  color5Name?: string;

  // ========== INTERIOR ==========
  interiorDescription?: string; // Descripción general del interior
  // Captions para cada foto (frontend busca /vehicles/{id}/interior/1.jpg, 2.jpg, etc)
  interior1Caption?: string;
  interior2Caption?: string;
  interior3Caption?: string;
  interior4Caption?: string;
  interior5Caption?: string;
  interior6Caption?: string;

  // ========== DATOS TÉCNICOS (TODO opcional) ==========
  // Cada categoría es un array de { label, value }
  specsConsumo?: SpecItem[]; // Ej: [{ label: "Capacidad tanque", value: "43 L" }]
  specsMotorizacion?: SpecItem[];
  specsPotencia?: SpecItem[];
  specsDimensiones?: SpecItem[];
  specsPerformance?: SpecItem[];
  specsCarroceria?: SpecItem[];
  specsChasis?: SpecItem[];
  specsPesos?: SpecItem[];

  // ========== EQUIPAMIENTO ==========
  // Frontend busca imágenes: /vehicles/{id}/equipment/1.jpg, 2.jpg, etc
  equip1Title?: string;
  equip1Description?: string;
  equip2Title?: string;
  equip2Description?: string;
  equip3Title?: string;
  equip3Description?: string;
  equip4Title?: string;
  equip4Description?: string;
  equip5Title?: string;
  equip5Description?: string;
  equip6Title?: string;
  equip6Description?: string;
  equip7Title?: string;
  equip7Description?: string;
  equip8Title?: string;
  equip8Description?: string;
}

// ========================================
// DATOS DE VEHÍCULOS
// ========================================
// TODO: Estos datos serán migrados a Supabase en Fase 1
// Por ahora dejamos vacío para el build limpio

export const vehicleData: Record<string, Vehicle> = {};
