# RESTYLE APROBADO — TEMA CLARO "PULCRITUD VERDE"

## Qué se hizo

Se reemplazó el diseño oscuro (Dark Mode Premium) de todo el frontend por el **tema claro "Pulcritud Verde"** aprobado por el propietario (sección 2.2 del prompt maestro), replicando la preview `preview_highclean_motion.html`: paleta derivada del logo, degradado de fondo diagonal, paneles glass, tarjetas blancas con hover elevado, hero con gotas en parallax, CTA con anillo de pulso, burbujas de fondo en canvas y animaciones de entrada con `motion` (Framer Motion). El logo oficial se copió a `public/logo-transparente.png` y se usa en Navbar (h-12), Hero (h-24/28) y Footer (h-10). Se conservó todo el comportamiento existente: rutas, fetches, placeholders TODO y tests.

## Por qué

El cliente pidió cambiar el diseño de la UI; la sección 2.2 del prompt maestro quedó actualizada y el frontend real estaba aún en tema oscuro.

## Arquitectura

```text
Layout (MotionConfig reducedMotion="user")
  ├── Background (canvas burbujas + círculos blur-3xl drift)  [fijo z-0]
  ├── Navbar (glass blanco, logo h-12, menú responsive, CTA Cotizar)
  ├── <Outlet/> → páginas (Home/Servicios/Nosotros/Galería/Contacto)
  └── Footer (glass, logo h-10, wordmark, copyright + TODO)
```

Diseño: tokens `@theme` en `index.css` (`--color-brand-*`), fuentes Sora/Inter, keyframes `float`/`drift`/`pulse-ring`, utilidades animadas `animate-float`/`animate-pulse-ring`, respeto a `prefers-reduced-motion` (CSS + `MotionConfig reducedMotion="user"`).

## Archivos creados

- `app/frontend/public/logo-transparente.png` (copia del oficial, 533×360)
- `app/frontend/src/lib/motion.ts` (EASE + variantes container/item/itemCard)
- `app/frontend/src/components/Background.tsx` (burbujas canvas + círculos drift)
- `app/frontend/src/components/SectionHeader.tsx` (etiqueta + título gradiente)
- `docs/modules/RESTYLE-APROBADO.md`
- apuntes de aprendizaje (no versionados)

## Archivos modificados

- `app/frontend/src/index.css` (tokens @theme, fuentes, keyframes, body claro)
- `app/frontend/src/components/Navbar.tsx` (tema claro + logo + menú móvil)
- `app/frontend/src/components/Footer.tsx` (tema claro + logo)
- `app/frontend/src/components/Layout.tsx` (MotionConfig + saltar al contenido + Background)
- `app/frontend/src/pages/Home.tsx` (Hero con gotas parallax, float, pulse-ring, stats)
- `app/frontend/src/pages/Servicios.tsx` (encabezado gradiente + tarjetas nueva UI)
- `app/frontend/src/pages/Nosotros.tsx` (2 columnas + misión/visión/valores + badge 100%)
- `app/frontend/src/pages/Galería.tsx` (galería `src/pages/Galeria.tsx` + empty state)
- `app/frontend/src/pages/Contacto.tsx` (2 columnas + formulario nueva UI)
- `app/frontend/src/test/setup.ts` (mocks IntersectionObserver + canvas)
- `app/frontend/package.json` + `package-lock.json` (dependencia `motion`)

## Dependencias

- `motion@13.2.0` (sucesor oficial de `framer-motion`, soporta React 19). Explicado y autorizado antes de instalar (secciones 2 y 4.1).

## API

- Sin cambios. Siguen funcionando `/api/v1/company`, `/api/v1/services`, `/api/v1/gallery` vía proxy dev.

## Base de datos

- Sin cambios.

## Seguridad

- Sin cambios de superficie. Burbujas y animaciones son decorativas (`pointer-events-none`, `aria-hidden`).

## Testing

```text
Frontend: lint ✅ typecheck ✅ test ✅ (3) build ✅
Backend:  lint ✅ typecheck ✅ test ✅ (7) build ✅
Smoke: 5173/ → HTTP 200 · /logo-transparente.png → 200 (131.690 B) · API servicios → []
```
Nota (problema resuelto): jsdom no implementa `IntersectionObserver` ni `canvas.getContext`; se añadieron mocks en `src/test/setup.ts` para que `motion` (whileInView) y el fondo decorativo no rompan los tests.

## Git

- Commits atómicos (17.1): style por componente + feat animations + test setup + docs. Push: NO REALIZADO (pendiente autorización).

## Problemas

- `IntersectionObserver is not defined` en tests (navegaciones a páginas con `whileInView`).
- Warning de jsdom por `canvas.getContext`.

## Soluciones

- Mocks en `src/test/setup.ts`.
- Guard en `Background.tsx` (`if (!ctx) return`) + mock de `getContext`.

## Cómo modificarlo

- Paleta: editar los `--color-brand-*` en `app/frontend/src/index.css`.
- Animaciones de entrada: `app/frontend/src/lib/motion.ts` (variantes).
- Fondo decorativo: `app/frontend/src/components/Background.tsx`.
- Hero: `app/frontend/src/pages/Home.tsx` (copiar parámetros de parallax/float).
- WhatsApp (CTA verde): NO implementado; corresponde al Módulo 10 (requiere `WHATSAPP_NUMBER`).