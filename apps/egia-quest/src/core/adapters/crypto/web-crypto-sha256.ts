import { err, ok } from "../../domain/result";
import type { Sha256Hasher } from "../../ports";

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");

export const createWebCryptoSha256Hasher = (
  cryptoApi: Pick<Crypto, "subtle"> = globalThis.crypto,
): Sha256Hasher => ({
  digestHex: async (value) => {
    try {
      const encoded = new TextEncoder().encode(value);
      const digest = await cryptoApi.subtle.digest("SHA-256", encoded);
      return ok(toHex(new Uint8Array(digest)));
    } catch {
      return err({
        code: "EXPORT_INTEGRITY_UNAVAILABLE",
        path: "integrity.digest",
        safeMessage:
          "No fue posible calcular la integridad del archivo local.",
      });
    }
  },
});
