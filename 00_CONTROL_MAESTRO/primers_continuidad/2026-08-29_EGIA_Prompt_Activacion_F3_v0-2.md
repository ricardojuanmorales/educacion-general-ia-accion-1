---
titulo: "Prompt de Activación - apertura de Fase 3"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.2"
fecha: "2026-08-29"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo"
sirve_a: "Continuidad entre sesiones · Plan de Fases y Gates v0.2.0"
sucede_a: "2026-08-29_EGIA_Prompt_Activacion_F1_v0-1.md"
ubicacion_recomendada: "00_CONTROL_MAESTRO/primers_continuidad/2026-08-29_EGIA_Prompt_Activacion_F3_v0-2.md"
tags: ["egia", "prompt-activacion", "continuidad", "fase-3"]
---

# Prompt de Activación — apertura de Fase 3

Texto para abrir una sesión nueva sin perder el hilo. Copiar y pegar tal cual.

---

## Prompt

Trabajo en EGIA Quest, del proyecto Educación General e Inteligencia Artificial en Acción.
Repositorio: `ricardojuanmorales/educacion-general-ia-accion-1`.

Antes de proponer nada, lee estos documentos y verifica el estado real del repositorio con
`git log --oneline -5`, `git tag -l` y `git status`:

- `00_CONTROL_MAESTRO/plan_maestro/2026-08-28_EGIA_Plan_Fases_Gates_Migracion_v0-2.md`
- `00_CONTROL_MAESTRO/decisiones/2026-08-28_EGIA_Registro_Decisiones_Migracion_v1-0_v0-1.md`
- `18_DOCUMENTACION_ACTIVA/deuda/2026-08-28_EGIA_Registro_Deuda_Migracion_v0-1.md`
- `18_DOCUMENTACION_ACTIVA/bitacoras_vivas/2026-08-29_EGIA_Transferencia_Simetrica_Cierre_F2_v0-2.md`
- `00_CONTROL_MAESTRO/2026-08-29_EGIA_Tabla_Ubicacion_Documental_v0-1.md`
- `12_DISENO_INSTRUCCIONAL_UNIVERSAL/2026-08-29_EGIA_Marco_Competencias_Andamiaje_v0-1.md`
- `15_EVALUACION_CALIDAD_Y_AUDITORIA/gates/` (actas de los Gates 1 y 2)

**Estado heredado.** Gates 0, 1 y 2 firmados. El monolito v0.1B está publicado y congelado. El
contenido está completo y validado: 15 retos, 12 dilemas, 38 términos de glosario, 8 fichas de
herramienta. El sucesor `apps/egia-quest` tiene el núcleo de AI StoryLab copiado verbatim y una
rebanada vertical funcionando de punta a punta con 37 pruebas.

**Qué NO debes hacer.** No edites nada bajo `apps/egia-quest/src/core`: es copia verbatim y
`verify:core-parity` lo vigila. No retires el monolito ni publiques el sucesor, que corresponde a
los Gates 3 y 4. No toques el repositorio de AI StoryLab 1. No integres IA en vivo dentro de la
aplicación. No des el contenido por revisado: está aprobado con reserva.

**Qué sigue, en orden.**

1. Escalar los catorce retos restantes a la interfaz, con sus pruebas.
2. Montar los doce dilemas ramificados con consecuencia y reparación.
3. Construir el tablero. Obliga a cerrar `DEUDA-EGIA-011`, los umbrales de nivel, y
   `DEUDA-EGIA-015`, la regla de progresión de competencia. Hoy hay 270 puntos en el catálogo y
   el último nivel está en 140.
4. Introducción ilustrada a las competencias del siglo 21 y a las buenas prácticas.
5. Salida estática low-tech que paga `DEUDA-EGIA-005`.
6. Estilos. La interfaz es HTML semántico sin CSS: falta la paleta de tinta y pergamino y la
   tipografía seria.

**Reglas de trabajo.**

- Antes de asignar cualquier identificador nuevo, consulta el índice de series de la Tabla de
  Ubicación Documental y verifícalo con `grep`. La serie de decisiones va por `DEC-EGIA-039`.
- Todo documento declara en cabecera a qué spec, gate o fundamento sirve.
- Un comando ejecutado no es un resultado verificado: comprueba el efecto de cada paso.
- `npm install` en `apps/egia-quest` requiere npm 12; npm 10.9.x falla con un error de arborist.
- La fecha del piloto es el 23 de octubre de 2026. Punto de control el 21 de septiembre: si los
  quince retos no están aprobados por revisión humana, se recorta a diez.
