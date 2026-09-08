# MÓDULO 1 — REPOSITORIO + ESTRUCTURA

## Qué se hizo

Se creó el repositorio Git local (rama `main`) y la estructura de carpetas del proyecto según la regla 01.

## Por qué

Tener desde el primer día una estructura estable y predecible para frontend, backend, documentación y aprendizaje.

## Estructura creada

```text
app/
  frontend/   # Solicitudes de apps de React (a partir del Módulo 2)
  backend/    # comenzarán aquí (Módulo 3+)
docs/
  architecture/
  api/
  deployment/
  security/
  seo/
  decisions/  # ADRs
  modules/    # reportes por módulo
aprendizaje/
  01-arquitectura … 13-glosario
```

## Dependencias

Ninguna.

## Seguridad

`.agents/` y `AGENTS.md` quedan excluidos de Git (`Node_modules` etc. en `.gitignore`): los secretos y las reglas personales nunca llegan al repositorio.

## Git

- Repositorio local iniciado en rama `main` con usuario configurado.
- Commit inicial del proyecto: `feat: initialize project architecture`.
- Push: NO REALIZADO.

## Cómo modificarlo

Crear/eliminar carpetas solo si un módulo lo requiere y documentarlo en `docs/modules/`.