# REGLAS 02 — SEGURIDAD, DEPLOY, GIT Y GITHUB

> Parte 2 de 3 del Prompt Maestro de High Clean SAS. Lee también 01-arquitectura-stack.md y 03-documentacion-modulos.md antes de trabajar en cualquier módulo.

# 6. SEGURIDAD

Aplicar buenas prácticas OWASP.

Revisar:

- Helmet
- CORS restringido
- rate limiting
- Zod
- protección XSS
- SQL injection
- autenticación
- autorización
- secretos
- límites de request
- logging seguro
- dependencias vulnerables

Especialmente proteger:

```text
/login
/contact
/chat
```

Nunca guardar secretos en Git.

Usar:

```text
.env
.env.local
.env.example
```

Nunca exponer en producción:

- passwords
- tokens
- API keys
- JWT secrets
- SQL
- stack traces
- información interna

---

# 7. ERRORES

Crear manejo centralizado:

```text
AppError
ValidationError
NotFoundError
AuthenticationError
AuthorizationError
ConflictError
DatabaseError
```

Middleware global de errores.

---

# 8. WHATSAPP

Crear CTA/botón directo.

Usar configuración:

```text
WHATSAPP_NUMBER
```

Nunca hardcodear el número.

---

# 9. CHATBOT

Inicialmente debe ser informativo.

Responder únicamente sobre información conocida de High Clean:

- servicios
- empresa
- horarios
- contacto
- preguntas frecuentes

Si no conoce algo, debe indicarlo y recomendar contacto directo.

Arquitectura:

```text
ChatController
 ↓
ChatService
 ↓
ChatProvider
```

Debe ser posible conectar posteriormente Gemini, OpenAI u otro proveedor sin reescribir la aplicación.

No activar servicios pagos sin autorización.

---

# 10. LOGIN Y ADMIN

El visitante NO necesita login para navegar.

Login principalmente para administración.

Preparar:

```text
User
Role
Permission
```

Futuro panel:

- servicios
- reseñas
- mensajes
- galería
- información empresarial

No implementar funcionalidades no aprobadas.

---

# 11. SEO Y GOOGLE

Implementar desde el principio:

- titles
- meta descriptions
- canonical
- URLs limpias
- Open Graph
- sitemap.xml
- robots.txt
- Schema.org
- breadcrumbs cuando corresponda
- alt text
- HTML semántico

Evaluar:

```text
Organization
LocalBusiness
Service
Review
BreadcrumbList
```

No inventar datos para Schema.org.

Crear documentación sobre:

```text
Publicación
 ↓
Google Search Console
 ↓
Verificación
 ↓
Sitemap
 ↓
Solicitud de indexación
 ↓
Seguimiento
```

Explicar que publicar una web NO garantiza indexación inmediata.

---

# 12. DEPLOY — REGLA PRINCIPAL

**Railway NO debe ser una dependencia de la aplicación.**

La aplicación debe depender de estándares:

```text
Node.js
PostgreSQL
HTTP/HTTPS
DATABASE_URL
environment variables
```

y no de APIs específicas de Railway, Render, Vercel, Supabase, Neon, etc.

Debe ser posible cambiar proveedor sin modificar la lógica de negocio.

Ejemplo:

```text
PostgreSQL
├── Railway
├── Supabase
└── Neon
```

La aplicación usa:

```text
DATABASE_URL
```

Nunca hardcodear credenciales o proveedor.

---

# 13. DEPLOY GRATUITO

Antes de desplegar, investigar las opciones disponibles ACTUALMENTE.

Evaluar como mínimo:

- Vercel
- Railway
- Render
- Supabase
- Neon
- Cloudflare
- otras alternativas relevantes

Distinguir:

```text
Frontend hosting
Backend hosting
Database hosting
```

No asumir que un plan gratuito sigue existiendo.

No inventar precios, límites o características.

Si un dato no puede verificarse:

```text
NO VERIFICADO
```

Crear:

```text
docs/deployment/provider-comparison.md
```

Comparar:

| Proveedor | Frontend | Backend | PostgreSQL | Gratis | Límites | Facilidad | Escalabilidad |
|---|---|---|---|---|---|---|---|

Después recomendar una arquitectura basada en la situación actual.

El proveedor elegido debe poder cambiarse posteriormente.

---

# 14. DOS ESCENARIOS DE DOMINIO

Documentar ambos:

## Sin dominio propio

Ejemplo conceptual:

```text
https://proyecto.proveedor.app
```

Explicar:

- despliegue
- HTTPS
- URL temporal
- SEO
- Search Console
- sitemap

## Con dominio propio

```text
Dominio
 ↓
DNS
 ↓
Hosting
 ↓
HTTPS
 ↓
Search Console
 ↓
Sitemap
 ↓
Indexación
```

Explicar DNS, registros necesarios y HTTPS.

No comprar dominio ni realizar cambios DNS sin autorización.

---

# 15. TESTING

Configurar pruebas apropiadas.

Antes de terminar cada módulo ejecutar:

```text
npm run lint
npm run typecheck
npm test
npm run build
```

Si algún script no existe, créalo o explica por qué.

No continuar con errores críticos.

---

# 16. CI/CD

Preparar GitHub Actions para:

```text
install
 ↓
lint
 ↓
typecheck
 ↓
test
 ↓
build
```

No activar deploy automático sin autorización.

---

# 17. GIT

Commits pequeños y profesionales:

```text
feat: initialize project architecture
feat: configure frontend
feat: configure backend
feat: add database configuration
feat: add company module
feat: add services module
test: add services tests
docs: document services architecture
```

Evitar:

```text
update
changes
final
final2
cosas
```

Puedes usar:

```text
main
develop
feature/*
fix/*
```

según corresponda.

---

# 18. PROHIBICIÓN ABSOLUTA DE PUSH

Puedes ejecutar:

```text
git init
git status
git add
git commit
git branch
git switch
git log
git diff
```

Pero:

# NUNCA EJECUTES `git push` SIN MI AUTORIZACIÓN EXPLÍCITA.

También está prohibido sin autorización:

```text
git push --force
git push --force-with-lease
```

Si existe duda:

**NO HAGAS PUSH.**

---

# 19. GITHUB

Crear o utilizar exclusivamente el repositorio de High Clean SAS.

Preferiblemente privado.

No:

- modificar otros repositorios
- eliminar otros repositorios
- acceder a otros proyectos
- modificar archivos fuera de HighCleanSAS

Si necesitas permisos adicionales:

**DETENTE Y PREGUNTA.**

---

