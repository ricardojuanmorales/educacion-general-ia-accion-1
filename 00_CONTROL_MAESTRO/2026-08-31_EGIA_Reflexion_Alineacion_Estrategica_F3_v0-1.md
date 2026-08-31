---
titulo: "Reflexión y alineación estratégica al cierre de la Fase 3"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-31"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "activo · insumo para el Gate 3 y para la planificación del piloto"
sirve_a: "Plan de Fases y Gates v0.2.1 · Gate 3 · piloto del 23 de octubre de 2026"
ubicacion_recomendada: "00_CONTROL_MAESTRO/2026-08-31_EGIA_Reflexion_Alineacion_Estrategica_F3_v0-1.md"
tags: ["egia", "reflexion", "alineacion-estrategica", "fase-3", "accesibilidad", "piloto"]
---

# Reflexión y alineación al cierre de la Fase 3

Documento de pensamiento, no de trámite. Se escribe porque el proyecto acaba de pasar de plan a
cosa que funciona, y ese es el momento en que conviene mirar el conjunto antes de que la inercia
decida por nosotros. **Quedan 53 días para el piloto del 23 de octubre.**

---

## 1. Dónde estamos, sin adorno

El sucesor está publicado y funciona: seis secciones, contenido aprobado completo, persistencia
local, 75 pruebas, 26 verificaciones en navegador sobre el artefacto que se sirve. Los Gates 0, 1
y 2 están firmados. El monolito v0.1B sigue intacto en la raíz del sitio, que era la promesa.

Lo que **no** está, y conviene decirlo junto y no repartido en un registro de deuda:

- La persona estudiante que abre la aplicación por primera vez cae en un tablero que dice «Q0» y
  no le explica nada. No hay puerta de entrada.
- El portafolio no exporta.
- No hay salida estática: si la conexión falla en el salón, no hay plan B.
- Las preferencias de accesibilidad que el motor heredado ya sabe guardar no están conectadas.
- Nadie que use lector de pantalla ha probado esto.

Ninguna de esas cinco es un detalle de acabado. Las cinco tocan si el piloto puede ocurrir.

---

## 2. Los tres hallazgos de la sesión, y lo que tienen en común

Esta sesión produjo tres hallazgos que ninguna planificación había anticipado:

1. **El motor exige un cuarto paso.** La interfaz decía «completado» donde el motor decía
   `ready_for_review`: falta la decisión humana sobre la propia evidencia (`DEC-EGIA-042`).
2. **Los prerrequisitos no protegen el orden de niveles.** `EGIA-R-010` es de Q4 y solo exige dos
   retos de Q0; a Q6 se llega por un camino que nunca toca Q2, Q3 ni Q4 (`DEC-EGIA-044`).
3. **El contraste de la paleta fallaba AA en modo claro.** `--tinta-tenue` daba 3.80:1 sobre
   `--pergamino-hondo`, en textos de 13 píxeles (`DEUDA-EGIA-028`).

Los tres aparecieron **al implementar o al medir, no al pensar**. Y los tres contradecían algo
que este documento —o su autor— había afirmado antes con aparente solidez.

Eso dice algo sobre el método que vale más que los tres hallazgos juntos:

> En este proyecto el SDD no va en una sola dirección. La especificación guía al código, y el
> código **interroga de vuelta** a la especificación. Implementar es una forma de verificar el
> diseño, y a veces la única que funciona.

De ahí una regla que conviene adoptar explícitamente: **una afirmación cómoda no entra a un
documento de gobernanza sin haberse verificado.** «Los prerrequisitos ya protegen el orden» era
plausible, elegante y falsa, y estuvo a punto de sostener una decisión. Es la misma lección que
ya costó una etiqueta mal puesta en la Fase 0 (`DEUDA-EGIA-017`), reaprendida en otro terreno.

---

## 3. Accesibilidad: por qué aquí no es cumplimiento, es coherencia

La observación de que faltaba la accesibilidad es correcta, y el lugar donde falta importa.

**Lo que sí había,** y no por casualidad sino porque el andamiaje del proyecto lo empujó:
estructura semántica con `header`, `nav`, `main` y `footer`; `lang="es"`; jerarquía de
encabezados sin saltos; foco visible que nunca se elimina; `prefers-reduced-motion` respetado;
`aria-selected` y navegación por flechas en las pestañas; el foco que viaja al encabezado al
cambiar de sección; ningún blanco táctil por debajo de 44 píxeles; y la lección de
`DEUDA-EGIA-001` convertida en dos verificaciones que se miden en píxeles.

**Lo que no había:**

| Hallazgo | Estado |
|---|---|
| `--tinta-tenue` fallaba AA en modo claro (3.80:1) | **Corregido** y convertido en `verify:contraste` |
| Sin enlace «saltar al contenido» | **Corregido**, con prueba de que el destino existe |
| Las remisiones del glosario movían la vista pero no el foco | **Corregido**, con prueba |
| Las preferencias de accesibilidad del núcleo sin conectar | `DEUDA-EGIA-029` |
| Sin revisión con lector de pantalla ni con personas usuarias | `DEUDA-EGIA-030` |

El tercer punto merece detenerse. El motor heredado **ya trae** `updateAccessibilityPreferences`
con movimiento reducido, alto contraste y escala de texto, y las guarda en el perfil del
proyecto. Es decir: la aplicación viene guardando desde el primer día un objeto de preferencias
de accesibilidad que nunca le ha ofrecido a nadie configurar. Está en cada exportación futura,
vacío de decisión.

Y aquí está el argumento que no es de cumplimiento normativo:

> El nivel **Q3 se llama «Accesibilidad aplicada»**. Cada uno de los quince retos obliga a
> declarar una acción de accesibilidad. El reto `EGIA-R-001` dice que delegar el propio
> disclosure hace que «el documento se contradiga a sí mismo».
>
> Una aplicación que enseña accesibilidad y no la practica tiene exactamente esa forma.

No es que convenga ser accesible. Es que **este** artefacto, con **este** contenido, pierde
autoridad pedagógica si no lo es. La accesibilidad aquí no es un requisito externo: es una
condición de coherencia interna, y por eso pertenece al Gate 3 y no a una lista de mejoras.

---

## 4. El hallazgo que me preocupa más: el piloto no tiene canal de evidencia

Esto salió al mirar el sistema completo, y no está en ningún registro de deuda todavía.

Tres decisiones tomadas por separado, todas defendibles, componen un problema que ninguna causa
por sí sola:

- **Sin telemetría, sin cuenta, sin servidor.** Privacidad por defecto (`README`, principio de
  diseño). Correcto.
- **Sin vista docente.** Diferida a v1.1 (`DEC-EGIA-022`). Razonable para acotar el alcance.
- **Sin exportación conectada.** Registrada como `DEUDA-EGIA-022`, prioridad P2.

Compuestas: **el 23 de octubre, nada de lo que haga una persona estudiante puede llegar a ti.**
Los datos viven en su navegador, no hay panel que los agregue y no hay forma de sacarlos. El
piloto se ejecutaría y no produciría evidencia.

Eso cambia la naturaleza de `DEUDA-EGIA-022`. No es una funcionalidad pendiente del portafolio:
**es el único canal de evidencia del piloto, y por tanto está en el camino crítico.** Sin ella
no hay piloto, hay demostración.

Conviene además decidir con qué diseño se evalúa el piloto, porque eso determina qué tiene que
exportar la aplicación. No es lo mismo querer saber si la mecánica de cuatro pasos se entiende,
que querer saber qué competencias se movieron, que querer una muestra de portafolios para
analizar cualitativamente. Cada respuesta pide una exportación distinta. Hoy la aplicación no
sabe cuál de las tres se le va a pedir.

Se registra como `DEUDA-EGIA-032`, y sugiero elevar `DEUDA-EGIA-022` a P1.

---

## 5. Riesgos que veo, dichos con franqueza

**El estudiante que llega en frío.** Un tablero que dice «Q0» y una escalera de siete tramos no
explican qué es esto ni por qué importa. La introducción ilustrada que pediste en la conversación
original sigue sin existir, y en un piloto de una sesión es probablemente lo que más determina si
alguien entra o abandona en el primer minuto. La subiría por delante de casi todo lo demás.

**La proporción entre gobernanza y aplicación.** El aparato documental es una fortaleza real y
ya ha demostrado su valor —el validador atrapó un error de contenido mío, la paridad del núcleo
sigue intacta, los identificadores dejaron de colisionar. Pero conviene mirarlo: quedan 53 días,
y la parte que todavía no existe es aplicación, no documentación. No propongo recortar la
gobernanza; propongo que en las próximas sesiones la proporción se incline hacia construir, y
que la documentación siga el ritmo en vez de marcarlo. Tú mismo lo dijiste al empezar: que no se
convierta en parsimonia sin fin.

**`preview/` como artefacto versionado.** Funciona y fue decisión consciente (`DEC-EGIA-043`),
pero cada sesión que pasa aumenta la probabilidad de que el build publicado y el código fuente
se desincronicen sin que nadie lo note. GitHub Actions (`DEUDA-EGIA-024`) deja de ser higiene y
pasa a ser prevención.

**Tres deudas que solo tú puedes cerrar y llevan semanas abiertas.** El eje B del IBATA
(`019`, desde la Fase 1), la regla de progresión competencial (`015`) y el reparto irregular de
retos por nivel (`027`). No las puede cerrar nadie más, y `015` es la que impide que el tablero
diga algo sobre desempeño en lugar de contar evidencias.

---

## 6. Camino crítico a 53 días

Ordenado por lo que hace posible el piloto, no por lo que sería bonito tener.

| | Qué | Por qué ahí | Quién |
|---|---|---|---|
| 1 | **Exportación del portafolio** (`022`) | Sin ella el piloto no produce evidencia | construible |
| 2 | **Introducción ilustrada** (`031`) | Determina si alguien entra o abandona en el primer minuto | construible |
| 3 | **Preferencias de accesibilidad** (`029`) | El motor ya las guarda; falta ofrecerlas. Coherencia con Q3 | construible |
| 4 | **Diseño de evaluación del piloto** (`032`) | Decide qué tiene que exportar la aplicación | tuyo |
| 5 | **Revisión con lector de pantalla** (`030`) | Ninguna métrica sustituye probar con la tecnología real | mixto |
| 6 | **Salida estática low-tech** (`005`) | Plan B si falla la conexión en el salón | construible |
| 7 | **Las tres deudas de contenido** (`015`, `019`, `027`) | Bloquean que el tablero hable de desempeño | tuyo |
| 8 | **GitHub Actions** (`024`) | Previene que el build publicado derive del código | construible |

Los puntos 4 y 7 no los puede cerrar la máquina. El 1 y el 4 están acoplados: conviene decidir
el 4 antes de construir el 1, o la exportación exportará lo que se nos ocurra y no lo que
necesitas para aprender del piloto.

---

## 7. Lo transdisciplinario, dicho en serio

Una observación que no cabe en un registro de deuda.

Este artefacto hace algo poco común: **aplica a la persona estudiante la misma disciplina que
aplica a su propio desarrollo.** El proyecto no avanza de fase sin comando ejecutable y decisión
humana registrada. Y desde `DEC-EGIA-042`, un reto no se cierra sin evidencia y decisión humana
registrada sobre esa evidencia. No fue un diseño deliberado: la simetría apareció al descubrir
que el motor heredado ya la exigía.

Vale la pena reconocerla, porque es lo que distingue a EGIA Quest de una aplicación educativa
con temática de ética. La gobernanza no está *alrededor* del producto: es la misma forma,
instanciada en dos escalas. Un estudiante que recorre los cuatro pasos está practicando, sin que
se lo digan, el método con el que se construyó la herramienta que usa.

Eso tiene una consecuencia práctica y una exigencia. La consecuencia: el registro de deuda del
proyecto y la «deuda pedagógica» del tablero son el mismo gesto —dejar visible lo que quedó
abierto, con su motivo, en vez de esconderlo— y podrían decirse con el mismo lenguaje. La
exigencia: la coherencia se rompe en cuanto la aplicación pide algo que ella misma no cumple.
La accesibilidad era el primer sitio donde eso estaba pasando. Probablemente no será el último,
y buscar activamente esos puntos —donde predicamos algo que no practicamos— es un buen criterio
de auditoría para las fases que quedan.

---

## 8. Qué propongo para el Gate 3

No firmarlo todavía, y no por perfeccionismo: porque tres de las cinco cosas que faltan tocan si
el piloto puede ocurrir, y un gate que se firma sobre eso no es un gate, es un trámite.

Propongo que el Gate 3 exija:

1. Exportación funcionando, con revisión previa y confirmación humana explícita.
2. Introducción que explique el juego a alguien que llega en frío.
3. Preferencias de accesibilidad conectadas y `verify:contraste` en verde.
4. Una revisión con lector de pantalla, aunque sea acotada.
5. Las decisiones de contenido `015` y `019` resueltas.

Es alcanzable en 53 días si la proporción se inclina hacia construir. Y si algo de eso no llega,
que se firme el gate **con reserva declarada**, como se hizo con el Gate 1: eso ya funcionó una
vez y es preferible a mover la definición de «terminado».
