# EGIA Quest 🧭

## Portafolio lúdico, ético y portable para aprender con IA en acción

**EGIA Quest** acompaña al proyecto **Educación General e Inteligencia Artificial en Acción**. Ayuda a estudiantes universitarios de educación general a practicar el uso responsable de la IA, documentar su proceso, decidir con criterio ético, cuidar la accesibilidad y construir un portafolio exportable en formatos abiertos.

No es un juego de puntos vacíos. Su principio de diseño es exigente:

> **La ética no adorna el juego. La ética es la mecánica.**

Un dilema sin consecuencia visible es una trivia. Un reto que se completa sin evidencia ni reflexión es un botón. Ninguna de las dos cosas cuenta aquí.

```yaml
estado: en migración de v0.1B a v1.0.0
aplicacion_publicada: index.html, monolito v0.1B
sucesor_en_construccion: apps/egia-quest
vista_previa_del_sucesor: /preview/
arquitectura: local_first
backend: false
cuenta_requerida: false
telemetria: false
ia_integrada_en_la_app: false
piloto_objetivo: 23 de octubre de 2026
```

- 🌐 **Aplicación en vivo:** https://ricardojuanmorales.github.io/educacion-general-ia-accion-1/
- 🔭 **Vista previa del sucesor:** https://ricardojuanmorales.github.io/educacion-general-ia-accion-1/preview/
- 🏛️ **Monolito congelado:** etiqueta `v0.1B`, preservado en `legacy/v0.1B/`

---

## 🌟 Qué encuentra una persona participante

Una ruta de siete niveles, de **Q0 Activación responsable** a **Q6 Transferencia portable**, donde cada nivel se ancla a un verbo: reconocer, explorar, crear, documentar, evaluar, reflexionar, transferir.

| Pieza | Qué contiene |
|---|---|
| **15 retos** | Diez anclados uno a uno a las Buenas Prácticas de la *Guía Rápida Estudiantil*, más cinco integradores transdisciplinarios |
| **12 dilemas ramificados** | Escenarios situados donde cada opción muestra su consecuencia y, donde hubo daño, ofrece reparación |
| **38 términos de glosario** | Cada uno con definición breve, definición operativa y una distinción de qué **no** es |
| **8 fichas de herramienta** | Por tipo, no por producto: qué hace, qué no hace, qué datos toca y cuándo no usarla |

Cada reto obliga a declarar un **«cuándo no usar IA»**. Es el campo que convierte el juego en formación del juicio: exige la abstención razonada, no solo el uso correcto.

El andamiaje se desvanece: plantilla rellenable en Q0 y Q1, checklist en Q2 a Q4, y solo el criterio en Q5 y Q6. Se retira el apoyo, no la exigencia.

**El nivel se recorre, no se compra.** Subes a un tramo cuando completas al menos un reto de cada nivel anterior, sin saltarte ninguno (`DEC-EGIA-044`). Los puntos siguen existiendo como señal de cuidado y no compran nivel — así «Q4 · Juicio ético» significa que hiciste un reto de juicio ético, no que juntaste setenta y cinco puntos.

### Lo que la aplicación evita, a propósito

Rankings públicos, presión por velocidad, competencia tóxica, acumulación superficial de puntos, publicación automática de evidencias y recopilación innecesaria de datos sensibles. Los puntos son señales de cuidado, no una carrera.

---

## 🔐 Privacidad por defecto

Lo más protector es lo que ocurre si no haces nada.

- Los datos viven en tu navegador. No hay servidor, ni cuenta, ni telemetría.
- Las reflexiones nacen clasificadas como privadas.
- Las evidencias voluntarias no se exportan salvo que marques la casilla.
- Exportar es un acto explícito, pieza por pieza.
- Si borras tu perfil local, no queda copia en ningún sitio.

EGIA Quest **enseña** a usar IA; no la incorpora. Cualquier integración futura exigiría especificación, análisis de riesgo y gate propios.

---

## 📐 Cómo está construido

El proyecto se desarrolla con **Spec-Driven Development**, tomando como arquetipo [AI StoryLab 1](https://github.com/ricardojuanmorales/ai-storylab-1). Antes de convertir una idea en código, se pregunta qué experiencia humana protege, a quién afecta, qué datos necesita realmente, qué riesgos crea y qué deuda produce o transfiere.

Cada fase cierra con un **gate que exige comando ejecutable y decisión humana registrada**. Un documento de gate puede estar aprobado como instrumento; la transición solo ocurre cuando existe evidencia aplicable y alguien la firma.

```text
F0 Congelar  →  F1 Contenido  →  F2 Rebanada vertical  →  F3 Escalar  →  F4 Piloto
   Gate 0         Gate 1              Gate 2                Gate 3         Gate 4
   firmado        firmado             firmado               pendiente      pendiente
```

### El núcleo heredado

`apps/egia-quest/src/core` es una **copia verbatim** del núcleo de AI StoryLab 1: dominio, puertos, adaptadores, esquemas y casos de uso de portafolio. No se edita nunca; el código propio vive en `src/egia` y extiende desde fuera. `verify:core-parity` compara los archivos contra un manifiesto de hashes y falla si alguien rompe esa regla.

Una consecuencia bonita de heredar ese motor: impone el orden **trabajo → evidencia → reflexión → decisión**. No se reflexiona sobre nada, y nada entra al portafolio sin que la persona lo decida y diga por qué.

Ese cuarto paso no estaba planificado: apareció en Fase 3, cuando la pantalla decía «completado» y el motor decía `ready_for_review`. Resultó ser el paso que le da sentido al portafolio, así que se adoptó como mecánica visible (`DEC-EGIA-042`). Es la misma exigencia que gobierna los gates de este proyecto —comando ejecutable y decisión humana registrada— aplicada al trabajo de quien aprende.

---

## 🧰 Comandos

```bash
# Monolito publicado
npm install
npm run verify:freeze        # 27 pruebas de extremo a extremo sobre index.html
npm run verify:legacy        # las mismas sobre la copia congelada v0.1B
npm run validate:content     # esquema y reglas del marco sobre todo el contenido

# Sucesor en construcción
cd apps/egia-quest
npm install                  # requiere npm >= 12
npm run verify:components    # typecheck + paridad del núcleo + 73 pruebas
npm run dev                  # servidor de desarrollo
npm run publicar:preview     # construye y escribe preview/ en la raíz del repositorio

# Y desde la raíz, humo de la vista previa en un navegador de verdad
npm run verify:preview       # 26 verificaciones sobre el bundle que se publica
npm run verify:preview:ver   # lo mismo, con el navegador visible
```

`validate:content` no solo valida forma: comprueba que el verbo corresponda al nivel, que el andamiaje corresponda al nivel, que ningún reto dependa de otro de nivel superior, que las diez Buenas Prácticas estén cubiertas una sola vez, y que toda opción de dilema tenga consecuencia y toda decisión que deja daño ofrezca reparación.

---

## 🗂️ Dónde está cada cosa

| Ruta | Contenido |
|---|---|
| `index.html` | La aplicación publicada, monolito v0.1B |
| `legacy/v0.1B/` | Copia congelada del monolito, preservada hasta el Gate 4 |
| `apps/egia-quest/` | El sucesor: núcleo heredado en `src/core`, código propio en `src/egia` |
| `preview/` | Artefacto generado del sucesor, publicado junto al monolito. No se edita a mano |
| `contenido/` | Retos, dilemas, glosario y herramientas como datos validados |
| `contenido/esquemas/` | Los JSON Schema que definen el contrato del contenido |
| `tools/` | Verificadores: humo del monolito, contenido y paridad del núcleo |
| `00_CONTROL_MAESTRO/` | Plan de fases, decisiones, bitácoras, tabla de ubicación documental |
| `12_DISENO_INSTRUCCIONAL_UNIVERSAL/` | Marco de competencias y andamiaje |
| `15_EVALUACION_CALIDAD_Y_AUDITORIA/gates/` | Actas de los gates |
| `18_DOCUMENTACION_ACTIVA/` | Registro de deuda y bitácoras vivas |
| `99_ARCHIVO_HISTORICO/` | Documentos sucedidos, con su decisión de archivo |

Antes de asignar cualquier identificador nuevo se consulta el índice de series de la **Tabla de Ubicación Documental**. Esa tabla nace de un choque real: en agosto de 2026 se redactaron decisiones numeradas desde `DEC-EGIA-001` sin saber que la serie ya llegaba a `DEC-EGIA-021`.

---

## 📖 Marco de competencias

Diez familias competenciales heredadas de AI StoryLab, con cuatro niveles orientadores de desempeño: inicial guiado, exploratorio, autónomo situado y transferente crítico. Se publica también una tabla de equivalencia con **DigComp 3.0**, que es lectura de equivalencia y no certificación de alineación.

Las ocho competencias del MVP v0.1A no se borraron: quedan como identificadores heredados que resuelven a las familias canónicas, de modo que los perfiles ya exportados se siguen leyendo.

---

## ⚠️ Estado honesto

El contenido pedagógico está validado automáticamente y **revisado y aprobado** por su autor el 29 de agosto de 2026, sobre un cuadernillo de 62 páginas con los 73 elementos completos (`DEC-EGIA-040`). Cualquier cambio posterior es una modificación de contenido aprobado y exige decisión propia.

El sucesor es navegable de punta a punta —tablero, retos, dilemas, glosario, herramientas y portafolio, sobre almacenamiento real del navegador— y todavía le faltan piezas declaradas: la exportación del portafolio sin conectar, la introducción ilustrada sin escribir y la salida estática low-tech pendiente desde la Fase 0. Lo que falte, el tablero y el registro de deuda lo dicen en su propia cara en vez de disimularlo.

El registro de deuda vive abierto en `18_DOCUMENTACION_ACTIVA/deuda/` y no se limpia por estética: la deuda no siempre es una falla, a veces es riesgo aceptado o decisión diferida con fecha. Lo que no puede es quedar invisible.

---

## 📌 Nota ética antes de compartir una exportación

¿Incluye datos sensibles? ¿La persona consintió? ¿La evidencia debe ser privada? ¿Hay revisión humana? ¿Es accesible? ¿Tiene propósito educativo claro? ¿Debe archivarse, investigarse o publicarse?

Si la respuesta no está clara, no publiques todavía.

---

## 📜 Autoría y licencia

Proyecto de **Ricardo Juan Morales De Jesús, Ph.D.**, Universidad de Puerto Rico, Facultad de Estudios Generales.

Parte del código y del contenido se redactó con asistencia de IA. Las decisiones, la autoría y la aprobación son humanas y están registradas en `00_CONTROL_MAESTRO/decisiones/`. Consulta `LICENSE_NOTA.md`.

El README anterior, correspondiente a v0.1A, se conserva en `99_ARCHIVO_HISTORICO/versiones_cerradas/` por decisión `DEC-EGIA-038`.

---

*Usar IA bien no es hacer trampa: es hacer visible tu juicio.* 🧭
