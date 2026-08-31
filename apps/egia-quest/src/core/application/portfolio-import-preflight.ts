import type { DomainError } from "../domain/errors";
import { err, ok, type Result } from "../domain/result";
import type { UntrustedLocalFile } from "../ports";
import { PORTFOLIO_EXPORT_MAX_BYTES } from "./portfolio-package-utils";

export const PORTFOLIO_IMPORT_MAX_BYTES =
  PORTFOLIO_EXPORT_MAX_BYTES;
export const PORTFOLIO_IMPORT_MAX_DEPTH = 32;
export const PORTFOLIO_IMPORT_MAX_STRUCTURAL_NODES = 20_000;

export interface JsonStructureMetrics {
  readonly maximumDepth: number;
  readonly structuralNodes: number;
}

export interface PreflightPortfolioFile {
  readonly fileName: string;
  readonly byteLength: number;
  readonly parsed: unknown;
  readonly structure: JsonStructureMetrics;
}

interface StructureFrame {
  readonly value: unknown;
  readonly depth: number;
}

const importError = (
  code: Extract<
    DomainError["code"],
    | "IMPORT_FILE_TOO_LARGE"
    | "IMPORT_JSON_MALFORMED"
    | "IMPORT_STRUCTURE_TOO_COMPLEX"
    | "IMPORT_PACKAGE_INVALID"
  >,
  path: string,
  safeMessage: string,
  details?: Readonly<Record<string, unknown>>,
): DomainError => {
  const base: DomainError = {
    code,
    path,
    safeMessage,
  };
  return details === undefined ? base : { ...base, details };
};

const isPlainRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const sanitizeUntrustedFileName = (
  value: string,
): string => {
  const leaf = value.split(/[\\/]/u).at(-1) ?? "";
  const sanitized = leaf
    .replace(/[\u0000-\u001f\u007f]/gu, "")
    .trim()
    .slice(0, 120);
  return sanitized || "portafolio.storylab.json";
};

export const analyzeJsonStructure = (
  value: unknown,
): Result<JsonStructureMetrics, DomainError> => {
  if (!isPlainRecord(value)) {
    return err(
      importError(
        "IMPORT_PACKAGE_INVALID",
        "file.content",
        "El archivo debe contener un objeto JSON en el nivel superior.",
      ),
    );
  }

  const stack: StructureFrame[] = [
    { value, depth: 1 },
  ];
  let structuralNodes = 0;
  let maximumDepth = 0;

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;

    structuralNodes += 1;
    maximumDepth = Math.max(maximumDepth, frame.depth);

    if (
      structuralNodes >
      PORTFOLIO_IMPORT_MAX_STRUCTURAL_NODES
    ) {
      return err(
        importError(
          "IMPORT_STRUCTURE_TOO_COMPLEX",
          "file.content",
          "El archivo contiene demasiados elementos estructurales.",
          {
            maximumNodes:
              PORTFOLIO_IMPORT_MAX_STRUCTURAL_NODES,
          },
        ),
      );
    }

    if (frame.depth > PORTFOLIO_IMPORT_MAX_DEPTH) {
      return err(
        importError(
          "IMPORT_STRUCTURE_TOO_COMPLEX",
          "file.content",
          "El archivo excede la profundidad estructural permitida.",
          {
            maximumDepth: PORTFOLIO_IMPORT_MAX_DEPTH,
          },
        ),
      );
    }

    if (Array.isArray(frame.value)) {
      for (let index = frame.value.length - 1; index >= 0; index -= 1) {
        stack.push({
          value: frame.value[index],
          depth: frame.depth + 1,
        });
      }
      continue;
    }

    if (typeof frame.value === "object" && frame.value !== null) {
      if (!isPlainRecord(frame.value)) {
        return err(
          importError(
            "IMPORT_PACKAGE_INVALID",
            "file.content",
            "El archivo contiene una estructura de objeto no permitida.",
          ),
        );
      }

      const keys = Object.keys(frame.value);
      for (let index = keys.length - 1; index >= 0; index -= 1) {
        const key = keys[index];
        if (key === undefined) continue;
        const child = frame.value[key];
        if (child === undefined) {
          return err(
            importError(
              "IMPORT_PACKAGE_INVALID",
              "file.content",
              "El archivo contiene un valor no representable por JSON.",
            ),
          );
        }
        stack.push({
          value: child,
          depth: frame.depth + 1,
        });
      }
    }
  }

  return ok({
    maximumDepth,
    structuralNodes,
  });
};

const decodeUtf8 = (
  bytes: Uint8Array,
): Result<string, DomainError> => {
  try {
    return ok(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
  } catch {
    return err(
      importError(
        "IMPORT_JSON_MALFORMED",
        "file.content",
        "El archivo no contiene texto UTF-8 válido.",
      ),
    );
  }
};

const parseJson = (
  text: string,
): Result<unknown, DomainError> => {
  try {
    return ok(JSON.parse(text) as unknown);
  } catch {
    return err(
      importError(
        "IMPORT_JSON_MALFORMED",
        "file.content",
        "El archivo no contiene JSON válido.",
      ),
    );
  }
};

export const preflightUntrustedPortfolioFile = async (
  file: UntrustedLocalFile,
): Promise<Result<PreflightPortfolioFile, DomainError>> => {
  if (
    !Number.isSafeInteger(file.size) ||
    file.size < 0
  ) {
    return err(
      importError(
        "IMPORT_PACKAGE_INVALID",
        "file.size",
        "El tamaño declarado del archivo no es válido.",
      ),
    );
  }

  if (file.size > PORTFOLIO_IMPORT_MAX_BYTES) {
    return err(
      importError(
        "IMPORT_FILE_TOO_LARGE",
        "file.size",
        "El archivo excede el tamaño máximo permitido.",
        {
          maximumBytes: PORTFOLIO_IMPORT_MAX_BYTES,
          receivedBytes: file.size,
        },
      ),
    );
  }

  let bytes: Uint8Array;
  try {
    bytes = await file.readBytes();
  } catch {
    return err(
      importError(
        "IMPORT_PACKAGE_INVALID",
        "file.content",
        "No fue posible leer el archivo local seleccionado.",
      ),
    );
  }

  if (bytes.byteLength > PORTFOLIO_IMPORT_MAX_BYTES) {
    return err(
      importError(
        "IMPORT_FILE_TOO_LARGE",
        "file.content",
        "El archivo excede el tamaño máximo permitido.",
        {
          maximumBytes: PORTFOLIO_IMPORT_MAX_BYTES,
          receivedBytes: bytes.byteLength,
        },
      ),
    );
  }

  if (bytes.byteLength !== file.size) {
    return err(
      importError(
        "IMPORT_PACKAGE_INVALID",
        "file.size",
        "El tamaño leído no coincide con el tamaño declarado.",
        {
          declaredBytes: file.size,
          receivedBytes: bytes.byteLength,
        },
      ),
    );
  }

  const decoded = decodeUtf8(bytes);
  if (!decoded.ok) return decoded;

  const parsed = parseJson(decoded.value);
  if (!parsed.ok) return parsed;

  const structure = analyzeJsonStructure(parsed.value);
  if (!structure.ok) return structure;

  return ok({
    fileName: sanitizeUntrustedFileName(file.name),
    byteLength: bytes.byteLength,
    parsed: parsed.value,
    structure: structure.value,
  });
};
