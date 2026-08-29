---
titulo: "Registro de Decisiones - Migración a EGIA Quest v1.0.0"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-28"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo"
sirve_a: "Plan de Fases y Gates v0.2.0-plan"
ubicacion_recomendada: "00_CONTROL_MAESTRO/decisiones/2026-08-28_EGIA_Registro_Decisiones_Migracion_v1-0_v0-1.md"
tags: ["egia", "registro-decisiones", "gobernanza", "sdd", "migracion", "egia-quest"]
---

# Registro de Decisiones — Migración a EGIA Quest v1.0.0

Continúa la serie `DEC-EGIA-NNN` abierta el 7 de mayo de 2026, que llegaba hasta `DEC-EGIA-021`.
Una decisión registrada no se edita: se sucede con una decisión nueva que la deroga explícitamente.

| ID | Fecha | Decisión | Justificación | Estado |
|---|---|---|---|---|
| DEC-EGIA-022 | 2026-08-28 | Audiencia primaria de v1.0: estudiantes | La Guía Rápida Estudiantil, Nivel 4, es la fuente del contenido. La ruta docente se difiere a v1.1 sobre el mismo motor | Confirmada |
| DEC-EGIA-023 | 2026-08-28 | Un reto de EGIA Quest ES una misión de AI StoryLab | Reutilizar `MissionDefinition` y `creative-cycle` evita mantener dos motores y hace posible la interoperabilidad de portafolio | Confirmada |
| DEC-EGIA-024 | 2026-08-28 | El sucesor vive en este repositorio con el núcleo de AI StoryLab copiado | AI StoryLab v1.0.0 está publicado y verificado; no se reestructura. `verify:core-parity` detecta divergencias | Confirmada |
| DEC-EGIA-025 | 2026-08-28 | Fecha objetivo: piloto con estudiantes el 23 de octubre de 2026 | Ocho semanas. La fecha es el mecanismo que obliga a declarar deuda en vez de extender el análisis | Confirmada |
| DEC-EGIA-026 | 2026-08-28 | El corazón lúdico es la decisión con consecuencia | Un dilema sin consecuencia visible es una trivia. Puntos, badges y niveles quedan como capa secundaria | Confirmada |
| DEC-EGIA-027 | 2026-08-28 | Portafolio formativo; exportar es acto explícito de la persona | Coherente con privacidad por defecto y con la práctica 10 de la Guía | Confirmada |
| DEC-EGIA-028 | 2026-08-28 | Espina dorsal de contenido: 10 prácticas + 5 integradores | Cada Buena Práctica de la Guía ya declara su evidencia exigida; el contenido está medio escrito | Confirmada |
| DEC-EGIA-029 | 2026-08-28 | Marco de competencias de AI StoryLab como canónico, mapeado a DigComp | Evita fragmentar el ecosistema con una taxonomía nueva | Confirmada |
| DEC-EGIA-030 | 2026-08-28 | Redacción asistida por IA; autoría, revisión y aprobación humanas | Coherente con el principio rector heredado: la persona conserva autoría y responsabilidad | Confirmada |
| DEC-EGIA-031 | 2026-08-28 | Gobernanza SDD sin techo documental, con trazabilidad obligatoria | El aparato documental es parte del valor, no su lastre. Cada documento declara en cabecera a qué spec, gate o fundamento sirve | Confirmada |
| DEC-EGIA-032 | 2026-08-28 | El portafolio migra al esquema de AI StoryLab con perfil EGIA encima | Es la condición para que un mismo estudiante use ambas aplicaciones con un solo portafolio | Confirmada |
| DEC-EGIA-033 | 2026-08-28 | El monolito se congela como v0.1B y se preserva en `legacy/v0.1B/` | Nadie se queda sin aplicación durante la migración; el MVP se retira solo tras el Gate 4 | Confirmada |
| DEC-EGIA-034 | 2026-08-29 | Se aprueba el Marco de Competencias y Andamiaje v0.1 | Habilita la redacción de los quince retos. Adopta las diez familias competenciales de AI StoryLab como canónicas, ancla los siete niveles Q a los siete verbos de la taxonomía de acción y construye el mapeo a DigComp 3.0 como pieza propia | Confirmada |
| DEC-EGIA-036 | 2026-08-29 | Subjetividad estratégica: estudiante universitario de educación general | Fija la voz, el andamiaje y el nivel de exigencia de los quince retos. Coherente con la política AIAS del curso declarada en la Guía Rápida: Nivel 4 (Uso Abierto) en tareas no supervisadas con controles obligatorios, Nivel 0 en pruebas supervisadas. Cierra DEUDA-EGIA-014 | Confirmada |
| DEC-EGIA-035 | 2026-08-29 | Se corrige la ubicación de la etiqueta `v0.1B` | La etiqueta se creó apuntando a `371f361`, el merge del PR #1, que no contiene la Fase 0. Se reubica sobre el `main` resultante de fusionar el PR #2. Requiere reescritura de una referencia ya publicada, autorizada por esta decisión | Confirmada |

---

## Nota de fundamento sobre DEC-EGIA-031

Retirar el techo documental no es aceptar crecimiento sin control. La disciplina sustituta es de
trazabilidad, no de cantidad: ningún documento entra al repositorio sin declarar su destino en
cabecera, y la gobernanza avanza en paralelo a la entrega sin bloquear la fecha del piloto.

La práctica de gobernanza basada en SDD, y los SDD fundados en bases pedagógicas, se consideran la
mayor fortaleza de AI StoryLab como arquetipo y se adoptan aquí sin recorte.
