# ADR-001 — Stack Tecnológico

## Contexto

High Clean SAS necesita una web pública para publicitar la empresa y mostrar sus servicios. Se esperan actualizaciones futuras: reseñas, galería, formulario de contacto, WhatsApp, chatbot informativo y panel administrativo.

## Problema

Elegir un stack que sea mantenible para una persona en aprendizaje, gratuito en despliegue y fácil de sustituir de proveedor.

## Alternativas

1. **Next.js (full-stack en una sola app)**: menos piezas, pero acopla frontend y backend y complica cambiar de hosting o proveedor de BD.
2. **SPA React + API Express separados**: más piezas, pero separación clara de responsabilidades, frontend nunca toca la BD directamente y cada parte se despliega por separado.
3. **Frameworks PHP (Laravel/WordPress)**: rápidos para contenido, pero menos alineados con el objetivo de aprendizaje del stack propuesto (Node/TS).

## Decisión

- **Frontend**: React + TypeScript + Vite + React Router. Tailwind CSS solo si aporta valor real.
- **Backend**: Node.js + Express + TypeScript, API REST versionada (`/api/v1`).
- **Base de datos**: PostgreSQL + Prisma ORM.
- **Validación**: Zod.
- **Testing**: Vitest + Supertest (backend) y React Testing Library (frontend).

## Consecuencias

- Mantenibilidad: TypeScript estricto; se evita `any` sin justificación.
- Portabilidad: la app depende de estándares (`DATABASE_URL`, variables de entorno) y no de APIs de un proveedor concreto.
- Complejidad: hay dos proyectos que mantener, pero cada uno es simple y con una sola responsabilidad.