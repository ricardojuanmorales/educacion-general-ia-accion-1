// Cálculo del progreso que alimenta el tablero.
//
// Desde DEC-EGIA-044 el nivel es recorrido, no moneda: se calcula por los retos completados,
// no por puntos acumulados. Los puntos siguen existiendo y siguen sumando, pero como señal de
// cuidado. Esa separación es la que devuelve al nivel su significado: «Q4 · Juicio ético» dice
// que la persona hizo un reto de juicio ético, no que juntó setenta y cinco puntos.

import type { CreativeProject } from "../../core/domain/model";
import {
  ETIQUETA_NIVEL,
  NIVELES_Q,
  nivelPorRecorrido,
  nivelSiguiente,
  type Familia,
  type NivelQ,
  type RetoMetadata,
} from "./reto";
import { puntosDeDilemas, type Dilema, type EstadoDilemas } from "./dilema";

export interface DeudaPedagogica {
  readonly retoId: string;
  readonly titulo: string;
  readonly motivo: string;
}

/** Un peldaño de la escalera de niveles, tal como se dibuja en el tablero. */
export interface PeldanoNivel {
  readonly nivel: NivelQ;
  readonly etiqueta: string;
  readonly completados: number;
  readonly total: number;
  /** Verdadero si este tramo ya cuenta como recorrido: al menos un reto completado. */
  readonly pisado: boolean;
}

export interface Progreso {
  readonly puntos: number;
  readonly puntosDeRetos: number;
  readonly puntosDeDilemas: number;
  readonly nivel: NivelQ;
  readonly etiquetaNivel: string;
  /** El tramo que sigue, y qué retos lo abren. `null` cuando ya se está en Q6. */
  readonly siguiente: {
    readonly nivel: NivelQ;
    readonly etiqueta: string;
    readonly retosQueLoAbren: readonly string[];
  } | null;
  readonly escalera: readonly PeldanoNivel[];
  readonly retosCompletados: readonly string[];
  readonly retosEnCurso: readonly string[];
  readonly dilemasResueltos: number;
  readonly competencias: ReadonlyArray<{ familia: Familia; evidencias: number }>;
  readonly deudaPedagogica: readonly DeudaPedagogica[];
}

/**
 * Un reto está completado cuando el motor lo dice, no cuando la interfaz lo supone.
 *
 * Hasta Fase 3 esta función preguntaba por evidencia y reflexión. El motor heredado exige
 * además la decisión humana registrada sobre la evidencia (DEC-EGIA-042): sin ella la misión
 * se queda en `ready_for_review`. El tablero se alinea con el motor, no al revés.
 */
function retoCompletado(proyecto: CreativeProject, reto: RetoMetadata): boolean {
  const mision = proyecto.missions.find((m) => m.missionId === reto.missionId);
  return mision?.status === "completed";
}

function retoEnCurso(proyecto: CreativeProject, reto: RetoMetadata): boolean {
  const mision = proyecto.missions.find((m) => m.missionId === reto.missionId);
  return Boolean(mision) && !retoCompletado(proyecto, reto);
}

export function calcularProgreso(
  proyecto: CreativeProject | null,
  retos: readonly RetoMetadata[],
  dilemas: readonly Dilema[],
  estadoDilemas: EstadoDilemas,
): Progreso {
  const completados: string[] = [];
  const enCurso: string[] = [];
  const deuda: DeudaPedagogica[] = [];
  const porFamilia = new Map<Familia, number>();
  let puntosRetos = 0;

  if (proyecto) {
    for (const reto of retos) {
      if (retoCompletado(proyecto, reto)) {
        completados.push(reto.retoId);
        puntosRetos += reto.puntosBase;
        for (const f of reto.competencias) {
          porFamilia.set(f, (porFamilia.get(f) ?? 0) + 1);
        }
      } else if (retoEnCurso(proyecto, reto)) {
        enCurso.push(reto.retoId);
        const tieneActividad = proyecto.activityResponses.some(
          (a) => a.missionId === reto.missionId,
        );
        const tieneEvidencia = proyecto.evidence.some((e) => e.missionId === reto.missionId);
        const tieneReflexion = proyecto.reflections.some((r) => r.missionId === reto.missionId);
        deuda.push({
          retoId: reto.retoId,
          titulo: reto.retoId,
          motivo: !tieneActividad
            ? "iniciado, sin trabajo guardado"
            : !tieneEvidencia
              ? "con trabajo, sin evidencia"
              : !tieneReflexion
                ? "con evidencia, sin reflexión"
                : "con reflexión, sin tu decisión sobre la evidencia",
        });
      }
    }
  }

  const nivel = nivelPorRecorrido(completados, retos);
  const hechos = new Set(completados);

  const escalera: PeldanoNivel[] = NIVELES_Q.map((n) => {
    const delNivel = retos.filter((r) => r.nivel === n);
    const hechosAqui = delNivel.filter((r) => hechos.has(r.retoId)).length;
    return {
      nivel: n,
      etiqueta: ETIQUETA_NIVEL[n],
      completados: hechosAqui,
      total: delNivel.length,
      pisado: n === "Q0" ? true : hechosAqui > 0,
    };
  });

  const proximo = nivelSiguiente(nivel);
  const puntosDil = puntosDeDilemas(dilemas, estadoDilemas);

  return {
    puntos: puntosRetos + puntosDil,
    puntosDeRetos: puntosRetos,
    puntosDeDilemas: puntosDil,
    nivel,
    etiquetaNivel: ETIQUETA_NIVEL[nivel],
    siguiente: proximo
      ? {
          nivel: proximo,
          etiqueta: ETIQUETA_NIVEL[proximo],
          // Cualquier reto de ese tramo abre el peldaño: basta uno.
          retosQueLoAbren: retos
            .filter((r) => r.nivel === proximo && !hechos.has(r.retoId))
            .map((r) => r.retoId),
        }
      : null,
    escalera,
    retosCompletados: completados,
    retosEnCurso: enCurso,
    dilemasResueltos: estadoDilemas.resoluciones.length,
    competencias: [...porFamilia.entries()]
      .map(([familia, evidencias]) => ({ familia, evidencias }))
      .sort((a, b) => b.evidencias - a.evidencias),
    deudaPedagogica: deuda,
  };
}
