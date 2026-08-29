---
titulo: "Tabla de Ubicación Documental e Índice de Series"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-29"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo"
sirve_a: "Trazabilidad · previene colisiones de identificadores y documentos duplicados"
instrumento_heredado: "AI StoryLab 1 · Tabla_Ubicacion_Documental"
ubicacion_recomendada: "00_CONTROL_MAESTRO/2026-08-29_EGIA_Tabla_Ubicacion_Documental_v0-1.md"
tags: ["egia", "ubicacion-documental", "gobernanza", "trazabilidad", "identificadores"]
---

# Tabla de Ubicación Documental e Índice de Series

Principio rector heredado de AI StoryLab 1:

> Un documento completo vive en una sola ruta canónica. Los demás lugares lo invocan mediante
> referencias lógicas. Las carpetas organizan ubicación. Los metadatos organizan significado. Los
> índices organizan navegación. Las decisiones organizan autoridad.

Este documento nace de un fallo concreto: el 28 de agosto de 2026 se redactaron once decisiones
numeradas `DEC-EGIA-001` a `011` sin saber que esa serie ya llegaba a `DEC-EGIA-021` desde el 7 de
mayo. La colisión se detectó por casualidad al inspeccionar el cartapacio. El índice de series de
la sección 2 existe para que eso no vuelva a ocurrir.

---

## 1. Rutas canónicas por tipo de documento

| Tipo de documento | Ruta canónica | Observación |
|---|---|---|
| Plan maestro y planes de fase | `00_CONTROL_MAESTRO/plan_maestro/` | Un plan vigente por horizonte |
| Registro de decisiones | `00_CONTROL_MAESTRO/decisiones/` | Serie `DEC-EGIA-NNN`, continua |
| Registro de deuda | `18_DOCUMENTACION_ACTIVA/deuda/` | Serie `DEUDA-EGIA-NNN`, continua |
| Bitácora de sesión | `00_CONTROL_MAESTRO/bitacoras_sesion/` | Una por sesión de trabajo |
| Transferencia simétrica | `18_DOCUMENTACION_ACTIVA/bitacoras_vivas/` | Una por cierre de fase o sesión |
| Prompt de activación | `00_CONTROL_MAESTRO/primers_continuidad/` | Uno por apertura de sesión |
| Changelog | `00_CONTROL_MAESTRO/changelog/` | Por versión publicada |
| Tabla de ubicación documental | `00_CONTROL_MAESTRO/` | Este documento. Raíz del cartapacio |
| Fundamento filosófico y pedagógico | `01_FUNDAMENTO_FILOSOFICO/` | |
| Marco de competencias y andamiaje | `12_DISENO_INSTRUCCIONAL_UNIVERSAL/` | |
| Herencia de Specs Núcleo por referencia | `04_GOBERNANZA_ETICA_Y_RIESGOS/` | No se reescriben; se invocan |
| Mapa de gates y actas de aprobación | `15_EVALUACION_CALIDAD_Y_AUDITORIA/` | |
| Guion de piloto y rúbricas de observación | `08_CURSOS_PROGRAMAS_Y_TRAYECTORIAS/` | |
| Contenido pedagógico como dato | `contenido/` | Retos, dilemas, glosario, herramientas |
| Herramientas de verificación | `tools/` | No forman parte de la aplicación publicada |
| Aplicación publicada | `index.html` (raíz) | Hasta el Gate 4 |
| Versiones congeladas | `legacy/<version>/` | Preservadas, no editables |

## 2. Índice de series de identificadores

**Antes de asignar un identificador nuevo, se consulta esta tabla y se verifica con
`grep -rho "<PREFIJO>-[0-9]\+" --include="*.md" . | sort -u | tail -1`.**

| Serie | Formato | Último asignado | Ubicación del registro | Abierta desde |
|---|---|---|---|---|
| Decisiones | `DEC-EGIA-NNN` | `DEC-EGIA-035` | `00_CONTROL_MAESTRO/decisiones/` | 2026-05-07 |
| Deuda | `DEUDA-EGIA-NNN` | `DEUDA-EGIA-018` | `18_DOCUMENTACION_ACTIVA/deuda/` | 2026-08-28 |
| Retos | `EGIA-R-NNN` | `EGIA-R-008` (MVP) · `EGIA-R-015` (planificado) | `contenido/retos/` | 2026-05 |
| Gates | `GATE-EGIA-N` | `GATE-EGIA-4` (planificado) | `15_EVALUACION_CALIDAD_Y_AUDITORIA/` | 2026-08-28 |

## 3. Regla de sucesión y archivo

Ningún documento se mueve a archivo histórico sin doble condición, heredada de la Constitución SDD
de AI StoryLab:

1. Existe reemplazo canónico.
2. Existe decisión registrada.

Un documento vigente no se edita para «corregir» una decisión ya registrada: se sucede con una
decisión nueva que la deroga explícitamente.
