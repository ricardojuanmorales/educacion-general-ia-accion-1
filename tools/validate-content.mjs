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

// --- informe ---
console.log(`\n  VALIDACIÓN DE CONTENIDO — EGIA Quest`);
console.log(`  datos:   ${RUTA_DATOS}`);
console.log(`  esquema: ${RUTA_ESQUEMA}`);
console.log(`  retos:   ${retos.length} · integradores: ${integradores.length} · prácticas cubiertas: ${practicas.length}/10\n`);

const porNivel = ORDEN_NIVEL.map(n => `${n}:${retos.filter(r => r.nivel === n).length}`).join('  ');
console.log(`  distribución por nivel   ${porNivel}`);
console.log(`  familias desarrolladas   ${familias.size}/10`);
console.log(`  puntos del catálogo      ${retos.reduce((s, r) => s + (r.puntos_base || 0), 0)}\n`);

for (const a of avisos) console.log(`  ! ${a}`);
if (avisos.length) console.log('');

if (errores.length) {
  for (const e of errores) console.log(`  ✗ ${e}`);
  console.log(`\n  ${errores.length} error${errores.length === 1 ? '' : 'es'}. El Gate 1 no puede firmarse.\n`);
  process.exit(1);
}

console.log(`  ✓ El contenido cumple el esquema y las reglas del marco.\n`);
