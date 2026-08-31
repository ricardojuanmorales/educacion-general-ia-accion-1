// Pantalla de un reto. Interfaz propia de EGIA Quest sobre el motor heredado.
//
// Dos lecciones del monolito v0.1A, pagadas caro, quedan aquí como reglas de diseño:
//   1. Un botón desactivado tiene que verse desactivado (DEUDA-EGIA-001, primera parte).
//   2. El aviso de validación aparece junto al control que lo provocó, nunca en la
//      cabecera de la sección (DEUDA-EGIA-001, segunda parte).
//
// Y una tercera, heredada del núcleo y afirmada en las pruebas: el orden es
// trabajo → evidencia → reflexión. La interfaz lo muestra como pasos, no lo oculta.

import { useId, useRef, useState } from "react";

import type { CreativeProject, MissionDefinition } from "../../core/domain/model";
import type { MissionStatus } from "../../core/domain/types";
import type { RetoMetadata } from "../dominio/reto";

export type PasoReto = "sin_iniciar" | "actividad" | "evidencia" | "reflexion" | "completado";

export interface AccionesReto {
  iniciar: () => Promise<void>;
  guardarActividad: (texto: string) => Promise<void>;
  crearEvidencia: (resumen: string) => Promise<void>;
  guardarReflexion: (texto: string) => Promise<void>;
}

export interface PantallaRetoProps {
  readonly reto: RetoMetadata;
  /** La definición que ejecuta el motor. Junto con `reto`, las dos mitades de DEC-EGIA-023. */
  readonly definicion: MissionDefinition;
  readonly proyecto: CreativeProject | null;
  readonly acciones: AccionesReto;
  readonly retosCompletados: readonly string[];
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
  return "completado";
}

const ETIQUETA_PASO: Readonly<Record<PasoReto, string>> = {
  sin_iniciar: "sin iniciar",
  actividad: "paso 1 de 3 · tu trabajo",
  evidencia: "paso 2 de 3 · tu evidencia",
  reflexion: "paso 3 de 3 · tu reflexión",
  completado: "completado",
};

export function PantallaReto({
  reto,
  definicion,
  proyecto,
  acciones,
  retosCompletados,
}: PantallaRetoProps) {
  const paso = pasoActual(reto, proyecto);
  const bloqueado = reto.prerrequisitos.some((p) => !retosCompletados.includes(p));

  const [actividad, setActividad] = useState("");
  const [evidencia, setEvidencia] = useState("");
  const [reflexion, setReflexion] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const idActividad = useId();
  const idEvidencia = useId();
  const idReflexion = useId();
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

  return (
    <article aria-labelledby={`${reto.retoId}-titulo`} data-paso={paso} data-reto={reto.retoId}>
      <p>
        <span>{ETIQUETA_PASO[paso]}</span>
        {" · "}
        <span>
          Nivel {reto.nivel} · {reto.verbo}
        </span>
      </p>

      <h2 id={`${reto.retoId}-titulo`}>{definicion.title}</h2>

      {/* El propósito de la misión ES la consigna del reto: la costura entre el motor
          heredado y el contenido pedagógico de EGIA Quest. */}
      <p data-campo="consigna">{definicion.purpose}</p>

      {reto.apoyo.length > 0 ? (
        <section aria-label={reto.andamiaje === "plantilla" ? "Plantilla" : "Checklist"}>
          <h3>{reto.andamiaje === "plantilla" ? "Rellena esto" : "Comprueba esto"}</h3>
          <ul>
            {definicion.instructions.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <dl>
        <dt>Evidencia mínima</dt>
        <dd>{reto.evidenciaMinima}</dd>
        <dt>Criterio ético</dt>
        <dd>{reto.criterioEtico}</dd>
        <dt>Accesibilidad</dt>
        <dd>{reto.accesibilidad}</dd>
        <dt>Cuándo no usar IA</dt>
        <dd data-campo="cuando-no-usar">{reto.cuandoNoUsarIa}</dd>
      </dl>

      {bloqueado ? (
        <p role="note">
          Este reto se abre cuando completes: {reto.prerrequisitos.join(", ")}.
        </p>
      ) : null}

      {paso === "sin_iniciar" ? (
        <div>
          <p>Pulsa «Iniciar» para abrir el espacio de trabajo, evidencia y reflexión.</p>
          <button
            type="button"
            disabled={bloqueado || ocupado}
            onClick={() => void conAviso(acciones.iniciar)}
          >
            Iniciar
          </button>
        </div>
      ) : null}

      {paso === "actividad" ? (
        <div>
          <label htmlFor={idActividad}>Tu trabajo: ¿qué hiciste?</label>
          <textarea
            id={idActividad}
            value={actividad}
            onChange={(e) => {
              setActividad(e.target.value);
              if (aviso) setAviso(null);
            }}
          />
          <button
            type="button"
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
        <div>
          <label htmlFor={idEvidencia}>Tu evidencia: {reto.evidenciaMinima}</label>
          <textarea
            id={idEvidencia}
            value={evidencia}
            onChange={(e) => {
              setEvidencia(e.target.value);
              if (aviso) setAviso(null);
            }}
          />
          <button
            type="button"
            disabled={ocupado}
            onClick={() => {
              if (evidencia.trim().length === 0) {
                setAviso("Describe o enlaza tu evidencia antes de continuar.");
                return;
              }
              void conAviso(() => acciones.crearEvidencia(evidencia));
            }}
          >
            Guardar evidencia
          </button>
        </div>
      ) : null}

      {paso === "reflexion" ? (
        <div>
          <label htmlFor={idReflexion}>{reto.preguntaReflexion}</label>
          <textarea
            id={idReflexion}
            ref={campoReflexion}
            value={reflexion}
            onChange={(e) => {
              setReflexion(e.target.value);
              if (aviso && e.target.value.trim().length >= MINIMO_REFLEXION) setAviso(null);
            }}
          />
          <p>Tu reflexión se guarda como privada. Nada se exporta sin que tú lo decidas.</p>
          <button
            type="button"
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
            Completar con reflexión
          </button>
        </div>
      ) : null}

      {paso === "completado" ? (
        <p role="status">
          Reto completado. Tu reflexión quedó guardada como privada y la evidencia espera tu
          decisión para entrar al portafolio.
        </p>
      ) : null}

      {/* El aviso vive aquí, junto a los controles, no en la cabecera de la sección.
          Esa fue la lección de DEUDA-EGIA-001. */}
      {aviso ? (
        <p role="alert" data-aviso="reto">
          {aviso}
        </p>
      ) : null}
    </article>
  );
}
