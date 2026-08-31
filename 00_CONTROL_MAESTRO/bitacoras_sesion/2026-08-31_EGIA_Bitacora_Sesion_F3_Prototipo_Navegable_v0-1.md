---
titulo: "Bitácora de Sesión - Fase 3, prototipo navegable"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-31"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo"
sirve_a: "Plan de Fases y Gates v0.2.1 · Fase 3 · Gate 3"
ubicacion_recomendada: "00_CONTROL_MAESTRO/bitacoras_sesion/2026-08-31_EGIA_Bitacora_Sesion_F3_Prototipo_Navegable_v0-1.md"
tags: ["egia", "bitacora-sesion", "fase-3", "prototipo", "egia-quest"]
---

# Bitácora de Sesión — Fase 3, prototipo navegable

## Qué se pidió

Llegar de la forma más eficiente posible a un prototipo funcional completo, con dos decisiones
humanas tomadas al abrir la sesión: publicar el build en `/preview/` aceptando el artefacto
compilado versionado, y limitar el alcance de esta iteración a **retos, dilemas, tablero y
portafolio**, dejando glosario y fichas de herramienta para una segunda pasada.

## Qué se entregó

Aplicación navegable de cuatro secciones sobre persistencia real de `localStorage`, construida y
publicada en `preview/`, verificada en navegador de verdad sobre el artefacto que se publica.

| Pieza | Archivo | Nota |
|---|---|---|
| Estado de la aplicación | `src/egia/presentacion/useEgia.ts` | Ninguna pantalla calcula el estado siguiente: llama al caso de uso y adopta lo que el motor devuelve |
| Lista de retos | `src/egia/presentacion/ListaRetos.tsx` | Agrupada por nivel Q; los bloqueados se muestran, no se esconden |
| Pantalla de reto | `src/egia/presentacion/PantallaReto.tsx` | Extendida a cuatro pasos por DEC-EGIA-042 |
| Lista y pantalla de dilema | `ListaDilemas.tsx`, `PantallaDilema.tsx` | La consecuencia se revela solo después de decidir **y justificar** |
| Tablero | `src/egia/presentacion/Tablero.tsx` | Declara en pantalla sus propios umbrales provisionales |
| Portafolio | `src/egia/presentacion/Portafolio.tsx` | La curaduría es un segundo acto, separado de la aceptación |
| Armazón | `App.tsx`, `main.tsx`, `index.html`, `estilos.css` | Pestañas con navegación por flechas, heredada de v0.1B |
| Publicación | `tools/publicar-preview.mjs` | Escribe `preview/` y no publica: eso sigue siendo humano |
| Humo en navegador | `tools/smoke-preview.mjs` | 17 verificaciones sobre el bundle compilado |

## El hallazgo de la sesión

Al conectar la pantalla al motor completo apareció una discrepancia: **la interfaz decía
«completado» donde el motor decía `ready_for_review`**. El ciclo heredado no cierra una misión con
evidencia y reflexión; exige además una decisión humana registrada sobre esa evidencia, y es esa
decisión la que la vuelve elegible para el portafolio.

Se pudo arreglar en dos direcciones. Se eligió mostrar el paso que faltaba, porque resultó ser el
que le da sentido al portafolio: sin él, la evidencia entra sola y acumular vuelve a ser lo mismo
que elegir. Queda como DEC-EGIA-042 y como prueba que falla si alguien lo revierte.

Consecuencia colateral: `calcularProgreso` preguntaba por evidencia y reflexión para dar un reto
por completado. Ahora pregunta al motor. El tablero se alinea con el motor, no al revés.

## Deuda nueva

Cinco entradas, ninguna oculta: `DEUDA-EGIA-021` (los dilemas viven fuera del portafolio del
núcleo), `022` (el portafolio no exporta todavía), `023` (el límite de «solo registro» lo sostiene
la pantalla y no el dominio), `024` (artefacto compilado versionado), `025` (glosario y fichas sin
pantalla, por alcance acordado).

`DEUDA-EGIA-011` se vuelve más concreta con el catálogo completo cargado: hay **420 puntos
disponibles** —270 de retos, 150 de dilemas— y el último umbral está en 140. Se llega a Q6 a un
tercio del recorrido. El tablero lo dice en pantalla mientras no se recalibre.

## Verificación ejecutada

```
apps/egia-quest · npm run verify:components
  typecheck            limpio
  verify:core-parity   67 archivos idénticos al sello
  vitest               49 pruebas en 4 archivos, todas en verde

raíz · node tools/smoke-preview.mjs
  17/17 verificaciones sobre el bundle de preview/, en Chromium
```

El humo en navegador existe porque en este proyecto ya ocurrió una vez que un comando ejecutado se
confundiera con un resultado verificado (DEUDA-EGIA-017). Las pruebas de `vitest` corren en jsdom
sobre módulos sin empaquetar; esto recorre el archivo que la gente abriría.

Dos de esas verificaciones miden en píxeles reales las dos mitades de DEUDA-EGIA-001: que el botón
bloqueado esté desactivado **y se vea** desactivado (opacidad 0.45), y que el aviso de validación
caiga dentro de la tarjeta del reto.

## Lo que queda antes del Gate 3

1. Recalibrar los umbrales de nivel (`DEUDA-EGIA-011`) — cambio de datos, decisión humana.
2. Escribir la regla de progresión competencial (`DEUDA-EGIA-015`) — decisión humana.
3. Confirmar el eje **B** del acrónimo IBATA (`DEUDA-EGIA-019`) — sigue abierta desde F1; el
   validador la reporta en cada ejecución.
4. Glosario y fichas de herramienta (`DEUDA-EGIA-025`).
5. Introducción ilustrada a las competencias del siglo 21 y buenas prácticas.
6. Exportación del portafolio (`DEUDA-EGIA-022`).

Los puntos 1, 2 y 3 no los puede cerrar la máquina: son datos y criterio pedagógico.

## Estado del repositorio al cierre

Rama de trabajo `fase-3/escalar`. Nada fusionado ni publicado sin decisión explícita: el `git push`
y el `gh pr merge` siguen siendo del responsable del proyecto, como en todas las sesiones
anteriores.
