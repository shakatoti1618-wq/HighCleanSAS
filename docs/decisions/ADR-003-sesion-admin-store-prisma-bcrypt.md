# ADR-003 — Sesión administrativa: store persistente en Postgres y hash bcrypt

## Contexto

El Módulo 12 añade autenticación administrativa (`/api/v1/auth`) con `express-session` y cookie `httpOnly`. Las sesiones deben sobrevivir al ciclo de vida de un proceso Node y a los reinicios/redeploys, y compartirse entre instancias si en el futuro se escala horizontalmente.

## Problema

`express-session` usa por defecto el **MemoryStore**, que no sirve para producción: guarda las sesiones en memoria del proceso (se pierden al reiniciar, no se comparten entre instancias y crecen sin límite). Hace falta un store que persista en **PostgreSQL**, coherente con el stack ya usado (Prisma + driver adapter `pg`).

## Alternativas

1. **MemoryStore (default de express-session)**: descartado — estado en memoria del proceso, sesiones perdidas en cada reinicio/redeploy, sin soporte multi-instancia, fuga de memoria.
2. **`connect-pg-simple`**: maduro y muy usado, pero:
   - requiere crear un segundo pool de conexiones `pg.Pool` (el proyecto ya maneja PostgreSQL vía Prisma con driver adapter);
   - las tablas se crean con su **DDL SQL propio fuera del flujo de migraciones de Prisma** (no usa `prisma migrate`/`db:deploy`), lo que fragmenta la gestión del esquema.
3. **Store propio sobre Prisma (tabla `Session`)**: implementa la interfaz `SessionStore` de `express-session` (`get`, `set`, `destroy`, `touch`) sobre una tabla gestionada por Prisma Migrate como el resto del esquema. Único cliente de datos (el `PrismaClient` existente), tipado con el cliente generado, sin dependencias nuevas.

## Decisión

- **Store: opción 3 — `PrismaSessionStore` propio** respaldado en la tabla `Session`:

```prisma
model Session {
  id        String   @id          // session id generado por express-session
  data      String   @db.Text    // sesión serializada (JSON)
  expiresAt DateTime?
  @@map("sessions")
}
```

- Implementa la interfaz `SessionStore` de `express-session`: `get(sid)` (Devuelve `null` si no existe/expirada), `set(sid, session)`, `destroy(sid)`, y `touch(sid, session)` (actualiza `expiresAt` para sesiones que se renuevan), serializando/deserializando la sesión a JSON en `data`.
- **Limpieza de expiradas**: borrado periódico `deleteMany({ expiresAt: { lt: now } })` en intervalo (~15 min), para que la tabla no crezca indefinidamente. Las expiradas se ignoran también en `get`.
- **Hash de contraseñas: `bcryptjs` con cost factor 12** (exigencia del propietario: mínimo 12; el default de bcrypt es 10). Se usa `bcryptjs` puro (sin bindings nativos, portable en Windows), suficiente para esta escala (un admin).
- La configuración de la cookie (`name`, `httpOnly`, `sameSite`, `secure`) y su comportamiento según el escenario de deploy se documenta por separado en **ADR-004**.

## Consecuencias

- Las sesiones persisten entre reinicios y se comparten entre instancias (escalado horizontal viable vía la misma base).
- Revocación inmediata y simple: borrar la fila de `Session` (logout) o eliminar sesiones de un usuario para "expulsarlo" sin esperar expiración.
- Coste: ~1 archivo nuevo (`lib/sessionStore.ts`) + tabla `Session` y su limpieza periódica; a cambio no se añade pool de conexiones extra ni DDL fuera de Prisma.
- `bcryptjs` con rounds 12 es intencionalmente más costoso por intento; mitigado por el rate limiting de `/api/v1/auth/login` (`authLimiter`, 5 intentos/15 min).