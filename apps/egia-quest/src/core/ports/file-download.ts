import type { DomainError } from "../domain/errors";
import type { Result } from "../domain/result";

export interface DownloadableFile {
  readonly fileName: string;
  readonly mediaType: string;
  readonly content: string;
}

export interface LocalFileDownloader {
  readonly download: (
    file: DownloadableFile,
  ) => Promise<Result<void, DomainError>>;
}
