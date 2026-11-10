-- 013 — Combustible de los 10 autos que no lo tenían (2026-11-10).
-- Sin fuel_type, el auto desaparecía al filtrar por combustible en /vehicles.
-- Fuente: páginas oficiales de mercedes-benz.com.ar (consumo en l/100 km).
-- Criterio: los mild hybrid de 48 V cuentan como nafta (igual que GLE y GLC Coupé);
-- los E PERFORMANCE son híbridos enchufables.
-- Aplicado en Supabase mjvhcqkpkfsfytiijfzh el 2026-11-10.

update vehicles set fuel_type = 'nafta'
where fuel_type is null and id in (
  '89ceb92d-c9d4-4fd1-940b-81fac745f9c9', -- Clase G
  '2053dce5-0c14-4224-b942-e07985bd078e', -- CLE Cabriolet
  'b0c0f52d-0d1e-4fb9-a3e6-e6a84b33d798', -- GLA
  'c759dc70-80ba-4537-a3e7-d01f944f4dd3', -- GLB
  'f633e4c3-ca13-44e9-8ed6-dfa7337c15d1', -- GLC SUV
  'cd4cd260-158a-4999-9e51-e519e5cf6704', -- GLE Coupé
  'cd9b669a-9398-41ff-8f24-6dda7aa8241a', -- Mercedes-AMG GT 43 Coupé
  'd5a517b8-0203-46a4-9dd9-602ce58e8e85'  -- Mercedes-Maybach Clase S
);

update vehicles set fuel_type = 'hibrido'
where fuel_type is null and id in (
  'f055ac99-c94c-4196-81d9-5d41548623aa', -- Mercedes-AMG GT 63 S E PERFORMANCE
  'a8f27db4-f288-42ae-b7e0-bb6a6a56bf5c'  -- Mercedes-AMG SL 63 S E PERFORMANCE
);
