#!/usr/bin/env python3
"""Genera el cuadernillo de revisión humana del contenido de EGIA Quest.

Sirve a DEUDA-EGIA-020, condición del Gate 4. Produce el HTML; `pdf.mjs` lo imprime.
Se regenera cada vez que el contenido cambie: el cuadernillo no es un artefacto suelto,
es una vista del contenido canónico.

    npm run revision:cuadernillo
"""

import json, html
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
BASE = RAIZ / "contenido"
SALIDA = RAIZ / "tools/cuadernillo/cuadernillo-revision.html"

def leer(p):
    return json.loads((BASE / p).read_text(encoding="utf-8"))

retos = leer("retos/retos_egia_quest_v0-1.json")["retos"]
dilemas = leer("dilemas/dilemas_egia_quest_v0-1.json")["dilemas"]
terminos = leer("glosario/glosario_egia_quest_v0-1.json")["terminos"]
herramientas = leer("herramientas/herramientas_egia_quest_v0-1.json")["herramientas"]

e = lambda s: html.escape(str(s if s is not None else ""))

NIVEL_ETIQUETA = {
    "Q0": "Activación responsable", "Q1": "Práctica situada", "Q2": "Producción documentada",
    "Q3": "Accesibilidad aplicada", "Q4": "Juicio ético", "Q5": "Integración caleidoscópica",
    "Q6": "Transferencia portable",
}
DESEMPENO = {1: "Inicial guiado", 2: "Exploratorio", 3: "Autónomo situado", 4: "Transferente crítico"}
CALIDAD = {"cuidadosa": "cuidadosa", "apresurada": "apresurada", "evasiva": "evasiva", "dañina": "dañina"}


def veredicto(ident, renglones=3):
    lineas = "".join("<span></span>" for _ in range(renglones))
    return f"""
    <div class="veredicto">
      <div class="opciones">
        <span class="op"><span class="caja"></span> Aprobado</span>
        <span class="op"><span class="caja"></span> Aprobado con cambios</span>
        <span class="op"><span class="caja"></span> Rehacer</span>
        <span class="op"><span class="caja"></span> Eliminar</span>
      </div>
      <div class="renglones">{lineas}</div>
      <p class="ident">{e(ident)}</p>
    </div>"""


def campo(etiqueta, valor, clase=""):
    if not valor:
        return ""
    return f'<div class="campo {clase}"><span class="etq">{e(etiqueta)}</span><p>{e(valor)}</p></div>'


def lista(etiqueta, elementos, clase=""):
    if not elementos:
        return ""
    items = "".join(f"<li>{e(x)}</li>" for x in elementos)
    return f'<div class="campo {clase}"><span class="etq">{e(etiqueta)}</span><ul>{items}</ul></div>'


# ---------- índice ----------
def fila_indice(ident, titulo, extra=""):
    return f'<tr><td class="id">{e(ident)}</td><td>{e(titulo)}</td><td class="extra">{e(extra)}</td><td class="vb"></td></tr>'

indice_retos = "".join(
    fila_indice(r["id"], r["titulo"], f'{r["nivel"]} · {r["verbo"]}') for r in retos)
indice_dilemas = "".join(
    fila_indice(d["id"], d["titulo"], f'{d["nivel"]} · {d["eje_ibata"].replace("_", " ")}') for d in dilemas)
indice_terminos = "".join(
    f'<tr><td>{e(t["termino"])}</td><td class="extra">{e(t["fuente"])}</td><td class="vb"></td></tr>'
    for t in terminos)
indice_herramientas = "".join(
    fila_indice(h["id"], h["tipo"], h["nivel_sugerido"]) for h in herramientas)

# ---------- retos ----------
bloques_retos = []
for r in retos:
    apoyo_etq = "Plantilla que recibe la persona" if r["andamiaje"] == "plantilla" else "Checklist que recibe la persona"
    apoyo = r.get("plantilla") or r.get("checklist") or []
    practica = f'Buena Práctica {r["practica_guia"]}' if r["practica_guia"] else "Reto integrador"
    bloques_retos.append(f"""
    <section class="ficha corta">
      <header>
        <p class="eyebrow">{e(r["id"])} · {e(practica)}</p>
        <h3>{e(r["titulo"])}</h3>
        <p class="meta">Nivel {e(r["nivel"])} · {e(NIVEL_ETIQUETA[r["nivel"]])} — verbo <em>{e(r["verbo"])}</em>
        · desempeño {e(r["desempeno_esperado"])} {e(DESEMPENO.get(r["desempeno_esperado"], ""))}
        · {e(r["puntos_base"])} puntos · sensibilidad {e(r["sensibilidad"])}</p>
        <p class="meta">Competencias: {e(", ".join(r["competencias"]))}
        {" · Prerrequisitos: " + e(", ".join(r["prerrequisitos"])) if r["prerrequisitos"] else ""}</p>
      </header>
      {campo("Consigna", r["consigna"], "destacado")}
      {campo("Evidencia mínima", r["evidencia_minima"])}
      {campo("Tipo de evidencia", r["tipo_evidencia"])}
      {campo("Pregunta de reflexión", r["reflexion"])}
      {campo("Criterio ético", r["criterio_etico"])}
      {campo("Accesibilidad", r["accesibilidad"])}
      {campo("Cuándo no usar IA", r["cuando_no_usar_ia"], "alerta")}
      {lista(apoyo_etq, apoyo)}
      {veredicto(r["id"])}
    </section>""")

# ---------- dilemas ----------
bloques_dilemas = []
for d in dilemas:
    opciones = []
    for o in d["opciones"]:
        rep = f'<p class="reparacion"><span class="etq">Reparación</span> {e(o["reparacion"])}</p>' if o.get("reparacion") else '<p class="reparacion sin"><span class="etq">Reparación</span> ninguna: la decisión no deja daño que reparar</p>'
        opciones.append(f"""
        <div class="opcion">
          <p class="texto"><span class="letra">{e(o["id"])}</span> {e(o["texto"])}
            <span class="calidad calidad-{e(o["calidad"])}">{e(CALIDAD.get(o["calidad"], o["calidad"]))}</span></p>
          <p class="consecuencia"><span class="etq">Consecuencia</span> {e(o["consecuencia"])}</p>
          {rep}
        </div>""")
    practica = f'· Buena Práctica {d["practica_relacionada"]}' if d.get("practica_relacionada") else ""
    bloques_dilemas.append(f"""
    <section class="ficha">
      <header>
        <p class="eyebrow">{e(d["id"])} · eje {e(d["eje_ibata"].replace("_", " y "))} {e(practica)}</p>
        <h3>{e(d["titulo"])}</h3>
        <p class="meta">Nivel {e(d["nivel"])} · {e(NIVEL_ETIQUETA[d["nivel"]])}
        · {e(d["puntos_base"])} puntos · sensibilidad {e(d["sensibilidad"])}
        · competencias: {e(", ".join(d["competencias"]))}</p>
      </header>
      {campo("Escenario", d["escenario"], "destacado")}
      {campo("Pregunta", d["pregunta"])}
      <div class="opciones-dilema">{"".join(opciones)}</div>
      {campo("Reflexión posterior", d["reflexion_posterior"])}
      {veredicto(d["id"])}
    </section>""")

# ---------- glosario ----------
bloques_terminos = []
for t in terminos:
    rel = f'<p class="rel">Relacionados: {e(", ".join(t.get("relacionados", [])))}</p>' if t.get("relacionados") else ""
    pend = f'<p class="pendiente">{e(t["nota_pendiente"])}</p>' if t.get("nota_pendiente") else ""
    bloques_terminos.append(f"""
    <section class="ficha compacta">
      <header>
        <h3>{e(t["termino"])}</h3>
        <p class="meta">{e(t["fuente"])}</p>
      </header>
      {campo("Definición breve", t["definicion_breve"])}
      {campo("Definición operativa", t["definicion_operativa"])}
      {campo("Qué NO es", t["distincion"], "alerta")}
      {rel}{pend}
      {veredicto(t["termino"], 3)}
    </section>""")

# ---------- herramientas ----------
bloques_herramientas = []
for h in herramientas:
    bloques_herramientas.append(f"""
    <section class="ficha corta">
      <header>
        <p class="eyebrow">{e(h["id"])} · nivel sugerido {e(h["nivel_sugerido"])}</p>
        <h3>{e(h["tipo"])}</h3>
        <p class="meta">Competencias: {e(", ".join(h["competencias"]))}</p>
      </header>
      {campo("Qué hace", h["que_hace"])}
      {campo("Qué no hace", h["que_no_hace"])}
      {campo("Datos que toca", h["datos_que_toca"])}
      {lista("Riesgos típicos", h["riesgos_tipicos"])}
      {campo("Cuándo no usar", h["cuando_no_usar"], "alerta")}
      {lista("Señales de alerta", h["senales_de_alerta"])}
      {lista("Preguntas antes de usar", h["preguntas_antes_de_usar"])}
      {veredicto(h["id"])}
    </section>""")

total = len(retos) + len(dilemas) + len(terminos) + len(herramientas)

HTML = f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Cuadernillo de revisión · EGIA Quest</title>
<style>
@page {{
  size: Letter;
  margin: 20mm 16mm 18mm 16mm;
}}
* {{ box-sizing: border-box; }}
html {{ font-size: 10.5pt; }}
body {{
  font-family: "Bitstream Charter", "Charter", Georgia, serif;
  color: #16202c; line-height: 1.5; margin: 0;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}}
h1, h2, h3 {{ margin: 0; line-height: 1.2; }}
h1 {{ font-size: 26pt; letter-spacing: -0.01em; }}
h2 {{ font-size: 16pt; }}
h3 {{ font-size: 13pt; }}
p {{ margin: 0; }}
em {{ font-style: italic; }}

.sans {{ font-family: "Liberation Sans", Helvetica, Arial, sans-serif; }}

/* portada */
.portada {{ page-break-after: always; padding-top: 22mm; }}
.portada .kicker {{
  font-family: "Liberation Sans", sans-serif; font-size: 8.5pt; letter-spacing: .16em;
  text-transform: uppercase; color: #6b6250;
}}
.portada h1 {{ margin: 6mm 0 4mm; }}
.portada .lede {{ font-size: 12pt; max-width: 135mm; color: #3b4653; }}
.ficha-datos {{ margin-top: 14mm; border-top: 1.5pt solid #16202c; }}
.ficha-datos div {{
  display: flex; gap: 6mm; padding: 2.2mm 0; border-bottom: .4pt solid #cfc7b4;
  font-size: 9.5pt;
}}
.ficha-datos dt {{
  font-family: "Liberation Sans", sans-serif; font-size: 7.5pt; letter-spacing: .1em;
  text-transform: uppercase; color: #6b6250; width: 42mm; flex: none; padding-top: .6mm;
}}
.ficha-datos dd {{ margin: 0; }}
.nota-portada {{
  margin-top: 12mm; padding: 4mm 5mm; border-left: 2.5pt solid #8a5a15; background: #faf7ef;
  font-size: 10pt;
}}
.nota-portada strong {{ display: block; margin-bottom: 1.5mm; }}
.leyenda {{ margin-top: 8mm; font-size: 9.5pt; color: #3b4653; }}

/* índice */
.indice {{ page-break-after: always; }}
.indice h2 {{ margin-bottom: 3mm; border-top: 1.5pt solid #16202c; padding-top: 2.5mm; }}
.indice + .indice {{ page-break-before: auto; }}
table {{ width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 7mm; }}
td {{ padding: 1.3mm 2mm; border-bottom: .4pt solid #ddd6c6; vertical-align: top; }}
td.id {{
  font-family: "Liberation Mono", monospace; font-size: 8pt; white-space: nowrap;
  width: 24mm; color: #1f3a5f;
}}
td.extra {{ width: 46mm; color: #6b6250; font-size: 8.5pt; }}
td.vb {{ width: 18mm; border-bottom: .4pt solid #16202c; }}

/* secciones */
.portadilla {{ page-break-before: always; padding-top: 6mm; }}
.portadilla h2 {{ border-top: 2.5pt solid #16202c; padding-top: 3mm; }}
.portadilla p {{ color: #3b4653; max-width: 130mm; margin-top: 2mm; font-size: 10pt; }}

/* fichas */
.ficha {{ page-break-before: always; padding-top: 2mm; }}
.ficha.corta {{ page-break-inside: avoid; }}
.ficha.compacta {{ page-break-before: auto; margin-bottom: 7mm; }}
.ficha header {{ border-bottom: .8pt solid #16202c; padding-bottom: 2.5mm; margin-bottom: 4mm; }}
.eyebrow {{
  font-family: "Liberation Mono", monospace; font-size: 8pt; letter-spacing: .08em;
  color: #1f3a5f; margin-bottom: 1.5mm;
}}
.meta {{
  font-family: "Liberation Sans", sans-serif; font-size: 8.5pt; color: #6b6250; margin-top: 1.5mm;
}}
.campo {{ margin-bottom: 3mm; }}
.etq {{
  font-family: "Liberation Sans", sans-serif; font-size: 7.5pt; letter-spacing: .09em;
  text-transform: uppercase; color: #6b6250; display: block; margin-bottom: .8mm;
}}
.campo.destacado p {{ font-size: 11pt; }}
.campo.alerta {{ border-left: 2.5pt solid #8a5a15; padding-left: 3.5mm; }}
.campo ul {{ margin: 0; padding-left: 5mm; }}
.campo li {{ margin-bottom: .8mm; }}

/* dilemas */
.opciones-dilema {{ margin: 3mm 0; }}
.opcion {{
  border: .4pt solid #ddd6c6; border-left: 2pt solid #cfc7b4;
  padding: 2mm 3mm; margin-bottom: 2mm; page-break-inside: avoid;
}}
.opcion .texto {{ font-size: 10pt; line-height: 1.4; }}
.letra {{
  font-family: "Liberation Mono", monospace; font-weight: bold; color: #1f3a5f; margin-right: 1.5mm;
}}
.calidad {{
  font-family: "Liberation Sans", sans-serif; font-size: 7pt; letter-spacing: .08em;
  text-transform: uppercase; padding: .5mm 1.6mm; border: .5pt solid currentColor;
  border-radius: 2mm; margin-left: 2mm; white-space: nowrap;
}}
.calidad-cuidadosa {{ color: #2f6f4e; }}
.calidad-apresurada {{ color: #a2621a; }}
.calidad-evasiva {{ color: #6b6250; }}
.calidad-dañina {{ color: #a33a3a; }}
.consecuencia, .reparacion {{ font-size: 9pt; line-height: 1.4; margin-top: 1.2mm; color: #3b4653; }}
.consecuencia .etq, .reparacion .etq {{ display: inline; margin-right: 1.5mm; }}
.reparacion.sin {{ color: #8a8272; font-style: italic; }}

.rel, .pendiente {{ font-size: 9pt; color: #6b6250; margin-top: 2mm; }}
.pendiente {{ color: #8a5a15; }}

/* veredicto */
.veredicto {{
  margin-top: 4mm; border: .5pt solid #16202c; padding: 3mm 3.5mm 2mm;
  page-break-inside: avoid; position: relative;
}}
.opciones {{ display: flex; gap: 7mm; flex-wrap: wrap; margin-bottom: 3mm; }}
.op {{ font-family: "Liberation Sans", sans-serif; font-size: 8.5pt; white-space: nowrap; }}
.caja {{
  display: inline-block; width: 3.4mm; height: 3.4mm; border: .7pt solid #16202c;
  margin-right: 1.5mm; vertical-align: -.4mm;
}}
.renglones {{ display: flex; flex-direction: column; gap: 5.5mm; padding-bottom: 2mm; }}
.renglones span {{ display: block; border-bottom: .4pt solid #cfc7b4; }}
.veredicto .ident {{
  position: absolute; right: 3mm; bottom: 1mm;
  font-family: "Liberation Mono", monospace; font-size: 7pt; color: #a89f8c;
}}
</style></head><body>

<div class="portada">
  <p class="kicker">EGIA Quest · Revisión humana del contenido pedagógico</p>
  <h1>Cuadernillo de revisión</h1>
  <p class="lede">Los {total} elementos del contenido de Fase 1, con todos sus campos y un espacio
  de veredicto por elemento. Este documento existe para cerrar <strong>DEUDA-EGIA-020</strong>,
  la única tarea del plan que no puede delegarse.</p>

  <dl class="ficha-datos">
    <div><dt>Proyecto</dt><dd>Educación General e Inteligencia Artificial en Acción</dd></div>
    <div><dt>Fecha</dt><dd>29 de agosto de 2026</dd></div>
    <div><dt>Sirve a</dt><dd>DEUDA-EGIA-020 · condición del Gate 4</dd></div>
    <div><dt>Fecha límite</dt><dd>Piloto del 23 de octubre de 2026</dd></div>
    <div><dt>Punto de control</dt><dd>21 de septiembre de 2026</dd></div>
    <div><dt>Retos</dt><dd>{len(retos)}</dd></div>
    <div><dt>Dilemas</dt><dd>{len(dilemas)}</dd></div>
    <div><dt>Términos de glosario</dt><dd>{len(terminos)}</dd></div>
    <div><dt>Fichas de herramienta</dt><dd>{len(herramientas)}</dd></div>
    <div><dt>Subjetividad</dt><dd>Estudiante universitario de educación general</dd></div>
  </dl>

  <div class="nota-portada">
    <strong>Qué garantiza la validación automática y qué no</strong>
    <p><code>validate:content</code> comprueba que el verbo corresponda al nivel, que el andamiaje
    corresponda al nivel, que los prerrequisitos no apunten a niveles superiores, que las diez
    Buenas Prácticas estén cubiertas una sola vez y que toda opción de dilema tenga consecuencia
    y toda decisión con daño ofrezca reparación. Eso es coherencia estructural.</p>
    <p style="margin-top:2mm">Lo que no puede comprobar es el acierto pedagógico, la adecuación
    de la voz para tus estudiantes, la pertinencia de cada escenario en tu facultad ni si un
    criterio ético dice lo que tú dirías. Eso es lo que este cuadernillo te pide.</p>
  </div>

  <div class="leyenda">
    <p><strong>Punto de control del 21 de septiembre:</strong> si los quince retos no están
    aprobados para esa fecha, el plan recorta a los diez anclados a las Buenas Prácticas y los
    cinco integradores pasan a v1.1 como deuda aceptada.</p>
  </div>
</div>

<div class="indice">
  <h2>Índice para llevar la cuenta</h2>
  <p class="meta" style="margin-bottom:4mm">La última columna es para marcar los que ya revisaste.</p>
  <h3 style="margin-bottom:2mm">Retos</h3>
  <table>{indice_retos}</table>
  <h3 style="margin-bottom:2mm">Dilemas</h3>
  <table>{indice_dilemas}</table>
  <h3 style="margin-bottom:2mm">Fichas de herramienta</h3>
  <table>{indice_herramientas}</table>
</div>

<div class="indice">
  <h3 style="margin-bottom:2mm">Glosario</h3>
  <table>{indice_terminos}</table>
</div>

<div class="portadilla">
  <h2>Los quince retos</h2>
  <p>Diez anclados uno a uno a las Buenas Prácticas de tu Guía Rápida Estudiantil, más cinco
  integradores transdisciplinarios. Cada uno con su nivel, verbo, competencias y el campo
  obligatorio «cuándo no usar IA».</p>
</div>
{"".join(bloques_retos)}

<div class="portadilla">
  <h2>Los doce dilemas</h2>
  <p>Ninguna opción se puntúa como correcta. Cada una muestra su consecuencia y, donde la decisión
  deja daño, ofrece reparación. La etiqueta de calidad se registra para el tablero y nunca se le
  muestra a la persona como nota.</p>
</div>
{"".join(bloques_dilemas)}

<div class="portadilla">
  <h2>Las ocho fichas de herramienta</h2>
  <p>Por tipo, no por producto: una ficha con marcas y versiones caduca en meses. La rejilla la
  pone la aplicación; el caso lo pone el estudiante en el reto EGIA-R-012.</p>
</div>
{"".join(bloques_herramientas)}

<div class="portadilla">
  <h2>Los treinta y ocho términos</h2>
  <p>Cada entrada tiene definición breve, definición operativa para este curso y una distinción de
  qué <em>no</em> es. La distinción es la parte que evita el uso decorativo del término.</p>
</div>
{"".join(bloques_terminos)}

</body></html>"""

SALIDA.write_text(HTML, encoding="utf-8")
print(f"HTML generado: {SALIDA} · {total} elementos")
