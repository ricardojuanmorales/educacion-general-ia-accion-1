// Índice de los doce dilemas. Muestra cuáles ya decidiste y con qué calidad, sin ranking
// ni puntaje comparativo: la calidad describe la decisión, no califica a la persona.

import type { Dilema, EstadoDilemas } from "../dominio/dilema";
import { resolucionDe } from "../dominio/dilema";
import { ETIQUETA_CALIDAD } from "./PantallaDilema";

export interface ListaDilemasProps {
  readonly dilemas: readonly Dilema[];
  readonly estado: EstadoDilemas;
  readonly alAbrir: (dilemaId: string) => void;
}

export function ListaDilemas({ dilemas, estado, alAbrir }: ListaDilemasProps) {
  return (
    <div className="lista-dilemas">
      <p className="intro">
        Doce escenarios situados. No hay respuesta marcada en verde: eliges, escribes tu razón,
        y solo entonces ves la consecuencia. Cuando una decisión deja daño, se te ofrece cómo
        repararlo. Los puntos son por decidir y justificar, no por acertar.
      </p>

      <ul className="tarjetas">
        {dilemas.map((d) => {
          const r = resolucionDe(estado, d.id);
          return (
            <li key={d.id}>
              <article className="tarjeta" data-estado={r ? "resuelto" : "pendiente"}>
                <p className="tarjeta__cinta">
                  <span className="etiqueta">{d.id}</span>
                  <span className="etiqueta etiqueta--nivel">{d.nivel}</span>
                </p>
                <h4 className="tarjeta__titulo">{d.titulo}</h4>
                <p className="tarjeta__estado" data-calidad={r?.calidad}>
                  {r ? ETIQUETA_CALIDAD[r.calidad] : "Sin decidir"}
                </p>
                <button
                  type="button"
                  className="boton boton--secundario"
                  onClick={() => alAbrir(d.id)}
                >
                  {r ? "Revisar" : "Abrir dilema"}
                </button>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
