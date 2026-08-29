export interface UntrustedLocalFile {
  readonly name: string;
  readonly size: number;
  readonly mediaType: string;
  readonly readBytes: () => Promise<Uint8Array>;
}
