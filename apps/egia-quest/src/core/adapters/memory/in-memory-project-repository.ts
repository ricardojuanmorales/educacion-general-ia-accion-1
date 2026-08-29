import type { DomainError } from "../../domain/errors";
import type { CreativeProject } from "../../domain/model";
import { ok, type Result } from "../../domain/result";
import type { ProjectId } from "../../domain/types";
import type { RecoverableProjectRepository } from "../../ports";

const cloneProject = (project: CreativeProject): CreativeProject =>
  structuredClone(project);

export class InMemoryProjectRepository
  implements RecoverableProjectRepository
{
  readonly #projects = new Map<string, CreativeProject>();
  #mostRecentProjectId: ProjectId | null = null;

  constructor(initial: readonly CreativeProject[] = []) {
    for (const project of initial) {
      this.#projects.set(project.id as string, cloneProject(project));
      this.#mostRecentProjectId = project.id;
    }
  }

  async load(
    projectId: ProjectId,
  ): Promise<Result<CreativeProject | null, DomainError>> {
    const project = this.#projects.get(projectId as string);
    return ok(project ? cloneProject(project) : null);
  }

  async loadMostRecent(): Promise<
    Result<CreativeProject | null, DomainError>
  > {
    if (!this.#mostRecentProjectId) return ok(null);
    return this.load(this.#mostRecentProjectId);
  }

  async save(project: CreativeProject): Promise<Result<void, DomainError>> {
    this.#projects.set(project.id as string, cloneProject(project));
    this.#mostRecentProjectId = project.id;
    return ok(undefined);
  }

  async remove(projectId: ProjectId): Promise<Result<void, DomainError>> {
    this.#projects.delete(projectId as string);
    if (this.#mostRecentProjectId === projectId) {
      this.#mostRecentProjectId = null;
    }
    return ok(undefined);
  }

  async clearMostRecent(): Promise<Result<void, DomainError>> {
    if (this.#mostRecentProjectId) {
      this.#projects.delete(this.#mostRecentProjectId as string);
    }
    this.#mostRecentProjectId = null;
    return ok(undefined);
  }
}
