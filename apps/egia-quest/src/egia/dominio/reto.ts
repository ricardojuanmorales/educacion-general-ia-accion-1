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

/** Nombre de cada nivel. Antes eran umbrales de puntos; ahora solo etiquetan el tramo. */
export const ETIQUETA_NIVEL: Readonly<Record<NivelQ, string>> = {
  Q0: "Activación responsable",
  Q1: "Práctica situada",
  Q2: "Producción documentada",
  Q3: "Accesibilidad aplicada",
  Q4: "Juicio ético",
  Q5: "Integración caleidoscópica",
  Q6: "Transferencia portable",
};

/**
 * El nivel es recorrido, no moneda (DEC-EGIA-044).
 *
 * Regla: subes a Qn cuando tienes al menos un reto completado en cada nivel desde Q1 hasta Qn.
 * Q0 es el suelo: se empieza ahí.
 *
 * La forma literal del Esquema C —«el nivel del reto más alto completado»— se descartó porque
 * el grafo de prerrequisitos NO protege el orden, contra lo que se afirmó al proponerlo:
 * EGIA-R-010 es de Q4 y solo exige dos retos de Q0, y EGIA-R-015 (Q6) se alcanza por un camino
 * de seis retos que nunca toca Q2, Q3 ni Q4. Sin la exigencia de cadena, alguien sería «Q6
 * Transferencia portable» sin haber hecho accesibilidad ni juicio ético.
 *
 * La cadena es además robusta al reparto irregular de retos por nivel (DEUDA-EGIA-027): pide
 * uno de cada tramo, no todos, así que el único reto de Q3 y los cuatro de Q5 pesan igual como
 * puerta.
 */
export function nivelPorRecorrido(
  retosCompletados: readonly string[],
  retos: readonly RetoMetadata[],
): NivelQ {
  const completados = new Set(retosCompletados);
  const hayEnNivel = (n: NivelQ) =>
    retos.some((r) => r.nivel === n && completados.has(r.retoId));

  let alcanzado: NivelQ = "Q0";
  for (const nivel of NIVELES_Q.slice(1)) {
    if (!hayEnNivel(nivel)) break;
    alcanzado = nivel;
  }
  return alcanzado;
}

/** El nivel inmediatamente superior, o `null` si ya se está en Q6. */
export function nivelSiguiente(nivel: NivelQ): NivelQ | null {
  const i = NIVELES_Q.indexOf(nivel);
  return NIVELES_Q[i + 1] ?? null;
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
