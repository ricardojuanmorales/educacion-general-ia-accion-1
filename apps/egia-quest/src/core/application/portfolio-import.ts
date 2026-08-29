import type { DomainError } from "../domain/errors";
import type { CreativeProject } from "../domain/model";
import { err, ok, type Result } from "../domain/result";
import type { ProjectId } from "../domain/types";
import type {
  IdGenerator,
  ProjectRepository,
} from "../ports";
import { validateProjectSnapshot } from "../schemas/runtime-validators";
import type { PortfolioImportStagingService } from "./portfolio-import-staging";
import {
  comparePortfolioProjectsSemantically,
  type SemanticEquivalenceResult,
} from "./portfolio-semantic-equivalence";

export const HUMAN_IMPORT_CONFIRMATION =
  "confirmed_by_human" as const;

export interface ConfirmPortfolioImportInput {
  readonly stagingId: string;
  readonly confirmation: string;
}

export interface ConfirmedPortfolioImport {
  readonly projectId: ProjectId;
  readonly title: string;
  readonly sourceProjectSchemaVersion: string;
  readonly storedProjectSchemaVersion: string;
  readonly migrationApplied: boolean;
  readonly semanticEquivalence:
    Extract<SemanticEquivalenceResult, { equivalent: true }>;
}

export interface PortfolioImportDependencies {
  readonly staging: Pick<
    PortfolioImportStagingService,
    "inspect" | "discard"
  >;
  readonly repository: ProjectRepository;
  readonly ids: IdGenerator;
}

export interface PortfolioImportService {
  readonly confirm: (
    input: ConfirmPortfolioImportInput,
  ) => Promise<Result<ConfirmedPortfolioImport, DomainError>>;
}

const importSaveError = (
  source: DomainError,
): DomainError => ({
  code: "IMPORT_SAVE_FAILED",
  path: "repository.save",
  safeMessage:
    "No fue posible guardar la copia importada en el almacenamiento local.",
  details: {
    sourceCode: source.code,
  },
});

const roundtripError = (
  safeMessage: string,
  details?: Readonly<Record<string, unknown>>,
): DomainError => {
  const base: DomainError = {
    code: "ROUNDTRIP_NOT_EQUIVALENT",
    path: "roundtrip",
    safeMessage,
  };
  return details === undefined ? base : { ...base, details };
};

const createLocalCopy = (
  project: CreativeProject,
  ids: IdGenerator,
): Result<CreativeProject, DomainError> => {
  const nextId = ids.next("project") as ProjectId;
  if (nextId === project.id) {
    return err({
      code: "DUPLICATE_IDENTIFIER",
      path: "import.project.id",
      safeMessage:
        "No fue posible generar un identificador local nuevo para la copia.",
    });
  }

  const candidate: CreativeProject = {
    ...structuredClone(project),
    id: nextId,
  };
  const validated = validateProjectSnapshot(candidate);
  return validated.ok ? ok(validated.value) : err(validated.error);
};

export const createPortfolioImportService = (
  dependencies: PortfolioImportDependencies,
): PortfolioImportService => ({
  confirm: async (input) => {
    if (input.confirmation !== HUMAN_IMPORT_CONFIRMATION) {
      return err({
        code: "IMPORT_CONFIRMATION_REQUIRED",
        path: "confirmation",
        safeMessage:
          "La importación requiere confirmación humana explícita.",
      });
    }

    const staged = dependencies.staging.inspect(
      input.stagingId,
    );
    if (!staged.ok) return staged;

    const copy = createLocalCopy(
      staged.value.candidateProject,
      dependencies.ids,
    );
    if (!copy.ok) return copy;

    const preSaveEquivalence =
      comparePortfolioProjectsSemantically(
        staged.value.candidateProject,
        copy.value,
      );
    if (!preSaveEquivalence.equivalent) {
      return err(
        roundtripError(
          "La copia local propuesta no preserva el significado del proyecto.",
          {
            firstDifferencePath:
              preSaveEquivalence.firstDifferencePath,
            reason: preSaveEquivalence.reason,
          },
        ),
      );
    }

    const saved = await dependencies.repository.save(
      copy.value,
    );
    if (!saved.ok) {
      return err(importSaveError(saved.error));
    }

    const recovered = await dependencies.repository.load(
      copy.value.id,
    );
    if (!recovered.ok) {
      return err(
        roundtripError(
          "No fue posible recuperar la copia local después de guardarla.",
          {
            sourceCode: recovered.error.code,
          },
        ),
      );
    }
    if (recovered.value === null) {
      return err(
        roundtripError(
          "La copia local guardada no pudo recuperarse.",
        ),
      );
    }

    const equivalence =
      comparePortfolioProjectsSemantically(
        staged.value.candidateProject,
        recovered.value,
      );
    if (!equivalence.equivalent) {
      return err(
        roundtripError(
          "La copia recuperada no es semánticamente equivalente al portafolio validado.",
          {
            firstDifferencePath:
              equivalence.firstDifferencePath,
            reason: equivalence.reason,
          },
        ),
      );
    }

    dependencies.staging.discard(input.stagingId);

    return ok({
      projectId: recovered.value.id,
      title: recovered.value.title,
      sourceProjectSchemaVersion:
        staged.value.sourceProjectSchemaVersion,
      storedProjectSchemaVersion:
        recovered.value.schemaVersion,
      migrationApplied:
        staged.value.migrationApplied,
      semanticEquivalence: equivalence,
    });
  },
});
