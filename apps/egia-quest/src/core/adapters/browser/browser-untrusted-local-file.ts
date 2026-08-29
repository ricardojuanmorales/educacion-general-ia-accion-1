import type { UntrustedLocalFile } from "../../ports";

export type BrowserFileSource = Pick<
  File,
  "name" | "size" | "type" | "arrayBuffer"
>;

export const createBrowserUntrustedLocalFile = (
  file: BrowserFileSource,
): UntrustedLocalFile => ({
  name: file.name,
  size: file.size,
  mediaType: file.type,
  readBytes: async () =>
    new Uint8Array(await file.arrayBuffer()),
});
