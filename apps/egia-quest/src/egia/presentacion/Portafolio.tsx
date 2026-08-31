// Portafolio. La curaduría es un segundo acto: aceptar una evidencia no la mete aquí.
//
// El motor heredado lo impone y la interfaz lo respeta —solo entra lo que tiene decisión
// humana de aceptación, y entra cuando la persona lo cura, pieza por pieza. La exportación
// no se resuelve en esta pantalla: se declara pendiente (DEUDA-EGIA-022) en vez de fingirse.

import { useState } from "react";

import type { CreativeProject, Evidence } from "../../core/domain/model";
import type { MissionId, PortfolioItemId } from "../../core/domain/types";
import type { RetoMetadata } from "../dominio/reto";

export interface PortafolioProps {
  readonly proyecto: CreativeProject | null;
  readonly metadatosPorMision: ReadonlyMap<MissionId, RetoMetadata>;
  readonly titulos: ReadonlyMap<string, string>;
  readonly alCurar: (evidenciaId: Evidence["id"], titulo: string) => Promise<void>;
  readonly alRetirar: (itemId: PortfolioItemId) => Promise<void>;
}

export function Portafolio({
  proyecto,
  metadatosPorMision,
  titulos,
  alCurar,
  alRetirar,
}: PortafolioProps) {
  const [aviso, setAviso] = useState<string | null>(null);

  const evidencias = proyecto?.evidence ?? [];
  const enPortafolio = proyecto?.portfolio.items ?? [];
  const idsCurados = new Set(enPortafolio.map((i) => i.evidenceId as string));

  const elegibles = evidencias.filter(
    (e) => e.status === "accepted_for_portfolio" && !idsCurados.has(e.id as string),
  );
  const registro = evidencias.filter((e) => e.status === "reviewed");

  function nombreDe(e: Evidence): string {
    const meta = metadatosPorMision.get(e.missionId);
    if (!meta) return e.title;
    return `${meta.retoId} · ${titulos.get(meta.retoId) ?? e.title}`;
  }

  function evidenciaPorId(id: string): Evidence | undefined {
    return evidencias.find((e) => (e.id as string) === id);
  }

  async function proteger(accion: () => Promise<void>) {
    try {
      await accion();
      setAviso(null);
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se pudo completar la acción.");
    }
  }

  return (
    <div className="portafolio">
      <p className="intro">
        Tu portafolio no se llena solo. Una evidencia entra cuando la aceptaste en el reto y
        además decides curarla aquí. Dos actos, no uno: es la diferencia entre acumular y elegir.
      </p>

      <section aria-labelledby="tit-curado">
        <h3 id="tit-curado">En tu portafolio ({enPortafolio.length})</h3>
        {enPortafolio.length === 0 ? (
          <p className="vacio">
            Todavía no has curado ninguna pieza. Las evidencias que aceptaste aparecen abajo
            listas para entrar.
          </p>
        ) : (
          <ol className="piezas">
            {enPortafolio.map((item) => {
              const e = evidenciaPorId(item.evidenceId as string);
              return (
                <li key={item.id as string} className="pieza">
                  <h4 className="pieza__titulo">{item.title}</h4>
                  {e ? <p className="pieza__resumen">{e.summary}</p> : null}
                  <button
                    type="button"
                    className="boton boton--discreto"
                    onClick={() => void proteger(() => alRetirar(item.id))}
                  >
                    Retirar del portafolio
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="tit-elegibles">
        <h3 id="tit-elegibles">Listas para curar ({elegibles.length})</h3>
        {elegibles.length === 0 ? (
          <p className="vacio">
            Nada pendiente de curar. Cuando aceptes la evidencia de un reto y la marques como
            elegible, aparecerá aquí.
          </p>
        ) : (
          <ul className="piezas">
            {elegibles.map((e) => (
              <li key={e.id as string} className="pieza">
                <h4 className="pieza__titulo">{nombreDe(e)}</h4>
                <p className="pieza__resumen">{e.summary}</p>
                <button
                  type="button"
                  className="boton boton--secundario"
                  onClick={() => void proteger(() => alCurar(e.id, nombreDe(e)))}
                >
                  Añadir al portafolio
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {registro.length > 0 ? (
        <section aria-labelledby="tit-registro">
          <h3 id="tit-registro">Solo registro ({registro.length})</h3>
          <p className="nota">
            Evidencias que decidiste conservar sin hacerlas elegibles, o que descartaste. Cuentan
            como trabajo hecho y no entran al portafolio. Nadie más las ve.
          </p>
          <ul className="piezas piezas--tenues">
            {registro.map((e) => (
              <li key={e.id as string} className="pieza">
                <h4 className="pieza__titulo">{nombreDe(e)}</h4>
                <p className="pieza__resumen">{e.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="nota nota--provisional" role="note">
        <strong>Exportación pendiente.</strong> El motor heredado trae exportación revisable
        pieza por pieza; conectarla a esta pantalla es trabajo de la siguiente iteración
        (DEUDA-EGIA-022). Mientras tanto, nada sale de este navegador.
      </p>

      {aviso ? (
        <p role="alert" className="aviso" data-aviso="portafolio">
          {aviso}
        </p>
      ) : null}
    </div>
  );
}
