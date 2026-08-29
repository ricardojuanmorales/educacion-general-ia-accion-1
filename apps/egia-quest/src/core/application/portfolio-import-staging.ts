import type { DomainError } from "../domain/errors";
import type { CreativeProject } from "../domain/model";
import {
  PORTFOLIO_PACKAGE_TYPE,
  PORTFOLIO_PACKAGE_VERSION,
} from "../domain/portfolio-package";
import { err, ok, type Result } from "../domain/result";
import type {
  IdGenerator,
  Sha256Hasher,
  UntrustedLocalFile,
} from "../ports";
import { migrateProjectToCurrent } from "../schemas/migrate-project";
import {
  type KnownPortfolioPackage,
  validatePortfolioPackageSnapshot,
} from "../schemas/portfolio-package-validator";
import { CURRENT_SCHEMA_VERSION } from "../schemas/schema-version";
import {
  classifyPortfolioImportCompatibility,
  type PortfolioCompatibilityDecision,
} from "./portfolio-import-compatibility";
import {
  preflightUntrustedPortfolioFile,
  type JsonStructureMetrics,
} from "./portfolio-import-preflight";
import { canonicalizeJson } from "./portfolio-package-utils";

export interface PortfolioImportPreview {
  readonly stagingId: string;
  readonly fileName: string;
  readonly byteLength: number;
  readonly packageType: typeof PORTFOLIO_PACKAGE_TYPE;
  readonly packageVersion: typeof PORTFOLIO_PACKAGE_VERSION;
  readonly sourceProjectSchemaVersion: string;
  readonly candidateProjectSchemaVersion:
    typeof CURRENT_SCHEMA_VERSION;
  readonly migrationApplied: boolean;
  readonly projectTitle: string;
  readonly portfolioItemCount: number;
  readonly reflectionCount: number;
  readonly checksum: string;
  readonly structure: JsonStructureMetrics;
}

export interface StagedPortfolioImport
  extends PortfolioImportPreview {
  readonly packageValue: KnownPortfolioPackage;
  readonly candidateProject: CreativeProject;
  readonly compatibility: PortfolioCompatibilityDecision;
}

export interface PortfolioImportStagingDependencies {
  readonly ids: IdGenerator;
  readonly hasher: Sha256Hasher;
}

export interface PortfolioImportStagingService {
  readonly stage: (
    file: UntrustedLocalFile,
  ) => Promise<Result<PortfolioImportPreview, DomainError>>;
  readonly inspect: (
    stagingId: string,
  ) => Result<StagedPortfolioImport, DomainError>;
  readonly discard: (stagingId: string) => void;
}

const mapPackageError = (
  source: DomainError,
): DomainError => ({
  code: "IMPORT_PACKAGE_INVALID",
  path: "portfolioPackage",
  safeMessage:
    "El archivo no contiene un paquete de portafolio válido.",
  details: {
    sourceCode: source.code,
  },
});

const mapMigrationError = (
  source: DomainError,
): DomainError =>
  source.code === "SCHEMA_VERSION_UNSUPPORTED" ||
  source.code === "LEGACY_MIGRATION_REQUIRED"
    ? source
    : mapPackageError(source);

const deepFreeze = <Value>(value: Value): Value => {
  if (
    typeof value !== "object" ||
    value === null ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const key of Object.keys(value)) {
    const record = value as unknown as Record<string, unknown>;
    deepFreeze(record[key]);
  }

  return Object.freeze(value) as Value;
};

const immutableClone = <Value>(value: Value): Value =>
  deepFreeze(structuredClone(value));

export const createPortfolioImportStagingService = (
  dependencies: PortfolioImportStagingDependencies,
): PortfolioImportStagingService => {
  const pending = new Map<string, StagedPortfolioImport>();

  return {
    stage: async (file) => {
      const preflight =
        await preflightUntrustedPortfolioFile(file);
      if (!preflight.ok) return preflight;

      const compatibility =
        classifyPortfolioImportCompatibility(
          preflight.value.parsed,
        );
      if (!compatibility.ok) return compatibility;

      const packageResult =
        validatePortfolioPackageSnapshot(
          preflight.value.parsed,
        );
      if (!packageResult.ok) {
        return err(mapPackageError(packageResult.error));
      }

      const canonicalPayload = canonicalizeJson(
        packageResult.value.payload,
      );
      if (!canonicalPayload.ok) {
        return err(mapPackageError(canonicalPayload.error));
      }

      const digest = await dependencies.hasher.digestHex(
        canonicalPayload.value,
      );
      if (!digest.ok) {
        return err({
          code: "IMPORT_PACKAGE_INVALID",
          path: "integrity.digest",
          safeMessage:
            "No fue posible verificar la integridad local del archivo.",
          details: {
            sourceCode: digest.error.code,
          },
        });
      }

      if (
        digest.value !==
        packageResult.value.integrity.digest
      ) {
        return err({
          code: "IMPORT_CHECKSUM_MISMATCH",
          path: "integrity.digest",
          safeMessage:
            "La integridad del archivo no coincide con su contenido.",
        });
      }

      const migrated = migrateProjectToCurrent(
        packageResult.value.payload.project,
      );
      if (!migrated.ok) {
        return err(mapMigrationError(migrated.error));
      }

      const stagingId = dependencies.ids.next(
        "portfolio-import-stage",
      );
      const packageValue = immutableClone(
        packageResult.value,
      );
      const candidateProject = immutableClone(
        migrated.value,
      );
      const compatibilityValue = immutableClone(
        compatibility.value,
      );
      const preview: PortfolioImportPreview = {
        stagingId,
        fileName: preflight.value.fileName,
        byteLength: preflight.value.byteLength,
        packageType: packageValue.packageType,
        packageVersion: packageValue.packageVersion,
        sourceProjectSchemaVersion:
          compatibilityValue.sourceProjectSchemaVersion,
        candidateProjectSchemaVersion:
          candidateProject.schemaVersion,
        migrationApplied:
          compatibilityValue.migrationRequired,
        projectTitle: candidateProject.title,
        portfolioItemCount:
          candidateProject.portfolio.items.length,
        reflectionCount:
          candidateProject.reflections.length,
        checksum: packageValue.integrity.digest,
        structure: immutableClone(
          preflight.value.structure,
        ),
      };
      const staged: StagedPortfolioImport =
        immutableClone({
          ...preview,
          packageValue,
          candidateProject,
          compatibility: compatibilityValue,
        });

      pending.set(stagingId, staged);
      return ok(immutableClone(preview));
    },

    inspect: (stagingId) => {
      const staged = pending.get(stagingId);
      if (staged === undefined) {
        return err({
          code: "IMPORT_STAGE_NOT_FOUND",
          path: "stagingId",
          safeMessage:
            "La preparación de importación ya no está disponible.",
        });
      }
      return ok(immutableClone(staged));
    },

    discard: (stagingId) => {
      pending.delete(stagingId);
    },
  };
};
