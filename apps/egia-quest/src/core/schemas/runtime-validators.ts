import type { ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { DomainError } from "../domain/errors";
import { validateProjectInvariants } from "../domain/invariants";
import type {
  CreativeProject,
  ExportPackage,
} from "../domain/model";
import { err, ok, type Result } from "../domain/result";
import exportPackageSchema from "./export-package.schema.json";
import {
  PROJECT_SCHEMA_REGISTRY,
  type ProjectJsonSchema,
} from "./schema-registry";
import {
  CURRENT_SCHEMA_VERSION,
  PREVIOUS_SCHEMA_VERSION,
  type KnownSchemaVersion,
} from "./schema-version";

type JsonSchema = Record<string, unknown>;

export type HistoricalCreativeProjectAlpha1 =
  Omit<CreativeProject, "schemaVersion"> & {
    readonly schemaVersion: typeof PREVIOUS_SCHEMA_VERSION;
  };

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  validateFormats: true,
});
addFormats(ajv);

for (const schema of Object.values(PROJECT_SCHEMA_REGISTRY)) {
  ajv.addSchema(schema as JsonSchema);
}

const validatorFor = (version: KnownSchemaVersion): ValidateFunction => {
  const schema = PROJECT_SCHEMA_REGISTRY[version] as ProjectJsonSchema;
  const validator = ajv.getSchema(String(schema.$id));
  if (!validator) {
    throw new Error(`PROJECT_SCHEMA_NOT_REGISTERED:${version}`);
  }
  return validator;
};

const validateCurrentProjectSchema = validatorFor(CURRENT_SCHEMA_VERSION);
const validateHistoricalProjectSchema = validatorFor(
  PREVIOUS_SCHEMA_VERSION,
);
const validateExportSchema = ajv.compile(
  exportPackageSchema as unknown as JsonSchema,
);

const validationError = (
  code: Extract<
    DomainError["code"],
    "PERSISTENCE_DATA_CORRUPTED" | "EXPORT_PACKAGE_INVALID"
  >,
  path: string,
  safeMessage: string,
  errorCount: number,
): DomainError => ({
  code,
  path,
  safeMessage,
  details: { errorCount },
});

const validateProjectShape = <
  ProjectType extends { readonly schemaVersion: string },
>(
  input: unknown,
  validator: ValidateFunction,
  path: string,
  formatMessage: string,
  invariantMessage: string,
): Result<ProjectType, DomainError> => {
  if (!validator(input)) {
    return err(
      validationError(
        "PERSISTENCE_DATA_CORRUPTED",
        path,
        formatMessage,
        validator.errors?.length ?? 0,
      ),
    );
  }

  const project = structuredClone(input) as ProjectType;
  const invariantCandidate = {
    ...structuredClone(project),
    schemaVersion: CURRENT_SCHEMA_VERSION,
  } as unknown as CreativeProject;
  const invariantErrors = validateProjectInvariants(invariantCandidate);

  if (invariantErrors.length > 0) {
    return err({
      code: "PERSISTENCE_DATA_CORRUPTED",
      path,
      safeMessage: invariantMessage,
      details: {
        errorCount: invariantErrors.length,
        firstInvariant: invariantErrors[0]?.code ?? "UNKNOWN",
      },
    });
  }

  return ok(project);
};

export const validateProjectSnapshot = (
  input: unknown,
): Result<CreativeProject, DomainError> =>
  validateProjectShape<CreativeProject>(
    input,
    validateCurrentProjectSchema,
    "storage.project",
    "El proyecto local no supera la validación de formato.",
    "El proyecto local contiene relaciones inconsistentes.",
  );

export const validateHistoricalProjectAlpha1Snapshot = (
  input: unknown,
): Result<HistoricalCreativeProjectAlpha1, DomainError> =>
  validateProjectShape<HistoricalCreativeProjectAlpha1>(
    input,
    validateHistoricalProjectSchema,
    "migration.source",
    "El proyecto fuente no supera la validación de su versión.",
    "El proyecto fuente contiene relaciones inconsistentes.",
  );

export const validateExportPackageSnapshot = (
  input: unknown,
): Result<ExportPackage, DomainError> => {
  if (!validateExportSchema(input)) {
    return err(
      validationError(
        "EXPORT_PACKAGE_INVALID",
        "exportPackage",
        "La vista previa de exportación no supera la validación.",
        validateExportSchema.errors?.length ?? 0,
      ),
    );
  }

  const packageValue = structuredClone(input) as ExportPackage;
  const projectResult = validateProjectSnapshot(packageValue.project);
  if (!projectResult.ok) {
    return err({
      code: "EXPORT_PACKAGE_INVALID",
      path: "exportPackage.project",
      safeMessage: "El proyecto de exportación contiene datos inconsistentes.",
      details: { sourceCode: projectResult.error.code },
    });
  }

  return ok(packageValue);
};
