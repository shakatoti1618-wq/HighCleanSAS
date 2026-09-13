# MÓDULO 10 — WHATSAPP

## Qué se hizo

Se crea el **botón flotante de WhatsApp** (CTA directo, sección 8 del prompt maestro): círculo verde en la esquina inferior derecha que abre `https://wa.me/<número>?text=<mensaje>` en pestaña nueva. La fuente del número NO está hardcodeada.

**Decisión aprobada (Opción B):** el número vive en la tabla `Company` como **`whatsappNumber` (nullable)** — igual que `phone`, `email` y `address` — y se sirve por el endpoint existente `GET /api/v1/company`. El botón aparece **solo cuando el campo no es null** (`enabled` = dato presente, sin columna aparte). Esto deja el número **editable desde el Módulo 13 (panel admin)** sin tocar variables de entorno, y evita partir un dato de contacto en un mecanismo de configuración distinto.

Backend:

- Migración `add_whatsapp_number`: columna `whatsappNumber TEXT` nullable en `Company` + regeneración del cliente Prisma.
- `GET /api/v1/company` ahora incluye `whatsappNumber` (sale "gratis" porque el repository devuelve el registro completo).

Frontend:

- `api.ts`: `Company.whatsappNumber: string | null`.
- `lib/whatsapp.ts`: helper `buildWhatsAppUrl(number, message)` → normaliza el número (solo dígitos, tolera `+`, espacios, guiones) y devuelve `https://wa.me/<dígitos>?text=<mensaje codificado>`; devuelve `null` si no hay dígitos (nunca un enlace roto).
- Hook compartido **`useCompany` con caché**: todas las páginas y el botón leen la empresa con **un solo fetch** (antes `Nosotros` y `Contacto` duplicaban la consulta).
- `WhatsAppButton.tsx`: fixeds bottom-right, `z-40`, `#25D366`, icono oficial WhatsApp (SVG inline de simple-icons), anillo de pulso (`motion-safe:animate-ping`, se desactiva con `prefers-reduced-motion`), `aria-label="Contactar por WhatsApp"`, `target="_blank"`, `rel="noopener noreferrer"`, entrada con `motion` (respeta `MotionConfig reducedMotion="user"` del Layout). Sin número → no se renderiza nada.
- Integrado en `Layout.tsx`, visible en todas las páginas.

## Por qué

Era el siguiente módulo del plan (sección 25) y completaba el requisito pendiente del restyle ("WhatsApp CTA verde: NO implementado, Módulo 10"). El número es un dato de contacto de la empresa como el teléfono; juntarlo con el resto en `Company` evita un mecanismo paralelo de configuración y habilita su edición por admin en M13.

## Arquitectura

```text
GET /api/v1/company  (repository devuelve el modelo completo)
  ↓
Company.whatsappNumber  (nullable)
  ↓
frontend useCompany (caché compartida, 1 fetch)
  ├─ WhatsAppButton.tsx  → buildWhatsAppUrl → wa.me/<dígitos>?text=...
  ├─ Nosotros.tsx
  └─ Contacto.tsx
```

```text
`enabled` = whatsappNumber != null  →  se renderiza el botón
            whatsappNumber == null →  no se renderiza nada
```

## Archivos creados

Backend:

- `app/backend/prisma/migrations/20260913212731_add_whatsapp_number/`

Frontend:

- `app/frontend/src/lib/whatsapp.ts`
- `app/frontend/src/hooks/useCompany.ts`
- `app/frontend/src/components/WhatsAppButton.tsx`
- `app/frontend/src/components/WhatsAppButton.test.tsx`
- `app/frontend/src/lib/whatsapp.test.ts`

Docs:

- `docs/modules/MODULO-10-WHATSAPP.md`

## Archivos modificados

- `app/backend/prisma/schema.prisma` (`whatsappNumber String?` en `Company`)
- `app/backend/src/company.test.ts` (aislamiento completo + campo nuevo)
- `app/backend/vitest.config.ts` (tests en **secuencia**: ver "Problemas")
- `app/frontend/src/lib/api.ts` (tipo `Company` + `whatsappNumber`)
- `app/frontend/src/pages/Nosotros.tsx` y `pages/Contacto.tsx` (refactor a `useCompany`)
- `app/frontend/src/components/Layout.tsx` (botón global)

## Dependencias

- Ninguna nueva (icono WhatsApp en SVG inline, sin paquete).

## API

- `GET /api/v1/company` → añade `whatsappNumber` al objeto; `null` si la empresa no lo tiene configurado.
- Sin endpoints ni body nuevos; ninguna superficie de ataque añadida.

## Base de datos

- Migración `add_whatsapp_number`: `ALTER TABLE "Company" ADD COLUMN "whatsappNumber" TEXT`.
- El seed no toca el campo → `null` por defecto (no se inventa un número).
- **Nota:** correr los tests borra la empresa (aislamiento) y hay que restaurarla con `npm run db:seed`.

## Seguridad

- El número nunca se hardcodea en el frontend: viaja desde la BD por la API.
- El enlace a `wa.me` es público y legítimo (mismo tipo de dato que el teléfono que ya se sirve).
- `rel="noopener noreferrer"` y `target="_blank"` en el enlace externo.
- Límite práctico: el frontend normaliza a dígitos; un número no numérico nunca produce enlace roto.

## Testing

```text
Backend: lint ✅ typecheck ✅ test ✅ (14) build ✅   — tests ahora en secuencia
Frontend: lint ✅ typecheck ✅ test ✅ (9; +6 nuevos) build ✅ (chunk Resenas intacto)
Smoke: GET :3000/api/v1/company → whatsappNumber null (por defecto) y valor seteado (configurado)
```

Tests nuevos:

1. `WhatsAppButton`: muestra el enlace `wa.me/<dígitos>?text=` con número configurado.
2. No renderiza nada sin número.
3. Normaliza `+57 300 1234567` → `573001234567`.
4. `buildWhatsAppUrl`: enlace estándar, limpieza de símbolos, `null` sin dígitos.

## Git

Commits atómicos por capa (sección 17.1) y fixes de aislamiento:

```text
757d193 feat: add whatsappNumber field to Company schema
5489841 fix: isolate company tests from global state
66d216f fix: run test files sequentially to isolate shared database state
8069c84 feat: add whatsappNumber to Company type
6a0081c feat: add buildWhatsAppUrl helper
612c30e feat: add shared useCompany hook with cache
54534a1 refactor: use shared useCompany hook in Nosotros
1e5d8e8 refactor: use shared useCompany hook in Contacto
b26cad6 feat: add WhatsApp floating button component
2e55f24 feat: render WhatsApp button globally in Layout
c8359fa test: add whatsapp button and url builder tests
```

Push: NO REALIZADO (se solicita autorización).

## Problemas

- **Flags del `company.test.ts`:** la respuesta era no determinista porque `GET /api/v1/company` usa `findFirst()` (global) y los archivos de tests corrían **en paralelo** creando empresas de prueba en la misma BD: en ciertos runs el endpoint "ganaba" el fixture de otro archivo. Era la misma clase de bug de estado global que ya se corrigió en `service.test.ts` (M6) y `gallery.test.ts` (M7). Diagnóstico: el residuo «Empresa de prueba módulo 9» del run anterior y la ejecución paralela.
- **Solución de raíz:** (1) `vitest.config.ts` con `fileParallelism: false` → los archivos corren en secuencia y cada `beforeEach`/`afterEach` limpia con autoridad; (2) `company.test.ts` aislado (borra todas las empresas, crea solo la canónica, limpia al final, `$disconnect` en `afterAll`). Consecuencia documentada: correr los tests borra la empresa real del dev → restaurar con `npm run db:seed`.
- El botón no se podía probar fácilmente por la caché del hook: se expone `resetCompanyCache()` (helper de dev/tests) y los tests lo invocan en `beforeEach`/`afterEach`.

## Soluciones

- Ver problemas. Además: `useCompany` con caché evita 2–3 fetches duplicados de la misma empresa por página (antes `Nosotros`, `Contacto` y ahora el botón la consultaban por separado).

## Cómo modificarlo

- Cambiar el mensaje predeterminado: `app/frontend/src/lib/whatsapp.ts` (`WHATSAPP_DEFAULT_MESSAGE`).
- Ajustar formato del número (dígitos, símbolos): `buildWhatsAppUrl` en `lib/whatsapp.ts`.
- Ajustar posición/tamaño/animación del botón: `app/frontend/src/components/WhatsAppButton.tsx`.
- Configurar el número real: columna `whatsappNumber` de `Company` (o el panel admin en M13).
- El número se editará en el panel admin (M13): columna ya servida por `/api/v1/company`.