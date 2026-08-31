import type { DomainError } from "../domain/errors";
import {
  PORTFOLIO_PACKAGE_MEDIA_TYPE,
  type PortfolioPackageV1,
} from "../domain/portfolio-package";
import { err, ok, type Result } from "../domain/result";
import type { ISODateTime } from "../domain/types";
import type { DownloadableFile } from "../ports";

export const PORTFOLIO_EXPORT_MAX_BYTES = 1_048_576;

type CanonicalJsonPrimitive =
  | null
  | boolean
  | number
  | string;

interface CanonicalJsonObject {
  readonly [key: string]: CanonicalJson;
}

type CanonicalJson =
  | CanonicalJsonPrimitive
  | readonly CanonicalJson[]
  | CanonicalJsonObject;

const normalizeJson = (
  value: unknown,
  ancestors: WeakSet<object>,
): CanonicalJson => {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("NON_FINITE_NUMBER");
    }
    return Object.is(value, -0) ? 0 : value;
  }

  if (typeof value !== "object") {
    throw new TypeError("NON_JSON_VALUE");
  }

  if (ancestors.has(value)) {
    throw new TypeError("CYCLIC_JSON_VALUE");
  }
  ancestors.add(value);

  try {
    if (Array.isArray(value)) {
      return value.map((item) => normalizeJson(item, ancestors));
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("NON_PLAIN_JSON_OBJECT");
    }

    const symbolKey = Reflect.ownKeys(value).find(
      (key) => typeof key === "symbol",
    );
    if (symbolKey !== undefined) {
      throw new TypeError("SYMBOL_KEY");
    }

    const source = value as Record<string, unknown>;
    const normalized: Record<string, CanonicalJson> = {};
    for (const key of Object.keys(source).sort()) {
      const item = source[key];
      if (item === undefined) {
        throw new TypeError("UNDEFINED_JSON_VALUE");
      }
      normalized[key] = normalizeJson(item, ancestors);
    }
    return normalized;
  } finally {
    ancestors.delete(value);
  }
};

export const canonicalizeJson = (
  value: unknown,
): Result<string, DomainError> => {
  try {
    return ok(JSON.stringify(normalizeJson(value, new WeakSet())));
  } catch {
    return err({
      code: "EXPORT_PACKAGE_INVALID",
      path: "payload",
      safeMessage:
        "El contenido exportable no puede representarse como JSON canónico.",
    });
  }
};

const slugifyTitle = (title: string): string => {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "proyecto";
};

const compactTimestamp = (value: ISODateTime): string =>
  value
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/u, "Z");

export const createPortfolioFileName = (
  title: string,
  exportedAt: ISODateTime,
): string =>
  `ai-storylab-${slugifyTitle(title)}-${compactTimestamp(exportedAt)}.storylab.json`;

export const serializePortfolioPackage = (
  packageValue: PortfolioPackageV1,
): string => `${JSON.stringify(packageValue, null, 2)}\n`;

export const measureUtf8Bytes = (value: string): number =>
  new TextEncoder().encode(value).byteLength;

export const createDownloadablePortfolioFile = (
  packageValue: PortfolioPackageV1,
): Result<DownloadableFile, DomainError> => {
  const content = serializePortfolioPackage(packageValue);
  const byteLength = measureUtf8Bytes(content);

  if (byteLength > PORTFOLIO_EXPORT_MAX_BYTES) {
    return err({
      code: "EXPORT_FILE_TOO_LARGE",
      path: "download.content",
      safeMessage:
        "El portafolio excede el tamaño máximo permitido para exportación.",
      details: {
        maximumBytes: PORTFOLIO_EXPORT_MAX_BYTES,
        receivedBytes: byteLength,
      },
    });
  }

  return ok({
    fileName: createPortfolioFileName(
      packageValue.payload.project.title,
      packageValue.exportedAt,
    ),
    mediaType: PORTFOLIO_PACKAGE_MEDIA_TYPE,
    content,
  });
};
