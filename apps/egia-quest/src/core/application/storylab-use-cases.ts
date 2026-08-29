import type { DomainError } from "../domain/errors";
import type {
  CreativeProject,
  ExportPackage,
} from "../domain/model";
import type { Result } from "../domain/result";
import type { ProjectId } from "../domain/types";
import type { RecoverableProjectRepository } from "../ports";
import type { CreateProjectInput } from "./create-project";
import { createProject } from "./create-project";
import {
  createCreativeCycleUseCases,
  type CreativeCycleDependencies,
} from "./creative-cycle";
import type {
  CreativeCycleUseCases,
  CreativeCycleProjectResult,
} from "./creative-cycle-contracts";
import { previewExport } from "./preview-export";
import {
  clearRecoveredProject,
  recoverProject,
} from "./recover-project";
import { removeProject } from "./remove-project";

export interface StoryLabDependencies
  extends Omit<CreativeCycleDependencies, "repository"> {
  readonly repository: RecoverableProjectRepository;
}

export interface StoryLabUseCases extends CreativeCycleUseCases {
  readonly createProject: (
    input: CreateProjectInput,
  ) => Promise<CreativeCycleProjectResult>;
  readonly recoverProject: () => Promise<
    Result<CreativeProject | null, DomainError>
  >;
  readonly removeProject: (
    projectId: ProjectId,
  ) => Promise<Result<void, DomainError>>;
  readonly clearRecovery: () => Promise<Result<void, DomainError>>;
}

export const createStoryLabUseCases = (
  dependencies: StoryLabDependencies,
): StoryLabUseCases => ({
  createProject: (input) => createProject(input, dependencies),
  ...createCreativeCycleUseCases(dependencies),
  previewExport: (input) => previewExport(input, dependencies),
  recoverProject: () => recoverProject(dependencies.repository),
  removeProject: (projectId) =>
    removeProject(projectId, dependencies.repository),
  clearRecovery: () => clearRecoveredProject(dependencies.repository),
});
