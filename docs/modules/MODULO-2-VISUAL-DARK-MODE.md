# MÓDULO 2 · ADENDA — VISUAL DARK MODE PREMIUM

## Qué se hizo

Se reestiló todo el frontend del Módulo 2 para cumplir la sección 2.1 del prompt maestro ("DARK MODE PREMIUM"): fondo oscuro profundo, tarjetas `slate-900`, bordes sutiles `slate-800`, títulos blancos, textos `slate-400`, acento cian con efecto neón en los CTA e iconos `lucide-react`. Sin cambios de lógica ni de datos.

## Por qué

La sección 2.1 se incorporó al prompt después de construir el Módulo 2. Aplica desde el Módulo 2 en adelante, así que era necesario alinear el frontend existente.

## Arquitectura

Estilos declarativos con clases Tailwind (v4) aplicadas directamente en cada componente. Paleta coherente en todo el sitio:

| Elemento | Clases |
|---|---|
| Body / fondo | `bg-slate-950` |
| Tarjetas / secciones | `bg-slate-900` |
| Bordes | `border-slate-800` |
| Títulos | `text-white` |
| Párrafos / descripciones | `text-slate-400` |
| Botones CTA (centro) | `bg-cyan-500 text-slate-950` + glow `hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]` |
| Glow en tarjetas (hover) | `hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]` + `hover:border-cyan-500/60` |
| Navbar (glassmorphism) | `bg-slate-950/70 backdrop-blur-md` |

## Archivos creados

- `docs/modules/MODULO-2-VISUAL-DARK-MODE.md`

## Archivos modificados

- `app/frontend/src/index.css` (body oscuro)
- `app/frontend/src/components/Navbar.tsx` (glassmorphism, logo cyan + Sparkles, enlaces cyan)
- `app/frontend/src/components/Footer.tsx` (oscuro)
- `app/frontend/src/pages/Home.tsx` (hero: título blanco, eyebrow cyan, CTA neon, acento Sparkles)
- `app/frontend/src/pages/Servicios.tsx` (tarjetas oscuras + icono + glow hover)
- `app/frontend/src/pages/Nosotros.tsx` (tarjetas oscuras + iconos Target/Eye/Gem)
- `app/frontend/src/pages/Contacto.tsx` (formulario oscuro, inputs `focus:border-cyan-500`, botón neon)
- `app/frontend/package.json` + `package-lock.json`

## Dependencias

- **lucide-react**: librería de iconos (la sección 2.1 la exige explícitamente). Alternativas consideradas: `@heroicons/react`, `react-icons`, SVGs manuales.

## API

Sin cambios (los estilos no tocan la lógica ni las rutas).

## Base de datos

Sin cambios.

## Seguridad

Sin cambios. Se conservan los `aria-hidden="true"` en iconos decorativos (accesibilidad).

## Testing

```text
npm run lint       ✅
npm run typecheck  ✅
npm test           ✅ (3 pruebas de navegación y contenido)
npm run build      ✅ (dist generado)
```

## Git

- Commits locales por archivo. Push: NO REALIZADO (por ahora).

## Problemas

1. La edición inicial de `Navbar.tsx` dejó un envoltorio `<script>...</script>` accidental; se removió con un reemplazo de texto del archivo.

## Soluciones

1. Reemplazo de las cadenas `<script>` / `</script>` en el archivo para dejarlo como módulo TSX válido.

## Cómo modificarlo

- Ajustar la paleta: editar las clases de cada componente o la regla `body` en `src/index.css`.
- Cambiar el glow: modificar la sombra `0_0_20px_rgba(6,182,212,0.5)` (glow) en botones/tarjetas.
- Añadir iconos: importar desde `lucide-react` y colorear con `text-cyan-400`.