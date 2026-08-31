import { parseAccessibilityPreferences } from "../domain/accessibility";
import type { DomainError } from "../domain/errors";
import { validateProjectInvariants } from "../domain/invariants";
import type { CreativeProject } from "../domain/model";
import { err, ok, type Result } from "../domain/result";
import type { ProjectId } from "../domain/types";
import type { Clock, ProjectRepository } from "../ports";

export interface UpdateAccessibilityPreferencesInput {
  readonly projectId: ProjectId;
  readonly preferences: unknown;
}

export interface UpdateAccessibilityPreferencesDependencies {
  readonly repository: ProjectRepository;
  readonly clock: Clock;
}

export const updateAccessibilityPreferences = async (
  input: UpdateAccessibilityPreferencesInput,
  dependencies: UpdateAccessibilityPreferencesDependencies,
): Promise<Result<CreativeProject, DomainError>> => {
  const parsed = parseAccessibilityPreferences(input.preferences);
  if (!parsed.ok) return parsed;

  const loaded = await dependencies.repository.load(input.projectId);
  if (!loaded.ok) return loaded;

  if (!loaded.value) {
    return err({
      code: "PROJECT_NOT_FOUND",
      path: "projectId",
      safeMessage: "No se encontró el proyecto solicitado.",
    });
  }

  const updated: CreativeProject = {
    ...loaded.value,
    profile: {
      ...loaded.value.profile,
      accessibility: parsed.value,
    },
    updatedAt: dependencies.clock.now(),
  };

  const [firstError] = validateProjectInvariants(updated);
  if (firstError) return err(firstError);

  const saved = await dependencies.repository.save(updated);
  if (!saved.ok) return saved;

  return ok(updated);
};
