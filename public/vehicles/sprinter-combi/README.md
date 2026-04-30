# Imágenes — Sprinter Combi

**ID:** `sprinter-combi`

Subí las imágenes a las subcarpetas de abajo. Formatos aceptados: `.avif`, `.webp`, `.jpg`, `.jpeg`, `.png`. Recomendado: **AVIF** o **WEBP** (más livianos).

El frontend prueba los formatos en orden: `avif → webp → jpg → jpeg → png`. Con que exista uno alcanza.

## Estructura

| Carpeta | Qué va | Cuántas |
|---|---|---|
| `hero/` | `hero.jpg` (desktop) + `hero-mobile.jpg` (mobile) | 2 |
| `foto-card/` | `card.avif` — la imagen del listado de vehículos | 1 |
| `exterior/` | `1.avif`, `2.avif`, … — un archivo por feature de exterior | ver README |
| `colors/` | `1.avif`, `2.avif`, … — variantes de color | hasta 7 |
| `interior/` | `1.avif`, `2.avif`, … — un archivo por feature de interior | ver README |
| `equipment/<categoría>/` | `1.avif`, `2.avif`, … — uno por equipamiento | ver README |

Cada subcarpeta tiene su propio `README.md` con la lista exacta de qué item representa cada número.
