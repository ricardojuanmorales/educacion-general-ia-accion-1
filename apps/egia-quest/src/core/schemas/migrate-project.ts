import type { DomainError } from "../domain/errors";
import type { CreativeProject } from "../domain/model";
import { err, ok, type Result } from "../domain/result";
import {
  validateHistoricalProjectAlpha1Snapshot,
  validateProjectSnapshot,
} from "./runtime-validators";
import {
  CURRENT_SCHEMA_VERSION,
  PREVIOUS_SCHEMA_VERSION,
} from "./schema-version";

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const migrationError = (
  code: DomainError["code"],
  path: string,
  safeMessage: string,
  details?: Readonly<Record<string, unknown>>,
): DomainError => {
  const base = { code, path, safeMessage };
  return details === undefined ? base : { ...base, details };
};

const isLegacyCandidate = (input: unknown): boolean =>
  isRecord(input) && input.source === "legacy_v0_3";

const declaredSchemaVersion = (input: unknown): string | null =>
  isRecord(input) && typeof input.schemaVersion === "string"
    ? input.schemaVersion
    : null;

export const migrateAlpha1ToAlpha2 = (
  input: unknown,
): Result<CreativeProject, DomainError> => {
  const source = validateHistoricalProjectAlpha1Snapshot(input);
  if (!source.ok) return err(source.error);

  const candidate: CreativeProject = {
    ...structuredClone(source.value),
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };

  const target = validateProjectSnapshot(candidate);
  if (!target.ok) return err(target.error);

  return ok(target.value);
};

export const migrateProjectToCurrent = (
  input: unknown,
): Result<CreativeProject, DomainError> => {
  if (isLegacyCandidate(input)) {
    return err(
      migrationError(
        "LEGACY_MIGRATION_REQUIRED",
        "migration.source",
        "La versión legacy requiere un proceso de migración separado.",
      ),
    );
  }

  const version = declaredSchemaVersion(input);
  if (version === null) {
    return err(
      migrationError(
        "PERSISTENCE_DATA_CORRUPTED",
        "migration.source.schemaVersion",
        "No se puede determinar la versión del proyecto fuente.",
      ),
    );
  }

  if (version === CURRENT_SCHEMA_VERSION) {
    return validateProjectSnapshot(input);
  }

  if (version === PREVIOUS_SCHEMA_VERSION) {
    return migrateAlpha1ToAlpha2(input);
  }

  return err(
    migrationError(
      "SCHEMA_VERSION_UNSUPPORTED",
      "migration.source.schemaVersion",
      "La versión del proyecto no es compatible.",
      {
        received: version,
        current: CURRENT_SCHEMA_VERSION,
        supportedPrevious: PREVIOUS_SCHEMA_VERSION,
      },
    ),
  );
};
