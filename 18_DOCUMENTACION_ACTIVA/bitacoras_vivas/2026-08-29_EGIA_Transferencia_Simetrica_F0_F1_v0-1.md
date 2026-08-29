---
titulo: "Bitácora de Transferencia Simétrica - cierre F0 y apertura F1"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-29"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo"
sirve_a: "Plan de Fases y Gates v0.2.0 · continuidad entre sesiones"
instrumento_heredado: "AI StoryLab 1 · bitácora de transferencia simétrica"
ubicacion_recomendada: "18_DOCUMENTACION_ACTIVA/bitacoras_vivas/2026-08-29_EGIA_Transferencia_Simetrica_F0_F1_v0-1.md"
tags: ["egia", "transferencia-simetrica", "continuidad", "gobernanza"]
---

# Transferencia Simétrica — cierre de Fase 0 y apertura de Fase 1

Instrumento heredado de AI StoryLab 1. No es un diario libre: es infraestructura de continuidad.
La próxima sesión debe recibir seis cosas.

---

## lo_decidido

- Doce decisiones de migración registradas: `DEC-EGIA-022` a `DEC-EGIA-033`.
- `DEC-EGIA-034`: marco de competencias aprobado por decisión humana el 2026-08-29.
- Audiencia primaria: estudiantes. Un reto ES una misión de AI StoryLab. Repo actual con núcleo
  copiado. Piloto el 23 de octubre de 2026. El corazón lúdico es la decisión con consecuencia.
- Las diez familias competenciales de AI StoryLab son canónicas; las ocho competencias del MVP
  quedan como identificadores heredados que resuelven a familias.
- Los siete niveles Q0–Q6 se anclan uno a uno a los siete verbos de la taxonomía de acción.

## lo_pagado

- `DEUDA-EGIA-001` (P1): el aviso de validación del reto ya vive dentro de la tarjeta, junto al
  botón, con `role="alert"`. Verificado: 27 de 27 pruebas, en contenedor y en máquina propia.
- Suite de humo `tools/smoke-monolito.mjs` existente y ejecutable: `npm run verify:freeze`.
- Instrumentos de trazabilidad creados: bitácora de sesión, esta transferencia, prompt de
  activación y Tabla de Ubicación Documental.

## lo_bloqueado

- **`main` no contiene la Fase 0.** PR #2 abierto sin fusionar.
- **La etiqueta `v0.1B` apunta a `371f361`**, el merge del PR #1, que no contiene la Fase 0. Ya
  está publicada en el remoto con el destino incorrecto. Corrección registrada como
  `DEC-EGIA-035`; requiere acción humana con `git tag -f` y `git push --force`.
- El sitio publicado sirve `main`, así que la corrección de `DEUDA-EGIA-001` **no está en vivo**.
- Fase 1 no puede cerrar sin los quince retos, los doce dilemas, el glosario y las fichas de
  herramientas.

## lo_vigilado

- La economía de puntos se calibró para ocho retos; con quince los umbrales Q0–Q6 se desajustan
  (`DEUDA-EGIA-011`).
- El anclaje de Q3 a `documentar` es el más débil de los siete (`DEUDA-EGIA-012`).
- El mapeo a DigComp 3.0 es lectura de equivalencia, sin validación externa (`DEUDA-EGIA-013`).
- La copia `legacy/v0.1B/index.html` puede divergir de `index.html` (`DEUDA-EGIA-010`,
  mitigada por `verify:legacy`).
- Punto de control de la semana 4 (21 de septiembre): si los quince retos no están aprobados, se
  recorta a diez y los cinco integradores pasan a v1.1.

## lo_no_autorizado

- Iniciar la Fase 2 antes de cerrar el Gate 1. No existe todavía `apps/egia-quest/`.
- Tocar el repositorio de AI StoryLab 1: está publicado y verificado en v1.0.0.
- Apagar el monolito. Se retira solo tras el Gate 4.
- Integrar IA en vivo dentro de la aplicación. Exigiría spec, análisis de riesgo y gate propios.
- Usar el marco de competencias para redactar retos antes de `DEC-EGIA-034` — condición ya
  cumplida el 2026-08-29.

## lo_que_debe_hacerse_despues

1. Fusionar PR #2 y reubicar la etiqueta `v0.1B` sobre el `main` resultante.
2. Verificar en el sitio publicado que el aviso aparece dentro de la tarjeta.
3. Abrir rama de Fase 1 y commitear el marco aprobado, los instrumentos de trazabilidad y el
   contenido.
4. Redactar R-04 a R-08 y luego R-09 a R-15.
5. Escribir el esquema JSON del contenido y el comando `validate:content` que hace real el Gate 1.
6. Redactar los doce dilemas ramificados, el glosario y las fichas de herramientas.
7. Resolver `DEUDA-EGIA-014` (subjetividad estratégica concreta) antes de fijar la voz definitiva.
