---
titulo: "Acta del Gate 2 - Rebanada vertical"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-29"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
autoridad_humana: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "aprobado"
sirve_a: "Plan de Fases y Gates v0.2.0 · cierre de Fase 2 y apertura de Fase 3"
ubicacion_recomendada: "15_EVALUACION_CALIDAD_Y_AUDITORIA/gates/2026-08-29_EGIA_Acta_Gate_2_Rebanada_Vertical_v0-1.md"
tags: ["egia", "gate", "fase-2", "rebanada-vertical", "gobernanza"]
---

# Acta del Gate 2 — Rebanada vertical

```yaml
gate_id: GATE-EGIA-2
label: Rebanada vertical de un reto de punta a punta
phase: Fase 2
status: approved
lifecycle: fulfilled
authority: Ricardo Juan Morales De Jesús, Ph.D.
date: 2026-08-29
evidence: [npm run verify:components, PR #3]
dependencies: [GATE-EGIA-1]
next_gate: GATE-EGIA-3
```

## 1. Qué autoriza

Abre la Fase 3: escalar los catorce retos restantes a la interfaz, incorporar los doce dilemas
ramificados, construir el tablero y la introducción ilustrada, y producir la salida estática
low-tech que paga `DEUDA-EGIA-005`.

## 2. Evidencia presentada

`npm run verify:components` en verde: typecheck limpio, paridad del núcleo intacta sobre 67
archivos copiados, y 37 pruebas repartidas en dominio, aplicación y presentación.

`EGIA-R-001` recorre el ciclo completo: iniciar, guardar actividad, crear evidencia, escribir
reflexión, decisión humana, entrada al portafolio y persistencia. Las pruebas corren contra el
catálogo real de `contenido/retos`, no contra fixtures: si el contenido y el motor se separan,
la suite se rompe.

## 3. Hallazgos de la fase

**Primero, que matiza DEC-EGIA-023.** `MissionDefinition` del núcleo es deliberadamente mínima.
Un reto lleva además nivel, verbo, competencias, criterio ético, accesibilidad,
`cuando_no_usar_ia`, andamiaje, prerrequisitos y puntos. La decisión se cumple en dos piezas: el
reto **se ejecuta** como misión en el motor heredado, y su carga pedagógica vive en
`RetoMetadata`, indexada por `MissionId`, del lado de EGIA. El núcleo mueve el ciclo; EGIA aporta
el sentido. Esto es lo que la rebanada vertical existía para descubrir.

**Segundo, a favor y heredado.** El núcleo impone el orden trabajo → evidencia → reflexión:
`createTextEvidence` falla sin actividad previa y `saveReflection` falla sin evidencia. No se
reflexiona sobre nada. Es la secuencia que EGIA Quest quiere enseñar y llega sin escribirla.
Queda afirmada como prueba para que nadie la relaje sin darse cuenta.

**Tercero, de entorno.** npm 10.9.x no puede resolver el árbol de dependencias de la aplicación:
falla con un error interno de arborist. npm 12 lo resuelve. Declarado en `engines`.

## 4. Las lecciones del monolito, ahora vigiladas

Las dos causas del fallo original de v0.1A quedan como pruebas de presentación:

- un botón desactivado se declara desactivado ante la tecnología de apoyo, además de verse
  desactivado;
- el aviso de validación vive dentro de la tarjeta del reto, y la prueba comprueba la contención
  en el DOM, no solo que el texto exista.

## 5. Deuda que permanece abierta al cruzar el gate

| ID | Prioridad | Motivo por el que no bloquea |
|---|---|---|
| DEUDA-EGIA-005 | P2 | La salida low-tech corresponde a F3 |
| DEUDA-EGIA-007 | P3 | Mitigada por `verify:core-parity`, con su límite declarado |
| DEUDA-EGIA-011 | P2 | Los umbrales se recalibran con el tablero, en F3 |
| DEUDA-EGIA-015 | P2 | La regla de progresión se necesita para el tablero, en F3 |
| DEUDA-EGIA-020 | P1 | Condición del Gate 4, no del Gate 2 |

## 6. Dictamen

El Gate 2 se declara **aprobado**. La Fase 3 queda autorizada.

Esta acta no autoriza retirar el monolito ni publicar el sucesor. Eso corresponde a los Gates 3
y 4, con evidencia aplicable y decisión humana registrada.
