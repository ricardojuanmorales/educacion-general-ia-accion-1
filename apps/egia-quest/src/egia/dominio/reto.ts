// Tipos propios de EGIA Quest. Extienden el núcleo copiado sin tocarlo (DEC-EGIA-024).
//
// Hallazgo de la rebanada vertical: `MissionDefinition` del núcleo es deliberadamente
// mínima (id, título, propósito, instrucciones, tipo de actividad y de evidencia). Un reto
// de EGIA Quest lleva además nivel, verbo, competencias, criterio ético, acción de
// accesibilidad, «cuándo no usar IA», andamiaje, prerrequisitos y puntos.
//
// Por eso DEC-EGIA-023 se cumple en dos piezas: el reto SE EJECUTA como misión en el motor
// heredado, y su carga pedagógica vive aquí, en `RetoMetadata`, indexada por MissionId. El
// núcleo mueve el ciclo; EGIA aporta el sentido.

import type { MissionId } from "../../core/domain/types";

export const NIVELES_Q = ["Q0", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6"] as const;
export type NivelQ = (typeof NIVELES_Q)[number];

export const VERBOS = [
  "reconocer",
  "explorar",
  "crear",
  "documentar",
  "evaluar",
  "reflexionar",
  "transferir",
] as const;
export type Verbo = (typeof VERBOS)[number];

/** Verbo dominante de cada nivel, según el Marco de Competencias v0.1 (DEC-EGIA-034). */
export const VERBO_POR_NIVEL: Readonly<Record<NivelQ, Verbo>> = {
  Q0: "reconocer",
  Q1: "explorar",
  Q2: "crear",
  Q3: "documentar",
  Q4: "evaluar",
  Q5: "reflexionar",
  Q6: "transferir",
};

export const FAMILIAS = [
  "agencia_humana",
  "aprendizaje_ludico",
  "investigacion_creacion",
  "literacidad_ia",
  "etica_responsabilidad",
  "diseno_universal",
  "conocimiento_situado",
  "colaboracion_transdisciplinaria",
  "reflexion_portafolio",
  "evaluacion_criterio",
] as const;
export type Familia = (typeof FAMILIAS)[number];

export const ANDAMIAJES = ["plantilla", "checklist", "criterio"] as const;
export type Andamiaje = (typeof ANDAMIAJES)[number];

/** Andamiaje que corresponde a cada nivel. El apoyo se desvanece; la exigencia no. */
export const ANDAMIAJE_POR_NIVEL: Readonly<Record<NivelQ, Andamiaje>> = {
  Q0: "plantilla",
  Q1: "plantilla",
  Q2: "checklist",
  Q3: "checklist",
  Q4: "checklist",
  Q5: "criterio",
  Q6: "criterio",
};

export const SENSIBILIDADES = ["media", "media-alta", "alta", "variable"] as const;
export type Sensibilidad = (typeof SENSIBILIDADES)[number];

/**
 * Carga pedagógica de un reto. Lo que el núcleo no sabe y EGIA Quest necesita.
 */
export interface RetoMetadata {
  readonly missionId: MissionId;
  readonly retoId: string;
  readonly practicaGuia: number | null;
  readonly nivel: NivelQ;
  readonly verbo: Verbo;
  readonly desempenoEsperado: 1 | 2 | 3 | 4;
  readonly competencias: readonly Familia[];
  readonly evidenciaMinima: string;
  readonly tipoEvidencia: string;
  readonly sensibilidad: Sensibilidad;
  readonly preguntaReflexion: string;
  readonly criterioEtico: string;
  readonly accesibilidad: string;
  /** Campo obligatorio propio de EGIA Quest: la abstención razonada. */
  readonly cuandoNoUsarIa: string;
  readonly andamiaje: Andamiaje;
  readonly apoyo: readonly string[];
  readonly prerrequisitos: readonly string[];
  readonly puntosBase: number;
  readonly badgePosible: string | null;
}

/** Niveles Q por puntos acumulados. Umbrales heredados del MVP v0.1A. */
export const UMBRALES_NIVEL: ReadonlyArray<{ nivel: NivelQ; puntosMinimos: number; etiqueta: string }> = [
  { nivel: "Q0", puntosMinimos: 0, etiqueta: "Activación responsable" },
  { nivel: "Q1", puntosMinimos: 10, etiqueta: "Práctica situada" },
  { nivel: "Q2", puntosMinimos: 30, etiqueta: "Producción documentada" },
  { nivel: "Q3", puntosMinimos: 50, etiqueta: "Accesibilidad aplicada" },
  { nivel: "Q4", puntosMinimos: 75, etiqueta: "Juicio ético" },
  { nivel: "Q5", puntosMinimos: 105, etiqueta: "Integración caleidoscópica" },
  { nivel: "Q6", puntosMinimos: 140, etiqueta: "Transferencia portable" },
];

export function nivelPorPuntos(puntos: number): { nivel: NivelQ; etiqueta: string } {
  const alcanzado = [...UMBRALES_NIVEL].reverse().find((u) => puntos >= u.puntosMinimos);
  const elegido = alcanzado ?? UMBRALES_NIVEL[0]!;
  return { nivel: elegido.nivel, etiqueta: elegido.etiqueta };
}

export function prerrequisitosCumplidos(
  reto: RetoMetadata,
  retosCompletados: readonly string[],
): boolean {
  return reto.prerrequisitos.every((p) => retosCompletados.includes(p));
}

export function esNivelQ(valor: unknown): valor is NivelQ {
  return typeof valor === "string" && (NIVELES_Q as readonly string[]).includes(valor);
}

export function esFamilia(valor: unknown): valor is Familia {
  return typeof valor === "string" && (FAMILIAS as readonly string[]).includes(valor);
}
