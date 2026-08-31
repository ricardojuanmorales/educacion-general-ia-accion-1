// Cálculo del progreso que alimenta el tablero.
//
// Los umbrales de nivel vienen del MVP v0.1A y están pendientes de recalibrar
// (DEUDA-EGIA-011): con 270 puntos en el catálogo de retos y Q6 en 140, se llega al último
// nivel a mitad del recorrido. El tablero lo declara en pantalla en vez de disimularlo.

import type { CreativeProject } from "../../core/domain/model";
import { nivelPorPuntos, type Familia, type NivelQ, type RetoMetadata } from "./reto";
import { puntosDeDilemas, type Dilema, type EstadoDilemas } from "./dilema";

export interface DeudaPedagogica {
  readonly retoId: string;
  readonly titulo: string;
  readonly motivo: string;
}

export interface Progreso {
  readonly puntos: number;
  readonly puntosDeRetos: number;
  readonly puntosDeDilemas: number;
  readonly nivel: NivelQ;
  readonly etiquetaNivel: string;
  readonly retosCompletados: readonly string[];
  readonly retosEnCurso: readonly string[];
  readonly dilemasResueltos: number;
  readonly competencias: ReadonlyArray<{ familia: Familia; evidencias: number }>;
  readonly deudaPedagogica: readonly DeudaPedagogica[];
  readonly umbralesProvisionales: true;
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

  const puntosDil = puntosDeDilemas(dilemas, estadoDilemas);
  const puntos = puntosRetos + puntosDil;
  const nivel = nivelPorPuntos(puntos);

  return {
    puntos,
    puntosDeRetos: puntosRetos,
    puntosDeDilemas: puntosDil,
    nivel: nivel.nivel,
    etiquetaNivel: nivel.etiqueta,
    retosCompletados: completados,
    retosEnCurso: enCurso,
    dilemasResueltos: estadoDilemas.resoluciones.length,
    competencias: [...porFamilia.entries()]
      .map(([familia, evidencias]) => ({ familia, evidencias }))
      .sort((a, b) => b.evidencias - a.evidencias),
    deudaPedagogica: deuda,
    umbralesProvisionales: true,
  };
}
