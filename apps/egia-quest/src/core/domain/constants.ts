export const PROJECT_STATUSES = [
  "new",
  "active",
  "review",
  "completed",
  "archived",
] as const;

export const MISSION_STATUSES = [
  "not_started",
  "in_progress",
  "ready_for_review",
  "completed",
  "reopened",
] as const;

export const EVIDENCE_STATUSES = [
  "draft",
  "reviewed",
  "accepted_for_portfolio",
  "removed",
] as const;

export const PRIVACY_CLASSES = [
  "private",
  "shareable_with_purpose",
  "exportable_after_review",
  "institutional_public",
  "high_care",
] as const;

export const REFLECTION_PRIVACY_CLASSES = [
  "private",
  "shareable_with_purpose",
  "exportable_after_review",
  "high_care",
] as const;

export const HUMAN_DECISION_VALUES = [
  "accept",
  "revise",
  "reject",
  "defer",
] as const;

export const EVIDENCE_KINDS = [
  "text",
  "image_metadata",
  "audio_metadata",
  "video_metadata",
  "link_metadata",
] as const;

export const TEXT_SCALES = [
  "default",
  "large",
  "extra_large",
] as const;

export const FEATURE_FLAG_KEYS = [
  "facilitatorView",
  "groupDashboard",
  "embeddedAI",
  "cloudSync",
  "analytics",
  "autoPublish",
  "realData",
] as const;

export const DOMAIN_LIMITS = Object.freeze({
  profilePseudonym: 80,
  profileContext: 120,
  projectTitle: 120,
} as const);
