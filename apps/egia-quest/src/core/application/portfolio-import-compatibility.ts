import type { DomainError } from "../domain/errors";
import { err, ok, type Result } from "../domain/result";
import {
  CURRENT_SCHEMA_VERSION,
  PREVIOUS_SCHEMA_VERSION,
} from "../schemas/schema-version";

interface JsonRecord {
  readonly [key: string]: unknown;
}

export interface PortfolioCompatibilityDecision {
  readonly sourceProjectSchemaVersion:
    | typeof CURRENT_SCHEMA_VERSION
    | typeof PREVIOUS_SCHEMA_VERSION;
  readonly targetProjectSchemaVersion:
    typeof CURRENT_SCHEMA_VERSION;
  readonly migrationRequired: boolean;
}

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const compatibilityError = (
  code: Extract<
    DomainError["code"],
    | "IMPORT_PACKAGE_INVALID"
    | "SCHEMA_VERSION_UNSUPPORTED"
    | "LEGACY_MIGRATION_REQUIRED"
  >,
  path: string,
  safeMessage: string,
  details?: Readonly<Record<string, unknown>>,
): DomainError => {
  const base: DomainError = {
    code,
    path,
    safeMessage,
  };
  return details === undefined ? base : { ...base, details };
};

const isLegacyProject = (
  project: JsonRecord,
  version: unknown,
): boolean =>
  project.source === "legacy_v0_3" ||
  version === "legacy_v0.3" ||
  version === "legacy_v0_3";

export const classifyPortfolioImportCompatibility = (
  input: unknown,
): Result<PortfolioCompatibilityDecision, DomainError> => {
  if (!isRecord(input)) {
    return err(
      compatibilityError(
        "IMPORT_PACKAGE_INVALID",
        "portfolioPackage",
        "El archivo no contiene un paquete de portafolio válido.",
      ),
    );
  }

  if (
    input.packageType !== "storylab_portfolio" ||
    input.packageVersion !== "1.0.0"
  ) {
    return err(
      compatibilityError(
        "IMPORT_PACKAGE_INVALID",
        "portfolioPackage.packageVersion",
        "La versión del paquete de portafolio no es compatible.",
      ),
    );
  }

  if (!isRecord(input.payload) || !isRecord(input.payload.project)) {
    return err(
      compatibilityError(
        "IMPORT_PACKAGE_INVALID",
        "portfolioPackage.payload",
        "El paquete no contiene un proyecto reconocible.",
      ),
    );
  }

  const version = input.payload.projectSchemaVersion;
  if (isLegacyProject(input.payload.project, version)) {
    return err(
      compatibilityError(
        "LEGACY_MIGRATION_REQUIRED",
        "portfolioPackage.payload.projectSchemaVersion",
        "La versión legacy requiere un proceso de migración separado.",
      ),
    );
  }

  if (version === CURRENT_SCHEMA_VERSION) {
    return ok({
      sourceProjectSchemaVersion: CURRENT_SCHEMA_VERSION,
      targetProjectSchemaVersion: CURRENT_SCHEMA_VERSION,
      migrationRequired: false,
    });
  }

  if (version === PREVIOUS_SCHEMA_VERSION) {
    return ok({
      sourceProjectSchemaVersion: PREVIOUS_SCHEMA_VERSION,
      targetProjectSchemaVersion: CURRENT_SCHEMA_VERSION,
      migrationRequired: true,
    });
  }

  if (typeof version === "string") {
    return err(
      compatibilityError(
        "SCHEMA_VERSION_UNSUPPORTED",
        "portfolioPackage.payload.projectSchemaVersion",
        "La versión del proyecto no es compatible.",
        {
          received: version,
          current: CURRENT_SCHEMA_VERSION,
          supportedPrevious: PREVIOUS_SCHEMA_VERSION,
        },
      ),
    );
  }

  return err(
    compatibilityError(
      "IMPORT_PACKAGE_INVALID",
      "portfolioPackage.payload.projectSchemaVersion",
      "El paquete no declara una versión de proyecto válida.",
    ),
  );
};
