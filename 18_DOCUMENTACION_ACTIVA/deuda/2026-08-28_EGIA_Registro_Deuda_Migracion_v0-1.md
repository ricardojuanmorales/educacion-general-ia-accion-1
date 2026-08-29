---
titulo: "Registro de Deuda - Migración a EGIA Quest v1.0.0"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-28"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo"
sirve_a: "Plan de Fases y Gates v0.2.0-plan"
ubicacion_recomendada: "18_DOCUMENTACION_ACTIVA/deuda/2026-08-28_EGIA_Registro_Deuda_Migracion_v0-1.md"
tags: ["egia", "registro-deuda", "gobernanza", "sdd", "migracion"]
---

# Registro de Deuda — Migración a EGIA Quest v1.0.0

La deuda no representa necesariamente una falla. Puede representar trabajo pendiente, riesgo
aceptado, decisión diferida o condición de transición. Serie nueva: `DEUDA-EGIA-NNN`.

| ID | Prioridad | Descripción | Origen | Criterio de cierre | Estado |
|---|---|---|---|---|---|
| DEUDA-EGIA-001 | P1 | El aviso de validación del reto se mostraba fuera del área visible; el botón parecía muerto | Prueba de humo 2026-08-28 | Aviso dentro de la tarjeta y prueba en verde | **Resuelta** y publicada en `main` |
| DEUDA-EGIA-002 | P1 | El monolito no tiene pruebas unitarias; solo prueba de humo de extremo a extremo | Análisis de brecha | Muere con el monolito tras el Gate 4 | Aceptada |
| DEUDA-EGIA-003 | P2 | No existe migración formal de esquema; la fusión de perfil es un parche defensivo | Análisis de brecha | Registro de esquemas heredado de AI StoryLab | Abierta · F2 |
| DEUDA-EGIA-004 | P2 | El marco de competencias no está mapeado a DigComp | DEC-EGIA-029 | Tabla de equivalencia publicada y aprobada | Abierta · F1 |
| DEUDA-EGIA-005 | P2 | Migrar al stack con build sacrifica la apertura por doble clic, principio de acceso low-tech | DEC-EGIA-023 | Salida estática de un archivo publicada | Abierta · F3 |
| DEUDA-EGIA-006 | P2 | Los dilemas actuales no tienen consecuencia ni reparación; funcionan como trivia | DEC-EGIA-026 | Doce dilemas ramificados validados contra esquema | Abierta · F1 |
| DEUDA-EGIA-007 | P3 | El núcleo copiado puede divergir de AI StoryLab sin que nadie lo note | DEC-EGIA-024 | `verify:core-parity` en verde en cada PR | Abierta · mitigada desde F2 |
| DEUDA-EGIA-008 | P3 | La ruta docente queda fuera de v1.0 | DEC-EGIA-022 | Entrega en v1.1 | Aceptada |
| DEUDA-EGIA-009 | P3 | npm introduce superficie de cadena de suministro que hoy no existe | DEC-EGIA-023 | `audit:secrets` y versiones fijadas | Abierta · mitigada desde F2 |
| DEUDA-EGIA-010 | P3 | `legacy/v0.1B/index.html` duplica el monolito; ambos archivos pueden divergir | DEC-EGIA-033 | `verify:legacy` en verde en cada PR | Abierta · mitigada desde F0 |
| DEUDA-EGIA-011 | P2 | La economía de puntos se calibró para 8 retos; con 15 retos y dilemas ramificados los umbrales Q0–Q6 quedan desajustados | Marco de Competencias v0.1 | Umbrales recalculados y probados | Abierta · F3 |
| DEUDA-EGIA-012 | P3 | El anclaje del nivel Q3 al verbo `documentar` es el más débil de los siete | Marco de Competencias v0.1 | Revisión humana en el Gate 1 | Abierta · Gate 1 |
| DEUDA-EGIA-013 | P3 | El mapeo a DigComp 3.0 es lectura de equivalencia sin validación externa | Marco de Competencias v0.1 | Se declara la limitación en la aplicación | Aceptada |
| DEUDA-EGIA-014 | P2 | El marco no fija la subjetividad estratégica concreta: AI StoryLab distingue estudiante de escuela superior y estudiante universitario, y la voz y el andamiaje cambian según cuál sea | Marco de Competencias v0.1 | Decisión humana registrada antes de fijar la voz definitiva | **Resuelta** 2026-08-29 por DEC-EGIA-036: estudiante universitario de educación general |
| DEUDA-EGIA-015 | P2 | Falta la regla de progresión de competencia: cómo se pasa de nivel 1 a 4 con evidencias. El MVP usa un umbral heredado de tres evidencias que no corresponde a los cuatro niveles nuevos | Marco de Competencias v0.1 | Regla escrita y probada; necesaria para el tablero | Abierta · F3 |
| DEUDA-EGIA-016 | P3 | No hay rúbricas ni mapeo competencia↔badge. AI StoryLab tiene una Matriz de Relación Competencias-Rúbricas-Portafolios que aún no se ha leído | Marco de Competencias v0.1 | Matriz leída y adaptada | Abierta · F3 |
| DEUDA-EGIA-017 | P1 | La etiqueta `v0.1B` se publicó apuntando a `371f361`, que no contiene la Fase 0, y el PR #2 quedó sin fusionar. El Gate 0 se dio por firmado sobre una rama, no sobre el estado publicado | Verificación de estado 2026-08-29 | PR #2 fusionado, etiqueta reubicada y sitio publicado verificado | **Resuelta** 2026-08-29: `main` en `db01204` con la Fase 0 incluida, `v0.1B` reubicada sobre ese commit |
| DEUDA-EGIA-020 | P1 | El contenido pedagógico se aprobó por validación automática, sin revisión humana línea por línea. La validación garantiza coherencia estructural, no acierto pedagógico ni adecuación de la voz | DEC-EGIA-037, Gate 1 | Revisión humana completa de los 15 retos, 12 dilemas, 38 términos y 8 fichas | Abierta · condición del Gate 4, antes del 23 de octubre |
| DEUDA-EGIA-019 | P3 | El acrónimo IBATA: la Guía Rápida nombra Injusticias y daños, Autonomía, Transformaciones y Accountability, pero no desarrolla la B. El reto R-008 se redactó sobre los ejes nombrados | Redacción de R-008 | Confirmación humana del eje que cubre la B | Abierta · F1 |
| DEUDA-EGIA-018 | P2 | Los instrumentos de trazabilidad (bitácora de sesión, transferencia simétrica, prompt de activación, tabla de ubicación documental) no existían durante F0; el proceso se reconstruyó a posteriori | Pregunta humana sobre trazabilidad 2026-08-29 | Instrumentos creados y mantenidos en cada cierre | **Resuelta** 2026-08-29 |
