import type { ValidateFunction } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { DomainError } from "../domain/errors";
import type { CreativeProject } from "../domain/model";
import type { PortfolioPackageV1 } from "../domain/portfolio-package";
import { err, ok, type Result } from "../domain/result";
import portfolioPackageSchema from "./portfolio-package.schema.json";
import {
  type HistoricalCreativeProjectAlpha1,
  validateHistoricalProjectAlpha1Snapshot,
  validateProjectSnapshot,
} from "./runtime-validators";
import { PROJECT_SCHEMA_REGISTRY } from "./schema-registry";
import {
  CURRENT_SCHEMA_VERSION,
  PREVIOUS_SCHEMA_VERSION,
} from "./schema-version";

export type KnownPortfolioProject =
  | CreativeProject
  | HistoricalCreativeProjectAlpha1;

export type KnownPortfolioPackage =
  PortfolioPackageV1<KnownPortfolioProject>;

type JsonSchema = Record<string, unknown>;

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  validateFormats: true,
});
addFormats(ajv);

for (const schema of Object.values(PROJECT_SCHEMA_REGISTRY)) {
  ajv.addSchema(schema as JsonSchema);
}

const validatePortfolioPackage: ValidateFunction = ajv.compile(
  portfolioPackageSchema as unknown as JsonSchema,
);

const invalidPackage = (
  safeMessage: string,
  details?: Readonly<Record<string, unknown>>,
): DomainError => {
  const base: DomainError = {
    code: "EXPORT_PACKAGE_INVALID",
    path: "portfolioPackage",
    safeMessage,
  };
  return details === undefined ? base : { ...base, details };
};

export const validatePortfolioPackageSnapshot = (
  input: unknown,
): Result<KnownPortfolioPackage, DomainError> => {
  if (!validatePortfolioPackage(input)) {
    return err(
      invalidPackage(
        "El paquete de portafolio no supera la validación de formato.",
        {
          errorCount:
            validatePortfolioPackage.errors?.length ?? 0,
        },
      ),
    );
  }

  const packageValue =
    structuredClone(input) as KnownPortfolioPackage;
  const version = packageValue.payload.projectSchemaVersion;
  const project = packageValue.payload.project;

  if (version !== project.schemaVersion) {
    return err(
      invalidPackage(
        "La versión declarada no coincide con el proyecto incluido.",
      ),
    );
  }

  const projectResult =
    version === CURRENT_SCHEMA_VERSION
      ? validateProjectSnapshot(project)
      : version === PREVIOUS_SCHEMA_VERSION
        ? validateHistoricalProjectAlpha1Snapshot(project)
        : undefined;

  if (projectResult === undefined || !projectResult.ok) {
    return err(
      invalidPackage(
        "El proyecto incluido contiene datos inconsistentes.",
        projectResult === undefined
          ? { receivedVersion: version }
          : { sourceCode: projectResult.error.code },
      ),
    );
  }

  return ok(packageValue);
};
