// Verificador de contraste de la paleta, contra WCAG 2.2 nivel AA.
//
// Existe porque en la sesión del 31 de agosto de 2026 se descubrió que `--tinta-tenue` daba
// 3.80:1 sobre `--pergamino-hondo` en modo claro y fallaba AA para texto normal, que es
// exactamente donde se usa: notas de 13 y 14 píxeles. El color se había elegido a ojo.
//
// Un proyecto cuyo nivel Q3 se llama «Accesibilidad aplicada» y que pide a cada estudiante
// declarar una acción de accesibilidad en cada reto no puede fiar su propio contraste al ojo.
// Esto lo mide, y falla el comando si algún par no llega.
//
// Uso:  node tools/verify-contraste.mjs

import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSS = join(RAIZ, "apps", "egia-quest", "src", "egia", "presentacion", "estilos.css");

/** Umbral de WCAG 2.2 AA para texto normal. El texto grande pide 3.0, pero aquí casi todo
 *  el color tenue se usa en cuerpos pequeños, así que se exige el umbral estricto. */
const UMBRAL_AA = 4.5;

const TINTAS = ["tinta", "tinta-suave", "tinta-tenue", "acento", "verde", "ambar", "rojo", "azul"];
const FONDOS = ["pergamino", "papel", "pergamino-hondo"];

function canal(v) {
  const x = v / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function luminancia(hex) {
  const [r, g, b] = hex.match(/\w\w/g).map((h) => canal(parseInt(h, 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const l1 = luminancia(a);
  const l2 = luminancia(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Extrae los dos bloques de paleta: el de `:root` y el de `prefers-color-scheme: dark`. */
function paletas(css) {
  const bloques = [...css.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => m[1]);
  const leer = (bloque) => {
    const mapa = {};
    for (const m of bloque.matchAll(/--([\w-]+):\s*#([0-9a-fA-F]{6})/g)) mapa[m[1]] = m[2];
    return mapa;
  };
  if (bloques.length < 2) throw new Error("No se encontraron los dos bloques de paleta en el CSS");
  return { claro: leer(bloques[0]), oscuro: leer(bloques[1]) };
}

const css = await readFile(CSS, "utf8");
const { claro, oscuro } = paletas(css);

let fallos = 0;
let comprobados = 0;

for (const [modo, pal] of [
  ["claro", claro],
  ["oscuro", oscuro],
]) {
  console.log(`\n  MODO ${modo.toUpperCase()}`);
  for (const tinta of TINTAS) {
    if (!pal[tinta]) {
      console.log(`  ✗ falta la variable --${tinta} en el modo ${modo}`);
      fallos += 1;
      continue;
    }
    let peor = Infinity;
    let peorFondo = "";
    for (const fondo of FONDOS) {
      if (!pal[fondo]) continue;
      const r = contraste(pal[tinta], pal[fondo]);
      comprobados += 1;
      if (r < peor) {
        peor = r;
        peorFondo = fondo;
      }
    }
    const ok = peor >= UMBRAL_AA;
    if (!ok) fallos += 1;
    console.log(
      `  ${ok ? "✓" : "✗"} --${tinta.padEnd(12)} ${peor.toFixed(2).padStart(5)}:1  (peor caso: --${peorFondo})`,
    );
  }
}

console.log(
  `\n  ${comprobados} pares medidos contra el umbral AA de ${UMBRAL_AA}:1 para texto normal.`,
);

if (fallos > 0) {
  console.error(`\n  ✗ ${fallos} combinaciones no llegan a AA.\n`);
  process.exit(1);
}
console.log("  ✓ Toda la paleta cumple WCAG 2.2 AA para texto normal, en ambos modos.\n");
console.log(
  "  ! Límite declarado: esto mide la paleta, no la página. El contraste real depende de\n" +
    "    dónde se use cada color, y hay comprobaciones que ninguna métrica sustituye\n" +
    "    (DEUDA-EGIA-030: revisión con lector de pantalla y con personas usuarias).\n",
);
