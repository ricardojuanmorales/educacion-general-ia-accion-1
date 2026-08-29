// Prueba de humo del monolito EGIA Quest — verify:freeze
// Uso: node smoke.mjs <ruta-al-index.html>
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const target = process.argv[2] || 'index.html';
const url = target.startsWith('http') ? target : pathToFileURL(resolve(target)).href;
const KEY = 'egiaQuestProfile_v01A';

const results = [];
let consoleErrors = [];

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
}

const REFLEXION = 'Comparé la salida inicial con mi versión revisada y documenté qué acepté, qué rechacé y por qué.';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message.split('\n')[0]));
page.on('console', m => { if (m.type() === 'error') consoleErrors.push('console: ' + m.text()); });
page.on('dialog', d => d.accept().catch(() => {}));

await page.goto(url);
await page.waitForTimeout(300);

// 1. carga limpia
check('La página carga sin errores de consola', consoleErrors.length === 0, consoleErrors.join(' | '));

// 2. las seis pestañas abren su panel
const tabs = ['profile', 'challenges', 'dilemmas', 'logbook', 'export', 'about'];
let tabsOk = true, tabDetail = '';
for (const t of tabs) {
  await page.click(`#tab-${t}`);
  await page.waitForTimeout(80);
  const visible = await page.isVisible(`#${t}`);
  const selected = await page.getAttribute(`#tab-${t}`, 'aria-selected');
  const role = await page.getAttribute(`#${t}`, 'role');
  if (!visible || selected !== 'true' || role !== 'tabpanel') { tabsOk = false; tabDetail += `${t} `; }
}
check('Las 6 pestañas abren su panel con aria correcto', tabsOk, tabDetail);

// 3. navegación por teclado
await page.click('#tab-profile');
await page.locator('#tab-profile').focus();
await page.keyboard.press('ArrowRight');
const tras = await page.evaluate(() => document.querySelector('[aria-selected="true"]').id);
await page.keyboard.press('End');
const fin = await page.evaluate(() => document.querySelector('[aria-selected="true"]').id);
check('Flechas y End navegan entre pestañas', tras === 'tab-challenges' && fin === 'tab-about', `${tras} / ${fin}`);

// 4. retos renderizados
await page.click('#tab-challenges');
await page.waitForTimeout(150);
const nCards = await page.locator('.challenge-card').count();
check('Se renderizan los 8 retos del catálogo', nCards === 8, `${nCards} tarjetas`);

const card = page.locator('.challenge-card').first();
const btnIniciar = card.locator('button[data-action="activate"]');
const btnCompletar = card.locator('button[data-action="complete"]');

// 5. estado inicial: completar bloqueado
check('«Completar» está bloqueado antes de iniciar', await btnCompletar.isDisabled());

// 6. iniciar
await btnIniciar.click();
await page.waitForTimeout(250);
const estado = await card.locator('.status').textContent();
const panelVisible = await card.locator('[data-field="reflection"]').isVisible();
const foco = await page.evaluate(() => document.activeElement?.dataset?.field || '');
check('«Iniciar» activa el reto y abre el panel', estado.trim() === 'activo' && panelVisible, `estado=${estado.trim()}`);
check('El foco pasa al campo de reflexión', foco === 'reflection', `foco=${foco || 'ninguno'}`);

// 7. el botón desactivado SE VE desactivado
const opacidad = await page.evaluate(() => {
  const b = document.querySelector('.challenge-card button[data-action="activate"]');
  return parseFloat(getComputedStyle(b).opacity);
});
check('El botón desactivado se distingue visualmente', opacidad < 0.7, `opacidad=${opacidad}`);

// 8. validación de reflexión corta
await card.locator('[data-field="reflection"]').fill('corto');
await btnCompletar.click();
await page.waitForTimeout(200);
const sigueActivo = (await card.locator('.status').textContent()).trim() === 'activo';
const avisoTexto = (await card.locator('.challenge-alert').textContent()) || '';
check('Una reflexión corta no completa el reto', sigueActivo && /caracteres m\u00e1s|reflexi\u00f3n/i.test(avisoTexto), avisoTexto.slice(0, 60));

// 8b. el aviso aparece donde está la persona (DEUDA-EGIA-001)
const avisoEnPantalla = await page.evaluate(() => {
  const b = document.querySelector('.challenge-card button[data-action="complete"]');
  b.scrollIntoView({ block: 'center' });
  const alerta = document.querySelector('.challenge-card .challenge-alert');
  if (!alerta || alerta.hidden) return { visible: false, motivo: 'no hay aviso en la tarjeta' };
  const a = alerta.getBoundingClientRect();
  const dentro = a.bottom > 0 && a.top < window.innerHeight;
  return { visible: dentro, motivo: dentro ? '' : 'el aviso queda fuera del area visible' };
});
check('DEUDA-EGIA-001 \u00b7 el aviso es visible junto al bot\u00f3n', avisoEnPantalla.visible, avisoEnPantalla.motivo);

// 9. completar bien
await card.locator('[data-field="evidence"]').fill('Enlace al prompt documentado en mi carpeta del curso.');
await card.locator('[data-field="reflection"]').fill(REFLEXION);
await btnCompletar.click();
await page.waitForTimeout(300);
const st = await page.evaluate(() => ({
  estado: document.querySelector('.challenge-card .status').textContent.trim(),
  completado: profile.challenges.completed[0],
  reflexion: profile.reflections.find(r => r.related_challenge_id),
  evidencia: profile.voluntary_evidence[0],
  puntos: profile.progress.points_total,
  nivel: profile.progress.current_level,
  badges: profile.badges.length,
  pendientes: profile.challenges.pending.length
}));
check('Completar con reflexión registra el reto', st.estado === 'completado' && st.puntos === 15 && st.badges === 1, JSON.stringify({ puntos: st.puntos, nivel: st.nivel, badges: st.badges }));
check('La reflexión se guarda con identificador real', !!st.completado?.reflection_id && st.completado.reflection_id === st.reflexion?.reflection_id, `reflection_id=${st.completado?.reflection_id}`);
check('La evidencia se guarda y se enlaza al reto', st.completado?.evidence_ids?.length === 1 && st.evidencia?.related_challenge_id === 'EGIA-R-001');
check('El reto sale de la lista de pendientes', st.pendientes === 7, `${st.pendientes} pendientes`);

// 10. persistencia
await page.reload();
await page.click('#tab-challenges');
await page.waitForTimeout(200);
const trasRecarga = await page.evaluate(() => ({
  estado: document.querySelector('.challenge-card .status').textContent.trim(),
  puntos: profile.progress.points_total
}));
check('El progreso sobrevive a la recarga', trasRecarga.estado === 'completado' && trasRecarga.puntos === 15, JSON.stringify(trasRecarga));

// 11. dilemas éticos
await page.click('#tab-dilemmas');
await page.fill('#ethical-justification', 'Anonimicé los datos y consulté el protocolo antes de procesar nada identificable.');
await page.fill('#ethical-mitigation', 'Uso de datos sintéticos para las pruebas.');
await page.click('#save-ethical-decision');
await page.waitForTimeout(250);
const eth = await page.evaluate(() => ({ n: profile.ethical_decisions.length, puntos: profile.progress.points_total }));
check('Guardar una decisión ética suma puntos', eth.n === 1 && eth.puntos === 20, JSON.stringify(eth));

// 12. mini-bitácora
await page.click('#tab-logbook');
await page.fill('#log-purpose', 'Preparar una guía de estudio.');
await page.fill('#log-review', 'Revisé y corregí dos afirmaciones sin fuente.');
await page.click('#save-log');
await page.waitForTimeout(250);
const log = await page.evaluate(() => ({ n: profile.reflections.length, puntos: profile.progress.points_total }));
check('Guardar una entrada de bitácora funciona', log.n === 2 && log.puntos === 25, JSON.stringify(log));

// 13. exportación
await page.click('#tab-export');
await page.click('#refresh-preview');
await page.waitForTimeout(200);
const json = await page.locator('#json-preview').textContent();
let parsed = null, parseOk = true;
try { parsed = JSON.parse(json); } catch { parseOk = false; }
check('La vista previa produce JSON válido', parseOk && parsed?.schema_version === 'egia-quest.profile-progress.v0.1.0');
check('La exportación incluye reto, reflexión y badge', parsed?.challenges?.completed?.length === 1 && parsed?.reflections?.length === 2 && parsed?.badges?.length === 1);
check('La evidencia voluntaria queda fuera por defecto', Array.isArray(parsed?.voluntary_evidence) && parsed.voluntary_evidence.length === 0);
await page.check('#export-evidence');
await page.waitForTimeout(150);
const json2 = JSON.parse(await page.locator('#json-preview').textContent());
check('Al marcar la casilla, la evidencia sí se exporta', json2.voluntary_evidence.length === 1);

// 14. descargas
const dl = await Promise.all([
  page.waitForEvent('download'),
  page.click('#download-json')
]).then(([d]) => d.suggestedFilename()).catch(() => null);
check('El JSON se descarga con nombre correcto', !!dl && /^egia_quest_profile_\d{4}-\d{2}-\d{2}\.json$/.test(dl), dl || 'sin descarga');
const dlmd = await Promise.all([
  page.waitForEvent('download'),
  page.click('#download-md')
]).then(([d]) => d.suggestedFilename()).catch(() => null);
check('El Markdown se descarga con nombre correcto', !!dlmd && /^egia_quest_portfolio_\d{4}-\d{2}-\d{2}\.md$/.test(dlmd), dlmd || 'sin descarga');

// 15. escape de HTML en texto de la persona usuaria
await page.click('#tab-logbook');
await page.fill('#log-purpose', '<img src=x onerror="window.__xss=1">');
await page.fill('#log-review', 'Prueba de escape de HTML en la bitácora.');
await page.click('#save-log');
await page.waitForTimeout(300);
const xss = await page.evaluate(() => ({ ejecutado: !!window.__xss, texto: document.querySelector('#log-list').textContent.includes('onerror') }));
check('El texto de la persona usuaria se escapa', !xss.ejecutado && xss.texto, JSON.stringify(xss));

// 16. perfil heredado de esquema antiguo
await page.evaluate(k => localStorage.setItem(k, JSON.stringify({
  challenges: { completed: [{ challenge_id: 'EGIA-R-003', title: 'Evidencia responsable', completed_at: '2026-01-01', points_awarded: 15 }] },
  progress: { points_total: 15 },
  participant: { display_alias: 'Docente_Heredado' }
})), KEY);
consoleErrors = [];
await page.reload();
await page.click('#tab-challenges');
await page.waitForTimeout(200);
await page.locator('.challenge-card').first().locator('button[data-action="activate"]').click();
await page.waitForTimeout(250);
const heredado = await page.evaluate(() => ({
  estado: document.querySelector('.challenge-card .status').textContent.trim(),
  pendientes: profile.challenges.pending.length,
  alias: profile.participant.display_alias,
  rol: profile.participant.role_self_selected,
  politica: profile.progress.points_policy
}));
check('Un perfil de esquema antiguo migra sin romperse', heredado.estado === 'activo' && heredado.pendientes === 6 && !!heredado.rol && !!heredado.politica, JSON.stringify(heredado));
check('La migración no produce errores de consola', consoleErrors.length === 0, consoleErrors.join(' | '));

// 17. borrar perfil local
await page.click('#tab-profile');
await page.click('#delete-profile');
await page.waitForTimeout(300);
const borrado = await page.evaluate(k => ({ storage: localStorage.getItem(k), puntos: profile.progress.points_total }), KEY);
check('Borrar el perfil local deja el estado en cero', borrado.storage === null && borrado.puntos === 0, JSON.stringify(borrado));

await browser.close();

// informe
const fallos = results.filter(r => !r.ok);
console.log('\n  PRUEBA DE HUMO — EGIA Quest monolito');
console.log('  fuente: ' + url + '\n');
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? '  — ' + r.detail : ''}`);
}
console.log(`\n  ${results.length - fallos.length}/${results.length} pruebas pasan\n`);
process.exit(fallos.length ? 1 : 0);
