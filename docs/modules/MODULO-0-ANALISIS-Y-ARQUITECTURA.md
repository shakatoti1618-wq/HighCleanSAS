# MÓDULO 0 — ANÁLISIS Y ARQUITECTURA

## Qué se hizo

Reconstrucción desde cero del módulo de análisis del proyecto (el propietario autorizó borrar y reiniciar). Se verificó el entorno, se definió la arquitectura y el stack, y se creó la documentación base.

## Por qué

Partir de una base limpia para publicitar High Clean SAS, con reglas claras y un plan de módulos que permite avanzar una pieza a la vez.

## Arquitectura

- **Stack**: React + TS + Vite (frontend) · Express + TS (backend) · PostgreSQL + Prisma · Zod · Vitest/Supertest/RTL.
- **Backend por capas**: Routes → Controllers → Services → Repositories → Prisma → PostgreSQL.
- **API REST versionada**: `/api/v1`. El frontend jamás conecta directo a la BD.
- **Módulos planificados (0–18)**: desde análisis hasta indexación en Google.

## Archivos creados

- `README.md`
- `.gitignore`
- `AGENTS.md` (local, no versionado)
- `.agents/rules/01-arquitectura-stack.md`, `02-seguridad-git-deploy.md`, `03-documentacion-modulos.md` (local, no versionados)
- `docs/decisions/ADR-001-stack-tecnologico.md`
- `docs/decisions/ADR-002-arquitectura-frontend-backend.md`

## Dependencias

Ninguna instalada (fase de análisis).

## API

No se implementan endpoints en este módulo. Se planifican: `/api/v1/health`, `/company`, `/services`, `/reviews`, `/contact` (chat y auth quedan reservados para módulos posteriores).

## Base de datos

No se crea. Se planifican entidades: `User`, `Role`, `Service`, `Review` (PENDING/APPROVED/REJECTED), `ContactMessage`, `Company`, `GalleryImage`.

## Seguridad

Principios fijados: buenas prácticas OWASP, secretos solo en `.env`, nunca `git push` sin autorización, no inventar datos de negocio.

## Testing / CI

Se definirá al configurar cada stack (módulos 2–16). Regla: antes de cerrar un módulo se ejecutan lint, typecheck, test y build (si aplican).

## Git

- Comando: `git init -b main` (repo local reiniciado).
- Commit: incluido en el cierre del Módulo 1.
- Push: NO REALIZADO.

## Problemas / Soluciones

- Problema: se reinicia el proyecto desde cero. Solución: respaldo completo del estado anterior en `C:\Users\shaka\AppData\Local\Temp\opencode\highclean-backup` por si se necesita.

## Cómo modificarlo

La fuente de verdad son las reglas en `.agents/rules/`. Ante una decisión técnica ambigua, se detiene el trabajo y se consulta antes de continuar.