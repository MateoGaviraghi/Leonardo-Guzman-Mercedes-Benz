# 🗑️ FASE 0: Limpieza y Preparación

## ✅ Tareas de Limpieza

### 1. **Eliminar archivos antiguos**

```bash
# Eliminar landing page antigua
rm -rf src/app/vehicles/detail/

# Eliminar página vehicles antigua
rm src/app/vehicles/page.tsx

# Eliminar datos antiguos
rm src/data/vehicles.ts  # Lo vamos a recrear vacío

# Eliminar carpeta CLA 200
rm -rf "public/vehicles/CLA 2000 Progressive/"
```

### 2. **Mantener intactos**

- ✅ `/vehicles/[category]/page.tsx` (transición con logo)
- ✅ Componentes: Navbar, Footer, etc.
- ✅ Resto de páginas (home, about, contact)

### 3. **Preparar estructura nueva**

```bash
# Crear nuevas carpetas
mkdir -p src/app/admin
mkdir -p src/app/vehicles/detail/[id]
mkdir -p src/lib
```

## 📋 Checklist Fase 0

- [ ] Eliminar `/vehicles/page.tsx`
- [ ] Eliminar `/vehicles/detail/[id]/page.tsx` antiguo
- [ ] Eliminar datos antiguos de `vehicles.ts`
- [ ] Eliminar carpeta CLA 200
- [ ] Crear `src/lib/supabase.ts` (vacío por ahora)
- [ ] Crear interfaz Vehicle actualizada (con `is_amg`)
- [ ] Crear tabla en Supabase con nuevo schema

## 🎯 Resultado esperado

Después de Fase 0:

- ❌ No hay landing de vehículos (lo crearemos en Fase 3)
- ❌ No hay listado de vehículos (lo crearemos en Fase 3)
- ✅ Estructura lista para empezar de 0
- ✅ Supabase configurado
- ✅ Campo `is_amg` agregado

---

**¿Procedo a ejecutar la limpieza?**
