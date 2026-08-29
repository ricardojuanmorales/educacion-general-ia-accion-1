import type { DomainError } from "../domain/errors";
import type {
  CreativeProject,
  ExportPackage,
} from "../domain/model";
import { err, type Result } from "../domain/result";
import type { ProjectRepository, Clock } from "../ports";
import { validateExportPackageSnapshot } from "../schemas/runtime-validators";
import type {
  ExportPreviewResult,
  PreviewExportInput,
} from "./creative-cycle-contracts";
import { createPortfolioProjection } from "./portfolio-projection";

export interface PreviewExportDependencies {
  readonly repository: ProjectRepository;
  readonly clock: Clock;
}

const loadProject = async (
  input: PreviewExportInput,
  repository: ProjectRepository,
): Promise<Result<CreativeProject, DomainError>> => {
  const loaded = await repository.load(input.projectId);
  if (!loaded.ok) return loaded;
  if (!loaded.value) {
    return err({
      code: "PROJECT_NOT_FOUND",
      path: "projectId",
      safeMessage: "No se encontró el proyecto local.",
    });
  }
  return { ok: true, value: loaded.value };
};

export const previewExport = async (
  input: PreviewExportInput,
  dependencies: PreviewExportDependencies,
): Promise<ExportPreviewResult> => {
  const loaded = await loadProject(input, dependencies.repository);
  if (!loaded.ok) return loaded;

  const projection = createPortfolioProjection(loaded.value);
  if (!projection.ok) return projection;

  const packageValue: ExportPackage = {
    exportType: "storylab_project",
    schemaVersion: projection.value.schemaVersion,
    exportedAt: dependencies.clock.now(),
    project: projection.value,
  };

  return validateExportPackageSnapshot(packageValue);
};
