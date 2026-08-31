import type { DomainError } from "../domain/errors";
import type { CreativeProject } from "../domain/model";
import type { Result } from "../domain/result";
import type { RecoverableProjectRepository } from "../ports";

export const recoverProject = (
  repository: RecoverableProjectRepository,
): Promise<Result<CreativeProject | null, DomainError>> =>
  repository.loadMostRecent();

export const clearRecoveredProject = (
  repository: RecoverableProjectRepository,
): Promise<Result<void, DomainError>> =>
  repository.clearMostRecent();
