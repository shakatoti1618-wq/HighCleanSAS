# ADR-002 — Arquitectura Frontend / Backend

## Contexto

Hay que separar responsabilidades para que la web sea mantenible, segura y permita evolucionar (chatbot, login administrativo) sin reescribir lo existente.

## Problema

¿Cómo organizar el backend (y su relación con el frontend) para evitar que el frontend toque la base de datos y que la lógica se mezcle?

## Alternativas

1. **Frontend conectado directo a PostgreSQL**: descartado por seguridad y por acoplamiento.
2. **Backend con lógica suelta en las rutas**: rápido al inicio, pero no escalable ni testeable.
3. **Backend por capas** (`Routes → Controllers → Services → Repositories → Prisma → PostgreSQL`): mayor estructura inicial, pero testeable y mantenible.

## Decisión

- Arquitectura backend por capas estrictas:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Prisma
  ↓
PostgreSQL
```

- Frontend se comunica únicamente por HTTP/HTTPS contra una API REST versionada `/api/v1`.
- Endpoints previstos: `/api/v1/health`, `/company`, `/services`, `/reviews`, `/contact`, y (en módulos posteriores) `/chat` y `/auth`.

## Consecuencias

- El frontend nunca conecta a PostgreSQL.
- Las capas facilitan testear (mockear repositorios) y cambiar internos sin tocar la API.
- Coste inicial: más archivos y estructura antes de tener la primera funcionalidad.