# Leonardo Guzman — Mercedes-Benz

Sitio web del concesionario oficial Mercedes-Benz de Automotores Mega (Argentina, Entre Ríos), operado por el vendedor Leonardo Guzman. Incluye:

- **Catálogo público** de vehículos (Autos, SUVs, Vans, Sprinter, Camiones).
- **Panel admin** para CRUD de vehículos (`/admin`).
- **CRM tipo Kanban** para seguimiento de leads, con zonas geográficas, agenda y reschedule automático (`/crm`).

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5** estricto
- **Tailwind CSS v4** · **Framer Motion** · **Lucide icons** · **`@dnd-kit`** (drag&drop CRM) · **Embla Carousel**
- **Supabase** (Postgres + Auth) — tabla `vehicles` para catálogo, `crm_*` para CRM
- **Vercel** (deploy + Cron diario para el reschedule del CRM)

## Setup local

```bash
npm install
cp .env.example .env.local       # editá los valores reales
npm run dev                      # http://localhost:3000
```

### Variables de entorno

Ver [`.env.example`](.env.example) para la lista completa. Las críticas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` — del dashboard de Supabase.
- `CRON_SECRET` — string random largo. Tiene que coincidir entre `.env.local` y Vercel → Project Settings → Environment Variables.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Dev server con Turbopack en `:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint sobre todo `src/` |

Los scripts `dev` y `build` envuelven el comando con `cross-env NODE_OPTIONS=--require=./scripts/silence-baseline-warning.cjs` para silenciar un warning ruidoso de `baseline-browser-mapping` que Turbopack emite desde sus workers.

## Estructura principal

```
src/
├── app/
│   ├── (rutas públicas)         home, about, contact, financiacion, plan-ahorro, usados
│   ├── vehicles/[id]/           detalle (auto/SUV vs camión, dos clientes distintos)
│   ├── admin/                   CRUD vehículos (login + nuevo, editar, guia-imagenes)
│   ├── crm/[zona]/              kanban CRM (pizarrón, agenda, ventas)
│   └── api/{vehicles,crm}/      endpoints REST
├── components/                  componentes globales + crm/
├── lib/
│   ├── supabase.ts              cliente anon (legacy, solo para reads públicos)
│   ├── supabase-client.ts       cliente browser (SSR cookies)
│   ├── supabase-server.ts       cliente RSC (SSR cookies)
│   ├── vehicles/mapping.ts      camelCase ↔ snake_case para `vehicles`
│   ├── parseVehicle.ts          parser de la columna a la interfaz `Vehicle`
│   └── crm/                     queries, actions, history, date-logic, constants
├── data/vehicles.ts             interfaz `Vehicle` (modelo del frontend)
├── types/{crm,supabase}.ts      tipos del dominio + tipos generados de Supabase
└── proxy.ts                     ex-middleware (Next 16): auth gate de /admin, /crm, /api/*
public/
├── vehicles/{vehicleId}/        imágenes por vehículo (convención de nombres)
└── fichas-tecnicas/             PDFs de camiones
sql-updates/                     migraciones idempotentes (002–008)
```

## Imágenes de vehículos

Las imágenes **no** se guardan en Supabase — se suben manualmente a `/public/vehicles/<id>/`. El admin tiene una "Guía de imágenes" (`/admin/guia-imagenes/[id]`) que muestra exactamente qué archivos subir y a dónde. Convención:

```
public/vehicles/<id>/
├── hero/{hero,hero-mobile}.jpg
├── foto-card/card.{jpg,avif,...}
├── exterior/{1..10}.{avif,webp,jpg}
├── colors/{1..7}.{avif,...}
├── interior/{1..10}.{avif,...}
└── equipment/{1..8}.{avif,...}
```

## CRM

- Cada vendedor opera dentro de una **zona** (`crm_zonas`) — `/crm` redirige a la primera zona activa.
- Cada lead es una **card** (`crm_cards`) que se mueve por columnas (Contacto → Llamada/Visita → Cotizar → Seguimiento) y zonas (Pizarrón → Agenda → Ventas).
- **Regla de los 20 días:** una card con `next_contact_at > hoy + 20d` se mueve a Agenda; si la fecha cae a ≤20d, vuelve a Contacto del Pizarrón. Se aplica al crear, editar y vía cron diario (00:00 ART, [`vercel.json`](vercel.json)).
- Toda acción se registra en `crm_card_history` (visible en el drawer de cada card).

## Deploy

Vercel con `framework: nextjs`. La sección `crons` de [`vercel.json`](vercel.json) configura el reschedule diario. El endpoint `/api/crm/cron/reschedule` valida `Authorization: Bearer ${CRON_SECRET}` con comparación timing-safe.

### Aplicar migraciones de DB

Las SQL están en `sql-updates/` numeradas en orden. Aplicar con Supabase MCP (`apply_migration`) o copiando al SQL Editor del dashboard. Todas son idempotentes.

## Notas operativas

- **`vehicles` y RLS:** RLS está habilitado, con policy SELECT pública (anon puede leer) y policy ALL para `authenticated` (admin puede escribir vía SSR). Ver [`sql-updates/008_vehicles_rls.sql`](sql-updates/008_vehicles_rls.sql).
- **Bucket `fichas-tecnicas`:** público para download por URL directa, pero el listing está cerrado y solo `authenticated` puede subir/modificar/borrar. Ver [`sql-updates/009_storage_fichas_lockdown.sql`](sql-updates/009_storage_fichas_lockdown.sql).
- **Policies CRM `USING(true) WITH CHECK(true)`:** las tablas `crm_*` tienen policies permisivas para `authenticated` — cualquier usuario logueado puede leer/escribir cualquier card de cualquier zona. **Es intencional**: el sistema es single-tenant (Leonardo y su equipo comparten visibilidad). Supabase Advisor lo marca como `rls_policy_always_true` (WARN, no ERROR) — ignorar mientras se mantenga el modelo. Si en algún momento se necesita scoping por vendedor, cambiar a `USING(created_by = auth.uid())` o agregar una columna `assigned_to`.
- **Leaked password protection deshabilitada:** Supabase Auth ofrece chequear passwords contra HaveIBeenPwned al registrarse. Está **deshabilitado a propósito** porque (a) el feature requiere plan Pro y (b) la app no tiene registro público — los usuarios de `/admin` y `/crm` los crea manualmente Leonardo desde el dashboard de Supabase. Advisor lo marca `auth_leaked_password_protection` (WARN) — aceptado.
- **Tipos Supabase:** [`src/types/supabase.ts`](src/types/supabase.ts) es el espejo del schema real. Si agregás/quitás columnas en la DB, regenerá ese archivo con `mcp__supabase__generate_typescript_types`.
- **Frontend `Vehicle` (camelCase) vs DB (snake_case):** la conversión vive en [`src/lib/parseVehicle.ts`](src/lib/parseVehicle.ts) (read) y [`src/lib/vehicles/mapping.ts`](src/lib/vehicles/mapping.ts) (write).
