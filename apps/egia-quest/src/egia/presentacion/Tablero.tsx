// Tablero de progreso.
//
// Cambio de protagonista (DEC-EGIA-044): el número grande ya no son los puntos, es la escalera
// de niveles. El nivel se gana recorriendo, no acumulando, y el tablero tiene que enseñar el
// recorrido para que la regla se entienda sin leer documentación: se ve qué tramos están
// pisados, cuál sigue y qué retos lo abren.
//
// Dos reglas de diseño que vienen del contenido aprobado, no del gusto:
//   1. Sin ranking, sin comparación con otras personas, sin cronómetro. Los puntos son señales
//      de cuidado, no una carrera (README, «Lo que la aplicación evita, a propósito»).
//   2. La «deuda pedagógica» no es un regaño: es la lista de lo que quedó abierto, con el
//      motivo exacto, para que se pueda cerrar.

import type { Familia } from "../dominio/reto";
import type { Progreso } from "../dominio/progreso";

export interface TableroProps {
  readonly progreso: Progreso;
  readonly totalRetos: number;
  readonly totalDilemas: number;
  readonly puntosPosibles: number;
  readonly alAbrirReto: (retoId: string) => void;
}

const NOMBRE_FAMILIA: Readonly<Record<Familia, string>> = {
  agencia_humana: "Agencia humana",
  aprendizaje_ludico: "Aprendizaje lúdico",
  investigacion_creacion: "Investigación y creación",
  literacidad_ia: "Literacidad en IA",
  etica_responsabilidad: "Ética y responsabilidad",
  diseno_universal: "Diseño universal",
  conocimiento_situado: "Conocimiento situado",
  colaboracion_transdisciplinaria: "Colaboración transdisciplinaria",
  reflexion_portafolio: "Reflexión y portafolio",
  evaluacion_criterio: "Evaluación con criterio",
};

export function Tablero({
  progreso,
  totalRetos,
  totalDilemas,
  puntosPosibles,
  alAbrirReto,
}: TableroProps) {
  return (
    <div className="tablero">
      <section className="tablero__nivel" aria-label="Nivel alcanzado">
        <p className="tablero__clave">{progreso.nivel}</p>
        <p className="tablero__etiqueta">{progreso.etiquetaNivel}</p>
        {progreso.siguiente ? (
          <p className="tablero__siguiente">
            Llegas a <strong>{progreso.siguiente.nivel} · {progreso.siguiente.etiqueta}</strong> al
            completar un reto de ese tramo.
          </p>
        ) : (
          <p className="tablero__siguiente">
            Has recorrido los siete tramos. Lo que quede por hacer, lo haces porque quieres.
          </p>
        )}
      </section>

      <section className="escalera" aria-labelledby="tit-escalera">
        <h3 id="tit-escalera">Tu recorrido</h3>
        <p className="nota">
          El nivel no se compra con puntos: se recorre. Subes a un tramo cuando completas al menos
          un reto de cada nivel anterior, sin saltarte ninguno.
        </p>
        <ol className="peldanos">
          {progreso.escalera.map((p) => (
            <li
              key={p.nivel}
              className="peldano"
              data-nivel={p.nivel}
              data-pisado={p.pisado}
              data-actual={p.nivel === progreso.nivel}
              aria-current={p.nivel === progreso.nivel ? "step" : undefined}
            >
              <span className="peldano__clave">{p.nivel}</span>
              <span className="peldano__etiqueta">{p.etiqueta}</span>
              <span className="peldano__cuenta">
                {p.completados} de {p.total}
                <span className="visualmente-oculto">
                  {" "}
                  {p.completados === 1 ? "reto completado" : "retos completados"}
                  {p.pisado ? ", tramo recorrido" : ", tramo sin empezar"}
                </span>
              </span>
            </li>
          ))}
        </ol>
        {progreso.siguiente && progreso.siguiente.retosQueLoAbren.length > 0 ? (
          <p className="escalera__pista">
            Abren {progreso.siguiente.nivel}:{" "}
            {progreso.siguiente.retosQueLoAbren.map((retoId, i) => (
              <span key={retoId}>
                {i > 0 ? ", " : ""}
                <button type="button" className="enlace" onClick={() => alAbrirReto(retoId)}>
                  {retoId}
                </button>
              </span>
            ))}
          </p>
        ) : null}
      </section>

      <section className="tablero__cifras" aria-label="Recuento">
        <dl className="cifras">
          <div>
            <dt>Retos completados</dt>
            <dd>
              {progreso.retosCompletados.length} <span>de {totalRetos}</span>
            </dd>
          </div>
          <div>
            <dt>Retos en curso</dt>
            <dd>{progreso.retosEnCurso.length}</dd>
          </div>
          <div>
            <dt>Dilemas decididos</dt>
            <dd>
              {progreso.dilemasResueltos} <span>de {totalDilemas}</span>
            </dd>
          </div>
          <div>
            <dt>Puntos de cuidado</dt>
            <dd>
              {progreso.puntos} <span>de {puntosPosibles}</span>
            </dd>
          </div>
        </dl>
        <p className="nota">
          Los puntos son una señal de cuidado, no una moneda: {progreso.puntosDeRetos} vienen de
          retos y {progreso.puntosDeDilemas} de dilemas. No compran nivel y no se comparan con
          nadie.
        </p>
      </section>

      <section className="tablero__competencias" aria-labelledby="tit-competencias">
        <h3 id="tit-competencias">Competencias con evidencia</h3>
        {progreso.competencias.length === 0 ? (
          <p className="vacio">
            Todavía no hay competencias con evidencia. Completa un reto —con su decisión— y
            aparecerán aquí las familias que ese reto desarrolla.
          </p>
        ) : (
          <ul className="barras">
            {progreso.competencias.map(({ familia, evidencias }) => (
              <li key={familia} className="barra">
                <span className="barra__nombre">{NOMBRE_FAMILIA[familia] ?? familia}</span>
                <span
                  className="barra__pista"
                  role="img"
                  aria-label={`${evidencias} ${evidencias === 1 ? "evidencia" : "evidencias"}`}
                >
                  <span
                    className="barra__relleno"
                    style={{ inlineSize: `${Math.min(100, evidencias * 25)}%` }}
                  />
                </span>
                <span className="barra__cifra">{evidencias}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="nota">
          Esto cuenta evidencias por familia, no dominio. La regla de progresión competencial
          está pendiente de definir (DEUDA-EGIA-015): tres evidencias no equivalen todavía a un
          nivel de desempeño declarado.
        </p>
      </section>

      <section className="tablero__deuda" aria-labelledby="tit-deuda">
        <h3 id="tit-deuda">Lo que quedó abierto</h3>
        {progreso.deudaPedagogica.length === 0 ? (
          <p className="vacio">Nada abierto. Todo lo que empezaste, lo cerraste.</p>
        ) : (
          <ul className="deuda">
            {progreso.deudaPedagogica.map((d) => (
              <li key={d.retoId} className="deuda__item">
                <button type="button" className="enlace" onClick={() => alAbrirReto(d.retoId)}>
                  {d.retoId}
                </button>
                <span className="deuda__motivo">{d.motivo}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="nota nota--privacidad">
        Este tablero se calcula en tu navegador con tus datos. No se envía a ningún servidor, no
        se compara con nadie y no hay ranking.
      </p>
    </div>
  );
}
