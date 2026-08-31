// Copia el build de apps/egia-quest a preview/ en la raíz del repositorio.
//
// Por qué existe: GitHub Pages sirve esta rama tal cual, así que el build tiene que estar
// versionado. Eso es artefacto compilado dentro del repositorio, que normalmente se evita.
// Aquí es una decisión consciente y acotada (DEC-EGIA-043, DEUDA-EGIA-024): permite ver la
// vista previa sin montar un flujo de despliegue antes del Gate 3, y desaparece cuando se
// monte GitHub Actions.
//
// El script no hace `git add` ni publica nada. Escribe archivos y se calla: publicar sigue
// siendo una decisión humana con un comando propio.

import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origen = join(raiz, "apps", "egia-quest", "dist");
const destino = join(raiz, "preview");

async function existe(ruta) {
  try {
    await stat(ruta);
    return true;
  } catch {
    return false;
  }
}

if (!(await existe(origen))) {
  console.error(
    "No hay build que publicar. Ejecuta primero:\n  cd apps/egia-quest && npm run build:preview",
  );
  process.exit(1);
}

if (await existe(destino)) {
  await rm(destino, { recursive: true });
}
await mkdir(destino, { recursive: true });
await cp(origen, destino, { recursive: true });

// GitHub Pages usa Jekyll por defecto y se salta las carpetas que empiezan por guion bajo.
// Vite no las genera hoy, pero el archivo cuesta cero y evita un fallo silencioso mañana.
await writeFile(join(destino, ".nojekyll"), "");

await writeFile(
  join(destino, "LEEME.md"),
  [
    "# Vista previa de EGIA Quest v1.0.0",
    "",
    "Esta carpeta es **artefacto generado**. No se edita a mano: cualquier cambio se pierde",
    "en la siguiente publicación.",
    "",
    "Se regenera con:",
    "",
    "```bash",
    "cd apps/egia-quest",
    "npm run publicar:preview",
    "```",
    "",
    "El código fuente vive en `apps/egia-quest/`. La aplicación publicada en la raíz del sitio",
    "sigue siendo el monolito v0.1B: esta vista previa no lo sustituye.",
    "",
    `Generada el ${new Date().toISOString().slice(0, 10)}.`,
    "",
  ].join("\n"),
);

const archivos = await readdir(destino, { recursive: true });
console.log(`Vista previa escrita en preview/ (${archivos.length} archivos).`);
console.log("Publicar sigue siendo tuyo: revisa con `git status` y decide qué commiteas.");
