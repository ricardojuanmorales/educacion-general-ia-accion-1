// Un dilema ético. La mecánica está en la consecuencia, no en el acierto.
//
// DEC-EGIA-026, hecha interfaz: la consecuencia SOLO aparece después de elegir, y cuando la
// opción dejó daño, la reparación se ofrece explícitamente. No hay respuesta «correcta»
// marcada en verde: hay una consecuencia que leer y una justificación que escribir.
//
// Los puntos no premian acertar. Premian haber decidido y haber dicho por qué.

import { useId, useState } from "react";

import type { Calidad, Dilema, ResolucionDilema } from "../dominio/dilema";

export interface PantallaDilemaProps {
  readonly dilema: Dilema;
  readonly resolucion: ResolucionDilema | undefined;
  readonly alResolver: (
    opcionId: "a" | "b" | "c" | "d",
    justificacion: string,
    reparacionAceptada: boolean,
  ) => Promise<void>;
  readonly alVolver?: () => void;
}

export const ETIQUETA_CALIDAD: Readonly<Record<Calidad, string>> = {
  cuidadosa: "decisión cuidadosa",
  apresurada: "decisión apresurada",
  evasiva: "decisión evasiva",
  dañina: "decisión que dejó daño",
};

const ETIQUETA_EJE: Readonly<Record<string, string>> = {
  injusticias_danos: "Injusticias y daños",
  autonomia: "Autonomía",
  transformaciones: "Transformaciones",
  accountability: "Rendición de cuentas",
};

const MINIMO_JUSTIFICACION = 15;

export function PantallaDilema({
  dilema,
  resolucion,
  alResolver,
  alVolver,
}: PantallaDilemaProps) {
  const [elegida, setElegida] = useState<"a" | "b" | "c" | "d" | null>(
    resolucion?.opcionElegida ?? null,
  );
  const [justificacion, setJustificacion] = useState(resolucion?.justificacion ?? "");
  const [reparacion, setReparacion] = useState(resolucion?.reparacionAceptada ?? false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const idJustificacion = useId();
  const yaResuelto = resolucion !== undefined;
  const opcion = elegida ? dilema.opciones.find((o) => o.id === elegida) : undefined;
  // La consecuencia se revela cuando ya hay una decisión registrada, no al pasar el ratón.
  const revelada = yaResuelto ? dilema.opciones.find((o) => o.id === resolucion.opcionElegida) : undefined;

  return (
    <article className="dilema" aria-labelledby={`${dilema.id}-titulo`} data-dilema={dilema.id}>
      {alVolver ? (
        <button type="button" className="enlace-volver" onClick={alVolver}>
          ← Volver a los dilemas
        </button>
      ) : null}

      <p className="dilema__cinta">
        <span className="etiqueta">{dilema.id}</span>
        <span className="etiqueta etiqueta--nivel">Nivel {dilema.nivel}</span>
        <span className="etiqueta etiqueta--eje">
          {ETIQUETA_EJE[dilema.ejeIbata] ?? dilema.ejeIbata}
        </span>
        <span className="etiqueta etiqueta--puntos">{dilema.puntosBase} puntos</span>
      </p>

      <h2 id={`${dilema.id}-titulo`} className="dilema__titulo">
        {dilema.titulo}
      </h2>

      <p className="dilema__escenario">{dilema.escenario}</p>
      <p className="dilema__pregunta">{dilema.pregunta}</p>

      <fieldset className="opciones" disabled={yaResuelto}>
        <legend className="opciones__leyenda">Elige una y explica por qué</legend>
        {dilema.opciones.map((o) => (
          <label
            key={o.id}
            className="opcion"
            data-elegida={elegida === o.id}
            data-resuelta={yaResuelto && resolucion.opcionElegida === o.id}
          >
            <input
              type="radio"
              name={`dilema-${dilema.id}`}
              value={o.id}
              checked={elegida === o.id}
              onChange={() => {
                setElegida(o.id);
                if (aviso) setAviso(null);
              }}
            />
            <span>{o.texto}</span>
          </label>
        ))}
      </fieldset>

      {!yaResuelto ? (
        <div className="control">
          <label className="control__etiqueta" htmlFor={idJustificacion}>
            ¿Por qué esa? Escribe tu razón antes de ver qué pasa.
          </label>
          <textarea
            id={idJustificacion}
            className="campo"
            rows={3}
            value={justificacion}
            onChange={(e) => {
              setJustificacion(e.target.value);
              if (aviso && e.target.value.trim().length >= MINIMO_JUSTIFICACION) setAviso(null);
            }}
          />
          <button
            type="button"
            className="boton boton--principal"
            disabled={ocupado}
            onClick={() => {
              if (!elegida || !opcion) {
                setAviso("Elige una opción antes de continuar.");
                return;
              }
              if (justificacion.trim().length < MINIMO_JUSTIFICACION) {
                setAviso(
                  "Escribe tu razón antes de ver la consecuencia. La razón es lo que se evalúa, no la opción.",
                );
                return;
              }
              setOcupado(true);
              void alResolver(elegida, justificacion, false)
                .then(() => setAviso(null))
                .catch((e: unknown) =>
                  setAviso(e instanceof Error ? e.message : "No se pudo guardar."),
                )
                .finally(() => setOcupado(false));
            }}
          >
            Decidir y ver la consecuencia
          </button>
        </div>
      ) : null}

      {yaResuelto && revelada ? (
        <section className="consecuencia" aria-label="Consecuencia de tu decisión">
          <p className="consecuencia__calidad" data-calidad={revelada.calidad}>
            {ETIQUETA_CALIDAD[revelada.calidad]}
          </p>
          <h3 className="consecuencia__titulo">Lo que pasó</h3>
          <p>{revelada.consecuencia}</p>

          {revelada.reparacion ? (
            <div className="reparacion">
              <h3 className="reparacion__titulo">Lo que aún puedes hacer</h3>
              <p>{revelada.reparacion}</p>
              <label className="casilla">
                <input
                  type="checkbox"
                  checked={reparacion}
                  onChange={(e) => {
                    setReparacion(e.target.checked);
                    void alResolver(
                      resolucion.opcionElegida,
                      resolucion.justificacion,
                      e.target.checked,
                    );
                  }}
                />
                <span>Me comprometo a esta reparación</span>
              </label>
            </div>
          ) : (
            <p className="nota">
              Esta decisión no dejó daño que reparar. Eso no la vuelve la única defendible: lee
              las otras consecuencias cuando quieras.
            </p>
          )}

          <div className="posterior">
            <h3 className="posterior__titulo">Para pensarlo después</h3>
            <p>{dilema.reflexionPosterior}</p>
          </div>

          <details className="otras">
            <summary>Ver qué habría pasado con las otras opciones</summary>
            <ul className="otras__lista">
              {dilema.opciones
                .filter((o) => o.id !== resolucion.opcionElegida)
                .map((o) => (
                  <li key={o.id}>
                    <p className="otras__texto">{o.texto}</p>
                    <p className="otras__calidad" data-calidad={o.calidad}>
                      {ETIQUETA_CALIDAD[o.calidad]}
                    </p>
                    <p>{o.consecuencia}</p>
                  </li>
                ))}
            </ul>
          </details>

          <blockquote className="cita-evidencia">
            <p className="cita-evidencia__titulo">Tu razón, tal como la escribiste</p>
            <p>{resolucion.justificacion}</p>
          </blockquote>
        </section>
      ) : null}

      {aviso ? (
        <p role="alert" className="aviso" data-aviso="dilema">
          {aviso}
        </p>
      ) : null}
    </article>
  );
}
