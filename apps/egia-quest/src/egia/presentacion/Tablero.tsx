// Tablero de progreso.
//
// Tres reglas de diseño que vienen del contenido aprobado, no del gusto:
//   1. Sin ranking, sin comparación con otras personas, sin cronómetro. Los puntos son
//      señales de cuidado, no una carrera (README, «Lo que la aplicación evita, a propósito»).
//   2. Los umbrales de nivel están sin recalibrar (DEUDA-EGIA-011). El tablero lo dice en
//      pantalla en vez de disimularlo: con 270 puntos disponibles y Q6 en 140, se llega al
//      último nivel a mitad de camino.
//   3. La «deuda pedagógica» no es un regaño: es la lista de lo que quedó abierto, con el
//      motivo exacto, para que se pueda cerrar.

import { UMBRALES_NIVEL, type Familia } from "../dominio/reto";
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
  const siguiente = UMBRALES_NIVEL.find((u) => u.puntosMinimos > progreso.puntos);

  return (
    <div className="tablero">
      <section className="tablero__nivel" aria-label="Nivel alcanzado">
        <p className="tablero__clave">{progreso.nivel}</p>
        <p className="tablero__etiqueta">{progreso.etiquetaNivel}</p>
        <p className="tablero__puntos">
          {progreso.puntos} <span>de {puntosPosibles} puntos posibles</span>
        </p>
        {siguiente ? (
          <p className="tablero__siguiente">
            Faltan {siguiente.puntosMinimos - progreso.puntos} puntos para {siguiente.nivel} ·{" "}
            {siguiente.etiqueta}
          </p>
        ) : (
          <p className="tablero__siguiente">Has pasado el último umbral definido.</p>
        )}
      </section>

      {progreso.umbralesProvisionales ? (
        <p className="nota nota--provisional" role="note">
          <strong>Umbrales provisionales.</strong> Los cortes de nivel vienen del prototipo
          anterior y están pendientes de recalibrar (DEUDA-EGIA-011). Con {puntosPosibles} puntos
          disponibles y el último umbral en {UMBRALES_NIVEL[UMBRALES_NIVEL.length - 1]?.puntosMinimos},
          se llega a Q6 antes de terminar el recorrido. Se declara en vez de disimularse.
        </p>
      ) : null}

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
            <dt>Puntos por retos</dt>
            <dd>{progreso.puntosDeRetos}</dd>
          </div>
          <div>
            <dt>Puntos por dilemas</dt>
            <dd>{progreso.puntosDeDilemas}</dd>
          </div>
        </dl>
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
                <button
                  type="button"
                  className="enlace"
                  onClick={() => alAbrirReto(d.retoId)}
                >
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
