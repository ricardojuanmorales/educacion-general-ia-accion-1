
import type { ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { DomainError } from "../domain/errors";
import {
  CURRENT_SCHEMA_VERSION,
  type CreativeProject,
} from "../domain/model";
import { err, ok, type Result } from "../domain/result";
import type { ISODateTime, ProjectId } from "../domain/types";
import projectSchema from "./project.schema.json";
import storageEnvelopeSchema from "./storage-envelope.schema.json";
import storageIndexSchema from "./storage-index.schema.json";
import { canonicalStringify } from "./storage-integrity";
import storageQuarantineSchema from "./storage-quarantine.schema.json";
import storageRecentSchema from "./storage-recent.schema.json";
import storageStagingSchema from "./storage-staging.schema.json";
import { validateProjectSnapshot } from "./runtime-validators";

export const STORAGE_FORMAT_VERSION = 1 as const;

export const STORAGE_FORMATS = Object.freeze({
  project: "ai-storylab-project",
  index: "ai-storylab-project-index",
  recent: "ai-storylab-recent-pointer",
  staging: "ai-storylab-staged-write",
  quarantine: "ai-storylab-storage-quarantine",
} as const);

export const STORAGE_FAILURE_KINDS = Object.freeze([
  "storage_unavailable",
  "quota_exceeded",
  "malformed_json",
  "invalid_envelope",
  "integrity_mismatch",
  "unsupported_future_version",
  "invalid_payload",
  "invalid_staging",
  "invalid_index",
  "invalid_recent_pointer",
  "invalid_quarantine",
  "orphan_recent_pointer",
  "orphan_index_entry",
  "snapshot_without_index",
  "interrupted_write",
] as const);

export type StorageFailureKind =
  (typeof STORAGE_FAILURE_KINDS)[number];

export interface ProjectEnvelopeV1 {
  readonly storageFormat: typeof STORAGE_FORMATS.project;
  readonly storageFormatVersion: typeof STORAGE_FORMAT_VERSION;
  readonly projectSchemaVersion: typeof CURRENT_SCHEMA_VERSION;
  readonly projectId: ProjectId;
  readonly writtenAt: ISODateTime;
  readonly payload: CreativeProject;
  readonly integrity: {
    readonly algorithm: "SHA-256";
    readonly value: string;
  };
}

export interface ProjectIndexEntryV1 {
  readonly projectId: ProjectId;
  readonly title: string;
  readonly projectSchemaVersion: typeof CURRENT_SCHEMA_VERSION;
  readonly updatedAt: ISODateTime;
  readonly writeState: "committed";
}

export interface ProjectIndexV1 {
  readonly storageFormat: typeof STORAGE_FORMATS.index;
  readonly storageFormatVersion: typeof STORAGE_FORMAT_VERSION;
  readonly updatedAt: ISODateTime;
  readonly entries: readonly ProjectIndexEntryV1[];
}

export interface RecentProjectPointerV1 {
  readonly storageFormat: typeof STORAGE_FORMATS.recent;
  readonly storageFormatVersion: typeof STORAGE_FORMAT_VERSION;
  readonly projectId: ProjectId;
  readonly updatedAt: ISODateTime;
}

export interface StagedProjectWriteV1 {
  readonly storageFormat: typeof STORAGE_FORMATS.staging;
  readonly storageFormatVersion: typeof STORAGE_FORMAT_VERSION;
  readonly operationId: string;
  readonly startedAt: ISODateTime;
  readonly makeRecent: boolean;
  readonly envelope: ProjectEnvelopeV1;
}

export interface StorageQuarantineEntryV1 {
  readonly sourceKey: string;
  readonly classification: StorageFailureKind;
  readonly detectedAt: ISODateTime;
  readonly action: "preserve_source";
  readonly reviewState: "pending_human_review";
}

export interface StorageQuarantineV1 {
  readonly storageFormat: typeof STORAGE_FORMATS.quarantine;
  readonly storageFormatVersion: typeof STORAGE_FORMAT_VERSION;
  readonly updatedAt: ISODateTime;
  readonly entries: readonly StorageQuarantineEntryV1[];
}

export type IntegrityProvider = (value: string) => Promise<string>;

type JsonSchema = Record<string, unknown>;
type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  validateFormats: true,
});
addFormats(ajv);

for (const schema of [
  projectSchema,
  storageEnvelopeSchema,
  storageIndexSchema,
  storageRecentSchema,
  storageStagingSchema,
  storageQuarantineSchema,
]) {
  ajv.addSchema(schema as unknown as JsonSchema);
}

const validatorFor = (id: string): ValidateFunction => {
  const validator = ajv.getSchema(id);
  if (!validator) {
    throw new Error(`STORAGE_SCHEMA_NOT_REGISTERED:${id}`);
  }
  return validator;
};

const validateEnvelopeShape = validatorFor(
  "https://ai-storylab.local/schemas/storage/project-envelope/v1",
);
const validateIndexShape = validatorFor(
  "https://ai-storylab.local/schemas/storage/project-index/v1",
);
const validateRecentShape = validatorFor(
  "https://ai-storylab.local/schemas/storage/recent-pointer/v1",
);
const validateStagingShape = validatorFor(
  "https://ai-storylab.local/schemas/storage/staged-write/v1",
);
const validateQuarantineShape = validatorFor(
  "https://ai-storylab.local/schemas/storage/quarantine/v1",
);

const storageContractError = (
  path: string,
  safeMessage: string,
  kind: StorageFailureKind,
  details?: Readonly<Record<string, unknown>>,
): DomainError => ({
  code: "PERSISTENCE_DATA_CORRUPTED",
  path,
  safeMessage,
  details: {
    kind,
    ...(details ?? {}),
  },
});

const integrityUnavailable = (path: string): DomainError => ({
  code: "PERSISTENCE_UNAVAILABLE",
  path,
  safeMessage:
    "El navegador no puede verificar la integridad del proyecto local.",
  details: { kind: "storage_unavailable" },
});

const validateShape = <Value>(
  input: unknown,
  validator: ValidateFunction,
  path: string,
  safeMessage: string,
  kind: StorageFailureKind,
): Result<Value, DomainError> => {
  if (!validator(input)) {
    return err(
      storageContractError(path, safeMessage, kind, {
        errorCount: validator.errors?.length ?? 0,
      }),
    );
  }

  return ok(structuredClone(input) as Value);
};

const declaredEnvelopeVersion = (input: unknown): string | null => {
  if (!isRecord(input)) return null;
  if (typeof input.projectSchemaVersion === "string") {
    return input.projectSchemaVersion;
  }
  if (
    isRecord(input.payload) &&
    typeof input.payload.schemaVersion === "string"
  ) {
    return input.payload.schemaVersion;
  }
  return null;
};

export const validateProjectEnvelopeV1 = async (
  input: unknown,
  integrity: IntegrityProvider,
): Promise<Result<ProjectEnvelopeV1, DomainError>> => {
  const declaredVersion = declaredEnvelopeVersion(input);
  if (
    declaredVersion !== null &&
    declaredVersion !== CURRENT_SCHEMA_VERSION
  ) {
    return err(
      storageContractError(
        "storage.envelope.projectSchemaVersion",
        "La versión del snapshot local no es compatible.",
        "unsupported_future_version",
        {
          observedVersion: declaredVersion,
          currentVersion: CURRENT_SCHEMA_VERSION,
        },
      ),
    );
  }

  const shape = validateShape<ProjectEnvelopeV1>(
    input,
    validateEnvelopeShape,
    "storage.envelope",
    "El envelope local no supera la validación de formato.",
    "invalid_envelope",
  );
  if (!shape.ok) return err(shape.error);

  const project = validateProjectSnapshot(shape.value.payload);
  if (!project.ok) {
    return err(
      storageContractError(
        "storage.envelope.payload",
        "El envelope contiene un proyecto inválido.",
        "invalid_payload",
        { sourceCode: project.error.code },
      ),
    );
  }

  if (
    shape.value.projectId !== project.value.id ||
    shape.value.projectSchemaVersion !== project.value.schemaVersion
  ) {
    return err(
      storageContractError(
        "storage.envelope",
        "El envelope no coincide con la identidad o versión de su proyecto.",
        "invalid_envelope",
      ),
    );
  }

  let expected: string;
  try {
    expected = await integrity(canonicalStringify(project.value));
  } catch {
    return err(integrityUnavailable("storage.envelope.integrity"));
  }

  if (expected !== shape.value.integrity.value) {
    return err(
      storageContractError(
        "storage.envelope.integrity",
        "La verificación de integridad del proyecto local falló.",
        "integrity_mismatch",
      ),
    );
  }

  return ok({
    ...shape.value,
    payload: project.value,
  });
};

export const validateProjectIndexV1 = (
  input: unknown,
): Result<ProjectIndexV1, DomainError> => {
  const shape = validateShape<ProjectIndexV1>(
    input,
    validateIndexShape,
    "storage.index",
    "El índice local no supera la validación de formato.",
    "invalid_index",
  );
  if (!shape.ok) return err(shape.error);

  const seen = new Set<string>();
  for (const entry of shape.value.entries) {
    const id = entry.projectId as string;
    if (seen.has(id)) {
      return err(
        storageContractError(
          "storage.index.entries",
          "El índice local contiene identificadores duplicados.",
          "invalid_index",
          { projectId: id },
        ),
      );
    }
    seen.add(id);
  }

  return ok(shape.value);
};

export const validateRecentProjectPointerV1 = (
  input: unknown,
): Result<RecentProjectPointerV1, DomainError> =>
  validateShape<RecentProjectPointerV1>(
    input,
    validateRecentShape,
    "storage.recent",
    "El puntero de proyecto reciente no supera la validación.",
    "invalid_recent_pointer",
  );

export const validateStagedProjectWriteV1 = async (
  input: unknown,
  integrity: IntegrityProvider,
): Promise<Result<StagedProjectWriteV1, DomainError>> => {
  const shape = validateShape<StagedProjectWriteV1>(
    input,
    validateStagingShape,
    "storage.staging",
    "La escritura en staging no supera la validación de formato.",
    "invalid_staging",
  );
  if (!shape.ok) return err(shape.error);

  const envelope = await validateProjectEnvelopeV1(
    shape.value.envelope,
    integrity,
  );
  if (!envelope.ok) return err(envelope.error);

  return ok({
    ...shape.value,
    envelope: envelope.value,
  });
};

export const validateStorageQuarantineV1 = (
  input: unknown,
): Result<StorageQuarantineV1, DomainError> => {
  const shape = validateShape<StorageQuarantineV1>(
    input,
    validateQuarantineShape,
    "storage.quarantine",
    "La cuarentena local no supera la validación de formato.",
    "invalid_quarantine",
  );
  if (!shape.ok) return err(shape.error);

  const seen = new Set<string>();
  for (const entry of shape.value.entries) {
    const identity = `${entry.sourceKey}\u0000${entry.classification}`;
    if (seen.has(identity)) {
      return err(
        storageContractError(
          "storage.quarantine.entries",
          "La cuarentena local contiene entradas duplicadas.",
          "invalid_quarantine",
        ),
      );
    }
    seen.add(identity);
  }

  return ok(shape.value);
};
