
import type {
  EVIDENCE_KINDS,
  EVIDENCE_STATUSES,
  HUMAN_DECISION_VALUES,
  MISSION_STATUSES,
  PRIVACY_CLASSES,
  PROJECT_STATUSES,
  REFLECTION_PRIVACY_CLASSES,
  TEXT_SCALES,
} from "./constants";

export type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

export type ProjectId = Brand<string, "ProjectId">;
export type MissionId = Brand<string, "MissionId">;
export type ActivityResponseId = Brand<string, "ActivityResponseId">;
export type EvidenceId = Brand<string, "EvidenceId">;
export type ReflectionId = Brand<string, "ReflectionId">;
export type HumanDecisionId = Brand<string, "HumanDecisionId">;
export type PortfolioItemId = Brand<string, "PortfolioItemId">;
export type ISODateTime = Brand<string, "ISODateTime">;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type MissionStatus = (typeof MISSION_STATUSES)[number];
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export type PrivacyClass = (typeof PRIVACY_CLASSES)[number];
export type ReflectionPrivacyClass =
  (typeof REFLECTION_PRIVACY_CLASSES)[number];
export type HumanDecisionValue = (typeof HUMAN_DECISION_VALUES)[number];
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];
export type TextScale = (typeof TEXT_SCALES)[number];
