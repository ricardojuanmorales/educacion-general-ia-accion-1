// Humo de la vista previa compilada, en un navegador de verdad.
//
// Las pruebas de vitest corren en jsdom sobre los módulos sin empaquetar. Esto recorre el
// artefacto que se publica: el mismo `preview/index.html` con su bundle. Existe porque en este
// proyecto ya pasó una vez que un comando ejecutado se confundiera con un resultado verificado.
//
// Uso:  node tools/smoke-preview.mjs [--ver]
//   --ver  deja el navegador visible y hace pausas, para mirar el recorrido.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "/educacion-general-ia-accion-1/preview/";
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const servidor = createServer(async (peticion, respuesta) => {
  try {
    const ruta = decodeURIComponent(new URL(peticion.url, "http://x").pathname);
    const relativa = ruta.startsWith(BASE) ? ruta.slice(BASE.length) : ruta.replace(/^\//, "");
    const archivo = join(RAIZ, "preview", normalize(relativa || "index.html"));
    if (!archivo.startsWith(join(RAIZ, "preview"))) {
      respuesta.writeHead(403).end("no");
      return;
    }
    const cuerpo = await readFile(archivo);
    respuesta.writeHead(200, { "content-type": TIPOS[extname(archivo)] ?? "application/octet-stream" });
    respuesta.end(cuerpo);
  } catch {
    respuesta.writeHead(404).end("no encontrado");
  }
});

const verificaciones = [];
function comprobar(nombre, condicion, detalle = "") {
  verificaciones.push({ nombre, ok: Boolean(condicion), detalle });
}

const visible = process.argv.includes("--ver");

await new Promise((listo) => servidor.listen(4173, listo));
const navegador = await chromium.launch({ headless: !visible });
const pagina = await navegador.newPage({ viewport: { width: 1180, height: 900 } });

const erroresDeConsola = [];
pagina.on("pageerror", (e) => erroresDeConsola.push(String(e)));
pagina.on("console", (m) => {
  if (m.type() === "error") erroresDeConsola.push(m.text());
});

try {
  await pagina.goto(`http://localhost:4173${BASE}`, { waitUntil: "networkidle" });

  // 1. La aplicación monta y abre en el tablero.
  await pagina.waitForSelector('h2:has-text("Tu progreso")', { timeout: 10_000 });
  comprobar("La aplicación monta y abre en el tablero", true);

  // 2. El tablero declara sus umbrales provisionales, como exige DEUDA-EGIA-011.
  comprobar(
    "El tablero declara que los umbrales son provisionales",
    await pagina.locator("text=Umbrales provisionales").isVisible(),
  );

  // 3. Los quince retos están.
  await pagina.getByRole("tab", { name: "Retos" }).click();
  await pagina.waitForSelector("[data-reto]");
  const cuantos = await pagina.locator("[data-reto]").count();
  comprobar("Se listan los quince retos", cuantos === 15, `encontrados ${cuantos}`);

  // 4. Un reto bloqueado se ve bloqueado. Esta es DEUDA-EGIA-001 medida en píxeles reales:
  //    no basta el atributo, el botón tiene que verse distinto.
  const bloqueado = pagina.locator('[data-bloqueado="true"] button').first();
  const desactivado = await bloqueado.isDisabled();
  const opacidad = await bloqueado.evaluate((b) => Number(getComputedStyle(b).opacity));
  comprobar(
    "DEUDA-EGIA-001 · un botón bloqueado está desactivado Y se ve desactivado",
    desactivado && opacidad < 0.7,
    `disabled=${desactivado} opacidad=${opacidad}`,
  );

  // 5. Recorrido completo del primer reto, incluido el cuarto paso.
  await pagina.locator('[data-reto="EGIA-R-001"] button').click();
  await pagina.getByRole("button", { name: "Iniciar" }).click();

  await pagina.waitForSelector('[data-paso="actividad"]');
  await pagina.locator("textarea").fill("Reorganicé tres párrafos y revisé cada cambio.");
  await pagina.getByRole("button", { name: "Guardar trabajo" }).click();

  await pagina.waitForSelector('[data-paso="evidencia"]');
  await pagina.locator("textarea").fill("Párrafo de disclosure con herramienta, versión y límite.");
  await pagina.getByRole("button", { name: "Guardar evidencia" }).click();

  // 6. La validación de reflexión corta aparece DENTRO de la tarjeta. El bug original.
  await pagina.waitForSelector('[data-paso="reflexion"]');
  await pagina.locator("textarea").fill("corto");
  await pagina.getByRole("button", { name: "Guardar reflexión" }).click();
  const aviso = pagina.locator('[data-aviso="reto"]');
  await aviso.waitFor({ timeout: 3000 });
  const cajaAviso = await aviso.boundingBox();
  const cajaTarjeta = await pagina.locator(".reto").boundingBox();
  comprobar(
    "DEUDA-EGIA-001 · el aviso aparece dentro de la tarjeta del reto",
    cajaAviso && cajaTarjeta && cajaAviso.y > cajaTarjeta.y && cajaAviso.y < cajaTarjeta.y + cajaTarjeta.height,
    `aviso y=${cajaAviso?.y} tarjeta y=${cajaTarjeta?.y} alto=${cajaTarjeta?.height}`,
  );

  await pagina.locator("textarea").fill("Me costó admitir cuánto delegué en la reorganización.");
  await pagina.getByRole("button", { name: "Guardar reflexión" }).click();

  // 7. DEC-EGIA-042: con reflexión guardada el reto NO está completado. Falta decidir.
  await pagina.waitForSelector('[data-paso="decision"]');
  comprobar(
    "DEC-EGIA-042 · tras la reflexión el reto pide la decisión, no se da por completado",
    await pagina.locator("text=paso 4 de 4").isVisible(),
  );
  comprobar(
    "La decisión ofrece las tres salidas",
    (await pagina.locator('.control--decision input[type="radio"]').count()) === 3,
  );

  await pagina.getByRole("button", { name: "Registrar mi decisión y cerrar el reto" }).click();
  await pagina.waitForSelector('[data-paso="completado"]');
  comprobar("El reto se cierra con la decisión registrada", true);

  // 8. El portafolio ve la evidencia elegible y la curaduría es un segundo acto.
  await pagina.getByRole("tab", { name: "Portafolio" }).click();
  await pagina.waitForSelector('h3:has-text("Listas para curar (1)")');
  comprobar("La evidencia aceptada aparece lista para curar, no curada sola", true);
  await pagina.getByRole("button", { name: "Añadir al portafolio" }).click();
  await pagina.waitForSelector('h3:has-text("En tu portafolio (1)")');
  comprobar("La curaduría mete la pieza en el portafolio", true);

  // 9. Un dilema: la consecuencia no se ve antes de decidir.
  await pagina.getByRole("tab", { name: "Dilemas" }).click();
  await pagina.locator(".tarjeta button").first().click();
  await pagina.waitForSelector(".dilema");
  const consecuenciasAntes = await pagina.locator(".consecuencia").count();
  comprobar("La consecuencia no se muestra antes de decidir", consecuenciasAntes === 0);

  await pagina.locator('.opciones input[type="radio"]').first().click();
  await pagina.getByRole("button", { name: "Decidir y ver la consecuencia" }).click();
  comprobar(
    "Sin justificación no se revela la consecuencia",
    await pagina.locator('[data-aviso="dilema"]').isVisible(),
  );
  await pagina.locator("textarea").fill("Elijo esta porque me pareció la salida más rápida.");
  await pagina.getByRole("button", { name: "Decidir y ver la consecuencia" }).click();
  await pagina.waitForSelector(".consecuencia");
  comprobar("Con justificación, la consecuencia se revela", true);
  comprobar(
    "DEC-EGIA-026 · una decisión no cuidadosa ofrece reparación",
    (await pagina.locator(".reparacion").count()) === 1,
  );

  // 10. Persistencia real: recargar no borra nada.
  await pagina.reload({ waitUntil: "networkidle" });
  await pagina.waitForSelector('h2:has-text("Tu progreso")');
  const puntos = await pagina.locator(".tablero__puntos").innerText();
  comprobar(
    "Tras recargar, el progreso sigue ahí",
    /^(?!0\s)\d+/.test(puntos.trim()),
    `tablero muestra «${puntos.replace(/\s+/g, " ").trim()}»`,
  );
  comprobar("Un reto completado cuenta como completado", (await pagina.locator("text=1 de 15").count()) > 0);

  // 11. Ningún error de consola en todo el recorrido.
  comprobar(
    "Ningún error en la consola del navegador",
    erroresDeConsola.length === 0,
    erroresDeConsola.slice(0, 3).join(" | "),
  );

  if (visible) await pagina.waitForTimeout(15_000);
} finally {
  await navegador.close();
  servidor.close();
}

let fallos = 0;
for (const v of verificaciones) {
  if (!v.ok) fallos += 1;
  console.log(`${v.ok ? "✓" : "✗"} ${v.nombre}${v.detalle ? `  — ${v.detalle}` : ""}`);
}
console.log(`\n${verificaciones.length - fallos}/${verificaciones.length} verificaciones.`);
process.exit(fallos === 0 ? 0 : 1);
