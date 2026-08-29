// Cargador del catálogo de retos: convierte el contenido validado en Fase 1
// en definiciones de misión que el motor heredado entiende, más la carga
// pedagógica que el motor no conoce.
//
// El JSON de origen ya pasó `npm run validate:content` en el Gate 1. Este cargador
// no repite esa validación: comprueba las invariantes que importan en tiempo de
// ejecución y falla de forma explícita si el contenido y el código se desincronizan.

import type { MissionDefinition } from "../../core/domain/model";
import type { MissionId } from "../../core/domain/types";
import {
  ANDAMIAJE_POR_NIVEL,
  VERBO_POR_NIVEL,
  esFamilia,
  esNivelQ,
  type Andamiaje,
  type Familia,
  type NivelQ,
  type RetoMetadata,
  type Sensibilidad,
  type Verbo,
} from "../dominio/reto";

export class ErrorDeContenido extends Error {
  constructor(
    message: string,
    readonly retoId?: string,
  ) {
    super(message);
    this.name = "ErrorDeContenido";
  }
}

export interface CatalogoDeRetos {
  readonly definiciones: readonly MissionDefinition[];
  readonly metadatos: ReadonlyMap<MissionId, RetoMetadata>;
  readonly porReto: ReadonlyMap<string, RetoMetadata>;
}

interface RetoCrudo {
  id?: unknown;
  titulo?: unknown;
  practica_guia?: unknown;
  nivel?: unknown;
  verbo?: unknown;
  desempeno_esperado?: unknown;
  competencias?: unknown;
  consigna?: unknown;
  evidencia_minima?: unknown;
  tipo_evidencia?: unknown;
  sensibilidad?: unknown;
  reflexion?: unknown;
  criterio_etico?: unknown;
  accesibilidad?: unknown;
  cuando_no_usar_ia?: unknown;
  andamiaje?: unknown;
  plantilla?: unknown;
  checklist?: unknown;
  prerrequisitos?: unknown;
  puntos_base?: unknown;
  badge_posible?: unknown;
}

function texto(valor: unknown, campo: string, retoId?: string): string {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new ErrorDeContenido(`El campo «${campo}» falta o está vacío`, retoId);
  }
  return valor;
}

/** El id de reto EGIA-R-NNN se convierte en MissionId sin perder trazabilidad. */
export function missionIdDeReto(retoId: string): MissionId {
  return `reto-${retoId.toLowerCase()}` as MissionId;
}

export function cargarRetos(datos: unknown): CatalogoDeRetos {
  if (typeof datos !== "object" || datos === null || !Array.isArray((datos as { retos?: unknown }).retos)) {
    throw new ErrorDeContenido("El catálogo no tiene una lista de retos");
  }

  const crudos = (datos as { retos: RetoCrudo[] }).retos;
  const definiciones: MissionDefinition[] = [];
  const metadatos = new Map<MissionId, RetoMetadata>();
  const porReto = new Map<string, RetoMetadata>();

  for (const crudo of crudos) {
    const retoId = texto(crudo.id, "id");

    if (porReto.has(retoId)) {
      throw new ErrorDeContenido("Identificador de reto repetido", retoId);
    }

    const nivel = crudo.nivel;
    if (!esNivelQ(nivel)) {
      throw new ErrorDeContenido(`Nivel desconocido: ${String(nivel)}`, retoId);
    }

    const verbo = crudo.verbo as Verbo;
    if (VERBO_POR_NIVEL[nivel] !== verbo) {
      throw new ErrorDeContenido(
        `El nivel ${nivel} corresponde al verbo «${VERBO_POR_NIVEL[nivel]}», pero el reto declara «${String(verbo)}»`,
        retoId,
      );
    }

    const andamiaje = crudo.andamiaje as Andamiaje;
    if (ANDAMIAJE_POR_NIVEL[nivel] !== andamiaje) {
      throw new ErrorDeContenido(
        `El nivel ${nivel} corresponde al andamiaje «${ANDAMIAJE_POR_NIVEL[nivel]}», pero el reto declara «${String(andamiaje)}»`,
        retoId,
      );
    }

    const competencias = Array.isArray(crudo.competencias) ? crudo.competencias : [];
    if (competencias.length === 0) {
      throw new ErrorDeContenido("El reto no declara ninguna competencia", retoId);
    }
    for (const c of competencias) {
      if (!esFamilia(c)) {
        throw new ErrorDeContenido(`Competencia fuera de las diez familias canónicas: ${String(c)}`, retoId);
      }
    }

    const apoyo: readonly string[] =
      andamiaje === "plantilla"
        ? (crudo.plantilla as string[] | undefined) ?? []
        : andamiaje === "checklist"
          ? (crudo.checklist as string[] | undefined) ?? []
          : [];

    if (andamiaje !== "criterio" && apoyo.length === 0) {
      throw new ErrorDeContenido(`El andamiaje «${andamiaje}» exige sus campos de apoyo`, retoId);
    }

    const cuandoNoUsarIa = texto(crudo.cuando_no_usar_ia, "cuando_no_usar_ia", retoId);

    const missionId = missionIdDeReto(retoId);
    const titulo = texto(crudo.titulo, "titulo", retoId);
    const consigna = texto(crudo.consigna, "consigna", retoId);

    // Las instrucciones de la misión son el apoyo del andamiaje. En Q5 y Q6 no hay
    // apoyo, así que la instrucción es la evidencia exigida: solo el criterio.
    const instrucciones =
      apoyo.length > 0 ? apoyo : [texto(crudo.evidencia_minima, "evidencia_minima", retoId)];

    definiciones.push({
      id: missionId,
      title: `${retoId} · ${titulo}`,
      purpose: consigna,
      instructions: instrucciones,
      activityKind: "text",
      evidenceKind: "text",
      optional: false,
    });

    const meta: RetoMetadata = {
      missionId,
      retoId,
      practicaGuia: typeof crudo.practica_guia === "number" ? crudo.practica_guia : null,
      nivel: nivel as NivelQ,
      verbo,
      desempenoEsperado: crudo.desempeno_esperado as 1 | 2 | 3 | 4,
      competencias: competencias as readonly Familia[],
      evidenciaMinima: texto(crudo.evidencia_minima, "evidencia_minima", retoId),
      tipoEvidencia: texto(crudo.tipo_evidencia, "tipo_evidencia", retoId),
      sensibilidad: crudo.sensibilidad as Sensibilidad,
      preguntaReflexion: texto(crudo.reflexion, "reflexion", retoId),
      criterioEtico: texto(crudo.criterio_etico, "criterio_etico", retoId),
      accesibilidad: texto(crudo.accesibilidad, "accesibilidad", retoId),
      cuandoNoUsarIa,
      andamiaje,
      apoyo,
      prerrequisitos: Array.isArray(crudo.prerrequisitos) ? (crudo.prerrequisitos as string[]) : [],
      puntosBase: typeof crudo.puntos_base === "number" ? crudo.puntos_base : 0,
      badgePosible: typeof crudo.badge_posible === "string" ? crudo.badge_posible : null,
    };

    metadatos.set(missionId, meta);
    porReto.set(retoId, meta);
  }

  // Los prerrequisitos tienen que existir y no pueden apuntar hacia arriba.
  const orden = ["Q0", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6"];
  for (const meta of porReto.values()) {
    for (const p of meta.prerrequisitos) {
      const previo = porReto.get(p);
      if (!previo) {
        throw new ErrorDeContenido(`Declara el prerrequisito ${p}, que no existe`, meta.retoId);
      }
      if (orden.indexOf(previo.nivel) > orden.indexOf(meta.nivel)) {
        throw new ErrorDeContenido(
          `Depende de ${p}, que está en un nivel superior (${previo.nivel} > ${meta.nivel})`,
          meta.retoId,
        );
      }
    }
  }

  return { definiciones, metadatos, porReto };
}
