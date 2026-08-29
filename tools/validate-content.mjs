// Validación del contenido pedagógico de EGIA Quest — validate:content
// Gate 1 del Plan de Fases y Gates v0.2.0.
//
// Dos capas:
//   1. JSON Schema, que valida forma y vocabularios cerrados.
//   2. Reglas semánticas del Marco de Competencias y Andamiaje v0.1 (DEC-EGIA-034),
//      que un esquema no puede expresar bien: coherencia entre nivel, verbo y andamiaje,
//      orden de prerrequisitos y cobertura de las diez Buenas Prácticas.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const RUTA_DATOS = process.argv[2] || 'contenido/retos/retos_egia_quest_v0-1.json';
const RUTA_ESQUEMA = process.argv[3] || 'contenido/esquemas/retos.schema.json';

const VERBO_POR_NIVEL = {
  Q0: 'reconocer',
  Q1: 'explorar',
  Q2: 'crear',
  Q3: 'documentar',
  Q4: 'evaluar',
  Q5: 'reflexionar',
  Q6: 'transferir',
};

const ANDAMIAJE_POR_NIVEL = {
  Q0: 'plantilla', Q1: 'plantilla',
  Q2: 'checklist', Q3: 'checklist', Q4: 'checklist',
  Q5: 'criterio', Q6: 'criterio',
};

const ORDEN_NIVEL = ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];

const errores = [];
const avisos = [];

const datos = JSON.parse(readFileSync(resolve(RUTA_DATOS), 'utf8'));
const esquema = JSON.parse(readFileSync(resolve(RUTA_ESQUEMA), 'utf8'));

// --- capa 1: JSON Schema ---
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const valida = ajv.compile(esquema);

if (!valida(datos)) {
  for (const e of valida.errors) {
    errores.push(`esquema · ${e.instancePath || '/'} ${e.message}${e.params?.allowedValues ? ` (permitidos: ${e.params.allowedValues.join(', ')})` : ''}`);
  }
}

// --- capa 2: reglas del marco ---
const retos = datos.retos || [];
const ids = new Set(retos.map(r => r.id));

for (const r of retos) {
  const donde = `${r.id}`;

  if (VERBO_POR_NIVEL[r.nivel] && r.verbo !== VERBO_POR_NIVEL[r.nivel]) {
    errores.push(`marco · ${donde} está en ${r.nivel}, cuyo verbo dominante es «${VERBO_POR_NIVEL[r.nivel]}», pero declara «${r.verbo}»`);
  }

  if (ANDAMIAJE_POR_NIVEL[r.nivel] && r.andamiaje !== ANDAMIAJE_POR_NIVEL[r.nivel]) {
    errores.push(`marco · ${donde} está en ${r.nivel}, que corresponde a andamiaje «${ANDAMIAJE_POR_NIVEL[r.nivel]}», pero declara «${r.andamiaje}»`);
  }

  for (const p of r.prerrequisitos || []) {
    if (!ids.has(p)) {
      errores.push(`marco · ${donde} declara el prerrequisito ${p}, que no existe en el catálogo`);
      continue;
    }
    const previo = retos.find(x => x.id === p);
    if (ORDEN_NIVEL.indexOf(previo.nivel) > ORDEN_NIVEL.indexOf(r.nivel)) {
      errores.push(`marco · ${donde} (${r.nivel}) depende de ${p}, que está en un nivel superior (${previo.nivel})`);
    }
  }

  if (r.cuando_no_usar_ia && !/^No /i.test(r.cuando_no_usar_ia.trim()) && !/\bno\b/i.test(r.cuando_no_usar_ia)) {
    avisos.push(`estilo · ${donde} · el campo «cuándo no usar IA» no expresa una abstención concreta`);
  }
}

// cobertura de las diez Buenas Prácticas
const practicas = retos.map(r => r.practica_guia).filter(p => p !== null && p !== undefined);
const faltan = [1,2,3,4,5,6,7,8,9,10].filter(n => !practicas.includes(n));
if (faltan.length) {
  errores.push(`marco · faltan retos anclados a las Buenas Prácticas: ${faltan.join(', ')}`);
}
const repetidas = practicas.filter((p, i) => practicas.indexOf(p) !== i);
if (repetidas.length) {
  errores.push(`marco · Buenas Prácticas ancladas más de una vez: ${[...new Set(repetidas)].join(', ')}`);
}

// integradores
const integradores = retos.filter(r => r.practica_guia === null || r.practica_guia === undefined);
if (integradores.length !== 5) {
  errores.push(`marco · se esperan 5 retos integradores (DEC-EGIA-028) y hay ${integradores.length}`);
}

// cobertura de familias competenciales
const familias = new Set(retos.flatMap(r => r.competencias || []));
const TODAS = ['agencia_humana','aprendizaje_ludico','investigacion_creacion','literacidad_ia','etica_responsabilidad','diseno_universal','conocimiento_situado','colaboracion_transdisciplinaria','reflexion_portafolio','evaluacion_criterio'];
const sinCubrir = TODAS.filter(f => !familias.has(f));
if (sinCubrir.length) {
  avisos.push(`cobertura · familias competenciales que ningún reto desarrolla: ${sinCubrir.join(', ')}`);
}

// pendientes declarados
for (const p of datos.pendiente_de_confirmacion_humana || []) {
  avisos.push(`pendiente humano · ${p}`);
}

// --- dilemas ---
const RUTA_DILEMAS = 'contenido/dilemas/dilemas_egia_quest_v0-1.json';
const RUTA_ESQUEMA_DILEMAS = 'contenido/esquemas/dilemas.schema.json';
let dilemas = [];

try {
  const datosD = JSON.parse(readFileSync(resolve(RUTA_DILEMAS), 'utf8'));
  const esquemaD = JSON.parse(readFileSync(resolve(RUTA_ESQUEMA_DILEMAS), 'utf8'));
  const validaD = ajv.compile(esquemaD);

  if (!validaD(datosD)) {
    for (const e of validaD.errors) {
      errores.push(`esquema dilemas · ${e.instancePath || '/'} ${e.message}${e.params?.allowedValues ? ` (permitidos: ${e.params.allowedValues.join(', ')})` : ''}`);
    }
  }

  dilemas = datosD.dilemas || [];

  for (const d of dilemas) {
    // DEC-EGIA-026: toda decisión tiene consecuencia, y el daño tiene reparación
    for (const o of d.opciones || []) {
      const dejaDano = ['dañina', 'apresurada', 'evasiva'].includes(o.calidad);
      if (dejaDano && !o.reparacion) {
        errores.push(`marco · ${d.id} opción ${o.id} es «${o.calidad}» y no ofrece reparación (DEC-EGIA-026)`);
      }
      if (o.calidad === 'cuidadosa' && o.reparacion) {
        avisos.push(`revisar · ${d.id} opción ${o.id} es cuidadosa pero declara reparación: ¿dejó daño?`);
      }
    }
    // un dilema donde todo es correcto no es un dilema
    const cuidadosas = (d.opciones || []).filter(o => o.calidad === 'cuidadosa').length;
    if (cuidadosas === (d.opciones || []).length) {
      errores.push(`marco · ${d.id} tiene las cuatro opciones cuidadosas: sin tensión no hay dilema`);
    }
    if (cuidadosas === 0) {
      errores.push(`marco · ${d.id} no ofrece ninguna salida cuidadosa: un dilema sin salida enseña impotencia, no juicio`);
    }
  }

  for (const p of datosD.pendiente_de_confirmacion_humana || []) {
    avisos.push(`pendiente humano · ${p}`);
  }
} catch (e) {
  if (e.code === 'ENOENT') {
    avisos.push('dilemas · todavía no existe el catálogo de dilemas');
  } else {
    errores.push(`dilemas · ${e.message}`);
  }
}

// --- glosario y fichas de herramientas ---
let terminos = [];
let fichas = [];

function validarCatalogo(ruta, rutaEsquema, clave, etiqueta) {
  try {
    const d = JSON.parse(readFileSync(resolve(ruta), 'utf8'));
    const e = JSON.parse(readFileSync(resolve(rutaEsquema), 'utf8'));
    const v = ajv.compile(e);
    if (!v(d)) {
      for (const err of v.errors) {
        errores.push(`esquema ${etiqueta} · ${err.instancePath || '/'} ${err.message}`);
      }
    }
    return d[clave] || [];
  } catch (err) {
    if (err.code === 'ENOENT') {
      avisos.push(`${etiqueta} · todavía no existe el catálogo`);
      return [];
    }
    errores.push(`${etiqueta} · ${err.message}`);
    return [];
  }
}

terminos = validarCatalogo('contenido/glosario/glosario_egia_quest_v0-1.json', 'contenido/esquemas/glosario.schema.json', 'terminos', 'glosario');
fichas = validarCatalogo('contenido/herramientas/herramientas_egia_quest_v0-1.json', 'contenido/esquemas/herramientas.schema.json', 'herramientas', 'herramientas');

// términos duplicados
const nombres = terminos.map(t => t.termino.toLowerCase());
const dup = nombres.filter((n, i) => nombres.indexOf(n) !== i);
if (dup.length) errores.push(`glosario · términos duplicados: ${[...new Set(dup)].join(', ')}`);

// referencias cruzadas del glosario
for (const t of terminos) {
  for (const r of t.relacionados || []) {
    if (!nombres.includes(r.toLowerCase())) {
      avisos.push(`glosario · «${t.termino}» remite a «${r}», que no existe como entrada`);
    }
  }
}

// las fichas de herramientas describen tipos, no productos
const MARCAS = /\b(chatgpt|gpt-?[0-9]|claude|gemini|copilot|midjourney|dall-?e|stable diffusion|perplexity|notebooklm|grammarly|turnitin|whisper)\b/i;
for (const f of fichas) {
  const texto = JSON.stringify(f);
  if (MARCAS.test(texto)) {
    errores.push(`herramientas · ${f.id} nombra un producto concreto; las fichas describen tipos de herramienta y caducan si nombran marcas`);
  }
}

// --- informe ---
console.log(`\n  VALIDACIÓN DE CONTENIDO — EGIA Quest`);
console.log(`  datos:   ${RUTA_DATOS}`);
console.log(`  esquema: ${RUTA_ESQUEMA}`);
console.log(`  retos:   ${retos.length} · integradores: ${integradores.length} · prácticas cubiertas: ${practicas.length}/10\n`);

const porNivel = ORDEN_NIVEL.map(n => `${n}:${retos.filter(r => r.nivel === n).length}`).join('  ');
console.log(`  retos por nivel          ${porNivel}`);
console.log(`  familias desarrolladas   ${familias.size}/10`);
console.log(`  puntos del catálogo      ${retos.reduce((s, r) => s + (r.puntos_base || 0), 0)}`);

if (dilemas.length) {
  const dPorNivel = ORDEN_NIVEL.map(n => `${n}:${dilemas.filter(d => d.nivel === n).length}`).join('  ');
  const ejes = ['injusticias_danos', 'autonomia', 'transformaciones', 'accountability']
    .map(e => `${e.split('_')[0]}:${dilemas.filter(d => d.eje_ibata === e).length}`).join('  ');
  const opciones = dilemas.flatMap(d => d.opciones || []);
  const conReparacion = opciones.filter(o => o.reparacion).length;
  console.log(`\n  dilemas                  ${dilemas.length}`);
  console.log(`  dilemas por nivel        ${dPorNivel}`);
  console.log(`  ejes IBATA               ${ejes}`);
  console.log(`  opciones                 ${opciones.length} · con consecuencia: ${opciones.filter(o => o.consecuencia).length} · con reparación: ${conReparacion}`);
}
if (terminos.length || fichas.length) {
  console.log(`\n  términos de glosario     ${terminos.length}`);
  console.log(`  fichas de herramienta    ${fichas.length} (por tipo, no por producto)`);
}
console.log('');

for (const a of avisos) console.log(`  ! ${a}`);
if (avisos.length) console.log('');

if (errores.length) {
  for (const e of errores) console.log(`  ✗ ${e}`);
  console.log(`\n  ${errores.length} error${errores.length === 1 ? '' : 'es'}. El Gate 1 no puede firmarse.\n`);
  process.exit(1);
}

console.log(`  ✓ El contenido cumple el esquema y las reglas del marco.\n`);
