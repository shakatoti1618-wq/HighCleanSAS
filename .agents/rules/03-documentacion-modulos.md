# REGLAS 03 — DOCUMENTACIÓN, MÓDULOS Y REGLAS FINALES

> Parte 3 de 3 del Prompt Maestro de High Clean SAS. Lee también 01-arquitectura-stack.md y 02-seguridad-git-deploy.md antes de trabajar en cualquier módulo.

# 20. AGENTS.MD

Crear `AGENTS.md` con:

- arquitectura
- estructura
- comandos
- convenciones
- Git
- seguridad
- testing
- documentación
- aprendizaje
- deploy
- regla de no push

`AGENTS.md` es la fuente de verdad persistente del proyecto: debe crearse en el Módulo 0, antes de cualquier otro archivo de código, y actualizarse cada vez que cambie una convención o regla.

**Obligatorio:** releer `AGENTS.md` completo antes de iniciar cada módulo y antes de cerrarlo. Esto no es opcional ni queda a criterio del agente — el objetivo es evitar que reglas de módulos tempranos (ej. no-push, no exponer secretos) se pierdan hacia módulos avanzados. Confirmar esta relectura en el reporte de cierre de módulo (sección 27).

---

# 21. DOCUMENTACIÓN

Cada módulo debe crear:

```text
docs/modules/MODULO-X-NOMBRE.md
```

Debe contener:

```text
Qué se hizo
Por qué
Arquitectura
Archivos creados
Archivos modificados
Dependencias
API
Base de datos
Seguridad
Testing
Git
Problemas
Soluciones
Cómo modificarlo
```

---

# 22. DOCUMENTACIÓN EDUCATIVA

Además crear documentación en:

```text
aprendizaje/
```

Debe explicar el concepto de forma sencilla y técnica.

Cada documento debe indicar los archivos del proyecto relacionados.

Ejemplo:

```text
Archivo relacionado:
app/backend/src/routes/services.routes.ts
```

Crear conceptos cuando aparezcan, no todos de golpe.

---

# 23. GLOSARIO

Crear progresivamente:

```text
aprendizaje/13-glosario/
```

Conceptos como:

```text
api.md
backend.md
controller.md
cors.md
crud.md
dto.md
endpoint.md
express.md
frontend.md
http.md
jwt.md
middleware.md
orm.md
prisma.md
repository.md
rest.md
route.md
service.md
sql.md
typescript.md
```

---

# 24. ADR

Para decisiones importantes crear:

```text
docs/decisions/
```

Ejemplo:

```text
ADR-001-stack-tecnologico.md
ADR-002-arquitectura-frontend-backend.md
ADR-003-postgresql-prisma.md
ADR-004-deploy-provider.md
```

Cada ADR:

```text
Contexto
Problema
Alternativas
Decisión
Consecuencias
```

---

# 25. MÓDULOS

Trabajar en este orden:

```text
0  Análisis y arquitectura
1  Repositorio + estructura
2  Frontend base
3  Backend base
4  PostgreSQL + Prisma
5  Información corporativa
6  Servicios
7  Galería
8  Reseñas
9  Contacto
10 WhatsApp
11 Chatbot
12 Autenticación
13 Panel administrativo
14 SEO
15 Seguridad
16 Testing + calidad
17 Deploy
18 Google Search Console + indexación
```

Puedes cambiar el orden si existe una dependencia técnica, pero debes explicarlo.

---
---

# 25.1 APERTURA DE MÓDULO (a partir del Módulo 1)

Antes de ejecutar cualquier módulo del 1 en adelante, presenta primero un plan breve:

texto
Qué se va a hacer
Archivos que se van a crear/modificar
Dependencias nuevas (si aplica)
Endpoints o tablas afectadas (si aplica)
Riesgos o decisiones técnicas ambiguas (si las hay)


Detente después del plan y espera mi autorización explícita antes de escribir o modificar código.

El Módulo 0 no requiere este paso: ya está detallado en la sección 26.

# 26. MÓDULO 0 — PRIMERA ACCIÓN

Comienza EXCLUSIVAMENTE con el Módulo 0.

Haz:

1. localizar Documentos
2. crear `HighCleanSAS`
3. comprobar Node
4. comprobar npm
5. comprobar Git
6. comprobar herramientas disponibles
7. comprobar acceso necesario a GitHub
8. analizar arquitectura
9. proponer estructura
10. proponer dependencias
11. proponer modelo de datos
12. proponer rutas
13. proponer seguridad
14. proponer SEO
15. proponer estrategia de deploy
16. crear documentación inicial
17. crear `AGENTS.md`
18. crear commit local si corresponde

NO:

- implementar toda la aplicación
- hacer deploy
- hacer push
- crear login completo
- crear chatbot completo
- crear toda la base de datos

---

# 27. FIN DE CADA MÓDULO

Al terminar:

```text
==================================================
MÓDULO X — NOMBRE
==================================================

ESTADO:
COMPLETADO

QUÉ SE HIZO:
...

ARCHIVOS CREADOS:
...

ARCHIVOS MODIFICADOS:
...

DEPENDENCIAS:
...

ARQUITECTURA:
...

SEGURIDAD:
...

TESTS:
...

GIT:
Commit local: ...
Push: NO REALIZADO

DOCUMENTACIÓN:
...

APRENDIZAJE:
...

CONCEPTOS APRENDIDOS:
...

PROBLEMAS:
...

SOLUCIONES:
...

CÓMO MODIFICARLO:
...

SIGUIENTE MÓDULO:
...

==================================================
ESPERANDO AUTORIZACIÓN
==================================================
```

# DETENTE DESPUÉS DE CADA MÓDULO.

No continúes automáticamente.

---

# 28. REGLAS FINALES

1. No inventes información de High Clean.
2. No inventes precios o límites de proveedores.
3. No uses secretos reales dentro del código.
4. No hagas operaciones destructivas sin autorización.
5. No hagas `git push` sin autorización.
6. No hagas deploy sin autorización.
7. No hagas cambios DNS sin autorización.
8. No accedas a otros repositorios.
9. No instales dependencias innecesarias.
10. Prioriza arquitectura mantenible.
11. Documenta decisiones.
