// Glosario. 38 términos, cada uno con definición breve, definición operativa para este curso y
// una distinción: qué NO es.
//
// Dos decisiones de interfaz que vienen del método, no del gusto:
//   1. La distinción se muestra siempre, no detrás de un desplegable. Es la parte que evita el
//      uso decorativo del término, y esconderla sería devolver el glosario a la decoración.
//   2. Las remisiones son navegables. Un glosario que se remite a sí mismo y obliga a buscar a
//      mano no se consulta: se abandona.

import { useId, useMemo, useState } from "react";

import { filtrarTerminos, porInicial, type TerminoGlosario } from "../dominio/referencia";

export interface GlosarioProps {
  readonly terminos: readonly TerminoGlosario[];
  readonly metodo: string;
}

export function Glosario({ terminos, metodo }: GlosarioProps) {
  const [consulta, setConsulta] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const idBusqueda = useId();

  const visibles = useMemo(() => filtrarTerminos(terminos, consulta), [terminos, consulta]);
  const grupos = useMemo(() => porInicial(visibles), [visibles]);

  function irA(termino: string) {
    setConsulta("");
    setAbierto(termino);
    // El término puede estar filtrado fuera; limpiar la consulta lo devuelve a la lista.
    requestAnimationFrame(() => {
      const destino = document.getElementById(`termino-${slug(termino)}`);
      // `scrollIntoView` no existe en todos los entornos. Que falte no puede tumbar la
      // navegación: el término ya quedó abierto, y eso es lo que importa.
      destino?.scrollIntoView?.({ block: "center" });
      // Y el foco viaja con la vista. Sin esto, quien navega con teclado o lector de
      // pantalla sigue en la remisión que pulsó, mientras la página se movió sin avisar:
      // el destino queda anunciado para el ojo y perdido para todo lo demás.
      destino?.querySelector("summary")?.focus();
    });
  }

  return (
    <div className="glosario">
      <p className="intro">{metodo}</p>

      <div className="buscador">
        <label className="control__etiqueta" htmlFor={idBusqueda}>
          Buscar en el glosario
        </label>
        <input
          id={idBusqueda}
          type="search"
          className="campo campo--linea"
          value={consulta}
          placeholder="declaración, sesgo, abstención…"
          onChange={(e) => setConsulta(e.target.value)}
        />
        <p className="buscador__cuenta" role="status">
          {visibles.length === terminos.length
            ? `${terminos.length} términos`
            : `${visibles.length} de ${terminos.length} términos`}
        </p>
      </div>

      {visibles.length === 0 ? (
        <p className="vacio">
          Ningún término coincide con «{consulta}». Puede que el concepto exista con otro nombre:
          prueba con una palabra de la definición.
        </p>
      ) : null}

      {grupos.map(({ inicial, terminos: delGrupo }) => (
        <section key={inicial} className="grupo-letra" aria-labelledby={`letra-${inicial}`}>
          <h3 id={`letra-${inicial}`} className="grupo-letra__titulo">
            {inicial}
          </h3>
          <dl className="terminos">
            {delGrupo.map((t) => (
              <div
                key={t.termino}
                className="termino"
                id={`termino-${slug(t.termino)}`}
                data-abierto={abierto === t.termino}
                data-termino={t.termino}
              >
                <dt className="termino__nombre" tabIndex={-1}>
                  {t.termino}
                </dt>
                <dd className="termino__cuerpo">
                  <p className="termino__breve">{t.definicionBreve}</p>

                  <details
                    open={abierto === t.termino}
                    onToggle={(e) =>
                      setAbierto(e.currentTarget.open ? t.termino : (a) => (a === t.termino ? null : a))
                    }
                  >
                    <summary>Ver definición operativa y distinción</summary>

                    <p className="termino__etiqueta">En este curso</p>
                    <p>{t.definicionOperativa}</p>

                    <p className="termino__etiqueta">Qué no es</p>
                    <p className="termino__distincion">{t.distincion}</p>

                    {t.relacionados.length > 0 ? (
                      <p className="termino__relacionados">
                        <span className="termino__etiqueta">Ver también</span>
                        {t.relacionados.map((r, i) => (
                          <span key={r}>
                            {i > 0 ? ", " : " "}
                            <button type="button" className="enlace" onClick={() => irA(r)}>
                              {r}
                            </button>
                          </span>
                        ))}
                      </p>
                    ) : null}

                    <p className="termino__fuente">{t.fuente}</p>

                    {t.notaPendiente ? (
                      <p className="nota nota--provisional" role="note">
                        <strong>Pendiente.</strong> {t.notaPendiente}
                      </p>
                    ) : null}
                  </details>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function slug(termino: string): string {
  return termino
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
