
type JsonRecord = Readonly<Record<string, unknown>>;

const compareKeys = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const canonicalize = (value: unknown): string => {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("NON_FINITE_NUMBER");
    }
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as JsonRecord)
      .filter((entry) => entry[1] !== undefined)
      .sort(([left], [right]) => compareKeys(left, right));

    return `{${entries
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`)
      .join(",")}}`;
  }

  throw new TypeError(`NON_JSON_VALUE:${typeof value}`);
};

export const canonicalStringify = (value: unknown): string =>
  canonicalize(value);

export const sha256Hex = async (value: string): Promise<string> => {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("WEB_CRYPTO_UNAVAILABLE");
  }

  const digest = await subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};
