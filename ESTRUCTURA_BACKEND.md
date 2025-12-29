# Estructura Backend - Supabase

## 📊 Tabla: `vehicles`

```sql
CREATE TABLE vehicles (
  -- OBLIGATORIO
  id TEXT PRIMARY KEY,              -- "cla-200-progressive"
  name TEXT NOT NULL,               -- "CLA 200 Progressive"
  category TEXT NOT NULL,           -- "Autos" | "SUV" | "Eléctricos"
  brand TEXT NOT NULL DEFAULT 'Mercedes-Benz',
  is_amg BOOLEAN NOT NULL DEFAULT FALSE, -- true = AMG, false = normal
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- ASPECTOS GENERALES (4 highlights en hero)
  aspecto_1 TEXT,                   -- "163 CV"
  aspecto_2 TEXT,                   -- "270 Nm"
  aspecto_3 TEXT,                   -- "0-100 en 8.4s"
  aspecto_4 TEXT,                   -- "229 km/h"

  -- EXTERIOR
  exterior_description TEXT,        -- Descripción general
  exterior_1_caption TEXT,          -- Caption foto 1
  exterior_2_caption TEXT,
  exterior_3_caption TEXT,
  exterior_4_caption TEXT,
  exterior_5_caption TEXT,
  exterior_6_caption TEXT,

  -- COLORES
  color_1_name TEXT,                -- "Blanco Polar"
  color_2_name TEXT,
  color_3_name TEXT,
  color_4_name TEXT,
  color_5_name TEXT,

  -- INTERIOR
  interior_description TEXT,
  interior_1_caption TEXT,
  interior_2_caption TEXT,
  interior_3_caption TEXT,
  interior_4_caption TEXT,
  interior_5_caption TEXT,
  interior_6_caption TEXT,

  -- DATOS TÉCNICOS (JSONB para flexibilidad)
  specs_consumo JSONB,              -- [{ "label": "Capacidad tanque", "value": "43 L" }]
  specs_motorizacion JSONB,
  specs_potencia JSONB,
  specs_dimensiones JSONB,
  specs_performance JSONB,
  specs_carroceria JSONB,
  specs_chasis JSONB,
  specs_pesos JSONB,

  -- EQUIPAMIENTO
  equip_1_title TEXT,
  equip_1_description TEXT,
  equip_2_title TEXT,
  equip_2_description TEXT,
  equip_3_title TEXT,
  equip_3_description TEXT,
  equip_4_title TEXT,
  equip_4_description TEXT,
  equip_5_title TEXT,
  equip_5_description TEXT,
  equip_6_title TEXT,
  equip_6_description TEXT,
  equip_7_title TEXT,
  equip_7_description TEXT,
  equip_8_title TEXT,
  equip_8_description TEXT
);

-- Índices para búsqueda rápida
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_brand ON vehicles(brand);
```

## 📁 Estructura de Imágenes en Frontend

```
public/vehicles/
└── {vehicle.id}/                    # Ej: "cla-200-progressive"
    ├── hero.mp4                     # Video hero (OPCIONAL - frontend busca automáticamente)
    ├── hero.jpg                     # Imagen fallback si no hay video (OPCIONAL)
    ├── exterior/
    │   ├── 1.jpg                    # exterior_1_caption
    │   ├── 2.jpg                    # exterior_2_caption
    │   ├── 3.jpg
    │   ├── 4.jpg
    │   ├── 5.jpg
    │   └── 6.jpg
    ├── colors/
    │   ├── 1.jpg                    # color_1_name
    │   ├── 2.jpg                    # color_2_name
    │   ├── 3.jpg
    │   ├── 4.jpg
    │   └── 5.jpg
    ├── interior/
    │   ├── 1.jpg                    # interior_1_caption
    │   ├── 2.jpg
    │   ├── 3.jpg
    │   ├── 4.jpg
    │   ├── 5.jpg
    │   └── 6.jpg
    └── equipment/
        ├── 1.jpg                    # equip_1_title + equip_1_description
        ├── 2.jpg
        ├── 3.jpg
        ├── 4.jpg
        ├── 5.jpg
        ├── 6.jpg
        ├── 7.jpg
        └── 8.jpg
```

## 🔗 Relación Datos ↔ Imágenes

**Backend (Supabase):**

```json
{
  "id": "cla-200-progressive",
  "exterior_1_caption": "Diseño frontal deportivo con parrilla Mercedes-Benz Pattern",
  "exterior_2_caption": "Techo panorámico corredizo"
}
```

**Frontend (Next.js):**

```typescript
// El componente automáticamente busca:
const imagePath = `/vehicles/${vehicle.id}/exterior/1.jpg`;
const caption = vehicle.exterior_1_caption;

// Renderiza:
<img src={imagePath} />
<p>{caption}</p>
```

## 💾 Ejemplo de Inserción

```sql
INSERT INTO vehicles (
  id, name, category, brand,
  aspecto_1, aspecto_2, aspecto_3, aspecto_4,
  exterior_description,
  exterior_1_caption,
  exterior_2_caption,
  specs_motorizacion
) VALUES (
  'cla-200-progressive',
  'CLA 200 Progressive',
  'Autos',
  'Mercedes-Benz',
  '163 CV',
  '270 Nm',
  '0-100 en 8.4s',
  '229 km/h',
  'El diseño del CLA Coupé combina elegancia deportiva con líneas aerodinámicas',
  'Diseño frontal con parrilla Mercedes-Benz Pattern',
  'Techo panorámico corredizo de cristal',
  '[
    {"label": "Cilindrada", "value": "1.332 cc"},
    {"label": "Potencia", "value": "120 kW (163 CV)"},
    {"label": "Par motor", "value": "270 Nm"}
  ]'::jsonb
);
```

## 🎯 Ventajas

1. **Separación clara**: Texto en DB, imágenes en filesystem
2. **Sin costo**: Supabase gratis 500MB, Vercel imágenes gratis
3. **Simple**: Convención de nombres, no hay paths complejos
4. **Escalable**: Agregar campos sin migrar imágenes
5. **Admin fácil**: Form HTML básico con campos de texto
6. **Flexible**: Cada vehículo usa solo los campos que necesita

## 📝 Próximos Pasos

1. ✅ Crear tabla en Supabase
2. ✅ Adaptar frontend para nueva estructura
3. ✅ Crear página admin básica
4. ✅ Migrar CLA 200 a nuevo formato
