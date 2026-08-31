import type { DomainError } from "../domain/errors";
import type { Result } from "../domain/result";
import type { ProjectId } from "../domain/types";
import type { ProjectRepository } from "../ports";

export const removeProject = (
  projectId: ProjectId,
  repository: ProjectRepository,
): Promise<Result<void, DomainError>> => repository.remove(projectId);
