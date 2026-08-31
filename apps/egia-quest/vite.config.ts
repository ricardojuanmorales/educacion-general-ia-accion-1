import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Ruta base del despliegue. En GitHub Pages el sitio vive bajo el nombre del repositorio y
// esta vista previa cuelga de /preview/, junto al monolito publicado, sin sustituirlo.
// `npm run build:preview` la fija; `npm run build` a secas sirve para servir en la raíz.
const rutaBase = process.env.EGIA_BASE_PATH ?? "/";

export default defineConfig({
  base: rutaBase,
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
