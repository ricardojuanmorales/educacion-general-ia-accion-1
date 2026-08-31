import { err, ok } from "../../domain/result";
import type {
  DownloadableFile,
  LocalFileDownloader,
} from "../../ports";

export interface BrowserFileDownloadDependencies {
  readonly documentApi: Document;
  readonly urlApi: Pick<
    typeof URL,
    "createObjectURL" | "revokeObjectURL"
  >;
  readonly BlobCtor: typeof Blob;
}

const browserDependencies = (): BrowserFileDownloadDependencies => ({
  documentApi: globalThis.document,
  urlApi: globalThis.URL,
  BlobCtor: globalThis.Blob,
});

export const createBrowserFileDownloader = (
  dependencies: BrowserFileDownloadDependencies = browserDependencies(),
): LocalFileDownloader => ({
  download: async (file: DownloadableFile) => {
    let objectUrl: string | undefined;
    try {
      const blob = new dependencies.BlobCtor(
        [file.content],
        { type: file.mediaType },
      );
      objectUrl = dependencies.urlApi.createObjectURL(blob);
      const anchor = dependencies.documentApi.createElement("a");
      anchor.href = objectUrl;
      anchor.download = file.fileName;
      anchor.rel = "noopener";
      dependencies.documentApi.body.append(anchor);
      anchor.click();
      anchor.remove();
      dependencies.urlApi.revokeObjectURL(objectUrl);
      return ok(undefined);
    } catch {
      if (objectUrl !== undefined) {
        dependencies.urlApi.revokeObjectURL(objectUrl);
      }
      return err({
        code: "EXPORT_DOWNLOAD_FAILED",
        path: "download",
        safeMessage:
          "No fue posible iniciar la descarga local del portafolio.",
      });
    }
  },
});
