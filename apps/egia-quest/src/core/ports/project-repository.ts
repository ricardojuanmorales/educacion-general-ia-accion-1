
import type { DomainError } from "../domain/errors";
import type { CreativeProject } from "../domain/model";
import type { Result } from "../domain/result";
import type { ISODateTime, ProjectId } from "../domain/types";

export interface ProjectRepository {
  load(
    projectId: ProjectId,
  ): Promise<Result<CreativeProject | null, DomainError>>;
  save(project: CreativeProject): Promise<Result<void, DomainError>>;
  remove(projectId: ProjectId): Promise<Result<void, DomainError>>;
}

export interface RecoverableProjectRepository extends ProjectRepository {
  loadMostRecent(): Promise<Result<CreativeProject | null, DomainError>>;
  clearMostRecent(): Promise<Result<void, DomainError>>;
}

export interface ProjectMetadata {
  readonly projectId: ProjectId;
  readonly title: string;
  readonly schemaVersion: string;
  readonly updatedAt: ISODateTime;
}

export interface IndexedProjectRepository extends RecoverableProjectRepository {
  listProjectMetadata(): Promise<
    Result<readonly ProjectMetadata[], DomainError>
  >;
}
