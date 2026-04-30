/**
 * Parsea un vehículo de Supabase (snake_case + JSON strings) a la interfaz Vehicle (camelCase + objetos)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseVehicleFromDB(vehicle: any) {
  if (!vehicle) return null;

  // Parsear campos JSON string → objeto
  const jsonFields = [
    ["specs_consumo", "specsConsumo"],
    ["specs_motorizacion", "specsMotorizacion"],
    ["specs_potencia", "specsPotencia"],
    ["specs_dimensiones", "specsDimensiones"],
    ["specs_performance", "specsPerformance"],
    ["specs_carroceria", "specsCarroceria"],
    ["specs_chasis", "specsChasis"],
    ["specs_cantidades", "specsCantidades"],
    ["specs_bateria_carga", "specsBateriaCarga"],
    ["equip_exterior", "equipExterior"],
    ["equip_interior", "equipInterior"],
    ["equip_multimedia", "equipMultimedia"],
    ["equip_asistencia", "equipAsistencia"],
    ["equip_confort", "equipConfort"],
    ["equip_tren_rodaje", "equipTrenRodaje"],
    ["equip_seguridad", "equipSeguridad"],
    // Categorías específicas Sprinter / Vito
    ["equip_variantes_carroceria", "equipVariantesCarroceria"],
    ["equip_carga", "equipCarga"],
    ["equip_variantes_compartimento", "equipVariantesCompartimento"],
    ["equip_equipamiento_compartimento", "equipEquipamientoCompartimento"],
    ["equip_puesto_conduccion", "equipPuestoConduccion"],
    ["charging_tab1_content", "chargingTab1Content"],
    ["charging_tab2_content", "chargingTab2Content"],
    ["truck_sections", "truckSections"],
    ["truck_pdfs", "truckPdfs"],
  ] as const;

  for (const [snakeKey, camelKey] of jsonFields) {
    if (vehicle[snakeKey] && typeof vehicle[snakeKey] === "string") {
      vehicle[camelKey] = JSON.parse(vehicle[snakeKey]);
    } else {
      vehicle[camelKey] = vehicle[snakeKey] || [];
    }
  }

  // snake_case → camelCase para campos simples
  const simpleFields = [
    ["autonomy_general_title", "autonomyGeneralTitle"],
    ["autonomy_general_description", "autonomyGeneralDescription"],
    ["autonomy_card1_title", "autonomyCard1Title"],
    ["autonomy_card1_description", "autonomyCard1Description"],
    ["autonomy_card1_link", "autonomyCard1Link"],
    ["autonomy_card2_title", "autonomyCard2Title"],
    ["autonomy_card2_description", "autonomyCard2Description"],
    ["autonomy_card2_link", "autonomyCard2Link"],
    ["charging_tab1_title", "chargingTab1Title"],
    ["charging_tab2_title", "chargingTab2Title"],
    ["aspecto_1_valor", "aspecto1Valor"],
    ["aspecto_1_label", "aspecto1Label"],
    ["aspecto_2_valor", "aspecto2Valor"],
    ["aspecto_2_label", "aspecto2Label"],
    ["aspecto_3_valor", "aspecto3Valor"],
    ["aspecto_3_label", "aspecto3Label"],
    ["aspecto_4_valor", "aspecto4Valor"],
    ["aspecto_4_label", "aspecto4Label"],
    ["equipment_general_title", "equipmentGeneralTitle"],
    ["equipment_general_description", "equipmentGeneralDescription"],
  ] as const;

  for (const [snakeKey, camelKey] of simpleFields) {
    vehicle[camelKey] = vehicle[snakeKey];
  }

  // exterior/interior 1-10
  for (let i = 1; i <= 10; i++) {
    vehicle[`exterior${i}Title`] = vehicle[`exterior_${i}_title`];
    vehicle[`exterior${i}Description`] = vehicle[`exterior_${i}_description`];
    vehicle[`interior${i}Title`] = vehicle[`interior_${i}_title`];
    vehicle[`interior${i}Description`] = vehicle[`interior_${i}_description`];
  }

  return vehicle;
}

/**
 * Determina el tab activo inicial de equipamiento
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getInitialEquipmentTab(vehicle: any): string {
  if (vehicle.equipExterior?.length > 0) return "exterior";
  if (vehicle.equipInterior?.length > 0) return "interior";
  if (vehicle.equipMultimedia?.length > 0) return "multimedia";
  if (vehicle.equipAsistencia?.length > 0) return "asistencia";
  if (vehicle.equipConfort?.length > 0) return "confort";
  if (vehicle.equipTrenRodaje?.length > 0) return "tren-rodaje";
  if (vehicle.equipSeguridad?.length > 0) return "seguridad";
  return "";
}
