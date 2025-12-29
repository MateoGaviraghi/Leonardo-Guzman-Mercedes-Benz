# 🚀 Fase 1: Configuración de Supabase

## ✅ Completado

1. ✅ Instalado `@supabase/supabase-js`
2. ✅ Creado `src/lib/supabase.ts` (cliente)
3. ✅ Creado `src/types/supabase.ts` (tipos TypeScript)
4. ✅ Creado `.env.local` (variables de entorno)

---

## 📋 Pasos para completar Fase 1

### 1️⃣ Crear cuenta en Supabase (si no tienes)

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

### 2️⃣ Obtener credenciales

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia estos valores:

   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Pega las credenciales en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### 3️⃣ Crear tabla `vehicles`

1. En Supabase, ve a **SQL Editor**
2. Copia y ejecuta este SQL:

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
CREATE INDEX idx_vehicles_is_amg ON vehicles(is_amg);
```

### 4️⃣ Habilitar Row Level Security (RLS)

**IMPORTANTE**: Por defecto, la tabla necesita permisos públicos de lectura para que el frontend pueda consultar los datos.

Ejecuta en SQL Editor:

```sql
-- Habilitar RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (GET)
CREATE POLICY "Enable read access for all users"
ON vehicles FOR SELECT
USING (true);

-- Solo admins pueden escribir (INSERT/UPDATE/DELETE)
-- Por ahora dejamos deshabilitado, en Fase 2 crearemos el admin panel
```

### 5️⃣ Verificar instalación

Una vez completados los pasos anteriores, avísame para crear una función de prueba que consulte Supabase y verifique que todo funciona.

---

## 📝 Checklist

- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Credenciales copiadas a `.env.local`
- [ ] Tabla `vehicles` creada
- [ ] RLS configurado
- [ ] Índices creados
- [ ] Listo para Fase 2 (Admin Panel)

---

**Siguiente paso**: Una vez completado esto, créame un vehículo de prueba manualmente en Supabase para verificar que todo funciona correctamente.
