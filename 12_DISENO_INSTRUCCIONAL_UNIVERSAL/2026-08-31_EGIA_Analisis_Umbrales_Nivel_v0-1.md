---
titulo: "Análisis de umbrales de nivel - insumo para cerrar DEUDA-EGIA-011"
proyecto: "Educación General e Inteligencia Artificial en Acción"
codigo: "EGIA-Accion"
version: "v0.1"
fecha: "2026-08-31"
responsable_documental: "Ricardo Juan Morales De Jesús, Ph.D."
estado: "decidido · Esquema C adoptado con corrección, DEC-EGIA-044"
sirve_a: "DEUDA-EGIA-011 · Marco de Competencias y Andamiaje v0.1 · Gate 3"
ubicacion_recomendada: "12_DISENO_INSTRUCCIONAL_UNIVERSAL/2026-08-31_EGIA_Analisis_Umbrales_Nivel_v0-1.md"
tags: ["egia", "diseno-instruccional", "umbrales", "niveles-q", "deuda-011"]
---

# Análisis de umbrales de nivel

Insumo para una decisión que no puede tomar la máquina. Este documento **no cambia nada**: pone
los números sobre la mesa, propone tres caminos y nombra sus consecuencias. La decisión se
registra aparte, como `DEC-EGIA-NNN`, y solo entonces se toca el código.

> **Resuelto el 31 de agosto de 2026.** Decisión humana: **Esquema C**, con la corrección de la
> sección 6 — la propuesta original de C contenía una afirmación falsa sobre los prerrequisitos.
> Registrada como `DEC-EGIA-044`. La sección 6 se añadió *después* de la decisión y es parte
> inseparable de ella: sin esa corrección, el esquema elegido tenía un agujero.

---

## 1. El problema, con números

Los umbrales vigentes se calibraron para el MVP de ocho retos sin dilemas ramificados. El
catálogo aprobado tiene quince retos y doce dilemas.

| | Umbral vigente | Se alcanza al… |
|---|---|---|
| Q0 Activación responsable | 0 | empezar |
| Q1 Práctica situada | 10 | primer reto |
| Q2 Producción documentada | 30 | 7% del catálogo |
| Q3 Accesibilidad aplicada | 50 | 12% |
| Q4 Juicio ético | 75 | 18% |
| Q5 Integración caleidoscópica | 105 | 25% |
| Q6 Transferencia portable | 140 | **33%** |

Con **420 puntos disponibles**, se llega al último nivel a un tercio del recorrido. Los dos
tercios restantes no tienen dónde ir: la persona termina el catálogo completo en Q6, igual que
quien lo dejó a la mitad. El nivel deja de significar.

## 2. De dónde salen los 420 puntos

| Nivel | Retos | Puntos de retos | Dilemas | Puntos de dilemas | Del nivel | Acumulado |
|---|---:|---:|---:|---:|---:|---:|
| Q0 | 2 | 20 | 1 | 5 | 25 | 25 |
| Q1 | 2 | 30 | 1 | 5 | 35 | 60 |
| Q2 | 2 | 30 | 2 | 20 | 50 | 110 |
| Q3 | **1** | **20** | 2 | 20 | 40 | 150 |
| Q4 | 2 | 40 | 2 | 30 | 70 | 220 |
| Q5 | **4** | **80** | 2 | 30 | 110 | 330 |
| Q6 | 2 | 50 | 2 | 40 | 90 | 420 |
| | **15** | **270** | **12** | **150** | | **420** |

### El hallazgo que no buscaba este análisis

La tabla deja ver una asimetría de contenido, no de puntos: **Q3 tiene un solo reto y Q5 tiene
cuatro**. Q3 aporta 40 puntos y Q5 aporta 110.

Eso importa más allá de los umbrales, y conviene mirarlo antes de decidir nada:

- Cualquier esquema basado en puntos hereda esa irregularidad. No es un defecto del esquema: es
  la forma real del catálogo.
- Q3 —«accesibilidad aplicada», verbo *documentar*— es exactamente el nivel que `DEUDA-EGIA-012`
  ya señala como el anclaje más débil de los siete. Que sea también el más flaco en contenido es
  una coincidencia que probablemente no lo sea.
- Q5 concentra los cuatro retos integradores transdisciplinarios. Tiene sentido que pese, pero
  cuatro de quince en un solo nivel es mucha carga en un tramo donde ya no hay andamiaje: en Q5
  solo queda el criterio.

**Recomendación separada de los umbrales:** mirar si un reto de Q5 pertenece en realidad a Q3.
No lo propongo aquí porque tocar el reparto de retos es modificar contenido aprobado
(`DEC-EGIA-040`), y eso exige decisión tuya con el texto delante.

---

## 3. Los tres caminos

### Esquema A · El nivel es el trabajo del nivel

Cada umbral es el acumulado del nivel anterior: entras a Q3 cuando has hecho todo lo de Q0 a Q2.

| | Q0 | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Umbral | 0 | 25 | 60 | 110 | 150 | 220 | 330 |

- **A favor:** el número deja de ser arbitrario. Cada umbral tiene un significado literal —«has
  hecho el trabajo de los niveles anteriores»— y se puede explicar en una frase a un estudiante.
- **En contra:** es exigente sin holgura. Saltarse un solo reto de Q2 deja a la persona por
  debajo de Q3 aunque haya hecho todo lo demás. Con un catálogo de 27 piezas, exigir el 100% de
  cada tramo puede leerse como castigo, y este juego evita a propósito la presión.
- **Riesgo real:** empuja hacia el completismo, que es primo del acumular que el propio README
  dice evitar.

### Esquema B · El nivel se alcanza con la mayor parte del tramo

Los mismos cortes, al 70% del acumulado, redondeados a cifras legibles.

| | Q0 | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Umbral | 0 | 20 | 40 | 75 | 105 | 155 | 230 |

- **A favor:** conserva el modelo actual sin rediseñarlo, deja holgura para saltarse alguna
  pieza, y Q6 cae al 55% del recorrido en vez del 33%. Es el cambio más barato y cierra la deuda.
- **En contra:** el 70% es una cifra elegida, no derivada. Sigue siendo un umbral arbitrario,
  solo que mejor calibrado. La deuda se cierra, la pregunta de fondo no.
- **Nota:** aun así queda un 45% del catálogo después de Q6. Menos grave que ahora, no resuelto.

### Esquema C · El nivel deja de ser moneda

El nivel Q de la persona es **el nivel del reto más alto que ha completado**, no un total de
puntos. Los puntos siguen existiendo y siguen sumando, pero como señal de cuidado, no como
moneda de ascenso.

- **A favor:** es el más coherente con tu propio marco. Q0–Q6 ya son niveles anclados a siete
  verbos y con un andamiaje que se desvanece; convertirlos además en una escala de puntos los
  hace significar dos cosas a la vez. Bajo este esquema el nivel dice algo verificable —«esta
  persona completó un reto de transferencia»— en vez de algo agregado.
- **⚠️ Aquí decía que «los prerrequisitos ya construyen la ruta, así que el orden queda protegido
  sin necesidad de umbrales». Era falso.** Ver la sección 6, escrita al verificarlo.
- **En contra:** cambia el modelo, no solo los números. Hay que decidir qué cuenta como
  «completado» a este efecto —¿un reto del nivel, o todos?— y el tablero necesita otra pieza:
  hoy muestra un número grande de puntos que dejaría de ser el protagonista.
- **Efecto secundario deseable:** desactiva el completismo. Ya no hay razón para hacer los
  veintisiete para «subir»; se hacen los que valen la pena.
- **Efecto secundario a vigilar:** con un solo reto en Q3, ese reto se vuelve un cuello de
  botella para llegar a Q4. Si se toma este camino, el reparto de retos por nivel deja de ser un
  detalle y pasa a ser estructural — lo que devuelve al hallazgo de la sección 2.

---

## 4. Qué recomiendo, y con qué reservas

**El Esquema C es el más coherente con el proyecto**, y la razón es tu propio marco: los niveles
Q ya están definidos por verbos y por andamiaje, no por acumulación. Hacerlos depender de puntos
los obliga a significar dos cosas y es lo que produjo el desajuste de entrada.

La reserva es honesta y no menor: **C no se puede adoptar sin mirar antes el reparto de retos por
nivel.** Con un único reto en Q3, ese reto se convierte en la puerta obligatoria hacia la mitad
superior del juego. Eso puede estar bien —hay puertas que deben ser obligatorias— pero tiene que
ser una decisión, no un accidente de cuántos retos cupieron en cada tramo.

Si prefieres cerrar la deuda ahora y volver al modelo después, el **Esquema B** es defendible:
cuesta cambiar siete números, no rompe nada, y el tablero deja de mentir. Es la opción de menor
riesgo antes del piloto de octubre.

Lo que no recomiendo es dejarlo como está. El tablero hoy declara sus umbrales provisionales en
pantalla, que es honesto, pero un estudiante que llega a Q6 con un tercio del camino hecho recibe
una señal falsa aunque venga con nota al pie.

---

## 5. Qué pasa cuando decidas

| Esquema | Qué se toca | Esfuerzo | Riesgo |
|---|---|---|---|
| A | `UMBRALES_NIVEL` en `dominio/reto.ts` | siete números y sus pruebas | bajo |
| B | igual que A | siete números y sus pruebas | bajo |
| C | `nivelPorPuntos` y `calcularProgreso`; el tablero cambia de protagonista | rediseño acotado de dominio y una pantalla | medio; abre revisión del reparto por nivel |

En los tres casos, la nota de «umbrales provisionales» sale del tablero y `DEUDA-EGIA-011` se
cierra citando la decisión.

---

## 6. Corrección · el orden NO estaba protegido

Al ir a implementar el Esquema C se verificó el grafo real de prerrequisitos del catálogo. La
afirmación de la sección 3 —que los prerrequisitos protegen el orden de los niveles— **es falsa**,
y el agujero no es menor:

| Reto | Nivel | Prerrequisitos | Consecuencia |
|---|---|---|---|
| `EGIA-R-010` | **Q4** | `R-001`, `R-002` (ambos **Q0**) | Con tres retos hechos, alguien sería «Q4 · Juicio ético» sin haber pasado por Q1, Q2 ni Q3 |
| `EGIA-R-015` | **Q6** | camino mínimo `R-001→002→003→004→009→014→015` | Seis retos, sin tocar nunca Q2, Q3 ni Q4: «Q6 · Transferencia portable» sin accesibilidad aplicada ni juicio ético |

Los caminos mínimos hacia `R-009`, `R-011`, `R-012` y `R-014` tienen el mismo defecto en distinto
grado. En su forma literal —«el nivel del reto más alto completado»— el Esquema C era inadoptable.

### La reparación adoptada

> **El nivel es el tramo más alto al que has llegado sin saltarte ninguno:** subes a Qn cuando
> tienes al menos un reto completado en cada nivel desde Q1 hasta Qn. Q0 es el suelo.

Conserva la intención de C —el nivel es recorrido, no acumulación—, se explica en una frase sin
tabla de umbrales, y no toca contenido aprobado. Tiene además una virtud que no se buscaba: es
**robusta al reparto irregular de la sección 2**, porque pide un reto de cada tramo y no todos.
El único reto de Q3 y los cuatro de Q5 pesan igual como puerta.

Dos pruebas fijan los dos agujeros por su nombre, en `egia.cargar-retos.test.ts`. Si alguien
reescribe la regla del nivel sin darse cuenta de esto, fallan.

### Lo que sigue abierto

La reparación hace que el **cálculo del nivel** compense un grafo de prerrequisitos que no
expresa la intención pedagógica por sí mismo. Funciona, pero deja la intención en dos sitios en
vez de uno. Si el grafo debe corregirse —que `R-010`, de Q4, no dependa solo de dos retos de Q0—
es una decisión sobre contenido aprobado y te corresponde: es `DEUDA-EGIA-027`.

### Nota de método

Esta sección existe porque una afirmación cómoda no se verificó al escribirla y sí al
implementarla. Es la misma lección que ya costó una etiqueta mal puesta en la Fase 0
(`DEUDA-EGIA-017`): **un razonamiento plausible no es un resultado verificado.** El documento se
corrige a la vista en vez de reescribirse en silencio, porque la decisión se tomó leyendo la
versión equivocada y eso tiene que quedar en el registro.
