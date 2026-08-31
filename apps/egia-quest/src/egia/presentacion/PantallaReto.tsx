// Pantalla de un reto. Interfaz propia de EGIA Quest sobre el motor heredado.
//
// Dos lecciones del monolito v0.1A, pagadas caro, quedan aquí como reglas de diseño:
//   1. Un botón desactivado tiene que verse desactivado (DEUDA-EGIA-001, primera parte).
//   2. El aviso de validación aparece junto al control que lo provocó, nunca en la
//      cabecera de la sección (DEUDA-EGIA-001, segunda parte).
//
// Y una tercera, heredada del núcleo y afirmada en las pruebas: el orden es
// trabajo → evidencia → reflexión → decisión. La interfaz lo muestra como pasos, no lo oculta.
//
// El cuarto paso es un hallazgo de Fase 3 (DEC-EGIA-042). El motor heredado NO da una misión
// por completada cuando hay evidencia y reflexión: exige además una decisión humana registrada
// sobre esa evidencia, y solo entonces la deja entrar al portafolio. Esa exigencia es la misma
// que gobierna los gates de este proyecto —comando ejecutable y decisión humana registrada—
// aplicada al trabajo de la persona estudiante. No se disimula: se muestra como paso 4.

import { useId, useRef, useState } from "react";

import type { CreativeProject, Evidence, MissionDefinition } from "../../core/domain/model";
import type { MissionStatus } from "../../core/domain/types";
import type { RetoMetadata } from "../dominio/reto";

export type PasoReto =
  | "sin_iniciar"
  | "actividad"
  | "evidencia"
  | "reflexion"
  | "decision"
  | "completado";

/** Qué decide la persona sobre su propia evidencia. Las tres cierran el reto. */
export type DestinoEvidencia = "portafolio" | "registro" | "descartar";

export interface AccionesReto {
  iniciar: () => Promise<void>;
  guardarActividad: (texto: string) => Promise<void>;
  crearEvidencia: (resumen: string) => Promise<void>;
  guardarReflexion: (texto: string) => Promise<void>;
  decidirEvidencia: (destino: DestinoEvidencia, justificacion: string) => Promise<void>;
}

export interface PantallaRetoProps {
  readonly reto: RetoMetadata;
  /** La definición que ejecuta el motor. Junto con `reto`, las dos mitades de DEC-EGIA-023. */
  readonly definicion: MissionDefinition;
  readonly proyecto: CreativeProject | null;
  readonly acciones: AccionesReto;
  readonly retosCompletados: readonly string[];
  readonly alVolver?: () => void;
}

const MINIMO_REFLEXION = 20;

export function pasoActual(reto: RetoMetadata, proyecto: CreativeProject | null): PasoReto {
  if (!proyecto) return "sin_iniciar";
  const mision = proyecto.missions.find((m) => m.missionId === reto.missionId);
  const estado: MissionStatus | undefined = mision?.status;
  if (!estado || estado === "not_started") return "sin_iniciar";
  if (estado === "completed") return "completado";

  const tieneActividad = proyecto.activityResponses.some((a) => a.missionId === reto.missionId);
  const tieneEvidencia = proyecto.evidence.some((e) => e.missionId === reto.missionId);
  const tieneReflexion = proyecto.reflections.some((r) => r.missionId === reto.missionId);

  if (!tieneActividad) return "actividad";
  if (!tieneEvidencia) return "evidencia";
  if (!tieneReflexion) return "reflexion";
  return "decision";
}

/** La evidencia viva de este reto, si existe. */
export function evidenciaDe(
  reto: RetoMetadata,
  proyecto: CreativeProject | null,
): Evidence | undefined {
  return proyecto?.evidence.find((e) => e.missionId === reto.missionId);
}

const ETIQUETA_PASO: Readonly<Record<PasoReto, string>> = {
  sin_iniciar: "sin iniciar",
  actividad: "paso 1 de 4 · tu trabajo",
  evidencia: "paso 2 de 4 · tu evidencia",
  reflexion: "paso 3 de 4 · tu reflexión",
  decision: "paso 4 de 4 · tu decisión",
  completado: "completado",
};

const ORDEN_PASOS: readonly PasoReto[] = ["actividad", "evidencia", "reflexion", "decision"];

export function PantallaReto({
  reto,
  definicion,
  proyecto,
  acciones,
  retosCompletados,
  alVolver,
}: PantallaRetoProps) {
  const paso = pasoActual(reto, proyecto);
  const bloqueado = reto.prerrequisitos.some((p) => !retosCompletados.includes(p));
  const evidencia = evidenciaDe(reto, proyecto);

  const [actividad, setActividad] = useState("");
  const [textoEvidencia, setTextoEvidencia] = useState("");
  const [reflexion, setReflexion] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [destino, setDestino] = useState<DestinoEvidencia>("portafolio");
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const idActividad = useId();
  const idEvidencia = useId();
  const idReflexion = useId();
  const idJustificacion = useId();
  const campoReflexion = useRef<HTMLTextAreaElement>(null);

  async function conAviso(accion: () => Promise<void>) {
    setOcupado(true);
    try {
      await accion();
      setAviso(null);
    } catch (error) {
      setAviso(error instanceof Error ? error.message : "No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setOcupado(false);
    }
  }

  const faltan = MINIMO_REFLEXION - reflexion.trim().length;
  const indicePaso = ORDEN_PASOS.indexOf(paso);

  return (
    <article
      className="reto"
      aria-labelledby={`${reto.retoId}-titulo`}
      data-paso={paso}
      data-reto={reto.retoId}
    >
      {alVolver ? (
        <button type="button" className="enlace-volver" onClick={alVolver}>
          ← Volver a los retos
        </button>
      ) : null}

      <p className="reto__cinta">
        <span className="etiqueta etiqueta--paso">{ETIQUETA_PASO[paso]}</span>
        <span className="etiqueta etiqueta--nivel">
          Nivel {reto.nivel} · {reto.verbo}
        </span>
        <span className="etiqueta etiqueta--puntos">{reto.puntosBase} puntos</span>
      </p>

      <h2 id={`${reto.retoId}-titulo`} className="reto__titulo">
        {definicion.title}
      </h2>

      {indicePaso >= 0 ? (
        <ol className="pasos" aria-label="Pasos del reto">
          {ORDEN_PASOS.map((p, i) => (
            <li
              key={p}
              className="pasos__item"
              data-estado={i < indicePaso ? "hecho" : i === indicePaso ? "actual" : "pendiente"}
              aria-current={i === indicePaso ? "step" : undefined}
            >
              {["Trabajo", "Evidencia", "Reflexión", "Decisión"][i]}
            </li>
          ))}
        </ol>
      ) : null}

      {/* El propósito de la misión ES la consigna del reto: la costura entre el motor
          heredado y el contenido pedagógico de EGIA Quest. */}
      <p className="reto__consigna" data-campo="consigna">
        {definicion.purpose}
      </p>

      {reto.apoyo.length > 0 ? (
        <section
          className="apoyo"
          aria-label={reto.andamiaje === "plantilla" ? "Plantilla" : "Checklist"}
        >
          <h3 className="apoyo__titulo">
            {reto.andamiaje === "plantilla" ? "Rellena esto" : "Comprueba esto"}
          </h3>
          <ul className="apoyo__lista">
            {definicion.instructions.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="apoyo apoyo--criterio">
          En este nivel no hay plantilla ni checklist. Se retira el apoyo, no la exigencia: te
          queda el criterio.
        </p>
      )}

      <dl className="ficha">
        <dt>Evidencia mínima</dt>
        <dd>{reto.evidenciaMinima}</dd>
        <dt>Criterio ético</dt>
        <dd>{reto.criterioEtico}</dd>
        <dt>Accesibilidad</dt>
        <dd>{reto.accesibilidad}</dd>
        <dt>Cuándo no usar IA</dt>
        <dd data-campo="cuando-no-usar" className="ficha__abstencion">
          {reto.cuandoNoUsarIa}
        </dd>
      </dl>

      {bloqueado ? (
        <p role="note" className="nota nota--bloqueo">
          Este reto se abre cuando completes: {reto.prerrequisitos.join(", ")}.
        </p>
      ) : null}

      {paso === "sin_iniciar" ? (
        <div className="control">
          <p>Pulsa «Iniciar» para abrir el espacio de trabajo, evidencia, reflexión y decisión.</p>
          <button
            type="button"
            className="boton boton--principal"
            disabled={bloqueado || ocupado}
            onClick={() => void conAviso(acciones.iniciar)}
          >
            Iniciar
          </button>
        </div>
      ) : null}

      {paso === "actividad" ? (
        <div className="control">
          <label className="control__etiqueta" htmlFor={idActividad}>
            Tu trabajo: ¿qué hiciste?
          </label>
          <textarea
            id={idActividad}
            className="campo"
            rows={5}
            value={actividad}
            onChange={(e) => {
              setActividad(e.target.value);
              if (aviso) setAviso(null);
            }}
          />
          <button
            type="button"
            className="boton boton--principal"
            disabled={ocupado}
            onClick={() => {
              if (actividad.trim().length === 0) {
                setAviso("Describe lo que hiciste antes de continuar.");
                return;
              }
              void conAviso(() => acciones.guardarActividad(actividad));
            }}
          >
            Guardar trabajo
          </button>
        </div>
      ) : null}

      {paso === "evidencia" ? (
        <div className="control">
          <label className="control__etiqueta" htmlFor={idEvidencia}>
            Tu evidencia: {reto.evidenciaMinima}
          </label>
          <textarea
            id={idEvidencia}
            className="campo"
            rows={5}
            value={textoEvidencia}
            onChange={(e) => {
              setTextoEvidencia(e.target.value);
              if (aviso) setAviso(null);
            }}
          />
          <button
            type="button"
            className="boton boton--principal"
            disabled={ocupado}
            onClick={() => {
              if (textoEvidencia.trim().length === 0) {
                setAviso("Describe o enlaza tu evidencia antes de continuar.");
                return;
              }
              void conAviso(() => acciones.crearEvidencia(textoEvidencia));
            }}
          >
            Guardar evidencia
          </button>
        </div>
      ) : null}

      {paso === "reflexion" ? (
        <div className="control">
          <label className="control__etiqueta" htmlFor={idReflexion}>
            {reto.preguntaReflexion}
          </label>
          <textarea
            id={idReflexion}
            className="campo"
            rows={5}
            ref={campoReflexion}
            value={reflexion}
            onChange={(e) => {
              setReflexion(e.target.value);
              if (aviso && e.target.value.trim().length >= MINIMO_REFLEXION) setAviso(null);
            }}
          />
          <p className="nota nota--privacidad">
            Tu reflexión se guarda como privada. Nada se exporta sin que tú lo decidas.
          </p>
          <button
            type="button"
            className="boton boton--principal"
            disabled={ocupado}
            onClick={() => {
              if (reflexion.trim().length < MINIMO_REFLEXION) {
                setAviso(
                  reflexion.trim().length === 0
                    ? "Escribe tu reflexión antes de completar el reto. La reflexión es parte de la evidencia, no un trámite."
                    : `Tu reflexión necesita ${faltan} ${faltan === 1 ? "carácter" : "caracteres"} más para poder completar el reto.`,
                );
                campoReflexion.current?.focus();
                return;
              }
              void conAviso(() => acciones.guardarReflexion(reflexion));
            }}
          >
            Guardar reflexión
          </button>
        </div>
      ) : null}

      {paso === "decision" ? (
        <div className="control control--decision">
          <h3 className="control__titulo">Tu decisión sobre tu evidencia</h3>
          <p>
            El reto no se cierra solo. Miraste tu trabajo; ahora decides qué hacer con él. La
            decisión queda registrada con tu razón, y es lo que abre —o no— la puerta al
            portafolio.
          </p>

          {evidencia ? (
            <blockquote className="cita-evidencia">
              <p className="cita-evidencia__titulo">{evidencia.title}</p>
              <p>{evidencia.summary}</p>
            </blockquote>
          ) : null}

          <fieldset className="opciones">
            <legend className="opciones__leyenda">¿Qué haces con esta evidencia?</legend>
            {(
              [
                {
                  valor: "portafolio",
                  titulo: "La acepto y puede entrar en mi portafolio",
                  detalle:
                    "Queda disponible para que la cures. Entrar al portafolio sigue siendo un segundo acto tuyo, no automático.",
                },
                {
                  valor: "registro",
                  titulo: "La acepto solo como registro privado",
                  detalle:
                    "Cuenta como trabajo hecho y suma puntos, pero no será elegible para el portafolio.",
                },
                {
                  valor: "descartar",
                  titulo: "La descarto: no representa mi trabajo",
                  detalle:
                    "Cierra el reto sin darla por buena. Descartar con razón también es criterio.",
                },
              ] as const
            ).map((opcion) => (
              <label key={opcion.valor} className="opcion" data-elegida={destino === opcion.valor}>
                <input
                  type="radio"
                  name={`destino-${reto.retoId}`}
                  value={opcion.valor}
                  checked={destino === opcion.valor}
                  onChange={() => setDestino(opcion.valor)}
                />
                <span>
                  <strong>{opcion.titulo}</strong>
                  <span className="opcion__detalle">{opcion.detalle}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <label className="control__etiqueta" htmlFor={idJustificacion}>
            ¿Por qué decides eso? (opcional, pero queda en el registro)
          </label>
          <textarea
            id={idJustificacion}
            className="campo"
            rows={3}
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
          />

          <button
            type="button"
            className="boton boton--principal"
            disabled={ocupado}
            onClick={() => void conAviso(() => acciones.decidirEvidencia(destino, justificacion))}
          >
            Registrar mi decisión y cerrar el reto
          </button>
        </div>
      ) : null}

      {paso === "completado" ? (
        <p role="status" className="nota nota--exito">
          Reto completado. Tu reflexión quedó guardada como privada
          {evidencia?.status === "accepted_for_portfolio"
            ? " y tu evidencia está elegible para el portafolio: te espera en la sección Portafolio para que la cures."
            : " y tu evidencia quedó como registro, sin entrar al portafolio."}
        </p>
      ) : null}

      {/* El aviso vive aquí, junto a los controles, no en la cabecera de la sección.
          Esa fue la lección de DEUDA-EGIA-001. */}
      {aviso ? (
        <p role="alert" className="aviso" data-aviso="reto">
          {aviso}
        </p>
      ) : null}
    </article>
  );
}
