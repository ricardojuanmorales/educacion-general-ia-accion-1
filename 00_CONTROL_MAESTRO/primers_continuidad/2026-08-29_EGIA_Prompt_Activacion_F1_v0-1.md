---
titulo: "Prompt de Activación - continuación de Fase 1"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-29"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo"
sirve_a: "Continuidad entre sesiones · Plan de Fases y Gates v0.2.0"
ubicacion_recomendada: "00_CONTROL_MAESTRO/primers_continuidad/2026-08-29_EGIA_Prompt_Activacion_F1_v0-1.md"
tags: ["egia", "prompt-activacion", "continuidad", "fase-1"]
---

# Prompt de Activación — continuación de Fase 1

Texto para abrir una sesión nueva sin perder el hilo. Copiar y pegar tal cual.

---

## Prompt

Trabajo en EGIA Quest, la aplicación del proyecto Educación General e Inteligencia Artificial en
Acción. Repositorio: `ricardojuanmorales/educacion-general-ia-accion-1`.

Estamos ejecutando el Plan de Fases y Gates v0.2.0, cuya ruta canónica es
`00_CONTROL_MAESTRO/plan_maestro/2026-08-28_EGIA_Plan_Fases_Gates_Migracion_v0-2.md`. Antes de
proponer nada, lee esos documentos:

- El plan de fases y gates.
- `00_CONTROL_MAESTRO/decisiones/2026-08-28_EGIA_Registro_Decisiones_Migracion_v1-0_v0-1.md`
- `18_DOCUMENTACION_ACTIVA/deuda/2026-08-28_EGIA_Registro_Deuda_Migracion_v0-1.md`
- `18_DOCUMENTACION_ACTIVA/bitacoras_vivas/2026-08-29_EGIA_Transferencia_Simetrica_F0_F1_v0-1.md`
- `00_CONTROL_MAESTRO/2026-08-29_EGIA_Tabla_Ubicacion_Documental_v0-1.md`
- `12_DISENO_INSTRUCCIONAL_UNIVERSAL/2026-08-29_EGIA_Marco_Competencias_Andamiaje_v0-1.md`

**Estado heredado.** La Fase 0 congeló el monolito y pagó `DEUDA-EGIA-001`: el aviso de validación
del reto ya vive dentro de la tarjeta. La Fase 1 está en curso: el marco de competencias está
aprobado (`DEC-EGIA-034`) y hay tres de quince retos en borrador.

**Qué NO debes iniciar todavía.** No abras la Fase 2 ni crees `apps/egia-quest/`: eso exige cerrar
el Gate 1. No toques el repositorio de AI StoryLab 1, publicado y verificado en v1.0.0. No apagues
el monolito. No integres IA en vivo dentro de la aplicación.

**Qué sigue, en orden.**

1. Verificar el estado real antes de asumir nada: `git log --oneline -3`, `git tag -l`,
   `git rev-list -n1 v0.1B`, estado del PR. La sesión anterior dio por hecho una fusión y una
   etiqueta que no se habían aplicado (`DEUDA-EGIA-017`).
2. Redactar R-04 a R-08 siguiendo el contrato de datos del marco, y luego R-09 a R-15.
3. Escribir el esquema JSON del contenido y el comando `validate:content` del Gate 1.
4. Redactar los doce dilemas ramificados, el glosario y las fichas de herramientas.
5. Resolver `DEUDA-EGIA-014`: fijar la subjetividad estratégica concreta antes de dar por
   definitiva la voz de los retos.

**Reglas de trabajo.**

- Antes de asignar cualquier identificador nuevo, consulta el índice de series de la Tabla de
  Ubicación Documental y verifícalo con `grep`.
- Todo documento declara en cabecera a qué spec, gate o fundamento sirve (`DEC-EGIA-031`).
- Un comando ejecutado no es un resultado verificado: comprueba el efecto de cada paso.
- La fecha de piloto es el 23 de octubre de 2026. Lo que no quepa se declara deuda, no se investiga
  más.
- Punto de control del 21 de septiembre: si los quince retos no están aprobados, se recorta a diez
  y los cinco integradores pasan a v1.1.
