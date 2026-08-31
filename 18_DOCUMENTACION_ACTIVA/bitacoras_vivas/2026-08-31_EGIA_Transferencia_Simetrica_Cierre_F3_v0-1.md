---
titulo: "Bitácora de Transferencia Simétrica - cierre de la sesión de Fase 3"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-31"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo"
sirve_a: "Plan de Fases y Gates v0.2.1 · continuidad entre sesiones · Gate 3"
instrumento_heredado: "AI StoryLab 1 · bitácora de transferencia simétrica"
ubicacion_recomendada: "18_DOCUMENTACION_ACTIVA/bitacoras_vivas/2026-08-31_EGIA_Transferencia_Simetrica_Cierre_F3_v0-1.md"
tags: ["egia", "transferencia-simetrica", "continuidad", "fase-3", "gobernanza"]
---

# Transferencia Simétrica — cierre de la sesión de Fase 3

Instrumento heredado de AI StoryLab 1. No es un diario libre: es infraestructura de continuidad.
La próxima sesión debe recibir seis cosas.

---

## lo_decidido

- `DEC-EGIA-042`: un reto se cierra con **cuatro** pasos, no tres. Trabajo, evidencia, reflexión
  y **decisión humana registrada sobre la propia evidencia**. El motor heredado ya lo exigía; la
  interfaz lo ocultaba. Esa decisión es la que vuelve la evidencia elegible para el portafolio.
- `DEC-EGIA-043`: la vista previa compilada se publica versionada en `preview/`, junto al
  monolito v0.1B y sin sustituirlo. La raíz del sitio sigue sirviendo el monolito.
- `DEC-EGIA-044`: el nivel Q deja de ser moneda y pasa a ser **recorrido**. Se sube a Qn al
  completar al menos un reto en cada nivel desde Q1 hasta Qn, sin saltarse ninguno. Los puntos
  siguen existiendo como señal de cuidado y ya no compran nivel.
- Decisión humana de alcance al abrir la sesión: retos, dilemas, tablero y portafolio primero;
  glosario y fichas de herramienta después. Ambas partes entregadas.

## lo_pagado

- **Prototipo navegable y publicado**, seis secciones sobre persistencia real de `localStorage`,
  verificado en el sitio en vivo: `.../educacion-general-ia-accion-1/preview/`.
- `DEUDA-EGIA-011` **cerrada eliminando el mecanismo**, no recalibrándolo: ya no hay umbrales de
  puntos que calibrar.
- `DEUDA-EGIA-025` cerrada: glosario de 38 términos con búsqueda sin acentos y remisiones
  navegables, y 8 fichas de herramienta por tipo con la rejilla completa.
- `DEUDA-EGIA-028` cerrada: contraste de la paleta medido y corregido, y convertido en
  `npm run verify:contraste` — 48 pares en ambos modos, falla si alguno baja de WCAG AA.
- Enlace «saltar al contenido» y foco que viaja al término remitido en el glosario.
- Verificadores nuevos: `tools/smoke-preview.mjs` (26 verificaciones en navegador sobre el
  bundle publicado) y `tools/verify-contraste.mjs`.
- Suite en 75 pruebas; paridad del núcleo intacta en 67 archivos.

## lo_bloqueado

- **El piloto no tiene canal de evidencia.** Sin telemetría, sin vista docente y sin exportación,
  nada de lo que haga una persona estudiante puede llegar al profesor (`DEUDA-EGIA-032`). La
  exportación (`DEUDA-EGIA-022`) queda elevada a P1 y en camino crítico.
- **El diseño de evaluación del piloto no está decidido**, y determina qué debe exportar la
  aplicación. Es decisión humana y bloquea el punto anterior.
- No hay puerta de entrada: quien abre la aplicación cae en un tablero que dice «Q0» sin
  explicación (`DEUDA-EGIA-031`).
- Las preferencias de accesibilidad del núcleo siguen sin conectarse (`DEUDA-EGIA-029`).
- Tres deudas de contenido que solo puede cerrar el responsable del proyecto: eje **B** del IBATA
  (`019`, abierta desde la Fase 1), regla de progresión competencial (`015`) y reparto irregular
  de retos por nivel (`027`).

## lo_vigilado

- **`preview/` es artefacto compilado versionado** (`DEUDA-EGIA-024`). Cada sesión aumenta la
  probabilidad de que el build publicado derive del código fuente sin que nadie lo note. Regla
  operativa mientras dure: `preview/assets/` debe contener **exactamente** los dos archivos que
  cita `preview/index.html`; al extraer entregas hay que borrar los del build anterior.
- La proporción entre gobernanza y aplicación. El aparato documental ha demostrado su valor, pero
  quedan 53 días y lo que falta es aplicación. Que la documentación siga el ritmo, no lo marque.
- `main` contiene trabajo de fase en curso desde el PR #4 (`DEUDA-EGIA-026`).
- «Aceptar solo como registro» lo sostiene la pantalla, no el dominio (`DEUDA-EGIA-023`).
- Las resoluciones de dilema viven fuera del portafolio del núcleo (`DEUDA-EGIA-021`).

## lo_no_autorizado

- Editar `apps/egia-quest/src/core`: es copia verbatim, la protege `verify:core-parity`
  (`DEC-EGIA-024`).
- Tocar el repositorio de AI StoryLab 1.
- Apagar el monolito v0.1B. Se retira solo tras el Gate 4.
- Integrar IA en vivo dentro de la aplicación.
- **Modificar el contenido aprobado** —retos, dilemas, glosario, fichas— sin decisión humana
  propia: quedó aprobado por `DEC-EGIA-040`. Eso incluye mover un reto de nivel, que es
  justamente lo que `DEUDA-EGIA-027` pone sobre la mesa.
- Firmar el Gate 3 mientras falten piezas que condicionan que el piloto pueda ocurrir. Si algo no
  llega, se firma **con reserva declarada**, como el Gate 1.
- Hacer `push`, abrir o fusionar PR sin decisión humana explícita. La autoría de los commits es
  del responsable del proyecto y así se ha hecho en todas las sesiones.

## lo_que_debe_hacerse_despues

1. **Decidir qué se quiere aprender del piloto** (`DEUDA-EGIA-032`). Bloquea el punto 2.
2. **Exportación del portafolio** (`DEUDA-EGIA-022`), con revisión previa y confirmación humana
   explícita, en la forma que pida la decisión anterior.
3. **Introducción ilustrada** a las competencias del siglo 21 y las buenas prácticas
   (`DEUDA-EGIA-031`).
4. **Preferencias de accesibilidad** conectadas a `updateAccessibilityPreferences`, con efecto
   real en la interfaz (`DEUDA-EGIA-029`).
5. **Revisión con lector de pantalla**, aunque sea acotada (`DEUDA-EGIA-030`).
6. Salida estática low-tech (`DEUDA-EGIA-005`), abierta desde la Fase 0.
7. Resolver `015`, `019` y `027`: son decisiones de contenido y criterio pedagógico.
8. GitHub Actions (`DEUDA-EGIA-024`), que saca `preview/` del control de versiones.
9. Redactar el Acta del Gate 3.

---

## Nota de método para quien continúe

Los tres hallazgos de esta sesión —el cuarto paso, el agujero del grafo de prerrequisitos y el
contraste por debajo de AA— aparecieron **al implementar o al medir, no al planificar**, y los
tres contradijeron una afirmación previa que parecía sólida.

De ahí la regla que conviene heredar: **una afirmación cómoda no entra a un documento de
gobernanza sin verificarse.** «Los prerrequisitos ya protegen el orden» era plausible, elegante y
falsa, y estuvo a punto de sostener una decisión. Es la misma lección de `DEUDA-EGIA-017`, que en
la Fase 0 costó una etiqueta publicada en el sitio equivocado: **un comando ejecutado no es un
resultado verificado, y un razonamiento plausible tampoco.**
