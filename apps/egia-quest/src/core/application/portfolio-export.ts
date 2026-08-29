import type { DomainError } from "../domain/errors";
import type { CreativeProject } from "../domain/model";
import {
  PORTFOLIO_PACKAGE_CANONICALIZATION,
  PORTFOLIO_PACKAGE_INTEGRITY_ALGORITHM,
  PORTFOLIO_PACKAGE_INTEGRITY_SCOPE,
  PORTFOLIO_PACKAGE_TYPE,
  PORTFOLIO_PACKAGE_VERSION,
  type PortfolioPackagePayload,
  type PortfolioPackageV1,
} from "../domain/portfolio-package";
import { err, ok, type Result } from "../domain/result";
import type {
  ISODateTime,
  ProjectId,
} from "../domain/types";
import type {
  Clock,
  DownloadableFile,
  LocalFileDownloader,
  ProjectRepository,
  Sha256Hasher,
} from "../ports";
import { validatePortfolioPackageSnapshot } from "../schemas/portfolio-package-validator";
import {
  canonicalizeJson,
  createDownloadablePortfolioFile,
  measureUtf8Bytes,
} from "./portfolio-package-utils";
import { createPortfolioProjection } from "./portfolio-projection";

export const HUMAN_EXPORT_CONFIRMATION =
  "confirmed_by_human" as const;

export interface PreparePortfolioExportInput {
  readonly projectId: ProjectId;
}

export interface PortfolioExportPreview {
  readonly previewId: string;
  readonly packageType: typeof PORTFOLIO_PACKAGE_TYPE;
  readonly packageVersion: typeof PORTFOLIO_PACKAGE_VERSION;
  readonly projectTitle: string;
  readonly portfolioItemCount: number;
  readonly reflectionCount: number;
  readonly exportedAt: ISODateTime;
  readonly checksum: string;
  readonly fileName: string;
  readonly byteLength: number;
}

export interface ConfirmPortfolioExportInput {
  readonly previewId: string;
  readonly confirmation: string;
}

export interface PortfolioExportReceipt {
  readonly previewId: string;
  readonly fileName: string;
  readonly checksum: string;
  readonly byteLength: number;
}

export interface PortfolioExportDependencies {
  readonly repository: ProjectRepository;
  readonly clock: Clock;
  readonly hasher: Sha256Hasher;
  readonly downloader: LocalFileDownloader;
}

export interface PortfolioExportService {
  readonly prepare: (
    input: PreparePortfolioExportInput,
  ) => Promise<Result<PortfolioExportPreview, DomainError>>;
  readonly confirm: (
    input: ConfirmPortfolioExportInput,
  ) => Promise<Result<PortfolioExportReceipt, DomainError>>;
  readonly discard: (previewId: string) => void;
}

interface PendingExport {
  readonly preview: PortfolioExportPreview;
  readonly file: DownloadableFile;
}

const loadProject = async (
  projectId: ProjectId,
  repository: ProjectRepository,
): Promise<Result<CreativeProject, DomainError>> => {
  const loaded = await repository.load(projectId);
  if (!loaded.ok) return loaded;
  if (loaded.value === null) {
    const missingProject: DomainError = {
      code: "PROJECT_NOT_FOUND",
      path: "projectId",
      safeMessage: "No se encontró el proyecto local.",
    };
    return err(missingProject);
  }
  return ok(loaded.value);
};

export const createPortfolioExportService = (
  dependencies: PortfolioExportDependencies,
): PortfolioExportService => {
  const pending = new Map<string, PendingExport>();
  let sequence = 0;

  return {
    prepare: async (input) => {
      const loaded = await loadProject(
        input.projectId,
        dependencies.repository,
      );
      if (!loaded.ok) return loaded;

      const projection = createPortfolioProjection(loaded.value);
      if (!projection.ok) return projection;

      const exportedAt = dependencies.clock.now();
      const payload: PortfolioPackagePayload = {
        projectSchemaVersion: projection.value.schemaVersion,
        project: projection.value,
      };

      const canonicalPayload = canonicalizeJson(payload);
      if (!canonicalPayload.ok) return canonicalPayload;

      const digest = await dependencies.hasher.digestHex(
        canonicalPayload.value,
      );
      if (!digest.ok) return digest;

      const packageValue: PortfolioPackageV1 = {
        packageType: PORTFOLIO_PACKAGE_TYPE,
        packageVersion: PORTFOLIO_PACKAGE_VERSION,
        exportedAt,
        payload,
        integrity: {
          algorithm: PORTFOLIO_PACKAGE_INTEGRITY_ALGORITHM,
          canonicalization:
            PORTFOLIO_PACKAGE_CANONICALIZATION,
          scope: PORTFOLIO_PACKAGE_INTEGRITY_SCOPE,
          digest: digest.value,
        },
      };

      const validated =
        validatePortfolioPackageSnapshot(packageValue);
      if (!validated.ok) return validated;

      const fileResult =
        createDownloadablePortfolioFile(packageValue);
      if (!fileResult.ok) return fileResult;

      sequence += 1;
      const previewId =
        `portfolio-export:${sequence}:${digest.value.slice(0, 16)}`;
      const preview: PortfolioExportPreview = {
        previewId,
        packageType: packageValue.packageType,
        packageVersion: packageValue.packageVersion,
        projectTitle: projection.value.title,
        portfolioItemCount:
          projection.value.portfolio.items.length,
        reflectionCount: projection.value.reflections.length,
        exportedAt,
        checksum: digest.value,
        fileName: fileResult.value.fileName,
        byteLength: measureUtf8Bytes(
          fileResult.value.content,
        ),
      };

      pending.set(previewId, {
        preview,
        file: fileResult.value,
      });

      return ok(structuredClone(preview));
    },

    confirm: async (input) => {
      if (input.confirmation !== HUMAN_EXPORT_CONFIRMATION) {
        return err({
          code: "EXPORT_CONFIRMATION_REQUIRED",
          path: "confirmation",
          safeMessage:
            "Confirme explícitamente la descarga del portafolio revisado.",
        });
      }

      const prepared = pending.get(input.previewId);
      if (prepared === undefined) {
        return err({
          code: "EXPORT_PREVIEW_NOT_FOUND",
          path: "previewId",
          safeMessage:
            "La vista previa ya no está disponible. Genere una nueva.",
        });
      }

      const downloaded = await dependencies.downloader.download(
        prepared.file,
      );
      if (!downloaded.ok) return downloaded;

      pending.delete(input.previewId);
      return ok({
        previewId: prepared.preview.previewId,
        fileName: prepared.preview.fileName,
        checksum: prepared.preview.checksum,
        byteLength: prepared.preview.byteLength,
      });
    },

    discard: (previewId) => {
      pending.delete(previewId);
    },
  };
};
