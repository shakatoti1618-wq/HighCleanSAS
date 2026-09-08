# Vite

Vite es el empaquetador y servidor de desarrollo del frontend.

- Arranca un servidor de desarrollo con **Hot Module Replacement** (HMR): los cambios se ven al instante sin recargar la página.
- Compila React + TypeScript y genera el **build de producción** en la carpeta `dist/`.
- Usa esbuild/Rolldown para ser muy rápido.

Comandos del proyecto:

```text
npm run dev    # servidor de desarrollo
npm run build  # genera dist/ listo para producción
```

Archivo relacionado:
`app/frontend/vite.config.ts`