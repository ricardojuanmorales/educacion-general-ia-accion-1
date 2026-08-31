import { DOMAIN_LIMITS, REFLECTION_PRIVACY_CLASSES } from "./constants";
import type { DomainError } from "./errors";
import {
  CURRENT_SCHEMA_VERSION,
  type CreativeProject,
  type HumanDecision,
} from "./model";
import type { MissionStatus } from "./types";

const transitionMap: Readonly<Record<MissionStatus, readonly MissionStatus[]>> = {
  not_started: ["in_progress"],
  in_progress: ["ready_for_review"],
  ready_for_review: ["completed", "in_progress"],
  completed: ["reopened"],
  reopened: ["in_progress", "ready_for_review"],
};

const error = (
  code: DomainError["code"],
  path: string,
  safeMessage: string,
  details?: Readonly<Record<string, unknown>>,
): DomainError => {
  const base = { code, path, safeMessage };
  return details === undefined ? base : { ...base, details };
};

export const canTransitionMission = (
  from: MissionStatus,
  to: MissionStatus,
): boolean => transitionMap[from].includes(to);

export const validateMissionTransition = (
  from: MissionStatus,
  to: MissionStatus,
): readonly DomainError[] =>
  canTransitionMission(from, to)
    ? []
    : [
        error(
          "INVALID_STATE_TRANSITION",
          "mission.status",
          "La transición solicitada no está permitida.",
          { from, to },
        ),
      ];

const acceptedEvidenceIds = (
  decisions: readonly HumanDecision[],
): ReadonlySet<string> =>
  new Set(
    decisions
      .filter(
        (decision) =>
          decision.actor === "human_user" && decision.value === "accept",
      )
      .map((decision) => decision.evidenceId as string),
  );

export const validateProjectInvariants = (
  project: CreativeProject,
): readonly DomainError[] => {
  const errors: DomainError[] = [];
  const pseudonym = project.profile.pseudonym;

  if (pseudonym.trim().length === 0) {
    errors.push(
      error(
        "PROFILE_PSEUDONYM_REQUIRED",
        "profile.pseudonym",
        "Se requiere un seudónimo local.",
      ),
    );
  } else if (pseudonym.length > DOMAIN_LIMITS.profilePseudonym) {
    errors.push(
      error(
        "PROFILE_PSEUDONYM_TOO_LONG",
        "profile.pseudonym",
        "El seudónimo excede el límite permitido.",
        { maxLength: DOMAIN_LIMITS.profilePseudonym },
      ),
    );
  }

  if (
    (project.profile.context?.length ?? 0) > DOMAIN_LIMITS.profileContext
  ) {
    errors.push(
      error(
        "PROFILE_CONTEXT_TOO_LONG",
        "profile.context",
        "El contexto excede el límite permitido.",
        { maxLength: DOMAIN_LIMITS.profileContext },
      ),
    );
  }

  const title = project.title;
  if (title.trim().length === 0) {
    errors.push(
      error(
        "PROJECT_TITLE_REQUIRED",
        "title",
        "Se requiere un título de proyecto.",
      ),
    );
  } else if (title.length > DOMAIN_LIMITS.projectTitle) {
    errors.push(
      error(
        "PROJECT_TITLE_TOO_LONG",
        "title",
        "El título excede el límite permitido.",
        { maxLength: DOMAIN_LIMITS.projectTitle },
      ),
    );
  }

  if (project.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    errors.push(
      error(
        "SCHEMA_VERSION_UNSUPPORTED",
        "schemaVersion",
        "La versión del paquete no es compatible.",
        { received: project.schemaVersion, expected: CURRENT_SCHEMA_VERSION },
      ),
    );
  }

  const identifiers = [
    project.id as string,
    ...project.missions.map((item) => item.missionId as string),
    ...project.activityResponses.map((item) => item.id as string),
    ...project.evidence.map((item) => item.id as string),
    ...project.reflections.map((item) => item.id as string),
    ...project.decisions.map((item) => item.id as string),
    ...project.portfolio.items.map((item) => item.id as string),
  ];
  if (new Set(identifiers).size !== identifiers.length) {
    errors.push(
      error(
        "DUPLICATE_IDENTIFIER",
        "$",
        "El proyecto contiene identificadores duplicados.",
      ),
    );
  }

  const missionIds = new Set(
    project.missions.map((item) => item.missionId as string),
  );
  const evidenceIds = new Set(
    project.evidence.map((item) => item.id as string),
  );
  const accepted = acceptedEvidenceIds(project.decisions);
  const portfolioEvidence = new Set<string>();

  project.activityResponses.forEach((response, index) => {
    if (!missionIds.has(response.missionId as string)) {
      errors.push(
        error(
          "MISSION_NOT_FOUND",
          `activityResponses.${index}.missionId`,
          "La actividad no encuentra su misión.",
        ),
      );
    }
  });

  project.evidence.forEach((item, index) => {
    if (!missionIds.has(item.missionId as string)) {
      errors.push(
        error(
          "MISSION_NOT_FOUND",
          `evidence.${index}.missionId`,
          "La evidencia no encuentra su misión.",
        ),
      );
    }
  });

  project.reflections.forEach((reflection, index) => {
    if (!missionIds.has(reflection.missionId as string)) {
      errors.push(
        error(
          "MISSION_NOT_FOUND",
          `reflections.${index}.missionId`,
          "La reflexión no encuentra su misión.",
        ),
      );
    }
    if (
      !(REFLECTION_PRIVACY_CLASSES as readonly string[]).includes(
        reflection.privacyClass as string,
      )
    ) {
      errors.push(
        error(
          "REFLECTION_PRIVACY_INVALID",
          `reflections.${index}.privacyClass`,
          "La privacidad de la reflexión no es válida.",
        ),
      );
    }
    if (reflection.selectedForExport && reflection.privacyClass === "private") {
      errors.push(
        error(
          "EXPORT_SELECTION_REQUIRED",
          `reflections.${index}`,
          "Revise la privacidad antes de exportar la reflexión.",
        ),
      );
    }
  });

  project.decisions.forEach((decision, index) => {
    if (!evidenceIds.has(decision.evidenceId as string)) {
      errors.push(
        error(
          "EVIDENCE_NOT_FOUND",
          `decisions.${index}.evidenceId`,
          "La decisión no encuentra su evidencia.",
        ),
      );
    }
    if (decision.actor !== "human_user") {
      errors.push(
        error(
          "AUTOMATED_DECISION_PROHIBITED",
          `decisions.${index}.actor`,
          "La decisión debe pertenecer a una persona.",
        ),
      );
    }
  });

  project.portfolio.items.forEach((item, index) => {
    const evidenceId = item.evidenceId as string;
    if (!evidenceIds.has(evidenceId)) {
      errors.push(
        error(
          "PORTFOLIO_EVIDENCE_NOT_FOUND",
          `portfolio.items.${index}.evidenceId`,
          "Una entrada de portafolio no encuentra su evidencia.",
        ),
      );
    }
    if (!accepted.has(evidenceId)) {
      errors.push(
        error(
          "HUMAN_DECISION_REQUIRED",
          `portfolio.items.${index}.evidenceId`,
          "La curaduría requiere una decisión humana.",
        ),
      );
    }
    if (portfolioEvidence.has(evidenceId)) {
      errors.push(
        error(
          "PORTFOLIO_DUPLICATE_EVIDENCE",
          `portfolio.items.${index}.evidenceId`,
          "La evidencia ya está en el portafolio.",
        ),
      );
    }
    portfolioEvidence.add(evidenceId);
  });

  const enabledFlag = Object.entries(project.featureFlags).find(
    ([, value]) => value !== false,
  );
  if (enabledFlag) {
    errors.push(
      error(
        "DEFERRED_CAPABILITY_ENABLED",
        `featureFlags.${enabledFlag[0]}`,
        "La capacidad solicitada permanece bloqueada.",
      ),
    );
  }

  const createdAt = Date.parse(project.createdAt);
  const updatedAt = Date.parse(project.updatedAt);
  if (
    !Number.isFinite(createdAt) ||
    !Number.isFinite(updatedAt) ||
    updatedAt < createdAt
  ) {
    errors.push(
      error(
        "TIMESTAMP_ORDER_INVALID",
        "updatedAt",
        "Las fechas del proyecto son inconsistentes.",
      ),
    );
  }

  return errors;
};
