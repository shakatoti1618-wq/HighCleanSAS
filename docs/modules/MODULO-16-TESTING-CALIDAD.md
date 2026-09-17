# Módulo 16 — Testing y calidad

## Qué se hizo
Se formalizó la calidad continua del proyecto con (1) **cobertura de tests** (provider V8 de Vitest, reportes `text` + `html`) en backend y frontend, (2) **umbrales de cobertura** que el CI respeta (fail-closed), y (3) un **workflow de GitHub Actions** (`ci.yml`) con dos jobs (backend y frontend) que ejecuta el orden del maestro: install → lint → typecheck → test --coverage → build. No se hace deploy: el CI es solo puerta de calidad (el deploy es el Módulo 17).

## Decisiones del usuario (aprobadas)
- **D1**: instalar `@vitest/coverage-v8@^5` (par oficial de vitest 5, provider `v8` nativo de Node) en ambos paquetes. Alternativas descartadas: `c8` (abandonado) e `istanbul` (más lento, transforma el código).
- **D2**: umbrales = **valor medido menos 1-2 puntos de colchón**, para que cambios triviales no tumben el CI por ruido de medición. Medidos y fijados:
  - Backend: statements **80** (medido 82.81), branches **56** (58.43/58.82), functions **88** (90.05), lines **82** (83.99).
  - Frontend: statements **40** (41.48), branches **23** (25.37), functions **28** (30.74), lines **41** (43.13). El frontend es la **línea base baja** a mejorar: páginas admin, `lib/api.ts`, `auth.ts`, `admin.ts` y `jobs.ts` casi sin cobertura (ver Pendientes).
- **D3**: imagen PostgreSQL en CI **`postgres:17-alpine`** (confirmado: PostgreSQL local = **17.10**, así se alinea 1:1 con la base de desarrollo).
- **D4**: el build del frontend en CI corre **sin** `VITE_SITE_URL` de producción (el `prebuild` solo avisa y regenera `sitemap.xml`/`robots.txt` con la base local); la validación estricta (fail del build) no se activa porque no se fuerza `NODE_ENV=production`. Cuando en M17 exista la URL real se pasará como variable/secret de GitHub.

## Arquitectura

```
npm run coverage (backend)  ──► vitest run --coverage ──► provider v8
    vitest.config.ts: coverage { provider:'v8', include:['src/**'],
      exclude: ['src/**/*.test.ts','src/generated/**','src/server.ts'],
      reporter:['text','html'], thresholds:{...} }

npm run coverage (frontend) ──► vitest run --coverage
    vite.config.ts: test.coverage { provider:'v8', include:['src/**'],
      exclude: ['src/**/*.test.{ts,tsx}','src/test/**','src/main.tsx'],
      reporter:['text','html'], thresholds:{...} }

.github/workflows/ci.yml
  push: main + PR contra main
    ├─ job backend (ubuntu-latest, Node 26)
    │    servicio postgres:17-alpine (healthcheck pg_isready)
    │    DATABASE_URL=postgresql://highclean:h1ghcl34n_dev@localhost:5432/highclean
    │    npm ci → db:generate → db:deploy → lint → typecheck → coverage → build
    └─ job frontend (ubuntu-latest, Node 26)
         npm ci → lint → typecheck → coverage → build (sin NODE_ENV de producción)
```

- Los tests backend ya corren **secuenciales** (`fileParallelism: false` en `vitest.config.ts`) porque comparten la misma BD; el job de CI usa un solo PostgreSQL en servicio.
- `prisma migrate deploy` (no `migrate dev`) no necesita shadow DB, así que el rol `highclean` del servicio es suficiente.
- `npm test` sigue sin cobertura (rápido); `npm run coverage` es el gate con umbrales que usa el CI.

## Archivos creados / modificados
- `app/backend/vitest.config.ts`: bloque `coverage` + umbrales.
- `app/backend/package.json`: script `coverage`; dependencia dev `@vitest/coverage-v8@^5` (+ lock).
- `app/frontend/vite.config.ts`: bloque `test.coverage` + umbrales.
- `app/frontend/package.json`: script `coverage`; dependencia dev `@vitest/coverage-v8@^5` (+ lock).
- `app/frontend/.gitignore`: `coverage/` (el backend ya lo ignoraba).
- `.github/workflows/ci.yml` (nuevo): jobs backend y frontend.
- `docs/modules/MODULO-16-TESTING-CALIDAD.md` (este documento).

## Seguridad
- El CI instala y valida sin exponer secretos: usa `DATABASE_URL` propia del job, credenciales de desarrollo en el servicio efímero, y ninguna clave real (RESEND/OPENAI no son obligatorias fuera de producción). No se sube ningún artefacto ni `coverage/` al repositorio (gitignored).

## Testing y calidad
- `npm run coverage` backend: **68/68 tests** ✅, umbrales cumplidos ✅.
- `npm run coverage` frontend: **45/45 tests** ✅, umbrales cumplidos ✅.
- `npm run lint` / `typecheck` / `build` (ambos paquetes) ✅.
- Recordatorio transversal: una corrida de la suite backend borra la empresa real → restaurar con `npm run db:seed`.

## Git (commits planificados, por capa)
1. `chore: add vitest v8 coverage provider to backend and frontend`
2. `feat: measure coverage and enforce thresholds in backend and frontend`
3. `ci: add github actions workflow for backend and frontend quality gates`
4. `docs: add testing and quality module doc`

## Pendientes / observaciones
- **Cobertura frontend baja (línea base)**: páginas admin (~1.5 %), `lib/api.ts` (~18 %), `lib/auth.ts`, `lib/admin.ts` y `lib/jobs.ts` (0 %). Mejorar en próximos módulos; el umbral actual solo evita que empeore.
- Backend: `src/providers` (integración AI/email) es lo menos cubierto (branch ~31 %) — candidato natural para tests con mocks.
- El CI no hace deploy; en M17 se decidirá el hosting y se añadirá la URL de producción (variable/secret) + job de deploy.
- GitHub Actions requiere el repositorio con el contenido; la primera corrida real se verá tras el push de este módulo.