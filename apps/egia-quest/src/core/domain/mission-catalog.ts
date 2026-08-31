import type { MissionDefinition } from "./model";
import type { MissionId } from "./types";

export const MISSION_CATALOG = [
  {
    id: "mission-intention" as MissionId,
    title: "M1 · Intención creadora",
    purpose:
      "Definir el sentido inicial de la creación sin convertir la exploración en un formulario rígido.",
    instructions: [
      "Describe qué deseas crear y por qué te importa.",
      "Imagina una audiencia o comunidad posible.",
      "Formula una premisa breve que pueda cambiar durante el proceso.",
      "Nombra límites éticos, creativos o técnicos que quieras respetar.",
    ],
    activityKind: "text",
    evidenceKind: "text",
    optional: false,
  },
  {
    id: "mission-architecture" as MissionId,
    title: "M2 · Arquitectura narrativa",
    purpose:
      "Organizar personajes, mundo, conflicto y estructura mediante un recorrido revisable.",
    instructions: [
      "Explora quién participa en la historia.",
      "Describe el mundo y sus reglas.",
      "Identifica tensiones o preguntas centrales.",
      "Ensaya una estructura que pueda reordenarse.",
    ],
    activityKind: "text",
    evidenceKind: "text",
    optional: false,
  },
  {
    id: "mission-production" as MissionId,
    title: "M3 · Producción multimodal",
    purpose:
      "Producir y documentar evidencias creativas conservando autoría, proceso y contexto.",
    instructions: [
      "Selecciona una forma de producción apropiada.",
      "Documenta decisiones y transformaciones.",
      "Conserva borradores que aporten al proceso.",
      "Distingue creación, evidencia y publicación.",
    ],
    activityKind: "text",
    evidenceKind: "text",
    optional: false,
  },
  {
    id: "mission-curation" as MissionId,
    title: "M4 · Curaduría y cierre",
    purpose:
      "Revisar, reflexionar y decidir qué representa mejor el proceso creativo.",
    instructions: [
      "Revisa evidencias y borradores.",
      "Reflexiona sin obligación de revelar información personal.",
      "Selecciona o retira elementos del portafolio.",
      "Prepara el cierre y la exportación mediante confirmación humana.",
    ],
    activityKind: "text",
    evidenceKind: "text",
    optional: false,
  },
] as const satisfies readonly MissionDefinition[];

export const M1_INTENTION_DEFINITION = MISSION_CATALOG[0];
