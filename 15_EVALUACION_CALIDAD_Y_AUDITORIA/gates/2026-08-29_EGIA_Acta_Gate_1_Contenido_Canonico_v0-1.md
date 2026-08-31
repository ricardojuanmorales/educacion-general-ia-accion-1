---
titulo: "Acta del Gate 1 - Contenido pedagógico canónico"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-29"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
autoridad_humana: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "aprobado con reservas"
sirve_a: "Plan de Fases y Gates v0.2.0 · cierre de Fase 1 y apertura de Fase 2"
ubicacion_recomendada: "15_EVALUACION_CALIDAD_Y_AUDITORIA/gates/2026-08-29_EGIA_Acta_Gate_1_Contenido_Canonico_v0-1.md"
tags: ["egia", "gate", "fase-1", "contenido", "gobernanza"]
---

# Acta del Gate 1 — Contenido pedagógico canónico

```yaml
gate_id: GATE-EGIA-1
label: Contenido pedagógico canónico
phase: Fase 1
status: approved_with_reservations
lifecycle: fulfilled
authority: Ricardo Juan Morales De Jesús, Ph.D.
date: 2026-08-29
evidence: [npm run validate:content, PR #3]
dependencies: [GATE-EGIA-0]
next_gate: GATE-EGIA-2
```

## 1. Qué autoriza

Abre la Fase 2: creación de `apps/egia-quest/` con el stack de AI StoryLab y el núcleo copiado, y
construcción de la rebanada vertical de un reto de punta a punta con sus pruebas.

## 2. Qué bloquea

No autoriza escalar al resto del contenido dentro de la aplicación, ni construir el tablero, ni
retirar el monolito. Eso corresponde a los Gates 2, 3 y 4.

## 3. Evidencia presentada

Comando `npm run validate:content`, ejecutado en el contenedor de trabajo y en la máquina del
responsable documental, con resultado en verde:

```
retos    15 · integradores 5 · prácticas cubiertas 10/10
retos por nivel          Q0:2  Q1:2  Q2:2  Q3:1  Q4:2  Q5:4  Q6:2
familias desarrolladas   10/10
dilemas                  12 · opciones 48 · con consecuencia 48 · con reparación 23
términos de glosario     38
fichas de herramienta     8 (por tipo, no por producto)
```

La validación cubre dos capas: JSON Schema para forma y vocabularios cerrados, y reglas del Marco
de Competencias y Andamiaje v0.1 que un esquema no expresa —coherencia entre nivel, verbo y
andamiaje; prerrequisitos que no dependen de niveles superiores; cobertura única de las diez Buenas
Prácticas; consecuencia obligatoria en toda opción de dilema y reparación obligatoria donde la
decisión deja daño.

## 4. Reserva que condiciona la aprobación

La autoridad humana declaró: «Tomaremos el contenido por bueno sujeto a revisión posterior».

El contenido pedagógico —quince retos, doce dilemas, treinta y ocho términos y ocho fichas— fue
redactado con asistencia de IA y validado automáticamente, pero **no ha sido revisado línea por
línea por la autoridad humana**. La validación garantiza coherencia estructural, no acierto
pedagógico ni adecuación de la voz.

Queda registrado como `DEUDA-EGIA-020` con prioridad P1 y cierre obligatorio antes del piloto del
23 de octubre de 2026.

## 5. Deuda que permanece abierta al cruzar el gate

| ID | Prioridad | Motivo por el que no bloquea |
|---|---|---|
| DEUDA-EGIA-011 | P2 | La economía de puntos se recalibra en F3, cuando exista el tablero |
| DEUDA-EGIA-012 | P3 | El anclaje de Q3 se revisa con el contenido en uso, no antes |
| DEUDA-EGIA-013 | P3 | Aceptada y declarada en la aplicación |
| DEUDA-EGIA-015 | P2 | La regla de progresión se necesita para el tablero, en F3 |
| DEUDA-EGIA-016 | P3 | Rúbricas y badges se derivan del contenido ya fijado |
| DEUDA-EGIA-019 | P3 | El eje B del IBATA afecta a un reto y a la clasificación de doce dilemas, no a su validez |
| DEUDA-EGIA-020 | P1 | **Condición del gate.** No bloquea la apertura de F2 porque el contenido no cambia de forma al implementarse, pero bloquea el Gate 4 |

## 6. Dictamen

El Gate 1 se declara **aprobado con reservas**. La Fase 2 queda autorizada. La revisión humana del
contenido pedagógico es condición para el Gate 4 y no puede diferirse más allá del piloto.

Esta acta no autoriza por sí sola ninguna implementación funcional adicional. Toda transición
posterior exige evidencia aplicable y decisión humana registrada.
