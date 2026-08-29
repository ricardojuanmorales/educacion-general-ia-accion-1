import type { DomainError } from "../domain/errors";
import type { CreativeProject } from "../domain/model";
import type { Result } from "../domain/result";
import type { ProjectId } from "../domain/types";
import type { ProjectRepository } from "../ports";

export const loadProject = (
  projectId: ProjectId,
  repository: ProjectRepository,
): Promise<Result<CreativeProject | null, DomainError>> =>
  repository.load(projectId);
