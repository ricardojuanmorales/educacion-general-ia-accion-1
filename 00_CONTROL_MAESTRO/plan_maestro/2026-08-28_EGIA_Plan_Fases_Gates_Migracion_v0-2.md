# Plan de Fases y Gates — Migración EGIA Quest v0.1A → v1.0.0

**Proyecto:** Educación General e Inteligencia Artificial en Acción · EGIA Quest
**Documento:** Plan de fases, gates ejecutables y deuda inicial
**Versión del documento:** v0.2.0-plan
**Fecha:** 28 de agosto de 2026
**Marco rector:** Spec-Driven Development + local-first por defecto + privacy by default
**Arquetipo de referencia:** AI StoryLab 1 v1.0.0
**Horizonte:** v1.0.0 · piloto con estudiantes el 23 de octubre de 2026
**Estado:** Propuesta para revisión humana
**Ruta canónica:** `00_CONTROL_MAESTRO/plan_maestro/2026-08-28_EGIA_Plan_Fases_Gates_Migracion_v0-2.md`

---

## 1. Propósito

Fijar la ruta por la que EGIA Quest deja de ser un archivo HTML monolítico y se convierte en una
aplicación local-first con motor de misiones heredado de AI StoryLab, quince retos con andamiaje
pedagógico y dilemas éticos donde la decisión tiene consecuencia.

Este documento no autoriza implementación por sí solo. Cada fase cierra con un gate que exige
comando ejecutable **y** decisión humana registrada.

---

## 2. Fundamento

Se hereda el principio rector de AI StoryLab 1 (Fundamento Filosófico v0.4.3):

> La IA no sustituye la imaginación humana, la decisión ética ni la construcción de sentido.
> La IA amplía posibilidades, pero la persona conserva la autoría, la agencia y la responsabilidad.

De él se deriva el principio de diseño propio de EGIA Quest, criterio de aceptación o rechazo de
toda mecánica:

> **La ética no adorna el juego. La ética es la mecánica.**

Un dilema sin consecuencia visible es una trivia. Un reto que se completa sin evidencia ni
reflexión es un botón. Ambas cosas existen en el MVP v0.1A y ambas se eliminan.

---

## 3. Registro de decisiones

La serie `DEC-EGIA-NNN` estaba abierta desde el 7 de mayo de 2026 y llegaba hasta `DEC-EGIA-021`.
Estas decisiones la continúan. Registro canónico en
`00_CONTROL_MAESTRO/decisiones/2026-08-28_EGIA_Registro_Decisiones_Migracion_v1-0_v0-1.md`.

| ID | Decisión | Consecuencia operativa |
|---|---|---|
| DEC-EGIA-022 | Audiencia primaria: estudiantes | Retos en voz estudiantil, Nivel 4. Ruta docente diferida a v1.1 sobre el mismo motor. |
| DEC-EGIA-023 | Un reto ES una misión | Se reutiliza y extiende `MissionDefinition` y `creative-cycle` de StoryLab. No se modela dominio paralelo. |
| DEC-EGIA-024 | Repo actual con núcleo copiado | StoryLab v1.0.0 no se toca. Gate `verify:core-parity` detecta divergencias. |
| DEC-EGIA-025 | Piloto el 23 de octubre de 2026 | Ocho semanas. Lo que no quepa se declara deuda aceptada. |
| DEC-EGIA-026 | El corazón lúdico es la decisión con consecuencia | Dilemas ramificados con efecto y reparación. Puntos y niveles quedan como capa secundaria. |
| DEC-EGIA-027 | Portafolio formativo; exportar es acto explícito | Privado por defecto. Nada sale sin decisión humana registrada. |
| DEC-EGIA-028 | Espina dorsal: 10 prácticas + 5 integradores | Un reto por Buena Práctica de la Guía Rápida Estudiantil, más cinco integradores transdisciplinarios. |
| DEC-EGIA-029 | Competencias de StoryLab como canónicas | Se hereda el marco y se publica equivalencia con DigComp. No se crea taxonomía nueva. |
| DEC-EGIA-030 | Redacción asistida, autoría y revisión humanas | Borrador completo de retos, dilemas y glosario para corrección de voz y contenido. |
| DEC-EGIA-031 | Gobernanza SDD sin techo documental | Se retira el límite por gate. A cambio, cada documento declara a qué spec, gate o fundamento sirve. |
| DEC-EGIA-032 | El portafolio migra al esquema de StoryLab | Perfil EGIA sobre esquema común, con migración desde `egia-quest.profile-progress.v0.1.0`. |
| DEC-EGIA-033 | El monolito se congela como v0.1B | Se preserva en `legacy/v0.1B/` y no se apaga hasta el Gate 4. |

**Nota sobre DEC-EGIA-031.** Retirar el techo no es aceptar crecimiento sin control. La disciplina
sustituta es de trazabilidad, no de cantidad: ningún documento entra sin declarar su destino en
cabecera, y la gobernanza avanza en paralelo a la entrega sin bloquear la fecha del piloto. El
antídoto contra la parsimonia no es escribir menos: es tener fecha y declarar deuda.

---

## 4. Análisis de brecha

| Dimensión | MVP v0.1A | Objetivo v1.0.0 |
|---|---|---|
| Arquitectura | Un `index.html` de 1,950 líneas con datos incrustados | TypeScript por capas: dominio, aplicación, puertos, adaptadores, presentación |
| Pruebas | Ninguna | Suite según patrón StoryLab: dominio, contratos, accesibilidad, offline, paridad |
| Contenido | 8 retos, 3 dilemas planos, sin glosario | 15 retos con andamiaje, 12 dilemas ramificados, glosario, fichas de herramientas |
| Datos | Literales JS dentro del HTML | Contenido como dato validado contra JSON Schema en compilación y ejecución |
| Portafolio | Exporta JSON y Markdown, sin migración | Esquema común del ecosistema, roundtrip probado, migración desde v0.1.0 |
| Progreso | Puntos, badges, conteo | Tablero con competencias, prácticas éticas, niveles y deuda pedagógica |
| Gobernanza | Cartapacios creados, casi todos vacíos | Specs, gates ejecutables, decisiones, deuda, transferencia simétrica |
| Verificación | Revisión visual | `verify:components` como condición para firmar gate |

### 4.1 Lo que el plan deliberadamente no hace

- **Ruta docente:** diferida a v1.1. El motor la soportará sin rehacerse.
- **Backend, cuentas o telemetría:** se mantiene `backend: false`, `account_required: false`, `telemetry: false`.
- **IA en vivo dentro de la aplicación:** EGIA Quest enseña a usar IA; no la incorpora. Cualquier integración exigiría spec, análisis de riesgo y gate propios.
- **Monorepo con StoryLab:** descartado para no reestructurar un release publicado y verificado.
- **Reescribir las Specs Núcleo:** consentimiento, datos y seguridad local-first se heredan por referencia de SPEC-OP-006, SPEC-OP-007 y SPEC-OP-008.

---

## 5. Los quince retos y su andamiaje

EGIA Quest tiene siete niveles, Q0 a Q6, y la taxonomía de acción heredada de AI StoryLab tiene
siete verbos: reconocer, explorar, crear, documentar, evaluar, reflexionar, transferir. El anclaje es
uno a uno. Andamiaje con desvanecimiento: Q0–Q1 plantilla rellenable, Q2–Q4 checklist, Q5–Q6 solo criterio.

| Reto | Práctica / eje | Nivel | Evidencia mínima | Apoyo |
|---|---|---|---|---|
| R-01 | Declara tu uso de IA | Q0 | Párrafo de disclosure con herramienta, versión y límites | Plantilla |
| R-02 | Bitácora breve pero sólida | Q0 | 2–5 prompts clave con decisiones de aceptar o rechazar | Plantilla |
| R-03 | Verifica y triangula | Q1 | Mini-matriz fuente–hallazgo–decisión con ≥2 fuentes | Plantilla |
| R-04 | Defiende tu aporte humano | Q1 | Sección «qué hice yo vs. IA» y guion de defensa | Plantilla |
| R-05 | Explicabilidad mínima | Q2 | Nota metodológica y un caso de abstención justificada | Checklist |
| R-06 | Privacidad y propiedad intelectual | Q2 | Matriz de licencias y descargo de privacidad | Checklist |
| R-07 | Justicia y accesibilidad (DUA/POUR) | Q3 | Checklist de accesibilidad y versión low-tech del producto | Checklist |
| R-08 | Proporcionaliza el riesgo (mini-IBATA) | Q4 | Mini-IBATA de una página con umbrales declarados | Checklist |
| R-09 | Aprende, no solo produzcas | Q5 | Reflexión de 100–150 palabras y registro de progreso | Solo criterio |
| R-10 | Juego limpio en evaluaciones (AIAS) | Q4 | Nivel AIAS declarado y coherencia con bitácora | Checklist |
| R-11 | Integrador · producto multimodal documentado | Q5 | Producto con trazabilidad completa de decisiones de autoría | Solo criterio |
| R-12 | Integrador · curaduría crítica de herramientas | Q5 | Ficha comparativa con límites y «cuándo no usar» | Solo criterio |
| R-13 | Integrador · dilema situado propio | Q5 | Caso real del curso analizado con IBATA completo | Solo criterio |
| R-14 | Integrador · portafolio íntegro | Q6 | Exportación revisada por pares y defensa en cinco láminas | Solo criterio |
| R-15 | Integrador · transferencia | Q6 | Aplicación a otro contexto y enseñanza a otra persona | Solo criterio |

### 5.1 Campo nuevo obligatorio

Cada reto exige declarar un **«cuándo no usar IA»**. La aplicación actual no lo pide y es el centro
de la práctica 5 de la Guía. Es el campo que convierte el juego en formación del juicio: obliga a la
abstención razonada, no solo al uso correcto.

### 5.2 Dilemas rediseñados

De opción única con justificación a estructura ramificada:
escenario → opciones → **consecuencia mostrada** → posibilidad de reparación → registro de la
decisión en el portafolio. Doce dilemas escalonados por nivel, anclados en los ejes del mini-IBATA.
Una decisión mala no bloquea: genera consecuencia y ofrece reparación documentada.

### 5.3 Glosario, herramientas y tablero

- **Glosario:** derivado del glosario canónico de StoryLab, con entradas propias de educación general.
- **Herramientas de IA:** fichas —qué hace, qué no hace, qué datos toca, cuándo no usarla— que alimentan el reto R-12.
- **Tablero:** progreso por competencia con delta medible, por práctica ética, por nivel Q, y una **deuda pedagógica** (retos abiertos sin evidencia, reflexiones vacías, accesibilidad no verificada). Es el Registro de Deuda aplicado al aprendizaje.

---

## 6. Fases y gates

### F0 · Congelar el monolito — Semana 1

Se paga la deuda P1 del aviso de validación fuera de pantalla, se etiqueta el monolito como `v0.1B`
y se publica bajo `/legacy/v0.1B/`, siguiendo el patrón con que StoryLab preservó su MVP histórico.
Nadie se queda sin aplicación durante la migración.

**Gate 0 · congelación** — `verify:freeze`: la etiqueta existe, la ruta legacy responde, la prueba de
humo del flujo iniciar→completar pasa. Decisión humana de cierre de v0.1A registrada.

### F1 · Contenido como dato canónico — Semanas 2–4

Los 15 retos, los 12 dilemas ramificados, el glosario y las fichas de herramientas se escriben como
datos validados contra JSON Schema, no como código. Inversión sin riesgo: este contenido vale igual
en cualquier stack.

**Gate 1 · contenido canónico** — `validate:content`: los 15 retos y los 12 dilemas validan contra
esquema; cada reto declara competencia, evidencia, criterio ético, accesibilidad y «cuándo no usar».
Aprobación humana del contenido pedagógico.

### F2 · Rebanada vertical — Semanas 4–5

Nace `apps/egia-quest/` con el stack de StoryLab y el núcleo copiado: esquemas, puertos, adaptadores
de almacenamiento y casos de uso de portafolio. Se implementa **un** reto completo —inicio,
evidencia, reflexión, decisión humana, entrada al portafolio— con sus pruebas.

**Gate 2 · rebanada vertical** — `verify:vertical-slice` y `verify:core-parity`: el reto funciona con
pruebas de dominio, aplicación y presentación; la copia del núcleo no ha divergido del original.

### F3 · Escalar — Semanas 5–7

Los catorce retos restantes, los dilemas con consecuencia, el tablero, el glosario, la sección de
herramientas y la introducción ilustrada a las competencias del siglo 21 y las buenas prácticas.
También la salida estática low-tech que preserva el principio de acceso sin servidor.

**Gate 3 · paridad** — `verify:components` más pruebas de paridad de portafolio: un perfil exportado
en v0.1.0 se importa, migra y produce equivalencia semántica verificada.

### F4 · Piloto y apagado — Semana 8

Prueba con estudiantes reales en condiciones de curso. El monolito se retira solo después de que el
sucesor pase el gate de piloto; hasta entonces convive en la ruta legacy.

**Gate 4 · piloto** — `verify:pilot`: accesibilidad verificada, guarda de funcionamiento sin red,
consentimiento situado operativo, y bitácora de la sesión con estudiantes registrada como evidencia
humana.

---

## 7. Calendario

| Semana | Fecha | Trabajo |
|---|---|---|
| S1 | 31 ago | F0. Deuda P1 pagada, monolito etiquetado v0.1B. Kit de gobernanza inicial. |
| S2 | 7 sep | F1. Borrador de retos R-01 a R-08 y esquema de contenido. |
| S3 | 14 sep | F1. Retos R-09 a R-15, glosario y fichas de herramientas. |
| S4 | 21 sep | F1 cierra. Doce dilemas ramificados. Arranca F2. |
| S5 | 28 sep | F2 cierra. Rebanada vertical con pruebas. Arranca F3. |
| S6 | 5 oct | F3. Los catorce retos restantes y los dilemas en la aplicación. |
| S7 | 12 oct | F3 cierra. Tablero, introducción ilustrada, salida low-tech. |
| S8 | 19–23 oct | Gate 4. Piloto con estudiantes. |

**Punto de control de la semana 4.** El contenido es el camino crítico. Si al cerrar la semana 4 los
quince retos no están aprobados, se recorta a los diez anclados a las prácticas y los cinco
integradores pasan a v1.1 como deuda aceptada. La decisión se toma una vez, con fecha, y no se
vuelve a discutir.

---

## 8. Registro de deuda inicial

| ID | Prioridad | Descripción | Cierre |
|---|---|---|---|
| DEUDA-EGIA-001 | P1 | El aviso de validación del reto se muestra a 501 px fuera del área visible; el botón vuelve a parecer muerto | F0 |
| DEUDA-EGIA-002 | P1 | El monolito no tiene pruebas automatizadas; toda verificación es visual | Aceptada; muere con el monolito en F4 |
| DEUDA-EGIA-003 | P2 | No existe migración formal de esquema; la fusión de perfil actual es un parche defensivo | F2 |
| DEUDA-EGIA-004 | P2 | El marco de competencias no está mapeado a DigComp | F1 |
| DEUDA-EGIA-005 | P2 | Migrar al stack con build sacrifica la apertura por doble clic, principio de acceso low-tech | F3, con salida estática de un archivo |
| DEUDA-EGIA-006 | P2 | Los dilemas actuales no tienen consecuencia ni reparación; funcionan como trivia | F1 |
| DEUDA-EGIA-007 | P3 | El núcleo copiado puede divergir de StoryLab sin que nadie lo note | Mitigada por `verify:core-parity` desde F2 |
| DEUDA-EGIA-008 | P3 | La ruta docente queda fuera de v1.0 | Aceptada; v1.1 |
| DEUDA-EGIA-009 | P3 | npm introduce superficie de cadena de suministro que hoy no existe | Gestionada con `audit:secrets` y versiones fijadas |

---

## 9. Instrumentos de gobernanza y rutas canónicas

Los cartapacios de EGIA Quest ya existen; casi todos están vacíos con marcadores `nada.md`. Se
pueblan en el orden en que el trabajo los necesita.

| Instrumento | Ruta canónica | Fase |
|---|---|---|
| Fundamento filosófico y pedagógico | `01_FUNDAMENTO_FILOSOFICO/` | F0 |
| Registro de decisiones (DEC-EGIA-NNN) | `00_CONTROL_MAESTRO/` | F0 |
| Registro de deuda (DEUDA-EGIA-NNN) | `00_CONTROL_MAESTRO/` | F0 |
| Tabla de ubicación documental | `00_CONTROL_MAESTRO/` | F0 |
| Herencia de Specs Núcleo por referencia | `04_GOBERNANZA_ETICA_Y_RIESGOS/` | F1 |
| Spec del contenido pedagógico y del andamiaje | `12_DISENO_INSTRUCCIONAL_UNIVERSAL/` | F1 |
| Mapa de gates y actas de aprobación | `15_EVALUACION_CALIDAD_Y_AUDITORIA/` | F1–F4 |
| Bitácora de transferencia simétrica | `18_DOCUMENTACION_ACTIVA/bitacoras_vivas/` | cada cierre |
| Prompt de activación de próxima sesión | `00_CONTROL_MAESTRO/primers_continuidad/` | cada cierre |
| Guion del piloto y rúbrica de observación | `08_CURSOS_PROGRAMAS_Y_TRAYECTORIAS/` | F4 |

---

## 10. Riesgos

- **El contenido no llega a tiempo.** Riesgo mayor y más probable. Mitigación: punto de control de la semana 4 y recorte automático a diez retos. Señal de alarma: menos de ocho retos aprobados al cerrar la semana 3.
- **La migración se traga las ocho semanas.** Mitigación: la rebanada vertical de F2 es la prueba de fuego. Si al terminar la semana 5 un reto no funciona de punta a punta con pruebas, se detiene la migración, se publica una v0.2 del monolito con el contenido nuevo y la migración se reabre después del piloto.
- **El aparato documental crece más rápido que la aplicación.** Sin techo de documentos, la señal a vigilar es otra: si al cerrar una fase hay documentos de gobernanza sin gate ni artefacto asociado, esa fase no cierra hasta que cada uno declare su destino o pase a archivo histórico.
- **Se pierde el juego.** Riesgo silencioso: terminar con una aplicación rigurosa que nadie quiere usar. Criterio de detección en el piloto: si ningún estudiante completa un dilema por voluntad propia, la mecánica falló, por muy verde que esté la suite de pruebas.

---

## 11. Próxima acción

1. Registrar las once decisiones y la deuda inicial en `00_CONTROL_MAESTRO/`, y adoptar este plan como documento canónico del proyecto.
2. Pagar `DEUDA-EGIA-001` y etiquetar `v0.1B`: media sesión de trabajo, un PR.
3. Iniciar la redacción de los retos R-01 a R-08 para revisión humana.

**Requisito para arrancar:** confirmación del plan y definición del marco de competencias de
StoryLab que se hereda como canónico (`05_COMPETENCIAS_Y_PERFILES`), presentado para aprobación
antes de usarlo en los retos.

---

*Documento preparado con asistencia de IA. Decisiones, autoría y aprobación: Ricardo Juan Morales De Jesús.*
