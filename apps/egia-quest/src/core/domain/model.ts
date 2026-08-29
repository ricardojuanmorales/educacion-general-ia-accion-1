import type {
  ActivityResponseId,
  EvidenceId,
  EvidenceKind,
  EvidenceStatus,
  HumanDecisionId,
  HumanDecisionValue,
  ISODateTime,
  MissionId,
  MissionStatus,
  PortfolioItemId,
  ProjectId,
  ProjectStatus,
  ReflectionId,
  ReflectionPrivacyClass,
  TextScale,
} from "./types";

export const CURRENT_SCHEMA_VERSION = "0.8.0-alpha.2" as const;
export type SchemaVersion = typeof CURRENT_SCHEMA_VERSION;

export interface AccessibilityPreferences {
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
  readonly textScale: TextScale;
}

export interface LocalProfile {
  readonly pseudonym: string;
  readonly context?: string;
  readonly accessibility: AccessibilityPreferences;
}

export interface MissionDefinition {
  readonly id: MissionId;
  readonly title: string;
  readonly purpose: string;
  readonly instructions: readonly string[];
  readonly activityKind: "text";
  readonly evidenceKind: Extract<EvidenceKind, "text">;
  readonly optional: boolean;
}

export interface MissionProgress {
  readonly missionId: MissionId;
  readonly status: MissionStatus;
  readonly startedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface ActivityResponse {
  readonly id: ActivityResponseId;
  readonly missionId: MissionId;
  readonly text: string;
  readonly updatedAt: ISODateTime;
}

export interface Evidence {
  readonly id: EvidenceId;
  readonly missionId: MissionId;
  readonly title: string;
  readonly kind: EvidenceKind;
  readonly summary: string;
  readonly status: EvidenceStatus;
  readonly createdAt: ISODateTime;
}

export interface Reflection {
  readonly id: ReflectionId;
  readonly missionId: MissionId;
  readonly text: string;
  readonly privacyClass: ReflectionPrivacyClass;
  readonly selectedForExport: boolean;
  readonly createdAt: ISODateTime;
}

export interface HumanDecision {
  readonly id: HumanDecisionId;
  readonly evidenceId: EvidenceId;
  readonly actor: "human_user";
  readonly value: HumanDecisionValue;
  readonly rationale?: string;
  readonly decidedAt: ISODateTime;
}

export interface PortfolioItem {
  readonly id: PortfolioItemId;
  readonly evidenceId: EvidenceId;
  readonly title: string;
  readonly order: number;
  readonly includedAt: ISODateTime;
}

export interface Portfolio {
  readonly items: readonly PortfolioItem[];
}

export interface FeatureFlags {
  readonly facilitatorView: false;
  readonly groupDashboard: false;
  readonly embeddedAI: false;
  readonly cloudSync: false;
  readonly analytics: false;
  readonly autoPublish: false;
  readonly realData: false;
}

export interface CreativeProject {
  readonly schemaVersion: SchemaVersion;
  readonly id: ProjectId;
  readonly title: string;
  readonly status: ProjectStatus;
  readonly profile: LocalProfile;
  readonly missions: readonly MissionProgress[];
  readonly activityResponses: readonly ActivityResponse[];
  readonly evidence: readonly Evidence[];
  readonly reflections: readonly Reflection[];
  readonly decisions: readonly HumanDecision[];
  readonly portfolio: Portfolio;
  readonly featureFlags: FeatureFlags;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface ExportPackage {
  readonly exportType: "storylab_project";
  readonly schemaVersion: SchemaVersion;
  readonly exportedAt: ISODateTime;
  readonly project: CreativeProject;
}

export interface ImportCandidate {
  readonly source: "storylab" | "legacy_v0_3";
  readonly sourceSchemaVersion: string;
  readonly payload: unknown;
}
