// Lista de los quince retos, agrupados por nivel Q. El andamiaje es visible: se ve dónde
// empieza la plantilla, dónde el checklist y dónde queda solo el criterio.
//
// Un reto bloqueado se muestra, no se esconde. Ver lo que falta es parte del mapa.

import type { CreativeProject } from "../../core/domain/model";
import { NIVELES_Q, type NivelQ, type RetoMetadata } from "../dominio/reto";
import { pasoActual, type PasoReto } from "./PantallaReto";

export interface ListaRetosProps {
  readonly retos: readonly RetoMetadata[];
  readonly titulos: ReadonlyMap<string, string>;
  readonly proyecto: CreativeProject | null;
  readonly retosCompletados: readonly string[];
  readonly alAbrir: (retoId: string) => void;
}

const ETIQUETA_NIVEL: Readonly<Record<NivelQ, string>> = {
  Q0: "Activación responsable",
  Q1: "Práctica situada",
  Q2: "Producción documentada",
  Q3: "Accesibilidad aplicada",
  Q4: "Juicio ético",
  Q5: "Integración caleidoscópica",
  Q6: "Transferencia portable",
};

const ESTADO_TEXTO: Readonly<Record<PasoReto, string>> = {
  sin_iniciar: "Sin iniciar",
  actividad: "En curso · falta tu trabajo",
  evidencia: "En curso · falta tu evidencia",
  reflexion: "En curso · falta tu reflexión",
  decision: "En curso · falta tu decisión",
  completado: "Completado",
};

export function ListaRetos({
  retos,
  titulos,
  proyecto,
  retosCompletados,
  alAbrir,
}: ListaRetosProps) {
  return (
    <div className="lista-retos">
      <p className="intro">
        Quince retos en siete niveles. Cada nivel tiene su verbo, y el apoyo se desvanece a
        medida que subes: plantilla en Q0 y Q1, checklist de Q2 a Q4, solo criterio en Q5 y Q6.
        Ninguno se completa sin evidencia, reflexión y una decisión tuya.
      </p>

      {NIVELES_Q.map((nivel) => {
        const delNivel = retos.filter((r) => r.nivel === nivel);
        if (delNivel.length === 0) return null;
        return (
          <section key={nivel} className="grupo-nivel" aria-labelledby={`nivel-${nivel}`}>
            <h3 id={`nivel-${nivel}`} className="grupo-nivel__titulo">
              <span className="grupo-nivel__clave">{nivel}</span> {ETIQUETA_NIVEL[nivel]}
            </h3>
            <ul className="tarjetas">
              {delNivel.map((reto) => {
                const paso = pasoActual(reto, proyecto);
                const bloqueado = reto.prerrequisitos.some((p) => !retosCompletados.includes(p));
                return (
                  <li key={reto.retoId}>
                    <article
                      className="tarjeta"
                      data-estado={paso}
                      data-bloqueado={bloqueado}
                      data-reto={reto.retoId}
                    >
                      <p className="tarjeta__cinta">
                        <span className="etiqueta">{reto.retoId}</span>
                        <span className="etiqueta etiqueta--verbo">{reto.verbo}</span>
                        <span className="etiqueta etiqueta--andamiaje">{reto.andamiaje}</span>
                      </p>
                      <h4 className="tarjeta__titulo">
                        {titulos.get(reto.retoId) ?? reto.retoId}
                      </h4>
                      <p className="tarjeta__estado" data-estado={paso}>
                        {bloqueado ? "Bloqueado" : ESTADO_TEXTO[paso]}
                      </p>
                      {bloqueado ? (
                        <p className="tarjeta__nota">
                          Se abre al completar {reto.prerrequisitos.join(", ")}.
                        </p>
                      ) : null}
                      <button
                        type="button"
                        className="boton boton--secundario"
                        disabled={bloqueado}
                        onClick={() => alAbrir(reto.retoId)}
                      >
                        {paso === "sin_iniciar" ? "Abrir reto" : "Continuar"}
                      </button>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
