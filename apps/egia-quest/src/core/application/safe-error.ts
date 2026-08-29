import type {
  DomainError,
  DomainErrorCode,
} from "../domain/errors";

export interface SafeErrorEnvelope {
  readonly code: DomainErrorCode | "UNEXPECTED_ERROR";
  readonly message: string;
}

export const toSafeDomainError = (
  error: DomainError,
): SafeErrorEnvelope =>
  Object.freeze({
    code: error.code,
    message: error.safeMessage,
  });

export const unexpectedErrorEnvelope = (): SafeErrorEnvelope =>
  Object.freeze({
    code: "UNEXPECTED_ERROR",
    message: "Ocurrió un error inesperado.",
  });
