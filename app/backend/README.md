# Backend — High Clean SAS

API REST en Node.js + Express + TypeScript.

## Comandos

```text
npm run dev      # servidor de desarrollo (tsx watch)
npm run build    # compila a dist/
npm run start    # ejecuta el build (node dist/server.js)
npm run lint     # oxlint
npm run typecheck
npm test         # Vitest + Supertest
```

## Estructura

```text
src/
  server.ts                     # entrada que escucha
  app.ts                        # fábrica de la app Express (para tests)
  config/env.ts                 # variables de entorno validadas con Zod
  middleware/                   # rate limit + errores globales
  routes/ → controllers/ → services/ → repositories/ (módulo 4)
  utils/httpError.ts            # AppError y subclases
```