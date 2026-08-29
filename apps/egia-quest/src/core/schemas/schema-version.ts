export const PREVIOUS_SCHEMA_VERSION = "0.8.0-alpha.1" as const;
export const CURRENT_SCHEMA_VERSION = "0.8.0-alpha.2" as const;

export const KNOWN_SCHEMA_VERSIONS = [
  PREVIOUS_SCHEMA_VERSION,
  CURRENT_SCHEMA_VERSION,
] as const;

export const SUPPORTED_SCHEMA_VERSIONS = KNOWN_SCHEMA_VERSIONS;

export type KnownSchemaVersion =
  (typeof KNOWN_SCHEMA_VERSIONS)[number];

export type SupportedSchemaVersion = KnownSchemaVersion;

export const isSupportedSchemaVersion = (
  value: string,
): value is SupportedSchemaVersion =>
  (SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(value);

export const isCurrentSchemaVersion = (
  value: string,
): value is typeof CURRENT_SCHEMA_VERSION =>
  value === CURRENT_SCHEMA_VERSION;

export const isPreviousSchemaVersion = (
  value: string,
): value is typeof PREVIOUS_SCHEMA_VERSION =>
  value === PREVIOUS_SCHEMA_VERSION;
