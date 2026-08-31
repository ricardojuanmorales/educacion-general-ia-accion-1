
import type { DomainError } from "../../domain/errors";
import {
  CURRENT_SCHEMA_VERSION,
  type CreativeProject,
} from "../../domain/model";
import { err, ok, type Result } from "../../domain/result";
import type { ISODateTime, ProjectId } from "../../domain/types";
import type {
  IndexedProjectRepository,
  ProjectMetadata,
} from "../../ports";
import { migrateAlpha1ToAlpha2 } from "../../schemas/migrate-project";
import {
  validateProjectSnapshot,
} from "../../schemas/runtime-validators";
import {
  PREVIOUS_SCHEMA_VERSION,
} from "../../schemas/schema-version";
import {
  canonicalStringify,
  sha256Hex,
} from "../../schemas/storage-integrity";
import {
  STORAGE_FORMATS,
  STORAGE_FORMAT_VERSION,
  type IntegrityProvider,
  type ProjectEnvelopeV1,
  type ProjectIndexEntryV1,
  type ProjectIndexV1,
  type RecentProjectPointerV1,
  type StagedProjectWriteV1,
  type StorageFailureKind,
  type StorageQuarantineEntryV1,
  type StorageQuarantineV1,
  validateProjectEnvelopeV1,
  validateProjectIndexV1,
  validateRecentProjectPointerV1,
  validateStagedProjectWriteV1,
  validateStorageQuarantineV1,
} from "../../schemas/storage-runtime-validators";

export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface LocalStorageProjectRepositoryOptions {
  readonly integrity?: IntegrityProvider;
  readonly now?: () => ISODateTime;
}

const STORAGE_PREFIX = "ai-storylab:storage:v1:";

export const LOCAL_STORAGE_KEYS = Object.freeze({
  projectPrefix: `${STORAGE_PREFIX}project:`,
  stagingPrefix: `${STORAGE_PREFIX}staging:`,
  index: `${STORAGE_PREFIX}index`,
  recent: `${STORAGE_PREFIX}recent`,
  quarantine: `${STORAGE_PREFIX}quarantine`,
  latest: `${STORAGE_PREFIX}recent`,
});

export const LEGACY_LOCAL_STORAGE_KEYS = Object.freeze({
  alpha2: Object.freeze({
    latest: `ai-storylab:${CURRENT_SCHEMA_VERSION}:latest-project`,
    projectPrefix: `ai-storylab:${CURRENT_SCHEMA_VERSION}:project:`,
  }),
  alpha1: Object.freeze({
    latest: `ai-storylab:${PREVIOUS_SCHEMA_VERSION}:latest-project`,
    projectPrefix: `ai-storylab:${PREVIOUS_SCHEMA_VERSION}:project:`,
  }),
});

const projectKey = (projectId: ProjectId): string =>
  `${LOCAL_STORAGE_KEYS.projectPrefix}${projectId as string}`;

const stagingKey = (projectId: ProjectId): string =>
  `${LOCAL_STORAGE_KEYS.stagingPrefix}${projectId as string}`;

const legacyProjectKey = (
  prefix: string,
  projectId: ProjectId,
): string => `${prefix}${projectId as string}`;

const isRecord = (
  value: unknown,
): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const schemaVersionOf = (value: unknown): string | null =>
  isRecord(value) && typeof value.schemaVersion === "string"
    ? value.schemaVersion
    : null;

const storageFailure = (
  failure: unknown,
  path: string,
): DomainError => {
  const name =
    typeof failure === "object" &&
    failure !== null &&
    "name" in failure &&
    typeof failure.name === "string"
      ? failure.name
      : "";

  if (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED"
  ) {
    return {
      code: "PERSISTENCE_QUOTA_EXCEEDED",
      path,
      safeMessage:
        "El navegador no tiene espacio suficiente para guardar el proyecto.",
      details: { kind: "quota_exceeded" },
    };
  }

  return {
    code: "PERSISTENCE_UNAVAILABLE",
    path,
    safeMessage: "El almacenamiento local no está disponible.",
    details: { kind: "storage_unavailable" },
  };
};

const corrupted = (
  path: string,
  safeMessage: string,
  details?: Readonly<Record<string, unknown>>,
): DomainError => ({
  code: "PERSISTENCE_DATA_CORRUPTED",
  path,
  safeMessage,
  details: {
    kind: "invalid_payload",
    ...(details ?? {}),
  },
});

const defaultNow = (): ISODateTime =>
  new Date().toISOString() as ISODateTime;

export class LocalStorageProjectRepository
  implements IndexedProjectRepository
{
  readonly #integrity: IntegrityProvider;
  readonly #now: () => ISODateTime;

  constructor(
    readonly storage: StorageLike | null,
    options: LocalStorageProjectRepositoryOptions = {},
  ) {
    this.#integrity = options.integrity ?? sha256Hex;
    this.#now = options.now ?? defaultNow;
  }

  #failureKind(error: DomainError): StorageFailureKind {
    const candidate = error.details?.kind;
    return typeof candidate === "string"
      ? (candidate as StorageFailureKind)
      : error.code === "PERSISTENCE_QUOTA_EXCEEDED"
        ? "quota_exceeded"
        : error.code === "PERSISTENCE_UNAVAILABLE"
          ? "storage_unavailable"
          : "invalid_payload";
  }

  #recordQuarantine(
    sourceKey: string,
    classification: StorageFailureKind,
  ): boolean {
    const storage = this.storage;
    if (!storage || sourceKey === LOCAL_STORAGE_KEYS.quarantine) {
      return false;
    }

    try {
      const detectedAt = this.#now();
      const raw = storage.getItem(LOCAL_STORAGE_KEYS.quarantine);
      let current: StorageQuarantineV1 = {
        storageFormat: STORAGE_FORMATS.quarantine,
        storageFormatVersion: STORAGE_FORMAT_VERSION,
        updatedAt: detectedAt,
        entries: [],
      };

      if (raw !== null) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw) as unknown;
        } catch {
          return false;
        }
        const validated = validateStorageQuarantineV1(parsed);
        if (!validated.ok) return false;
        current = validated.value;
      }

      const entry: StorageQuarantineEntryV1 = {
        sourceKey,
        classification,
        detectedAt,
        action: "preserve_source",
        reviewState: "pending_human_review",
      };
      const entries = [
        ...current.entries.filter(
          (candidate) =>
            !(
              candidate.sourceKey === sourceKey &&
              candidate.classification === classification
            ),
        ),
        entry,
      ].sort((left, right) =>
        `${left.sourceKey}:${left.classification}`.localeCompare(
          `${right.sourceKey}:${right.classification}`,
        ),
      );

      const next = validateStorageQuarantineV1({
        storageFormat: STORAGE_FORMATS.quarantine,
        storageFormatVersion: STORAGE_FORMAT_VERSION,
        updatedAt: detectedAt,
        entries,
      });
      if (!next.ok) return false;

      storage.setItem(
        LOCAL_STORAGE_KEYS.quarantine,
        JSON.stringify(next.value),
      );
      return true;
    } catch {
      return false;
    }
  }

  #quarantineFailure(
    sourceKey: string,
    error: DomainError,
  ): DomainError {
    if (
      error.code !== "PERSISTENCE_DATA_CORRUPTED" &&
      error.code !== "SCHEMA_VERSION_UNSUPPORTED"
    ) {
      return error;
    }

    const kind = this.#failureKind(error);
    const quarantineRecorded = this.#recordQuarantine(sourceKey, kind);
    return {
      ...error,
      details: {
        ...(error.details ?? {}),
        kind,
        sourceKey,
        quarantineRecorded,
      },
    };
  }

  #recordClassification(
    sourceKey: string,
    classification: StorageFailureKind,
  ): void {
    this.#recordQuarantine(sourceKey, classification);
  }

  #readItem(
    key: string,
    path: string,
  ): Result<string | null, DomainError> {
    if (!this.storage) return err(storageFailure(null, "storage"));
    try {
      return ok(this.storage.getItem(key));
    } catch (failure) {
      return err(storageFailure(failure, path));
    }
  }

  #writeItem(
    key: string,
    value: string,
    path: string,
  ): Result<void, DomainError> {
    if (!this.storage) return err(storageFailure(null, "storage"));
    try {
      this.storage.setItem(key, value);
      return ok(undefined);
    } catch (failure) {
      return err(storageFailure(failure, path));
    }
  }

  #removeItem(
    key: string,
    path: string,
  ): Result<void, DomainError> {
    if (!this.storage) return err(storageFailure(null, "storage"));
    try {
      this.storage.removeItem(key);
      return ok(undefined);
    } catch (failure) {
      return err(storageFailure(failure, path));
    }
  }

  #parseJson(
    raw: string,
    path: string,
    safeMessage: string,
  ): Result<unknown, DomainError> {
    try {
      return ok(JSON.parse(raw) as unknown);
    } catch {
      return err(
        corrupted(path, safeMessage, {
          kind: "malformed_json",
        }),
      );
    }
  }

  #serialize(
    value: unknown,
    path: string,
    safeMessage: string,
  ): Result<string, DomainError> {
    try {
      return ok(JSON.stringify(value));
    } catch {
      return err(corrupted(path, safeMessage));
    }
  }

  #keysWithPrefix(
    prefix: string,
    path: string,
  ): Result<readonly string[], DomainError> {
    if (!this.storage) return err(storageFailure(null, "storage"));
    try {
      const keys: string[] = [];
      const length = this.storage.length;
      for (let index = 0; index < length; index += 1) {
        const key = this.storage.key(index);
        if (key?.startsWith(prefix)) keys.push(key);
      }
      return ok(keys.sort());
    } catch (failure) {
      return err(storageFailure(failure, path));
    }
  }

  #stagingKeys(): Result<readonly string[], DomainError> {
    return this.#keysWithPrefix(
      LOCAL_STORAGE_KEYS.stagingPrefix,
      "storage.staging.enumerate",
    );
  }

  #projectKeys(): Result<readonly string[], DomainError> {
    return this.#keysWithPrefix(
      LOCAL_STORAGE_KEYS.projectPrefix,
      "storage.snapshot.enumerate",
    );
  }

  #emptyIndex(updatedAt: ISODateTime): ProjectIndexV1 {
    return {
      storageFormat: STORAGE_FORMATS.index,
      storageFormatVersion: STORAGE_FORMAT_VERSION,
      updatedAt,
      entries: [],
    };
  }

  #readIndex(
    fallbackUpdatedAt: ISODateTime,
  ): Result<ProjectIndexV1, DomainError> {
    const raw = this.#readItem(
      LOCAL_STORAGE_KEYS.index,
      "storage.index.read",
    );
    if (!raw.ok) return err(raw.error);
    if (raw.value === null) return ok(this.#emptyIndex(fallbackUpdatedAt));

    const parsed = this.#parseJson(
      raw.value,
      "storage.index",
      "El índice local no contiene JSON válido.",
    );
    if (!parsed.ok) {
      return err(
        this.#quarantineFailure(
          LOCAL_STORAGE_KEYS.index,
          parsed.error,
        ),
      );
    }

    const validated = validateProjectIndexV1(parsed.value);
    if (!validated.ok) {
      return err(
        this.#quarantineFailure(
          LOCAL_STORAGE_KEYS.index,
          validated.error,
        ),
      );
    }
    return validated;
  }

  #nextIndex(
    index: ProjectIndexV1,
    envelope: ProjectEnvelopeV1,
  ): Result<ProjectIndexV1, DomainError> {
    const entries = [
      ...index.entries.filter(
        (entry) => entry.projectId !== envelope.projectId,
      ),
      {
        projectId: envelope.projectId,
        title: envelope.payload.title,
        projectSchemaVersion: envelope.projectSchemaVersion,
        updatedAt: envelope.payload.updatedAt,
        writeState: "committed" as const,
      },
    ].sort((left, right) =>
      (left.projectId as string).localeCompare(right.projectId as string),
    );

    return validateProjectIndexV1({
      storageFormat: STORAGE_FORMATS.index,
      storageFormatVersion: STORAGE_FORMAT_VERSION,
      updatedAt: envelope.writtenAt,
      entries,
    });
  }

  #indexWithout(
    index: ProjectIndexV1,
    projectId: ProjectId,
    updatedAt: ISODateTime,
  ): Result<ProjectIndexV1, DomainError> {
    return validateProjectIndexV1({
      storageFormat: STORAGE_FORMATS.index,
      storageFormatVersion: STORAGE_FORMAT_VERSION,
      updatedAt,
      entries: index.entries.filter(
        (entry) => entry.projectId !== projectId,
      ),
    });
  }

  async #readEnvelopeByStorageKey(
    key: string,
  ): Promise<Result<ProjectEnvelopeV1 | null, DomainError>> {
    const raw = this.#readItem(key, "storage.snapshot.read");
    if (!raw.ok) return err(raw.error);
    if (raw.value === null) return ok(null);

    const parsed = this.#parseJson(
      raw.value,
      "storage.snapshot",
      "El snapshot local no contiene JSON válido.",
    );
    if (!parsed.ok) {
      return err(this.#quarantineFailure(key, parsed.error));
    }

    const envelope = await validateProjectEnvelopeV1(
      parsed.value,
      this.#integrity,
    );
    if (!envelope.ok) {
      return err(this.#quarantineFailure(key, envelope.error));
    }

    const keyProjectId = key.slice(
      LOCAL_STORAGE_KEYS.projectPrefix.length,
    );
    if ((envelope.value.projectId as string) !== keyProjectId) {
      return err(
        this.#quarantineFailure(
          key,
          corrupted(
            "storage.snapshot.projectId",
            "La clave local no coincide con la identidad del proyecto.",
            { kind: "invalid_envelope" },
          ),
        ),
      );
    }

    return envelope;
  }

  async #indexEntriesFromSnapshots(): Promise<
    Result<readonly ProjectIndexEntryV1[], DomainError>
  > {
    const keys = this.#projectKeys();
    if (!keys.ok) return err(keys.error);

    const entries: ProjectIndexEntryV1[] = [];
    for (const key of keys.value) {
      const envelope = await this.#readEnvelopeByStorageKey(key);
      if (!envelope.ok) {
        if (
          envelope.error.code === "PERSISTENCE_DATA_CORRUPTED" ||
          envelope.error.code === "SCHEMA_VERSION_UNSUPPORTED"
        ) {
          continue;
        }
        return err(envelope.error);
      }
      if (envelope.value === null) continue;
      entries.push({
        projectId: envelope.value.projectId,
        title: envelope.value.payload.title,
        projectSchemaVersion: envelope.value.projectSchemaVersion,
        updatedAt: envelope.value.payload.updatedAt,
        writeState: "committed",
      });
    }

    return ok(
      entries.sort((left, right) =>
        (left.projectId as string).localeCompare(
          right.projectId as string,
        ),
      ),
    );
  }

  #persistIndex(
    entries: readonly ProjectIndexEntryV1[],
    updatedAt: ISODateTime,
  ): Result<void, DomainError> {
    const next = validateProjectIndexV1({
      storageFormat: STORAGE_FORMATS.index,
      storageFormatVersion: STORAGE_FORMAT_VERSION,
      updatedAt,
      entries,
    });
    if (!next.ok) return err(next.error);

    const serialized = this.#serialize(
      next.value,
      "storage.index",
      "El índice no puede convertirse a JSON local.",
    );
    if (!serialized.ok) return err(serialized.error);
    return this.#writeItem(
      LOCAL_STORAGE_KEYS.index,
      serialized.value,
      "storage.index.write",
    );
  }

  async #repairIndex(): Promise<Result<void, DomainError>> {
    const expected = await this.#indexEntriesFromSnapshots();
    if (!expected.ok) return err(expected.error);

    const raw = this.#readItem(
      LOCAL_STORAGE_KEYS.index,
      "storage.index.read",
    );
    if (!raw.ok) return err(raw.error);

    if (raw.value === null) {
      if (expected.value.length === 0) return ok(undefined);
      for (const entry of expected.value) {
        this.#recordClassification(
          projectKey(entry.projectId),
          "snapshot_without_index",
        );
      }
      return this.#persistIndex(expected.value, this.#now());
    }

    const parsed = this.#parseJson(
      raw.value,
      "storage.index",
      "El índice local no contiene JSON válido.",
    );
    if (!parsed.ok) {
      this.#quarantineFailure(
        LOCAL_STORAGE_KEYS.index,
        parsed.error,
      );
      return this.#persistIndex(expected.value, this.#now());
    }

    const current = validateProjectIndexV1(parsed.value);
    if (!current.ok) {
      this.#quarantineFailure(
        LOCAL_STORAGE_KEYS.index,
        current.error,
      );
      return this.#persistIndex(expected.value, this.#now());
    }

    const expectedIds = new Set(
      expected.value.map((entry) => entry.projectId as string),
    );
    const currentIds = new Set(
      current.value.entries.map((entry) => entry.projectId as string),
    );

    for (const entry of current.value.entries) {
      if (!expectedIds.has(entry.projectId as string)) {
        this.#recordClassification(
          `${LOCAL_STORAGE_KEYS.index}#${entry.projectId as string}`,
          "orphan_index_entry",
        );
      }
    }
    for (const entry of expected.value) {
      if (!currentIds.has(entry.projectId as string)) {
        this.#recordClassification(
          projectKey(entry.projectId),
          "snapshot_without_index",
        );
      }
    }

    if (
      canonicalStringify(current.value.entries) ===
      canonicalStringify(expected.value)
    ) {
      return ok(undefined);
    }

    return this.#persistIndex(expected.value, this.#now());
  }

  async #repairRecent(): Promise<Result<void, DomainError>> {
    const raw = this.#readItem(
      LOCAL_STORAGE_KEYS.recent,
      "storage.recent.read",
    );
    if (!raw.ok) return err(raw.error);
    if (raw.value === null) return ok(undefined);

    const parsed = this.#parseJson(
      raw.value,
      "storage.recent",
      "El puntero reciente no contiene JSON válido.",
    );
    if (!parsed.ok) {
      return err(
        this.#quarantineFailure(
          LOCAL_STORAGE_KEYS.recent,
          parsed.error,
        ),
      );
    }

    const pointer = validateRecentProjectPointerV1(parsed.value);
    if (!pointer.ok) {
      return err(
        this.#quarantineFailure(
          LOCAL_STORAGE_KEYS.recent,
          pointer.error,
        ),
      );
    }

    const target = this.#readItem(
      projectKey(pointer.value.projectId),
      "storage.recent.target.read",
    );
    if (!target.ok) return err(target.error);
    if (target.value !== null) return ok(undefined);

    this.#recordClassification(
      LOCAL_STORAGE_KEYS.recent,
      "orphan_recent_pointer",
    );
    return this.#removeItem(
      LOCAL_STORAGE_KEYS.recent,
      "storage.recent.cleanup",
    );
  }

  async #recoverRepositoryState(): Promise<
    Result<void, DomainError>
  > {
    const repairBefore = await this.#repairIndex();
    if (!repairBefore.ok) return err(repairBefore.error);

    const pending = await this.#recoverPendingWritesOnly();
    if (!pending.ok) return err(pending.error);

    const repairAfter = await this.#repairIndex();
    if (!repairAfter.ok) return err(repairAfter.error);

    return this.#repairRecent();
  }

  async #promoteStagedWrite(
    staged: StagedProjectWriteV1,
    sourceStagingKey: string,
  ): Promise<Result<void, DomainError>> {
    const targetKey = projectKey(staged.envelope.projectId);
    const existing = await this.#readEnvelopeByStorageKey(targetKey);
    if (!existing.ok) return err(existing.error);

    const index = this.#readIndex(staged.envelope.writtenAt);
    if (!index.ok) return err(index.error);

    const nextIndex = this.#nextIndex(index.value, staged.envelope);
    if (!nextIndex.ok) return err(nextIndex.error);

    const recent: RecentProjectPointerV1 = {
      storageFormat: STORAGE_FORMATS.recent,
      storageFormatVersion: STORAGE_FORMAT_VERSION,
      projectId: staged.envelope.projectId,
      updatedAt: staged.envelope.writtenAt,
    };
    const validRecent = validateRecentProjectPointerV1(recent);
    if (!validRecent.ok) return err(validRecent.error);

    const envelopeText = this.#serialize(
      staged.envelope,
      "storage.envelope",
      "El envelope no puede convertirse a JSON local.",
    );
    if (!envelopeText.ok) return err(envelopeText.error);

    const indexText = this.#serialize(
      nextIndex.value,
      "storage.index",
      "El índice no puede convertirse a JSON local.",
    );
    if (!indexText.ok) return err(indexText.error);

    const recentText = this.#serialize(
      validRecent.value,
      "storage.recent",
      "El puntero reciente no puede convertirse a JSON local.",
    );
    if (!recentText.ok) return err(recentText.error);

    const writeProject = this.#writeItem(
      targetKey,
      envelopeText.value,
      "storage.snapshot.write",
    );
    if (!writeProject.ok) return err(writeProject.error);

    const readback = this.#readItem(
      targetKey,
      "storage.snapshot.verify",
    );
    if (!readback.ok) return err(readback.error);
    if (readback.value === null) {
      return err(
        this.#quarantineFailure(
          targetKey,
          corrupted(
            "storage.snapshot.verify",
            "El snapshot definitivo no pudo verificarse.",
            { kind: "interrupted_write" },
          ),
        ),
      );
    }

    const parsed = this.#parseJson(
      readback.value,
      "storage.snapshot.verify",
      "El snapshot definitivo no contiene JSON válido.",
    );
    if (!parsed.ok) {
      return err(this.#quarantineFailure(targetKey, parsed.error));
    }

    const verified = await validateProjectEnvelopeV1(
      parsed.value,
      this.#integrity,
    );
    if (!verified.ok) {
      return err(this.#quarantineFailure(targetKey, verified.error));
    }

    const writeIndex = this.#writeItem(
      LOCAL_STORAGE_KEYS.index,
      indexText.value,
      "storage.index.write",
    );
    if (!writeIndex.ok) return err(writeIndex.error);

    if (staged.makeRecent) {
      const writeRecent = this.#writeItem(
        LOCAL_STORAGE_KEYS.recent,
        recentText.value,
        "storage.recent.write",
      );
      if (!writeRecent.ok) return err(writeRecent.error);
    }

    return this.#removeItem(
      sourceStagingKey,
      "storage.staging.cleanup",
    );
  }

  async #recoverPendingWritesOnly(): Promise<
    Result<void, DomainError>
  > {
    const keys = this.#stagingKeys();
    if (!keys.ok) return err(keys.error);

    for (const key of keys.value) {
      const raw = this.#readItem(key, "storage.staging.read");
      if (!raw.ok) return err(raw.error);
      if (raw.value === null) continue;

      const parsed = this.#parseJson(
        raw.value,
        "storage.staging",
        "La escritura en staging no contiene JSON válido.",
      );
      if (!parsed.ok) {
        return err(this.#quarantineFailure(key, parsed.error));
      }

      const staged = await validateStagedProjectWriteV1(
        parsed.value,
        this.#integrity,
      );
      if (!staged.ok) {
        return err(this.#quarantineFailure(key, staged.error));
      }

      const promoted = await this.#promoteStagedWrite(
        staged.value,
        key,
      );
      if (!promoted.ok) return err(promoted.error);
    }
    return ok(undefined);
  }

  async #buildEnvelope(
    project: CreativeProject,
    writtenAt: ISODateTime,
  ): Promise<Result<ProjectEnvelopeV1, DomainError>> {
    let digest: string;
    try {
      digest = await this.#integrity(canonicalStringify(project));
    } catch {
      return err({
        code: "PERSISTENCE_UNAVAILABLE",
        path: "storage.integrity",
        safeMessage:
          "El navegador no puede calcular la integridad del proyecto local.",
      });
    }

    const envelope: ProjectEnvelopeV1 = {
      storageFormat: STORAGE_FORMATS.project,
      storageFormatVersion: STORAGE_FORMAT_VERSION,
      projectSchemaVersion: CURRENT_SCHEMA_VERSION,
      projectId: project.id,
      writtenAt,
      payload: project,
      integrity: {
        algorithm: "SHA-256",
        value: digest,
      },
    };
    return validateProjectEnvelopeV1(envelope, this.#integrity);
  }

  async #persistValidatedProject(
    project: CreativeProject,
    makeRecent: boolean,
  ): Promise<Result<void, DomainError>> {
    const startedAt = this.#now();
    const envelope = await this.#buildEnvelope(project, startedAt);
    if (!envelope.ok) return err(envelope.error);

    const staged: StagedProjectWriteV1 = {
      storageFormat: STORAGE_FORMATS.staging,
      storageFormatVersion: STORAGE_FORMAT_VERSION,
      operationId: `write:${project.id as string}:${startedAt}`,
      startedAt,
      makeRecent,
      envelope: envelope.value,
    };

    const validStaged = await validateStagedProjectWriteV1(
      staged,
      this.#integrity,
    );
    if (!validStaged.ok) return err(validStaged.error);

    const serialized = this.#serialize(
      validStaged.value,
      "storage.staging",
      "La escritura en staging no puede convertirse a JSON local.",
    );
    if (!serialized.ok) return err(serialized.error);

    const key = stagingKey(project.id);
    const written = this.#writeItem(
      key,
      serialized.value,
      "storage.staging.write",
    );
    if (!written.ok) return err(written.error);

    const readback = this.#readItem(key, "storage.staging.verify");
    if (!readback.ok) return err(readback.error);
    if (readback.value === null) {
      return err(
        this.#quarantineFailure(
          key,
          corrupted(
            "storage.staging.verify",
            "La escritura en staging no pudo verificarse.",
            { kind: "interrupted_write" },
          ),
        ),
      );
    }

    const parsed = this.#parseJson(
      readback.value,
      "storage.staging.verify",
      "La escritura verificada no contiene JSON válido.",
    );
    if (!parsed.ok) {
      return err(this.#quarantineFailure(key, parsed.error));
    }

    const verified = await validateStagedProjectWriteV1(
      parsed.value,
      this.#integrity,
    );
    if (!verified.ok) {
      return err(this.#quarantineFailure(key, verified.error));
    }

    return this.#promoteStagedWrite(verified.value, key);
  }

  async #loadEnvelopeProject(
    projectId: ProjectId,
  ): Promise<Result<CreativeProject | null, DomainError>> {
    const envelope = await this.#readEnvelopeByStorageKey(
      projectKey(projectId),
    );
    if (!envelope.ok) return err(envelope.error);
    return ok(envelope.value?.payload ?? null);
  }

  #loadRawAlpha2Project(
    projectId: ProjectId,
  ): Result<CreativeProject | null, DomainError> {
    const key = legacyProjectKey(
      LEGACY_LOCAL_STORAGE_KEYS.alpha2.projectPrefix,
      projectId,
    );
    const raw = this.#readItem(key, "storage.raw.alpha2.read");
    if (!raw.ok) return err(raw.error);
    if (raw.value === null) return ok(null);

    const parsed = this.#parseJson(
      raw.value,
      "storage.raw.alpha2",
      "El snapshot raw alpha.2 no contiene JSON válido.",
    );
    if (!parsed.ok) {
      return err(this.#quarantineFailure(key, parsed.error));
    }

    const observedVersion = schemaVersionOf(parsed.value);
    if (
      observedVersion !== null &&
      observedVersion !== CURRENT_SCHEMA_VERSION
    ) {
      return err(
        this.#quarantineFailure(
          key,
          corrupted(
            "storage.raw.alpha2.schemaVersion",
            "La versión del snapshot raw no es compatible.",
            {
              kind: "unsupported_future_version",
              observedVersion,
            },
          ),
        ),
      );
    }

    const project = validateProjectSnapshot(parsed.value);
    if (!project.ok) {
      return err(this.#quarantineFailure(key, project.error));
    }
    if (project.value.id !== projectId) {
      return err(
        this.#quarantineFailure(
          key,
          corrupted(
            "storage.raw.alpha2.id",
            "El snapshot raw alpha.2 no coincide con su clave.",
            { kind: "invalid_payload" },
          ),
        ),
      );
    }
    return ok(project.value);
  }

  #loadRawAlpha1Project(
    projectId: ProjectId,
  ): Result<CreativeProject | null, DomainError> {
    const key = legacyProjectKey(
      LEGACY_LOCAL_STORAGE_KEYS.alpha1.projectPrefix,
      projectId,
    );
    const raw = this.#readItem(key, "storage.raw.alpha1.read");
    if (!raw.ok) return err(raw.error);
    if (raw.value === null) return ok(null);

    const parsed = this.#parseJson(
      raw.value,
      "storage.raw.alpha1",
      "El snapshot raw alpha.1 no contiene JSON válido.",
    );
    if (!parsed.ok) {
      return err(this.#quarantineFailure(key, parsed.error));
    }

    const observedVersion = schemaVersionOf(parsed.value);
    if (
      observedVersion !== null &&
      observedVersion !== PREVIOUS_SCHEMA_VERSION
    ) {
      return err(
        this.#quarantineFailure(
          key,
          corrupted(
            "storage.raw.alpha1.schemaVersion",
            "La versión del snapshot raw no es compatible.",
            {
              kind: "unsupported_future_version",
              observedVersion,
            },
          ),
        ),
      );
    }

    const project = migrateAlpha1ToAlpha2(parsed.value);
    if (!project.ok) {
      return err(this.#quarantineFailure(key, project.error));
    }
    if (project.value.id !== projectId) {
      return err(
        this.#quarantineFailure(
          key,
          corrupted(
            "storage.raw.alpha1.id",
            "El snapshot raw alpha.1 no coincide con su clave.",
            { kind: "invalid_payload" },
          ),
        ),
      );
    }
    return ok(project.value);
  }

  async #promoteRawProject(
    project: CreativeProject,
    makeRecent: boolean,
  ): Promise<Result<CreativeProject, DomainError>> {
    const promoted = await this.#persistValidatedProject(
      project,
      makeRecent,
    );
    if (!promoted.ok) return err(promoted.error);
    return ok(project);
  }

  async load(
    projectId: ProjectId,
  ): Promise<Result<CreativeProject | null, DomainError>> {
    if (!this.storage) return err(storageFailure(null, "storage"));

    const recovery = await this.#recoverRepositoryState();
    if (!recovery.ok) return err(recovery.error);

    const current = await this.#loadEnvelopeProject(projectId);
    if (!current.ok || current.value !== null) return current;

    const alpha2 = this.#loadRawAlpha2Project(projectId);
    if (!alpha2.ok) return err(alpha2.error);
    if (alpha2.value !== null) {
      return this.#promoteRawProject(alpha2.value, false);
    }

    const alpha1 = this.#loadRawAlpha1Project(projectId);
    if (!alpha1.ok) return err(alpha1.error);
    if (alpha1.value !== null) {
      return this.#promoteRawProject(alpha1.value, false);
    }

    return ok(null);
  }

  async #loadCurrentMostRecent(): Promise<
    Result<CreativeProject | null, DomainError>
  > {
    const raw = this.#readItem(
      LOCAL_STORAGE_KEYS.recent,
      "storage.recent.read",
    );
    if (!raw.ok) return err(raw.error);
    if (raw.value === null) return ok(null);

    const parsed = this.#parseJson(
      raw.value,
      "storage.recent",
      "El puntero reciente no contiene JSON válido.",
    );
    if (!parsed.ok) return err(parsed.error);

    const pointer = validateRecentProjectPointerV1(parsed.value);
    if (!pointer.ok) return err(pointer.error);

    const project = await this.#loadEnvelopeProject(
      pointer.value.projectId,
    );
    if (!project.ok) return err(project.error);
    if (project.value !== null) return project;

    const cleanup = this.#removeItem(
      LOCAL_STORAGE_KEYS.recent,
      "storage.recent.cleanup",
    );
    if (!cleanup.ok) return err(cleanup.error);
    return ok(null);
  }

  async #loadLegacyMostRecent(
    latestKey: string,
    version: "alpha1" | "alpha2",
  ): Promise<Result<CreativeProject | null, DomainError>> {
    const latest = this.#readItem(
      latestKey,
      `storage.raw.${version}.recent.read`,
    );
    if (!latest.ok) return err(latest.error);
    if (!latest.value) return ok(null);

    const projectId = latest.value as ProjectId;
    const project =
      version === "alpha2"
        ? this.#loadRawAlpha2Project(projectId)
        : this.#loadRawAlpha1Project(projectId);

    if (!project.ok) return err(project.error);
    if (project.value === null) {
      const cleanup = this.#removeItem(
        latestKey,
        `storage.raw.${version}.recent.cleanup`,
      );
      if (!cleanup.ok) return err(cleanup.error);
      return ok(null);
    }

    return this.#promoteRawProject(project.value, true);
  }

  async loadMostRecent(): Promise<
    Result<CreativeProject | null, DomainError>
  > {
    if (!this.storage) return err(storageFailure(null, "storage"));

    const recovery = await this.#recoverRepositoryState();
    if (!recovery.ok) return err(recovery.error);

    const current = await this.#loadCurrentMostRecent();
    if (!current.ok || current.value !== null) return current;

    const alpha2 = await this.#loadLegacyMostRecent(
      LEGACY_LOCAL_STORAGE_KEYS.alpha2.latest,
      "alpha2",
    );
    if (!alpha2.ok || alpha2.value !== null) return alpha2;

    return this.#loadLegacyMostRecent(
      LEGACY_LOCAL_STORAGE_KEYS.alpha1.latest,
      "alpha1",
    );
  }

  async save(
    project: CreativeProject,
  ): Promise<Result<void, DomainError>> {
    if (!this.storage) return err(storageFailure(null, "storage"));

    const recovery = await this.#recoverRepositoryState();
    if (!recovery.ok) return err(recovery.error);

    const validated = validateProjectSnapshot(project);
    if (!validated.ok) return err(validated.error);
    return this.#persistValidatedProject(validated.value, true);
  }

  async listProjectMetadata(): Promise<
    Result<readonly ProjectMetadata[], DomainError>
  > {
    if (!this.storage) return err(storageFailure(null, "storage"));

    const recovery = await this.#recoverRepositoryState();
    if (!recovery.ok) return err(recovery.error);

    const index = this.#readIndex(this.#now());
    if (!index.ok) return err(index.error);

    return ok(
      index.value.entries.map((entry) => ({
        projectId: entry.projectId,
        title: entry.title,
        schemaVersion: entry.projectSchemaVersion,
        updatedAt: entry.updatedAt,
      })),
    );
  }

  async remove(
    projectId: ProjectId,
  ): Promise<Result<void, DomainError>> {
    if (!this.storage) return err(storageFailure(null, "storage"));

    const recovery = await this.#recoverRepositoryState();
    if (!recovery.ok) return err(recovery.error);

    const now = this.#now();
    const index = this.#readIndex(now);
    if (!index.ok) return err(index.error);
    const nextIndex = this.#indexWithout(index.value, projectId, now);
    if (!nextIndex.ok) return err(nextIndex.error);
    const indexText = this.#serialize(
      nextIndex.value,
      "storage.index",
      "El índice no puede convertirse a JSON local.",
    );
    if (!indexText.ok) return err(indexText.error);

    const recentRaw = this.#readItem(
      LOCAL_STORAGE_KEYS.recent,
      "storage.recent.read",
    );
    if (!recentRaw.ok) return err(recentRaw.error);

    let recentProjectId: ProjectId | null = null;
    if (recentRaw.value !== null) {
      const parsed = this.#parseJson(
        recentRaw.value,
        "storage.recent",
        "El puntero reciente no contiene JSON válido.",
      );
      if (!parsed.ok) return err(parsed.error);
      const recent = validateRecentProjectPointerV1(parsed.value);
      if (!recent.ok) return err(recent.error);
      recentProjectId = recent.value.projectId;
    }

    const keysToRemove: readonly (readonly [string, string])[] = [
      [projectKey(projectId), "storage.snapshot.remove"],
      [stagingKey(projectId), "storage.staging.remove"],
      [
        legacyProjectKey(
          LEGACY_LOCAL_STORAGE_KEYS.alpha2.projectPrefix,
          projectId,
        ),
        "storage.raw.alpha2.remove",
      ],
      [
        legacyProjectKey(
          LEGACY_LOCAL_STORAGE_KEYS.alpha1.projectPrefix,
          projectId,
        ),
        "storage.raw.alpha1.remove",
      ],
    ];

    for (const [key, path] of keysToRemove) {
      const removed = this.#removeItem(key, path);
      if (!removed.ok) return err(removed.error);
    }

    const writeIndex = this.#writeItem(
      LOCAL_STORAGE_KEYS.index,
      indexText.value,
      "storage.index.write",
    );
    if (!writeIndex.ok) return err(writeIndex.error);

    if (recentProjectId === projectId) {
      const removed = this.#removeItem(
        LOCAL_STORAGE_KEYS.recent,
        "storage.recent.remove",
      );
      if (!removed.ok) return err(removed.error);
    }

    for (const key of [
      LEGACY_LOCAL_STORAGE_KEYS.alpha2.latest,
      LEGACY_LOCAL_STORAGE_KEYS.alpha1.latest,
    ]) {
      const raw = this.#readItem(key, "storage.raw.recent.read");
      if (!raw.ok) return err(raw.error);
      if (raw.value === (projectId as string)) {
        const removed = this.#removeItem(
          key,
          "storage.raw.recent.remove",
        );
        if (!removed.ok) return err(removed.error);
      }
    }

    return ok(undefined);
  }

  async clearMostRecent(): Promise<Result<void, DomainError>> {
    if (!this.storage) return err(storageFailure(null, "storage"));

    const recovery = await this.#recoverRepositoryState();
    if (!recovery.ok) return err(recovery.error);

    const current = this.#readItem(
      LOCAL_STORAGE_KEYS.recent,
      "storage.recent.read",
    );
    if (!current.ok) return err(current.error);

    if (current.value !== null) {
      const parsed = this.#parseJson(
        current.value,
        "storage.recent",
        "El puntero reciente no contiene JSON válido.",
      );
      if (!parsed.ok) {
        return this.#removeItem(
          LOCAL_STORAGE_KEYS.recent,
          "storage.recent.clear",
        );
      }

      const pointer = validateRecentProjectPointerV1(parsed.value);
      if (!pointer.ok) {
        return this.#removeItem(
          LOCAL_STORAGE_KEYS.recent,
          "storage.recent.clear",
        );
      }
      return this.remove(pointer.value.projectId);
    }

    for (const key of [
      LEGACY_LOCAL_STORAGE_KEYS.alpha2.latest,
      LEGACY_LOCAL_STORAGE_KEYS.alpha1.latest,
    ]) {
      const raw = this.#readItem(key, "storage.raw.recent.read");
      if (!raw.ok) return err(raw.error);
      if (raw.value) return this.remove(raw.value as ProjectId);
    }

    return ok(undefined);
  }
}
