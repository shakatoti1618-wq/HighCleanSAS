# MÓDULO 6 — SERVICIOS

## Qué se hizo

Se expone la lista pública de servicios: `GET /api/v1/services` por capas (route → controller → service → repository) con **orden determinístico** (`createdAt ASC, id ASC` como desempate), y la página Servicios del frontend se conecta a la API, dejando de usar los placeholders "Servicio 1/2/3" hardcodeados. Sin inventar servicios ni precios: si no hay registros, se muestra el placeholder `TODO`. Icono por índice con set de lucide-react (decisión 4.1, opción b).

## Por qué

Era el siguiente módulo funcional del plan y la página Servicios ya existía solo como maqueta.

## Arquitectura

```text
GET /api/v1/services
  ↓
routes/service.routes.ts
  ↓
controllers/service.controller.ts
  ↓
services/service.service.ts
  ↓
repositories/service.repository.ts
  ↓ (orderBy createdAt ASC, id ASC)
lib/prisma.ts → PostgreSQL
```

Frontend: `pages/Servicios.tsx` → `fetch('/api/v1/services')` (proxy dev) → `lib/api.ts`.

### Orden y iconos (decisión 4.1 — opción b)
- La API ordena siempre por `createdAt` ASC y `id` ASC como desempate: el orden nunca cambia sin razón explícita (insertar al final no desplaza a los anteriores).
- El frontend asigna los iconos de lucide (`Sparkles`, `Wind`, `Brush`, `Building2`) con `índice % 4`, con fallback `Sparkles`.
- El campo `icon` real por servicio se evaluará en el Módulo 13 (panel admin); hasta entonces, el icono es decorativo y depende de la posición.

## Archivos creados

- `app/backend/src/repositories/service.repository.ts`
- `app/backend/src/services/service.service.ts`
- `app/backend/src/controllers/service.controller.ts`
- `app/backend/src/routes/service.routes.ts`
- `app/backend/src/service.test.ts`
- `docs/modules/MODULO-6-SERVICIOS.md`

## Archivos modificados

- `app/backend/src/routes/index.ts`
- `app/frontend/src/lib/api.ts` (types + `fetchServices`)
- `app/frontend/src/pages/Servicios.tsx`

## Dependencias

- Ninguna.

## API

- `GET /api/v1/services` → 200 con arreglo de servicios ordenado (`createdAt` ASC, `id` ASC). `[]` si no hay registros.

## Base de datos

- Tabla `Service` de solo lectura pública. Sin seed de datos inventados.

## Seguridad

- Endpoint público de solo lectura.

## Testing

```text
Backend: lint ✅ typecheck ✅ test ✅ (5, incluye el ordenado) build ✅
Frontend: lint ✅ typecheck ✅ test ✅ (3) build ✅
Smoke: 5173/api/v1/services → [] (proxy funcionando)
```

Test clave (pedido por el propietario): insertar 3 servicios en orden distinto al de creación y verificar que la respuesta los ordena por `createdAt` ASC, `id` ASC.

## Git

- Commits por archivo/capa (17.1: 1 responsabilidad por commit). Push: NO REALIZADO.

## Problemas

- Ninguno bloqueante.

## Soluciones

- (ver problemas)

## Cómo modificarlo

- Cambiar el orden del listado: `service.repository.ts`.
- Nuevo icono: ampliar `ICONS` en `Servicios.tsx`.
- Campo `icon` real por servicio: Módulo 13 (requiere migración).