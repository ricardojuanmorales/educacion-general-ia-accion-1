import type { DomainError } from "../domain/errors";
import { validateProjectInvariants } from "../domain/invariants";
import type { CreativeProject } from "../domain/model";
import { err, ok, type Result } from "../domain/result";
import type { ProjectRepository } from "../ports";

export const saveProject = async (
  project: CreativeProject,
  repository: ProjectRepository,
): Promise<Result<CreativeProject, DomainError>> => {
  const [firstError] = validateProjectInvariants(project);
  if (firstError) return err(firstError);

  const saved = await repository.save(project);
  if (!saved.ok) return saved;
  return ok(project);
};
