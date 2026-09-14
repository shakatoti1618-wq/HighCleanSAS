# ADR-004 — Cookie de sesión: comportamiento según el escenario de deploy

## Contexto

El login administrativo (Módulo 12) envía la cookie de sesión `sid` (`httpOnly`) con `express-session`. El deploy no está decidido todavía (Módulo 17), por lo que la cookie debe comportarse de forma predecible en los dos escenarios posibles. Una mala configuración de `sameSite`/`secure`/CORS con credentials **rompe el login en producción sin ser un "bug de código"** (el endpoint funciona, pero el navegador bloquea la cookie).

## Problema

¿Cómo configurar la cookie de sesión para que funcione (a) cuando frontend y API comparten el mismo origen y (b) cuando viven en orígenes distintos (por ejemplo frontend en Vercel y API en Railway/Render)?

## Configuración base acordada (en código)

```ts
name: 'sid'
httpOnly: true
maxAge: 12h
sameSite: 'lax'        // default; ver escenarios
secure: 'auto'         // Secure solo cuando la conexión es HTTPS
```

- `secure: 'auto'` requiere `app.set('trust proxy', ...)` correcto detrás de un proxy que termina TLS (que lea `X-Forwarded-Proto`). En development local (http://localhost) `auto` deja `Secure` apagado y la cookie se envía igual.
- Same-origin ≠ same-site: `localhost:5173` → `localhost:3000` es **mismo site** (el puerto no forma parte del "site"), así que SameSite no bloquea en dev; lo que aplica ahí es CORS/credentials.

## Escenario A — Mismo origen (frontend servido por el mismo dominio de la API)

- Todas las llamadas `fetch('/api/v1/...')` son **same-origin**: el navegador envía la cookie automáticamente (credentials `same-origin` por defecto).
- `sameSite: 'lax'` funciona; `secure: 'auto'` activa `Secure` en producción (HTTPS) y lo apaga en dev.
- **No se requiere CORS** (no hay origen cruzado). El `cors()` actual queda inerte.

## Escenario B — Orígenes distintos (frontend en dominio A, API en dominio B)

Requiere cumplir **cuatro condiciones** a la vez; si falta una, el login "funciona" pero la cookie no viaja:

1. **Credenciales en el cliente**: `fetch(apiUrl, { credentials: 'include' })` (imprescindible para origen cruzado; inocuo en same-origin).
2. **CORS con credentials en el servidor**: `Access-Control-Allow-Origin` con el **origen exacto** (nunca `*`, que es inválido con credentials) **+ `Access-Control-Allow-Credentials: true`**. ⚠️ El `cors({ origin: allowedOrigins })` actual **no** emite `Allow-Credentials`; habría que añadir `credentials: true` (y `CORS_ORIGIN` sin comodín) cuando se decida este escenario en el Módulo 17.
3. **`SameSite=None`**: con orígenes distintos, `SameSite=Lax` hace que el navegador **no envíe la cookie** en la petición cross-site al API.
4. **`Secure=true` obligatorio con `SameSite=None`**: Chrome/Chromium **rechaza** una cookie `SameSite=None` sin `Secure`. → En este escenario la cookie exige HTTPS en ambos lados (razón por la que no se puede probar bien contra `http://` en local).

## Decisión

- Configuración por defecto en código: `sameSite: 'lax'`, `secure: 'auto'`, escritura del `Set-Cookie` siempre con `httpOnly`, y **el cliente usará `credentials: 'include'` en las llamadas de auth** para ser robusto en ambos escenarios.
- El `cors` actual se mantiene (origin configurable por `CORS_ORIGIN`), **sin** `credentials: true` mientras no se requiera, para no debilitar la configuración en same-origin.
- **Acción diferida a validar en Módulo 17 (Deploy)**: elegido el escenario final:
  - si es B (orígenes distintos) → cambiar cookie a `sameSite: 'none'`, garantizar `secure: true` (HTTPS) y configurar `cors({ origin: <exacto>, credentials: true })` con `CORS_ORIGIN` sin comodín. Revalidar entonces la mitigación CSRF (Módulo 15).

## Consecuencias

- Login funcional en el escenario A sin configuración adicional; en B basta un cambio acotado y documentado en Módulo 17.
- El caso B queda registrado como riesgo de configuración, no de código.
- `SameSite=Lax` mitiga CSRF en mismo-origen; si en Módulo 17 se pasa a `SameSite=None` (escenario B), la superficie CSRF aumenta y debe revisarse (perspectiva Módulo 15 — Seguridad).