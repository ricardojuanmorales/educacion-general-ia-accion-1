// Imprime el cuadernillo de revisión a PDF. Segunda mitad de `npm run revision:cuadernillo`.
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const HTML = resolve(AQUI, "cuadernillo-revision.html");
const FECHA = new Date().toISOString().slice(0, 10);
const PDF = resolve(AQUI, `EGIA_Quest_Cuadernillo_Revision_${FECHA}.pdf`);

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.goto(pathToFileURL(HTML).href, { waitUntil: "networkidle" });
await pagina.pdf({
  path: PDF,
  format: "Letter",
  printBackground: true,
  margin: { top: "20mm", bottom: "18mm", left: "16mm", right: "16mm" },
  displayHeaderFooter: true,
  headerTemplate:
    '<div style="font-family:Helvetica,sans-serif;font-size:7pt;color:#8a8272;width:100%;padding:0 16mm;display:flex;justify-content:space-between;"><span>EGIA Quest · Cuadernillo de revisión</span><span>DEUDA-EGIA-020</span></div>',
  footerTemplate:
    '<div style="font-family:Helvetica,sans-serif;font-size:7.5pt;color:#8a8272;width:100%;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
});
await navegador.close();
console.log(`\n  Cuadernillo impreso: ${PDF}\n`);
