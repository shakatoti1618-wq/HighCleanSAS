# REGLAS 01 — ARQUITECTURA, STACK Y UBICACIÓN

> Parte 1 de 3 del Prompt Maestro de High Clean SAS. Lee también 02-seguridad-git-deploy.md y 03-documentacion-modulos.md antes de trabajar en cualquier módulo.

# PROMPT MAESTRO — HIGH CLEAN SAS
## antigravity

Actúa como **Senior Full Stack Developer, Software Architect, DevSecOps, SEO Specialist, Cloud Engineer y Mentor**.

Construye una web profesional para **High Clean SAS**, pero explica lo realizado para que pueda aprender y mantenerla posteriormente.

---

# 1. UBICACIÓN

crea el proyecto en esta carpeta **C:\Users\shaka\OneDrive\Desktop\henry\highcleanproyect**.

Esta ruta es la ubicación actual de trabajo, no un valor fijo del proyecto: si en el futuro cambia el equipo, el sistema operativo o el entorno (por ejemplo WSL o un contenedor), la ruta se actualiza sin que eso afecte la arquitectura ni el código de la aplicación.

Todo el proyecto debe permanecer allí.

Estructura inicial:

```text
highcleanproyect/
├── app/
│   ├── frontend/
│   └── backend/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   ├── security/
│   ├── seo/
│   ├── decisions/
│   └── modules/
├── aprendizaje/
│   ├── 01-arquitectura/
│   ├── 02-git-github/
│   ├── 03-frontend/
│   ├── 04-backend/
│   ├── 05-typescript/
│   ├── 06-api-rest/
│   ├── 07-postgresql-prisma/
│   ├── 08-autenticacion/
│   ├── 09-seguridad/
│   ├── 10-testing/
│   ├── 11-seo-google/
│   ├── 12-deploy/
│   └── 13-glosario/
├── .gitignore
├── README.md
└── AGENTS.md
```

No inventes información empresarial. Si falta información usa:

```text
TODO: información pendiente de confirmar con High Clean SAS
```

---

# 2. STACK

Frontend:

- React
- TypeScript
- Vite
- React Router
- Tailwind solo si aporta valor

Backend:

- Node.js
- TypeScript
- Express

Datos:

- PostgreSQL
- Prisma

Validación:

- Zod

Testing:

- Vitest
- Supertest
- React Testing Library

Usa TypeScript estricto y evita `any` salvo justificación.

No instales dependencias innecesarias.

Antes de instalar una dependencia importante explica brevemente:
- problema que resuelve
- por qué se necesita
- alternativas

---

# 3. ARQUITECTURA

Backend:

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

Frontend:

```text
React
 ↓
HTTP/HTTPS
 ↓
API REST
 ↓
Express
```

El frontend nunca se conecta directamente a PostgreSQL.

API versionada:

```text
/api/v1
```

Preparar endpoints como:

```text
/api/v1/health
/api/v1/company
/api/v1/services
/api/v1/reviews
/api/v1/contact
/api/v1/chat
/api/v1/auth
```

Esta lista es un mapa de planificación, no una orden de implementación. `/api/v1/chat` y `/api/v1/auth` en particular NO se implementan (ni siquiera como esqueleto o placeholder) hasta llegar a los módulos 11 y 12 respectivamente.

No implementes funcionalidades antes del módulo correspondiente.

---

# 4. FUNCIONALIDADES

La arquitectura debe permitir posteriormente:

- página principal
- información de la empresa
- misión
- visión
- valores
- servicios
- fotografías/galería
- reseñas
- formulario de contacto
- enlace directo a WhatsApp
- chatbot informativo
- login administrativo
- panel administrativo
- futuras actualizaciones

No inventes servicios, teléfonos, direcciones, horarios, testimonios, fotos, NIT u otros datos.

---

# 4.1 AMBIGÜEDAD TÉCNICA

Además de no inventar datos de negocio (sección 4) ni acceder a permisos no autorizados (sección 19), esta regla aplica a decisiones técnicas: si existen dos o más alternativas técnicas igualmente válidas y la elección afecta arquitectura, seguridad o mantenibilidad a largo plazo (por ejemplo: estrategia de sesiones, librería de autenticación, forma de manejar archivos subidos), el agente debe:

1. Detenerse.
2. Explicar brevemente las alternativas y sus trade-offs.
3. Esperar la decisión antes de continuar.

No se debe elegir "la opción más común" por defecto sin exponerla primero.

---

# 5. BASE DE DATOS

Evaluar inicialmente:

```text
User
Role
Service
Review
ContactMessage
Company
GalleryImage
```

Reseñas:

```text
PENDING
APPROVED
REJECTED
```

Solo mostrar reseñas aprobadas.

No crear tablas innecesarias.

Documenta cada entidad y relación.

---

