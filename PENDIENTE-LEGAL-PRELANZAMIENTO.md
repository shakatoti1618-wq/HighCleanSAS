# Pendientes Legales Pre-Lanzamiento

## 1. Plazo de retención de datos (Política de Datos — Sección 7)

**Estado:** Pendiente de confirmación por abogado

**Detalle:** El texto actual en `PoliticaDeDatos.tsx` (sección 7 "Vigencia") dice:

> "Sus datos serán conservados mientras sea necesario para la finalidad del tratamiento descrita, o hasta que usted solicite su supresión conforme al punto 6."

El abogado (vía Jonathan/Claude) revisó y aprobó el texto en general, pero señaló que **no hay un plazo concreto de retención** definido — solo la frase genérica "mientras sea necesario".

**Acción requerida:** El abogado debe confirmar un período de retención específico (ej. "5 años desde la última interacción", "10 años contables", etc.) o una regla clara según la normativa aplicable (Ley 1581/2012, Ley 1266/2008, normas tributarias colombianas).

**Archivo relacionado:**
- `app/frontend/src/pages/PoliticaDeDatos.tsx` (líneas 151-159)

---

## 2. Siguiente revisión legal

Programar revisión con abogado antes del despliegue a producción para cerrar este punto.