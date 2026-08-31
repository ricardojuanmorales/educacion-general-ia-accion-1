import { err, ok, type Result } from "../domain/result";
import {
  CURRENT_SCHEMA_VERSION,
  type CreativeProject,
} from "../domain/model";
import { validateProjectInvariants } from "../domain/invariants";
import type { DomainError } from "../domain/errors";
import type { ProjectId } from "../domain/types";
import type { Clock, IdGenerator, ProjectRepository } from "../ports";

export interface CreateProjectInput {
  readonly title: string;
  readonly pseudonym: string;
  readonly context?: string;
}

export interface CreateProjectDependencies {
  readonly repository: ProjectRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

export const createProject = async (
  input: CreateProjectInput,
  dependencies: CreateProjectDependencies,
): Promise<Result<CreativeProject, DomainError>> => {
  const now = dependencies.clock.now();
  const context = input.context?.trim();
  const profile = {
    pseudonym: input.pseudonym.trim(),
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      textScale: "default" as const,
    },
    ...(context ? { context } : {}),
  };

  const project: CreativeProject = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: dependencies.ids.next("project") as ProjectId,
    title: input.title.trim(),
    status: "new",
    profile,
    missions: [],
    activityResponses: [],
    evidence: [],
    reflections: [],
    decisions: [],
    portfolio: { items: [] },
    featureFlags: {
      facilitatorView: false,
      groupDashboard: false,
      embeddedAI: false,
      cloudSync: false,
      analytics: false,
      autoPublish: false,
      realData: false,
    },
    createdAt: now,
    updatedAt: now,
  };

  const [firstError] = validateProjectInvariants(project);
  if (firstError) return err(firstError);

  const saved = await dependencies.repository.save(project);
  if (!saved.ok) return saved;
  return ok(project);
};
