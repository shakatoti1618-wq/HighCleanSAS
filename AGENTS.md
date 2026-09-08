# AGENTS.md — High Clean SAS

Este es el índice de instrucciones permanentes del proyecto. Léelo por completo antes de iniciar o cerrar cualquier módulo, en cada tarea nueva, sin excepción.

## Reglas completas (léelas todas, en orden)

1. `.agents/rules/01-arquitectura-stack.md` — ubicación del proyecto, stack tecnológico, arquitectura, funcionalidades, base de datos.
2. `.agents/rules/02-seguridad-git-deploy.md` — seguridad, manejo de errores, WhatsApp, chatbot, login/admin, SEO, deploy, testing, CI/CD, Git, prohibición de push, GitHub.
3. `.agents/rules/03-documentacion-modulos.md` — AGENTS.md, documentación por módulo, documentación educativa, glosario, ADR, lista de módulos, formato de cierre de módulo, reglas finales.

## Reglas no negociables (resumen — el detalle completo está en los archivos de arriba)

- **NUNCA** ejecutes `git push` (ni `--force`) sin autorización explícita mía en el chat.
- No inventes información de negocio de High Clean (servicios, precios, horarios, testimonios, NIT). Usa `TODO: información pendiente de confirmar con High Clean SAS`.
- Ante ambigüedad técnica con varias alternativas válidas: detente, explica las opciones y espera decisión — no elijas por defecto.
- No implementes funcionalidades de un módulo antes de llegar a él (especialmente `/api/v1/auth` y `/api/v1/chat`).
- Trabaja un módulo a la vez, en el orden de la sección de módulos. Al terminar cada uno, usa el formato de cierre definido y **detente a esperar mi autorización** — no continúes automáticamente al siguiente.
- Railway/Vercel/Render/etc. nunca son una dependencia de la aplicación; todo pasa por estándares (`DATABASE_URL`, variables de entorno).
- El prompt maestro (`.agents/rules/`) y este archivo **se versionan en Git por archivos** y se mantienen actualizados en cada módulo.

## Estado actual

El proyecto se reinició desde cero (autorizado por el propietario). Los **Módulos 0 — Análisis y arquitectura** y **1 — Repositorio + estructura** han sido reconstruidos y documentados.
El siguiente paso a la espera de autorización es el **Módulo 2 — Frontend base**. No avances de módulo sin mi autorización explícita registrada en el chat.