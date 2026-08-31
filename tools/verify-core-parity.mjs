// Verificación de paridad del núcleo copiado — verify:core-parity
// Gate 2 del Plan de Fases y Gates v0.2.0. Vigila DEUDA-EGIA-007.
//
// src/core es una copia verbatim del núcleo de AI StoryLab 1 (DEC-EGIA-024).
// Este comando compara cada archivo contra el manifiesto de hashes registrado
// en el momento de la copia y falla si alguno cambió.
//
// Uso:
//   node tools/verify-core-parity.mjs           verifica
//   node tools/verify-core-parity.mjs --sellar  regenera el manifiesto (solo tras una recopia)

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NUCLEO = join(RAIZ, 'apps/egia-quest/src/core');
const MANIFIESTO = join(RAIZ, 'apps/egia-quest/core-manifest.json');
const sellar = process.argv.includes('--sellar');

function recorrer(dir) {
  const salida = [];
  for (const entrada of readdirSync(dir).sort()) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) salida.push(...recorrer(ruta));
    else salida.push(ruta);
  }
  return salida;
}

if (!existsSync(NUCLEO)) {
  console.error('\n  ✗ No existe apps/egia-quest/src/core\n');
  process.exit(1);
}

const archivos = recorrer(NUCLEO);
const actual = {};
for (const ruta of archivos) {
  const clave = relative(NUCLEO, ruta).split('\\').join('/');
  actual[clave] = createHash('sha256').update(readFileSync(ruta)).digest('hex');
}

if (sellar) {
  const previo = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : {};
  const manifiesto = {
    origen: 'github.com/ricardojuanmorales/ai-storylab-1',
    ruta_origen: 'apps/storylab/src',
    commit_origen: previo.commit_origen || '6ef7fb3',
    fecha_copia: previo.fecha_copia || new Date().toISOString().slice(0, 10),
    fecha_sellado: new Date().toISOString().slice(0, 10),
    nota: 'Detecta deriva local, no deriva de origen. Si AI StoryLab avanza hay que recopiar y volver a sellar (DEUDA-EGIA-007).',
    archivos: actual,
  };
  writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n');
  console.log(`\n  ✓ Manifiesto sellado con ${Object.keys(actual).length} archivos.\n`);
  process.exit(0);
}

if (!existsSync(MANIFIESTO)) {
  console.error('\n  ✗ No existe el manifiesto. Sella con: node tools/verify-core-parity.mjs --sellar\n');
  process.exit(1);
}

const manifiesto = JSON.parse(readFileSync(MANIFIESTO, 'utf8'));
const esperado = manifiesto.archivos || {};

const modificados = [];
const ausentes = [];
const anadidos = [];

for (const [clave, hash] of Object.entries(esperado)) {
  if (!(clave in actual)) ausentes.push(clave);
  else if (actual[clave] !== hash) modificados.push(clave);
}
for (const clave of Object.keys(actual)) {
  if (!(clave in esperado)) anadidos.push(clave);
}

console.log(`\n  PARIDAD DEL NÚCLEO COPIADO`);
console.log(`  origen:  ${manifiesto.origen} · ${manifiesto.ruta_origen}`);
console.log(`  commit:  ${manifiesto.commit_origen} · copiado el ${manifiesto.fecha_copia}`);
console.log(`  archivos verificados: ${Object.keys(esperado).length}\n`);

for (const c of modificados) console.log(`  ✗ modificado · ${c}`);
for (const c of ausentes) console.log(`  ✗ ausente    · ${c}`);
for (const c of anadidos) console.log(`  ✗ añadido    · ${c}`);

if (modificados.length || ausentes.length || anadidos.length) {
  console.log(`\n  El núcleo copiado divergió del original. src/core no se edita: el código propio`);
  console.log(`  de EGIA Quest vive en src/egia y extiende el núcleo desde fuera (DEC-EGIA-024).`);
  console.log(`  Si la divergencia es intencional porque recopiaste desde un commit nuevo de`);
  console.log(`  AI StoryLab, vuelve a sellar con --sellar y registra la decisión.\n`);
  process.exit(1);
}

console.log(`  ✓ El núcleo copiado es idéntico al que se selló.`);
console.log(`  ! Límite declarado: esto detecta deriva local, no deriva de origen (DEUDA-EGIA-007).\n`);
