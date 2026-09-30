<div align="center">

# 🧼 High Clean SAS

**Plataforma web corporativa de servicios de aseo y limpieza profesional**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![CI](https://img.shields.io/github/actions/workflow/status/shakatoti1618-wq/HighCleanSAS/ci.yml?style=flat&label=CI)](https://github.com/shakatoti1618-wq/HighCleanSAS/actions)

**🌐 [highcleansas.com](https://highcleansas.com)**

</div>

---

## 📋 Descripción

Sistema web completo para **High Clean S.A.S.**, empresa de aseo y limpieza en Colombia. El proyecto lleva de **cero presencia digital** a una plataforma en producción que publicita la empresa, muestra sus **7 servicios con modalidades y precios reales**, permite cotizaciones, postulación de hojas de vida, consultas mediante **chatbot con IA** y administración de contenido.

Desarrollado por módulos con **revisión y aprobación explícita** en cada etapa: **+353 commits atómicos** en **18 módulos**, cada capa independiente para permitir `git bisect` y reverts quirúrgicos.

---

## ✨ Funcionalidades

- **Página corporativa** — Home, servicios, galería multimedia, reseñas, contacto, política de datos y más.
- **7 servicios reales** — Descripciones fieles, modalidades/precios editables desde el panel admin y cobertura en 6 ciudades.
- **Chatbot con IA** — Responde sobre servicios, cobertura, horarios y contacto con datos reales de la BD.
- **Cotizaciones y hojas de vida** — Formularios con emails transaccionales (Resend) y validación Zod.
- **Panel administrativo** — Autenticación con sesión segura, gestión de servicios, opciones/precios, empresa, galería multimedia y estadísticas.
- **Galería multimedia** — Imágenes y videos en Cloudflare R2.
- **WhatsApp flotante** — Botón de contacto directo con número configurable.

---

## 🧱 Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Motion (Framer Motion) · React Router 7 |
| **Backend** | Node.js 26 · Express · TypeScript · Prisma 7 (driver adapter) · Zod |
| **Base de datos** | PostgreSQL 17 (Neon en producción) |
| **Testing** | Vitest · Supertest · React Testing Library · Coverage V8 |
| **Seguridad** | Helmet · CORS restringido · Rate limiting · CSRF por Origin · Sesión regenerada · Zod |
| **IA** | Chatbot con integración de LLM (Gemini) |
| **Email** | Resend (dominio verificado) |
| **Almacenamiento** | Cloudflare R2 |
| **CI/CD** | GitHub Actions (lint · typecheck · test --coverage · build) |
| **Deploy** | Cloudflare Pages + Worker proxy · Render (API) · Neon (PostgreSQL) |

---

## 🎨 Arquitectura y seguridad

### Backend por capas
```
Routes → Controllers → Services → Repositories → Prisma → PostgreSQL
```

### Medidas de seguridad (OWASP)
- **Helmet** con cabeceras de seguridad y CSP.
- **CSRF** por validación de `Origin` en todas las mutaciones (nunca GET); 403 si difiere.
- **`CORS_ORIGIN=*` rechazado en producción** (fail-closed en arranque).
- **Rate limiting** en `/login`, `/contact`, `/chat` y endpoints sensibles.
- **Sesión con cookie `HttpOnly` + `Secure`** y `req.session.regenerate()` en login (anti session-fixation).
- **Validación Zod** en todas las entradas (protección XSS / SQL injection / inyección).
- **Errores centralizados** (`AppError`, `ValidationError`, `NotFoundError`, `AuthenticationError`, `DatabaseError`…).
- **Secretos** solo en variables de entorno; **jamás** en el repositorio.
- **`X-Robots-Tag: noindex` + `Cache-Control: no-store`** en zonas privadas.
- **BD de test aislada** (`DATABASE_URL_TEST`): las suites jamás tocan datos reales.

### Calidad
- Backend: **96 tests**, coverage Stmts **82.9%** · Branch **63.0%** · Funcs **89.1%** · Lines **83.9%**.
- Frontend: **59 tests**.
- CI/CD con GitHub Actions en cada push a `main`.

---

## 📁 Estructura del proyecto

```text
highcleanproyect/
├── app/
│   ├── frontend/          # SPA React (Vite)
│   │   ├── src/           # Componentes, páginas, hooks, lib (API/SEO), tests
│   │   └── public/        # Assets, manifest, robots.txt, sitemap.xml, favicons
│   └── backend/           # API REST Express
│       ├── src/
│       │   ├── routes/        # Definición de endpoints
│       │   ├── controllers/   # Request/response
│       │   ├── services/      # Lógica de negocio
│       │   ├── repositories/  # Acceso a datos (Prisma)
│       │   ├── middlewares/   # Auth, CSRF, rate limit, CORS
│       │   ├── schemas/       # Validación Zod
│       │   └── lib/           # Prisma, email, R2, sessions
│       ├── prisma/            # Schema, migraciones, seed
│       └── scripts/           # Utilidades (ej. setup-test-db)
├── deploy/
│   ├── backend/           # Dockerfile de producción
│   └── cloudflare-worker/ # Worker proxy /api/*
├── docs/                  # Módulos, deploy, decisiones (ADR), seguridad, SEO
└── render.yaml            # Blueprint de Render
```

---

## 🚀 Puesta en marcha (local)

### Requisitos
- Node.js ≥ 20 (recomendado **26**)
- PostgreSQL ≥ 15

### 1. Clonar e instalar

```bash
git clone https://github.com/shakatoti1618-wq/HighCleanSAS.git
cd HighCleanSAS/app/frontend && npm install
cd ../backend && npm install
```

### 2. Configurar variables de entorno

```bash
# Backend
cd ../backend
cp .env.example .env        # edita con tus credenciales reales
cp .env.example .env.test   # (opcional) para BD de test

# Frontend
cd ../frontend
cp .env.example .env.local  # define VITE_SITE_URL si haces dev con SEO
```

> ⚠️ **Nunca** se suben `.env` al repositorio (ver `.gitignore`).

### 3. Base de datos

```bash
cd ../backend
npm run db:generate   # genera el cliente Prisma
npm run db:deploy     # aplica migraciones
npm run db:seed       # carga datos reales (idempotente)
npm run db:test:setup # (solo para testing) crea la BD aislada
```

### 4. Ejecutar

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd app/backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd app/frontend && npm run dev
```

El dev server de Vite proxea `/api` hacia `localhost:3000`.

---

## 🧪 Testing

```bash
cd app/backend && npm run coverage   # suite backend + cobertura
cd app/frontend && npm run coverage  # suite frontend + cobertura
```

> Las suites corren contra la BD de test aislada y **nunca** tocan los datos de desarrollo.

---

## 🛠️ Scripts de utilidad

| Comando | Descripción |
|---------|-------------|
| `npm run db:generate` | Regenera el cliente Prisma |
| `npm run db:migrate` | Crear/ aplicar migraciones en desarrollo |
| `npm run db:deploy` | Aplicar migraciones en producción |
| `npm run db:seed` | Cargar datos reales (idempotente) |
| `npm run db:test:setup` | Crear BD de pruebas aislada |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run lint` / `typecheck` / `build` | Calidad y compilación |

---

## ☁️ Deploy (producción)

Arquitectura **costo $0/mes** (ver `docs/deployment/GUIA-DEPLOY.md` y `ADR-004`):

| Servicio | Rol |
|----------|-----|
| **Cloudflare Pages** | Frontend estático + dominio `highcleansas.com` |
| **Cloudflare Worker** | Proxy `/api/*` → backend |
| **Render (Free)** | API Express (`/api/v1`) |
| **Neon (Free)** | PostgreSQL |
| **Cloudflare R2** | Imágenes y videos |
| **Resend** | Emails transaccionales |

El backend se despliega con **`render.yaml`** (Blueprint) vía Dockerfile. **Sin `preDeployCommand`** (el tier Free no lo soporta); las migraciones se aplican con `npm run db:deploy`.

---

## 🔐 Variables de entorno (resumen)

### Backend (`app/backend/.env`)
| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | ✅ | Cadena de conexión a PostgreSQL |
| `DATABASE_URL_TEST` | test | BD aislada para pruebas |
| `SESSION_SECRET` | ✅ prod | Firma de cookie de sesión (≥32 chars) |
| `CORS_ORIGIN` | ✅ prod | Origen del frontend (nunca `*` en prod) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ✅ prod | Credenciales admin del seed |
| `EMAIL_FROM` | ✅ prod | Remitente verificado en Resend |
| `NOTIFY_EMAIL_CONTACT` | ✅ prod | Correo de cotizaciones |
| `NOTIFY_EMAIL_JOBS` | ✅ prod | Correo de hojas de vida |
| `RESEND_API_KEY` | ✅ prod | API key de emails |
| `R2_*` (6 vars) | ✅ prod | Credenciales Cloudflare R2 |

### Frontend (`app/frontend/.env.local`)
| Variable | Descripción |
|----------|-------------|
| `VITE_SITE_URL` | URL canónica del sitio (requerida en build de producción) |

> En **producción**, el backend **no arranca** si `CORS_ORIGIN=*`, falta el secreto o faltan variables obligatorias (fail-closed).

---

## 🔗 Enlaces útiles

- **Sitio en vivo:** https://highcleansas.com
- **API health:** https://highclean-api.onrender.com/api/v1/health
- **Docs de desarrollo:** `docs/` (módulos, deploy, ADR, seguridad, SEO)
- **Reporte de vulnerabilidades:** abre un issue en este repositorio (sin exponer secretos en datos adjuntos).

---

## 📄 Licencia

Proyecto privado de **High Clean S.A.S.** — Uso interno autorizado. No redistribuir sin permiso.

---

<div align="center">

**Hecho con ❤️ por Jonathan Heredia** · [GitHub](https://github.com/shakatoti1618-wq) · [LinkedIn](https://linkedin.com/in/jonathan-heredia)

</div>