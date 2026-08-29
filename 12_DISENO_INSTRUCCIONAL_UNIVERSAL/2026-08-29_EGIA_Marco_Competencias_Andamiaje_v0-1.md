---
titulo: "Marco de Competencias y Andamiaje - EGIA Quest v1.0.0"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-29"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "propuesta para aprobación humana"
sirve_a: "DEC-EGIA-029 · Fase 1 del Plan de Fases y Gates v0.2.0 · paga DEUDA-EGIA-004"
fuente_heredada: "AI StoryLab 1 · 05_COMPETENCIAS_Y_PERFILES · Marco_Competencias_Taxonomias v0.4.3"
ubicacion_recomendada: "12_DISENO_INSTRUCCIONAL_UNIVERSAL/2026-08-29_EGIA_Marco_Competencias_Andamiaje_v0-1.md"
tags: ["egia", "competencias", "andamiaje", "digcomp", "sdd", "fase-1"]
---

# Marco de Competencias y Andamiaje — EGIA Quest v1.0.0

## 1. Propósito y alcance

Fijar el marco competencial canónico de EGIA Quest, su relación con DigComp 3.0 y el contrato de
datos que todo reto debe declarar. Ejecuta `DEC-EGIA-029` y paga `DEUDA-EGIA-004`.

Este documento no autoriza implementación. Requiere aprobación humana antes de usarse para redactar
los quince retos.

---

## 2. Lo que se hereda y lo que se construye aquí

**Se hereda literalmente de AI StoryLab 1 v0.4.3**, sin reescritura:

- Las diez dimensiones operacionales y sus diez familias competenciales.
- La taxonomía transversal de acción: `reconocer, explorar, crear, documentar, evaluar, reflexionar, transferir`.
- Los cuatro niveles orientadores de desempeño.
- La tipología de trece tipos de evidencia y su matriz de sensibilidad.

**Se construye nuevo en este documento**, porque no existe en AI StoryLab:

- El mapeo a DigComp. Se verificó por búsqueda literal en los 2,201 archivos del repositorio de
  AI StoryLab: **DigComp, UNESCO, OCDE e IEEE no aparecen en ningún documento**. La Guía Rápida
  Estudiantil sí los cita, así que el puente se levanta aquí y queda como pieza propia de EGIA Quest,
  no como herencia.
- El anclaje de los siete niveles Q de EGIA Quest a la taxonomía de acción.
- El contrato de datos de un reto.

---

## 3. Las diez familias competenciales (canónicas)

Identificadores nuevos en formato slug, para uso en datos. Los nombres y la evidencia mínima son
cita literal del marco heredado.

| ID | Familia competencial | Dimensión operacional | Evidencia mínima heredada |
|---|---|---|---|
| `agencia_humana` | Agencia, autoría y criterio humano | Agencia Humana | Una explicación breve de una decisión tomada y por qué fue tomada por la persona |
| `aprendizaje_ludico` | Exploración lúdica e imaginación aplicada | Aprendizaje Lúdico | Un registro breve de una prueba realizada, qué ocurrió y qué se aprendió |
| `investigacion_creacion` | Investigación-creación y producción de conocimiento | Investigación-Creación | Una pregunta conectada con un artefacto y una explicación breve del proceso |
| `literacidad_ia` | Comprensión, verificación y uso responsable de IA | Literacidad Crítica en IA | Una declaración simple de uso de IA: para qué se usó y qué revisó la persona |
| `etica_responsabilidad` | Decisión ética, privacidad, consentimiento y cuidado | Ética Aplicada y Responsabilidad | Una identificación de riesgo ético y una decisión tomada para reducirlo |
| `diseno_universal` | Diseño inclusivo, accesibilidad y multimodalidad | Diseño Universal y Accesibilidad | Una barrera identificada y una adaptación propuesta o realizada |
| `conocimiento_situado` | Pertinencia cultural, institucional y contextual | Conocimiento Situado y Contextual | Una explicación de cómo el contexto afecta una decisión, evidencia o producción |
| `colaboracion_transdisciplinaria` | Diálogo, co-creación y coautoría | Colaboración Transdisciplinaria | Un registro de roles y contribuciones principales en un proceso colectivo |
| `reflexion_portafolio` | Metacognición, evidencia y memoria de proceso | Reflexión Metacognitiva y Portafolio | Una evidencia seleccionada con una breve explicación de por qué muestra aprendizaje |
| `evaluacion_criterio` | Retroalimentación, rúbrica y juicio situado | Evaluación Formativa y Criterio Humano | Una revisión realizada a partir de retroalimentación, con explicación breve del cambio |

### 3.1 Sucesión de las competencias actuales de EGIA Quest

Las ocho competencias del MVP v0.1A no se borran: quedan como identificadores heredados que
resuelven a una o más familias canónicas. Los perfiles ya exportados siguen leyéndose.

| ID heredado (v0.1A) | Etiqueta v0.1A | Resuelve a |
|---|---|---|
| `prompt_engineering` | Ingeniería de prompts | `literacidad_ia` + `aprendizaje_ludico` |
| `human_review` | Revisión humana | `evaluacion_criterio` + `agencia_humana` |
| `responsible_ai` | Uso ético y responsable de IA | `etica_responsabilidad` |
| `data_governance` | Gobernanza de datos y privacidad | `etica_responsabilidad` |
| `accessibility` | Accesibilidad y diseño universal | `diseno_universal` |
| `documentation` | Documentación activa | `reflexion_portafolio` |
| `curation` | Curaduría crítica | `literacidad_ia` + `conocimiento_situado` |
| `transdisciplinary` | Pensamiento transdisciplinario | `colaboracion_transdisciplinaria` + `conocimiento_situado` |

---

## 4. Los siete niveles Q y la taxonomía de acción

EGIA Quest ya tenía siete niveles. La taxonomía heredada tiene siete verbos. El anclaje es
uno a uno, con una salvedad declarada.

| Nivel | Etiqueta EGIA Quest | Puntos mínimos (v0.1A) | Verbo dominante |
|---|---|---:|---|
| Q0 | Activación responsable | 0 | reconocer |
| Q1 | Práctica situada | 10 | explorar |
| Q2 | Producción documentada | 30 | crear |
| Q3 | Accesibilidad aplicada | 50 | documentar |
| Q4 | Juicio ético | 75 | evaluar |
| Q5 | Integración caleidoscópica | 105 | reflexionar |
| Q6 | Transferencia portable | 140 | transferir |

**Salvedad honesta.** El anclaje de Q3 a `documentar` es el más débil de los siete: «Accesibilidad
aplicada» no es sinónimo de documentar. Se sostiene porque la evidencia mínima heredada de
`diseno_universal` es exactamente documental —«una barrera identificada y una adaptación propuesta
o realizada»—, pero conviene revisarlo en el Gate 1 en vez de darlo por bueno.

**Niveles orientadores de desempeño** (heredados sin cambio; se declaran por reto, no por persona):

1. Inicial guiado — reconoce conceptos o participa con acompañamiento, ejemplos y estructura clara.
2. Exploratorio — prueba alternativas, crea evidencias iniciales y empieza a justificar decisiones.
3. Autónomo situado — documenta, evalúa y revisa procesos con criterio propio y atención al contexto.
4. Transferente crítico — adapta, comunica, justifica y transfiere aprendizajes a nuevos contextos.

El marco heredado advierte que «estos niveles son orientadores, no calificaciones cerradas». La
advertencia se conserva.

---

## 5. Andamiaje y su desvanecimiento

| Nivel | Apoyo que recibe la persona |
|---|---|
| Q0–Q1 | Plantilla rellenable con campos y ejemplo resuelto |
| Q2–Q4 | Checklist de criterios, sin plantilla |
| Q5–Q6 | Solo el criterio y la evidencia exigida |

El desvanecimiento es del andamiaje, no de la exigencia: la evidencia pedida en Q6 es más difícil,
no menos acompañada por descuido.

---

## 6. Mapeo a DigComp 3.0

DigComp 3.0 (2026) reorganizó el marco europeo en cinco áreas, redujo los niveles de dominio de
ocho a cuatro —lo que coincide con los cuatro niveles heredados de AI StoryLab— e integró la IA a
lo largo de todo el marco en vez de tratarla como anexo.

| Familia canónica EGIA | Área DigComp 3.0 |
|---|---|
| `literacidad_ia` | 1 · Information search, evaluation and management |
| `conocimiento_situado` | 1 · Information search, evaluation and management |
| `colaboracion_transdisciplinaria` | 2 · Communication and collaboration |
| `investigacion_creacion` | 3 · Content creation |
| `diseno_universal` | 3 · Content creation |
| `etica_responsabilidad` | 4 · Safety, wellbeing and responsible use |
| `agencia_humana` | 4 · Safety, wellbeing and responsible use |
| `aprendizaje_ludico` | 5 · Problem identification and solving |
| `evaluacion_criterio` | 5 · Problem identification and solving |
| `reflexion_portafolio` | transversal · sin área única |

**Advertencia de método.** Este mapeo es una lectura de equivalencia, no una certificación de
alineación con DigComp. Sirve para que el progreso de un estudiante sea legible fuera de la
institución; no autoriza afirmar que EGIA Quest «certifica competencias DigComp». `reflexion_portafolio`
se declara transversal en vez de forzarla a un área: el portafolio atraviesa las cinco.

---

## 7. Contrato de datos de un reto

Todo reto declara estos campos. Los marcados con · son obligatorios y bloquean la validación del
Gate 1 si faltan.

| Campo | Tipo | Obligatorio | Nota |
|---|---|---|---|
| `id` | `EGIA-R-NNN` | · | Identificador estable, nunca se reutiliza |
| `titulo` | texto | · | |
| `practica_guia` | 1–10 o `null` | · | Buena Práctica de la Guía Rápida Estudiantil que ancla el reto |
| `nivel` | `Q0`–`Q6` | · | |
| `verbo` | taxonomía de acción | · | Verbo dominante |
| `desempeno_esperado` | 1–4 | · | Nivel orientador |
| `competencias` | lista de familias | · | Entre una y tres |
| `consigna` | texto | · | Lo que la persona debe hacer, en segunda persona |
| `evidencia_minima` | texto | · | Qué produce y entrega |
| `tipo_evidencia` | tipología de 13 | · | Para la matriz de sensibilidad |
| `sensibilidad` | media / media-alta / alta / variable | · | Heredada de la matriz de privacidad |
| `reflexion` | pregunta | · | Pregunta que abre el campo de reflexión |
| `criterio_etico` | texto | · | |
| `accesibilidad` | texto | · | Acción concreta, no principio general |
| `cuando_no_usar_ia` | texto | · | Campo nuevo obligatorio; la abstención razonada |
| `andamiaje` | plantilla / checklist / criterio | · | Derivado del nivel, declarado explícito |
| `plantilla` | lista de campos | según andamiaje | Solo en Q0–Q1 |
| `checklist` | lista de criterios | según andamiaje | Solo en Q2–Q4 |
| `prerrequisitos` | lista de `id` | | Retos que deben estar completados antes |
| `puntos_base` | entero | · | |
| `badge_posible` | id de badge o `null` | | |
| `proyectos_transversales` | lista | | Enlace a los cinco proyectos del programa |

---

## 8. Deuda que este documento abre

| ID | Prioridad | Descripción | Cierre |
|---|---|---|---|
| DEUDA-EGIA-011 | P2 | La economía de puntos del MVP se calibró para 8 retos; con 15 retos y dilemas ramificados los umbrales Q0–Q6 quedan desajustados | F3 |
| DEUDA-EGIA-012 | P3 | El anclaje de Q3 a `documentar` es el más débil de los siete y necesita revisión humana | Gate 1 |
| DEUDA-EGIA-013 | P3 | El mapeo a DigComp 3.0 es lectura de equivalencia sin validación externa | Aceptada; se declara en la aplicación |

---

## 9. Dictamen

Documento propuesto para revisión humana. No debe usarse para redactar los quince retos hasta
contar con aprobación registrada como decisión.
