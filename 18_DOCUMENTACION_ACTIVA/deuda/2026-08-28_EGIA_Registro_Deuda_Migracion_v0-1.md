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
| DEUDA-EGIA-001 | P1 | El aviso de validación del reto se mostraba fuera del área visible; el botón parecía muerto | Prueba de humo 2026-08-28 | Aviso dentro de la tarjeta y prueba en verde | Resuelta en F0 |
| DEUDA-EGIA-002 | P1 | El monolito no tiene pruebas unitarias; solo prueba de humo de extremo a extremo | Análisis de brecha | Muere con el monolito tras el Gate 4 | Aceptada |
| DEUDA-EGIA-003 | P2 | No existe migración formal de esquema; la fusión de perfil es un parche defensivo | Análisis de brecha | Registro de esquemas heredado de AI StoryLab | Abierta · F2 |
| DEUDA-EGIA-004 | P2 | El marco de competencias no está mapeado a DigComp | DEC-EGIA-029 | Tabla de equivalencia publicada y aprobada | Abierta · F1 |
| DEUDA-EGIA-005 | P2 | Migrar al stack con build sacrifica la apertura por doble clic, principio de acceso low-tech | DEC-EGIA-023 | Salida estática de un archivo publicada | Abierta · F3 |
| DEUDA-EGIA-006 | P2 | Los dilemas actuales no tienen consecuencia ni reparación; funcionan como trivia | DEC-EGIA-026 | Doce dilemas ramificados validados contra esquema | Abierta · F1 |
| DEUDA-EGIA-007 | P3 | El núcleo copiado puede divergir de AI StoryLab sin que nadie lo note | DEC-EGIA-024 | `verify:core-parity` en verde en cada PR | Abierta · mitigada desde F2 |
| DEUDA-EGIA-008 | P3 | La ruta docente queda fuera de v1.0 | DEC-EGIA-022 | Entrega en v1.1 | Aceptada |
| DEUDA-EGIA-009 | P3 | npm introduce superficie de cadena de suministro que hoy no existe | DEC-EGIA-023 | `audit:secrets` y versiones fijadas | Abierta · mitigada desde F2 |
| DEUDA-EGIA-010 | P3 | `legacy/v0.1B/index.html` duplica el monolito; ambos archivos pueden divergir | DEC-EGIA-033 | `verify:legacy` en verde en cada PR | Abierta · mitigada desde F0 |
