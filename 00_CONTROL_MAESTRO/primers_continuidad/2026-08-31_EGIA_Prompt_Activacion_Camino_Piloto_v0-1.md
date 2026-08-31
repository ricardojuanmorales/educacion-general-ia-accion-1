---
titulo: "Prompt de Activación - camino al piloto del 23 de octubre"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-31"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo"
sirve_a: "Continuidad entre sesiones · Plan de Fases y Gates v0.2.1 · Gate 3"
ubicacion_recomendada: "00_CONTROL_MAESTRO/primers_continuidad/2026-08-31_EGIA_Prompt_Activacion_Camino_Piloto_v0-1.md"
tags: ["egia", "prompt-activacion", "continuidad", "fase-3", "piloto"]
---

# Prompt de Activación — camino al piloto

Texto para abrir una sesión nueva sin perder el hilo. Copiar y pegar tal cual.

---

## Prompt

Trabajo en EGIA Quest, la aplicación del proyecto Educación General e Inteligencia Artificial en
Acción. Repositorio: `ricardojuanmorales/educacion-general-ia-accion-1`.

Antes de proponer nada, lee estos documentos en este orden:

1. `00_CONTROL_MAESTRO/2026-08-31_EGIA_Reflexion_Alineacion_Estrategica_F3_v0-1.md` — empieza
   aquí: tiene el camino crítico y el hallazgo que reordena las prioridades.
2. `18_DOCUMENTACION_ACTIVA/bitacoras_vivas/2026-08-31_EGIA_Transferencia_Simetrica_Cierre_F3_v0-1.md`
3. `00_CONTROL_MAESTRO/decisiones/2026-08-28_EGIA_Registro_Decisiones_Migracion_v1-0_v0-1.md`
4. `18_DOCUMENTACION_ACTIVA/deuda/2026-08-28_EGIA_Registro_Deuda_Migracion_v0-1.md`
5. `00_CONTROL_MAESTRO/plan_maestro/2026-08-28_EGIA_Plan_Fases_Gates_Migracion_v0-2.md`
6. `00_CONTROL_MAESTRO/2026-08-29_EGIA_Tabla_Ubicacion_Documental_v0-1.md` — **consúltala antes
   de asignar cualquier identificador nuevo.**

**Estado heredado.** Gates 0, 1 y 2 firmados sin reservas. El sucesor está publicado y navegable
en `/preview/`: seis secciones —tablero, retos, dilemas, glosario, herramientas, portafolio—
sobre `localStorage`, con el contenido aprobado completo. La raíz del sitio sigue sirviendo el
monolito v0.1B, intacto. Series al cierre: `DEC-EGIA-044` y `DEUDA-EGIA-032`.

**Las tres reglas que gobiernan el código.**

- `apps/egia-quest/src/core` es copia verbatim de AI StoryLab 1 y **no se edita nunca**. El
  código propio vive en `src/egia`. Lo protege `npm run verify:core-parity`.
- Un reto se cierra con cuatro pasos: trabajo, evidencia, reflexión y decisión humana registrada
  sobre la evidencia (`DEC-EGIA-042`). Ninguna pantalla calcula el estado siguiente por su
  cuenta: llama al caso de uso y adopta lo que el motor devuelve.
- El nivel Q es recorrido, no moneda (`DEC-EGIA-044`).

**Lo primero que hay que decidir, y es humano.** Qué se quiere aprender del piloto del 23 de
octubre. Hoy la aplicación no tiene canal de evidencia: sin telemetría, sin vista docente y sin
exportación, nada de lo que hagan las personas estudiantes puede llegar al profesor
(`DEUDA-EGIA-032`). Esa decisión determina qué debe exportar la aplicación, así que **no
construyas la exportación antes de tenerla**.

**Orden de trabajo sugerido**, del camino crítico de la reflexión: exportación → introducción
ilustrada → preferencias de accesibilidad → revisión con lector de pantalla → salida estática
low-tech → GitHub Actions.

**Qué NO debes hacer.** No edites el núcleo copiado. No modifiques el contenido aprobado —retos,
dilemas, glosario, fichas— sin decisión humana propia (`DEC-EGIA-040`); eso incluye mover un reto
de nivel. No apagues el monolito. No integres IA en vivo. No hagas `push` ni abras ni fusiones
PR: los commits los firma el responsable del proyecto.

**Comandos de verificación.** Desde la raíz: `verify:freeze`, `verify:legacy`, `validate:content`,
`verify:contraste`, `verify:preview`. Dentro de `apps/egia-quest` (requiere npm ≥ 12):
`verify:components` y `publicar:preview`.

**Una advertencia sobre `preview/`.** Es artefacto compilado versionado (`DEC-EGIA-043`,
`DEUDA-EGIA-024`). Tras regenerarlo, `preview/assets/` debe contener **exactamente** los dos
archivos que cita `preview/index.html`; borra los del build anterior o quedarán huérfanos en el
repositorio.

**Y una regla de método, aprendida caro dos veces en este proyecto:** un comando ejecutado no es
un resultado verificado, y un razonamiento plausible tampoco. Verifica el estado real antes de
afirmar nada, y si un documento tuyo resulta equivocado, corrígelo a la vista en vez de
reescribirlo en silencio.
