// Fichas de herramienta. Ocho tipos, no ocho productos.
//
// La rejilla es siempre la misma y siempre completa: qué hace, qué NO hace, qué datos toca, qué
// riesgos trae, cuándo no usarla, qué señales de alerta mirar y qué preguntarse antes. Que el
// orden no cambie de ficha en ficha es lo que la convierte en un instrumento comparable: el
// reto EGIA-R-012 pide que la persona pruebe tres herramientas reales usando esta misma rejilla.
//
// «Qué no hace» y «cuándo no usarla» se muestran con el mismo peso visual que «qué hace». Una
// ficha que destaca la capacidad y esconde el límite es publicidad.

import { useId, useMemo, useState } from "react";

import { filtrarHerramientas, type FichaHerramienta } from "../dominio/referencia";

export interface HerramientasProps {
  readonly fichas: readonly FichaHerramienta[];
  readonly decisionDeDiseno: string;
}

export function Herramientas({ fichas, decisionDeDiseno }: HerramientasProps) {
  const [consulta, setConsulta] = useState("");
  const idBusqueda = useId();
  const visibles = useMemo(() => filtrarHerramientas(fichas, consulta), [fichas, consulta]);

  return (
    <div className="herramientas">
      <p className="intro">
        Ocho <strong>tipos</strong> de herramienta, no ocho productos. Todas responden la misma
        rejilla, en el mismo orden, para que puedas comparar.
      </p>

      <details className="porque">
        <summary>Por qué tipos y no marcas</summary>
        <p>{decisionDeDiseno}</p>
      </details>

      <div className="buscador">
        <label className="control__etiqueta" htmlFor={idBusqueda}>
          Buscar entre las fichas
        </label>
        <input
          id={idBusqueda}
          type="search"
          className="campo campo--linea"
          value={consulta}
          placeholder="imagen, voz, código, detector…"
          onChange={(e) => setConsulta(e.target.value)}
        />
        <p className="buscador__cuenta" role="status">
          {visibles.length === fichas.length
            ? `${fichas.length} fichas`
            : `${visibles.length} de ${fichas.length} fichas`}
        </p>
      </div>

      {visibles.length === 0 ? (
        <p className="vacio">
          Ninguna ficha coincide con «{consulta}». Las fichas describen tipos, no marcas: prueba
          con lo que la herramienta hace, no con cómo se llama.
        </p>
      ) : null}

      <ul className="fichas">
        {visibles.map((f) => (
          <li key={f.id}>
            <article className="ficha-herramienta" data-herramienta={f.id}>
              <p className="tarjeta__cinta">
                <span className="etiqueta">{f.id}</span>
                <span className="etiqueta etiqueta--nivel">Sugerida desde {f.nivelSugerido}</span>
              </p>
              <h3 className="ficha-herramienta__titulo">{f.tipo}</h3>

              <div className="par">
                <section className="par__lado par__lado--hace">
                  <h4>Qué hace</h4>
                  <p>{f.queHace}</p>
                </section>
                <section className="par__lado par__lado--no-hace">
                  <h4>Qué no hace</h4>
                  <p>{f.queNoHace}</p>
                </section>
              </div>

              <section className="bloque">
                <h4>Qué datos toca</h4>
                <p>{f.datosQueToca}</p>
              </section>

              <section className="bloque">
                <h4>Riesgos típicos</h4>
                <ul className="lista-puntos">
                  {f.riesgosTipicos.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </section>

              <section className="bloque bloque--abstencion">
                <h4>Cuándo no usarla</h4>
                <p>{f.cuandoNoUsar}</p>
              </section>

              <section className="bloque">
                <h4>Señales de alerta</h4>
                <ul className="lista-puntos lista-puntos--alerta">
                  {f.senalesDeAlerta.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>

              <section className="bloque bloque--preguntas">
                <h4>Antes de usarla, pregúntate</h4>
                <ul className="lista-puntos">
                  {f.preguntasAntesDeUsar.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </section>
            </article>
          </li>
        ))}
      </ul>

      <p className="nota">
        La aplicación aporta la rejilla; tú aportas el caso. El reto EGIA-R-012 te pide probar y
        comparar tres herramientas reales con estos mismos criterios.
      </p>
    </div>
  );
}
