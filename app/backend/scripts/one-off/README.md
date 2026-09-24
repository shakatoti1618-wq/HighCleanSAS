# Script one-off: subir imágenes de servicios y galería a Cloudflare R2

Carga única de los medios reales de High Clean SAS al bucket de R2 usando el dominio
público `https://media.highcleansas.com`.

## Prerrequisitos
- `.env` del backend con las variables R2 configuradas (ver `.env.example`):
  `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`,
  `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`.
- Base de datos con una empresa registrada (ejecutar antes `npm run db:seed`).
- Archivos esperados en `Descargas`:
  - `hogar.jpeg`, `planchado.jpeg`, `adultomayor.jpeg`, `conjuntos.jpeg`,
    `niñeras.jpeg`, `oficinas.jpeg`, `airbnb.jpeg` (fotos de servicios).
  - Carpeta `galeriahighclean/` con las imágenes/videos de la galería
    (png/jpg/webp/mp4/webm).

## Ejecución
Desde `app/backend`:

    npx tsx scripts/one-off/upload-assets.ts

## Qué hace
1. **Servicios**: para cada nombre de la lista, si el `Service` no existe lo crea
   (solo `name` + `imageUrl`; el resto de la información la completará el módulo de
   servicios). Sube la foto a `services/<slug>.jpeg` y asigna `imageUrl` al servicio.
2. **Galería**: sube cada archivo válido de `galeriahighclean/` a `gallery/<archivo>`
   y crea una `GalleryImage` con `type` IMAGE/VIDEO según la extensión. Si una fila
   ya tiene la URL, la salta (idempotente: no duplica filas).
3. **Verificación**: hace un `GET` real a cada URL pública y marca las que no
   respondan 2xx. No inventa causes: solo lista las fallidas.

## Salida y código de salida
- Imprime una tabla tipo/nombre/URL/estado por archivo.
- Salida `0` si todo subió y verificó; `1` si faltó algún archivo, se quedó sin
  empresa, falló la subida o una URL no respondió 2xx.

## Notas
- El script reutiliza la capa de storage del backend (`src/services/storage.service.ts`).
- No borra nada: solo crea filas que falten y actualiza `imageUrl` de servicios.
- Eseo fuera de `tsconfig` (`include: ["src"]`), así que no participa de
  lint/typecheck/build de CI.