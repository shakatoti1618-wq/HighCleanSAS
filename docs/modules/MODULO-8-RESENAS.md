# MÓDULO 8 — RESEÑAS

## Qué se hizo

Se expone la lista pública de reseñas aprobadas: `GET /api/v1/reviews` por capas (route → controller → service → repository). El repository filtra `status: 'APPROVED'` (nunca se muestran `PENDING` ni `REJECTED`) y ordena **`createdAt DESC, id DESC`** (la más reciente primero, con `id` como desempate determinístico). Se añade al frontend:

- Componente `Reviews` (sección "Lo que dicen nuestros clientes") integrado en la Home, réplica de la sección aprobada en `preview_highclean_motion.html`: tarjetas `bg-white` con borde `turqSoft`, 5 estrellas doradas (lucide `Star`), cita y autor con inicial en caja `brand-turq/10`.
- Página dedicada **`/resenas`** con carga diferida (`React.lazy` + `Suspense`).
- Hook reutilizable `useApprovedReviews` para no duplicar la lógica de fetch entre Home y `/resenas`.
- Componente presentacional `ReviewCard` compartido por ambas vistas.
- Seed idempotente que crea 3 reseñas de ejemplo con `status: APPROVED` y el placeholder exacto `TODO: información pendiente de confirmar con High Clean SAS` (no se inventan testimonios).

## Por qué

Era el siguiente módulo funcional del plan (sección 25). La regla de negocio "solo mostrar reseñas aprobadas" viene de la sección 5. Se separó la tarjeta y el hook para que Home y `/resenas` compartan la misma lógica y apariencia sin duplicar código.

## Arquitectura

```text
GET /api/v1/reviews
  ↓
routes/review.routes.ts
  ↓
controllers/review.controller.ts
  ↓
services/review.service.ts
  ↓
repositories/review.repository.ts
  ↓ (WHERE status='APPROVED' ORDER BY createdAt DESC, id DESC)
lib/prisma.ts → PostgreSQL
```

Frontend:

```text
components/Reviews.tsx (Home) ─┐
                              ├─ hooks/useApprovedReviews.ts → lib/api.ts → fetch('/api/v1/reviews')
pages/Resenas.tsx (lazy)     ─┘
        └── components/ReviewCard.tsx (tarjeta compartida)
```

## Archivos creados

Backend:

- `app/backend/src/repositories/review.repository.ts`
- `app/backend/src/services/review.service.ts`
- `app/backend/src/controllers/review.controller.ts`
- `app/backend/src/routes/review.routes.ts`
- `app/backend/src/reviews.test.ts`

Frontend:

- `app/frontend/src/hooks/useApprovedReviews.ts`
- `app/frontend/src/components/ReviewCard.tsx`
- `app/frontend/src/components/Reviews.tsx`
- `app/frontend/src/pages/Resenas.tsx`

Docs:

- `docs/modules/MODULO-8-RESENAS.md`

## Archivos modificados

- `app/backend/src/routes/index.ts` (registra `/reviews`)
- `app/backend/prisma/seed.ts` (creación idempotente de reseñas de ejemplo)
- `app/frontend/src/lib/api.ts` (`Review` + `fetchApprovedReviews`)
- `app/frontend/src/pages/Home.tsx` (sección `<Reviews />` al pie del hero)
- `app/frontend/src/App.tsx` (ruta lazy `resenas`)

## Dependencias

- Ninguna nueva.

## API

- `GET /api/v1/reviews` → 200 con arreglo de reseñas **solo `APPROVED`**, ordenadas `createdAt` DESC, `id` DESC. `[]` si no hay aprobadas.
- Campos: `id`, `author`, `content`, `rating`, `status` (siempre `APPROVED`), `companyId`, `createdAt`, `updatedAt`.

## Base de datos

- Tabla `Review` (relación con `Company`, índice en `status`) — ya creada en la migración `init` del Módulo 4; **no hubo migración nueva**.
- Seed idempotente: si la empresa aún no tiene reseñas, crea 3 con `rating: 5`, `status: 'APPROVED'` y contenido/autor = placeholder TODO. Si ya existen reseñas, las conserva.

## Seguridad

- Endpoint público de solo lectura (GET) sin parámetros de usuario: sin superficie de inyección.
- No se exponen reseñas pendientes ni rechazadas.
- Sin secretos: los placeholders son genéricos, sin inventar testimonios.

## Testing

```text
Backend: lint ✅ typecheck ✅ test ✅ (10 total; 3 nuevos de reseñas) build ✅
Frontend: lint ✅ typecheck ✅ test ✅ (3) build ✅ (chunk Resenas separado)
Smoke: GET :3000/api/v1/reviews → 3 reseñas APPROVED (seed)
```

Tests nuevos (`reviews.test.ts`), con limpieza `beforeEach` porque `author` no es único:

1. Solo devuelve reseñas `APPROVED` (se insertan APPROVED + PENDING + REJECTED y solo aparece la primera).
2. Orden `createdAt DESC, id DESC` (insertadas fuera de orden, respuesta `['T3','T2','T1']`).
3. Lista vacía `[]` cuando solo hay reseñas no aprobadas.

## Git

Commits atómicos por capa (sección 17.1), en orden:

```text
7b1ec9a feat: add review repository layer
7698b45 feat: add review service
95239de feat: add review controller
21ef4c2 feat: add review route
eb5f713 feat: register review route
e22e4dc test: add review endpoint tests
09a5252 feat: add idempotent review seed data
5a0f5d9 feat: add Review type and fetchApprovedReviews to api lib
3dee5b8 feat: add useApprovedReviews hook
b9acfdd feat: add ReviewCard component
a400777 feat: add Reviews section component
d214c89 feat: add Reviews section to Home page
0f08eac feat: add dedicated Resenas page
2634db7 feat: register Resenas lazy route
```

Push: NO REALIZADO (se solicita autorización).

## Problemas

- La preview original de la sección no definía qué pasa con `rating < 5`: se resuelve pintando la estrella sin relleno (contorno dorado) cuando la posición supera la calificación.
- El avatar de la preview siempre usaba `—`; con autores reales se usa la inicial, y `—` si el autor es placeholder.

## Soluciones

- Ver problemas. Además: se creó el hook `useApprovedReviews` para que Home y `/resenas` compartan fetch, estados `loading/error/vacío` y no dupliquen lógica.

## Cómo modificarlo

- Cambiar el orden del listado: `app/backend/src/repositories/review.repository.ts`.
- Exponer más reseñas (paginación): añadir `take`/`skip` en el repository y un parámetro en el controller.
- Ajustar la tarjeta: `app/frontend/src/components/ReviewCard.tsx`.
- Ajustar la sección de Home o la página: `components/Reviews.tsx` / `pages/Resenas.tsx`.
- Añadir reseñas reales: insertar registros con `status: 'APPROVED'` en la tabla `Review` (el panel admin del Módulo 13 permitirá aprobar/rechazar/pendiente).
- La aprobación/rechazo de reseñas NO se expone públicamente todavía: corresponde al panel admin (Módulo 13).