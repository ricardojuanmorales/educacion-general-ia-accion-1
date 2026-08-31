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

## Segundo tramo de la sesión · glosario y fichas de herramienta

Con el prototipo verificado, se añadieron las dos secciones de referencia que faltaban del
alcance original. Son de consulta: no pasan por el motor, no producen evidencia y no guardan
estado. Están en la aplicación porque el trabajo de los retos las necesita a mano.

| Pieza | Archivo |
|---|---|
| Tipos y búsqueda sin acentos | `src/egia/dominio/referencia.ts` |
| Cargadores con verificación de remisiones | `src/egia/contenido/cargar-referencia.ts` |
| Glosario, 38 términos | `src/egia/presentacion/Glosario.tsx` |
| Fichas de herramienta, 8 tipos | `src/egia/presentacion/Herramientas.tsx` |

Tres decisiones de interfaz que vienen del método del contenido, no del gusto:

1. **La distinción —«qué no es»— se muestra marcada**, no como un párrafo más. Es la parte del
   método que evita el uso decorativo del término; diluirla sería devolver el glosario a la
   decoración.
2. **Las remisiones son navegables.** El cargador falla si una remisión no resuelve, y hay prueba
   que lo comprueba: la primera redacción del glosario tenía nueve remisiones rotas.
3. **«Qué hace» y «qué no hace» ocupan el mismo ancho**, y el humo en navegador lo mide en
   píxeles. Una ficha que destaca la capacidad y esconde el límite es publicidad.

Hay además una prueba que quizá parezca excesiva y no lo es: **ninguna ficha puede nombrar un
producto concreto**. La decisión de contenido dice tipos, no marcas, porque una ficha con nombres
y versiones caduca en meses. La prueba sostiene esa decisión en vez de confiar en que nadie la
olvide en dos años.

`DEUDA-EGIA-025` queda resuelta. Verificación: 66 pruebas y 23 verificaciones en navegador.

## Análisis de umbrales entregado

Se entrega `12_DISENO_INSTRUCCIONAL_UNIVERSAL/2026-08-31_EGIA_Analisis_Umbrales_Nivel_v0-1.md`
como insumo para cerrar `DEUDA-EGIA-011`. No cambia nada: pone los números, propone tres caminos
y nombra sus consecuencias.

Al desglosar los 420 puntos por nivel apareció algo que el análisis no buscaba: **Q3 tiene un
solo reto y Q5 tiene cuatro**. Es la forma real del catálogo, y afecta a cualquier esquema de
nivel que se elija. Se registra como `DEUDA-EGIA-027`, separada de los umbrales, porque tocar el
reparto de retos es modificar contenido aprobado y eso exige decisión humana con el texto
delante. Vale la pena notar que Q3 es también el nivel que `DEUDA-EGIA-012` ya señalaba como el
anclaje más débil de los siete.

## Tercer tramo · el nivel deja de ser moneda

Decisión humana sobre el análisis: **Esquema C**. Al implementarlo se verificó el grafo de
prerrequisitos y apareció que **la afirmación en que se apoyaba la propuesta era falsa**: los
prerrequisitos no protegen el orden de los niveles.

- `EGIA-R-010` es de Q4 y solo exige dos retos de Q0. Tres retos bastarían para ser «Q4 · Juicio
  ético» sin pasar por Q1, Q2 ni Q3.
- `EGIA-R-015` (Q6) se alcanza por un camino de seis retos que nunca toca Q2, Q3 ni Q4.

Se adoptó la reparación mínima que conserva la intención de C, y se registró como
`DEC-EGIA-044`: **subes a Qn cuando tienes al menos un reto completado en cada nivel desde Q1
hasta Qn, sin saltarte ninguno.** Se explica en una frase, no toca contenido aprobado y es
robusta al reparto irregular de `DEUDA-EGIA-027`, porque pide uno de cada tramo y no todos.

El tablero cambió de protagonista: el número grande ya no son los puntos, es la escalera de los
siete tramos, con el que se pisa, el que sigue y qué retos lo abren. Los puntos quedan como
«puntos de cuidado», declarados en la propia pantalla como lo que son.

`DEUDA-EGIA-011` se cierra **eliminando el mecanismo, no recalibrándolo**. Dos pruebas fijan los
dos agujeros por su nombre: si alguien reescribe la regla del nivel, fallan.

El documento de análisis se corrigió a la vista, con una sección 6 que dice qué se afirmó mal y
por qué. No se reescribió en silencio: la decisión se tomó leyendo la versión equivocada, y eso
pertenece al registro. Es la misma lección de `DEUDA-EGIA-017` — un razonamiento plausible no es
un resultado verificado.

Verificación tras el cambio: 73 pruebas y 26 verificaciones en navegador.

## Cuarto tramo · accesibilidad y alineación estratégica

Observación humana al cierre: **faltó la parte de accesibilidad**. Correcta, y el lugar donde
faltaba importa.

Auditoría hecha sobre la aplicación en vivo, midiendo en vez de opinando. Lo que ya estaba,
empujado por el andamiaje del proyecto: `header`/`nav`/`main`/`footer`, `lang="es"`, jerarquía de
encabezados sin saltos, foco visible nunca eliminado, `prefers-reduced-motion` respetado,
`aria-selected` y flechas en las pestañas, foco al encabezado al cambiar de sección, ningún
blanco táctil por debajo de 44 px.

Tres defectos encontrados y corregidos en la sesión:

1. **Contraste medido, no elegido a ojo.** `--tinta-tenue` daba **3.80:1** sobre
   `--pergamino-hondo` en modo claro, en textos de 13 px: por debajo del 4.5:1 que pide WCAG AA
   para texto normal. `--ambar` daba 4.19:1 sobre el fondo de su propio aviso de bloqueo.
   Corregidos a `#6a5f53` y `#805c1e`. El hallazgo se convirtió en `tools/verify-contraste.mjs`,
   que mide 48 pares en los dos modos y **falla el comando** si alguno baja de AA.
2. **Enlace «saltar al contenido»**, con prueba de que el destino existe y de que es lo primero
   que encuentra el teclado. Recorrer seis pestañas antes de llegar al contenido no es navegable.
3. **Las remisiones del glosario movían la vista pero no el foco.** Quien navega con teclado se
   quedaba en la remisión que pulsó mientras la página se movía sin avisar. El destino estaba
   anunciado para el ojo y perdido para todo lo demás.

Queda abierto, y es lo que la observación destapó de fondo: **el motor heredado ya trae
`updateAccessibilityPreferences`** —movimiento reducido, alto contraste, escala de texto— y las
guarda en el perfil desde el primer día. La aplicación nunca las ha ofrecido. Cada portafolio
lleva un objeto de preferencias de accesibilidad vacío de decisión (`DEUDA-EGIA-029`). Y nadie ha
probado esto con lector de pantalla (`DEUDA-EGIA-030`).

El argumento para priorizarlo no es normativo: el nivel Q3 se llama «Accesibilidad aplicada» y
cada reto obliga a declarar una acción de accesibilidad. Una aplicación que enseña accesibilidad
y no la practica tiene la misma forma que el documento que `EGIA-R-001` describe como
«contradiciéndose a sí mismo».

### El hallazgo sistémico

Al mirar el conjunto apareció algo que ningún registro recogía. Tres decisiones defendibles por
separado —sin telemetría, sin vista docente, sin exportación conectada— componen un problema:
**el 23 de octubre nada de lo que haga una persona estudiante puede llegar al profesor.** El
piloto se ejecutaría sin producir evidencia.

Eso cambia la naturaleza de `DEUDA-EGIA-022`: no es una funcionalidad pendiente del portafolio,
es el único canal de evidencia del piloto. Elevada a P1 y registrada como `DEUDA-EGIA-032`, con
la decisión acoplada que le corresponde: **qué se quiere aprender del piloto**, porque eso
determina qué debe exportar la aplicación.

La reflexión completa, con el camino crítico a 53 días, está en
`00_CONTROL_MAESTRO/2026-08-31_EGIA_Reflexion_Alineacion_Estrategica_F3_v0-1.md`.

## Lo que queda antes del Gate 3

1. ~~Recalibrar los umbrales de nivel~~ (`DEUDA-EGIA-011`) — **cerrada** por `DEC-EGIA-044`.
2. Escribir la regla de progresión competencial (`DEUDA-EGIA-015`) — decisión humana.
3. Confirmar el eje **B** del acrónimo IBATA (`DEUDA-EGIA-019`) — sigue abierta desde F1; el
   validador la reporta en cada ejecución.
4. ~~Glosario y fichas de herramienta~~ (`DEUDA-EGIA-025`) — **hecho**.
5. Introducción ilustrada a las competencias del siglo 21 y buenas prácticas.
6. Exportación del portafolio (`DEUDA-EGIA-022`).
7. Salida estática low-tech (`DEUDA-EGIA-005`), abierta desde la Fase 0.
8. El reparto de retos por nivel (`DEUDA-EGIA-027`) — decisión humana sobre contenido aprobado.

Los puntos 1, 2, 3 y 8 no los puede cerrar la máquina: son datos y criterio pedagógico.

## Estado del repositorio al cierre

Rama de trabajo `fase-3/escalar`. Nada fusionado ni publicado sin decisión explícita: el `git push`
y el `gh pr merge` siguen siendo del responsable del proyecto, como en todas las sesiones
anteriores.
