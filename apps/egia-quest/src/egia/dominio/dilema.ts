// Tipos propios de los dilemas éticos. El núcleo heredado no los modela: su ciclo creativo
// cubre misiones, evidencias y reflexiones, no decisiones ramificadas con consecuencia.
//
// Por eso las resoluciones de dilema se guardan en un almacén propio de EGIA Quest, con su
// propia clave de localStorage. Queda declarado como deuda: al integrarse el portafolio con
// el esquema de AI StoryLab habrá que decidir cómo entran ahí (DEUDA-EGIA-021).

export const CALIDADES = ["cuidadosa", "apresurada", "evasiva", "dañina"] as const;
export type Calidad = (typeof CALIDADES)[number];

export const EJES_IBATA = [
  "injusticias_danos",
  "autonomia",
  "transformaciones",
  "accountability",
] as const;
export type EjeIbata = (typeof EJES_IBATA)[number];

export interface OpcionDilema {
  readonly id: "a" | "b" | "c" | "d";
  readonly texto: string;
  readonly calidad: Calidad;
  readonly consecuencia: string;
  readonly reparacion: string | null;
}

export interface Dilema {
  readonly id: string;
  readonly titulo: string;
  readonly nivel: string;
  readonly ejeIbata: EjeIbata;
  readonly practicaRelacionada: number | null;
  readonly competencias: readonly string[];
  readonly sensibilidad: string;
  readonly escenario: string;
  readonly pregunta: string;
  readonly opciones: readonly OpcionDilema[];
  readonly reflexionPosterior: string;
  readonly puntosBase: number;
}

/** Lo que queda registrado cuando alguien resuelve un dilema. */
export interface ResolucionDilema {
  readonly dilemaId: string;
  readonly opcionElegida: "a" | "b" | "c" | "d";
  readonly calidad: Calidad;
  readonly justificacion: string;
  readonly reparacionAceptada: boolean;
  readonly fecha: string;
}

export interface EstadoDilemas {
  readonly resoluciones: readonly ResolucionDilema[];
}

export const ESTADO_DILEMAS_VACIO: EstadoDilemas = { resoluciones: [] };

export function resolucionDe(
  estado: EstadoDilemas,
  dilemaId: string,
): ResolucionDilema | undefined {
  return estado.resoluciones.find((r) => r.dilemaId === dilemaId);
}

/** Los puntos de un dilema no dependen de acertar: dependen de haber decidido y justificado. */
export function puntosDeDilemas(dilemas: readonly Dilema[], estado: EstadoDilemas): number {
  return estado.resoluciones.reduce((suma, r) => {
    const d = dilemas.find((x) => x.id === r.dilemaId);
    return suma + (d?.puntosBase ?? 0);
  }, 0);
}

export function conteoPorCalidad(estado: EstadoDilemas): Record<Calidad, number> {
  const base: Record<Calidad, number> = {
    cuidadosa: 0,
    apresurada: 0,
    evasiva: 0,
    dañina: 0,
  };
  for (const r of estado.resoluciones) base[r.calidad] += 1;
  return base;
}
