# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## SEO y metadatos

- `<Seo>` (`src/components/Seo.tsx`) fija por ruta: `title`, `description`, Open Graph, Twitter, canonical y bloques JSON-LD (`src/lib/seo.ts`).
- `npm run build` ejecuta un prebuild (`scripts/generate-seo-files.mjs`) que genera `public/robots.txt` y `public/sitemap.xml`.
- La base de URLs del SEO es la variable **`VITE_SITE_URL`** (ver `.env.example`; copiar a `.env.local`, que está gitignored).
- **En producción (`NODE_ENV=production`) el build FALLA** si `VITE_SITE_URL` no está definida o no es una URL `https` válida (nada de localhost/IP local/dominios de ejemplo). En desarrollo sin definir usa `http://localhost:5173` y solo avisa.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
