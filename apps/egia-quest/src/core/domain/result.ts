import type { DomainError } from "./errors";

export interface Ok<Value> {
  readonly ok: true;
  readonly value: Value;
}

export interface Err<ErrorValue> {
  readonly ok: false;
  readonly error: ErrorValue;
}

export type Result<Value, ErrorValue = DomainError> =
  | Ok<Value>
  | Err<ErrorValue>;

export const ok = <Value>(value: Value): Ok<Value> => ({ ok: true, value });

export const err = <ErrorValue>(error: ErrorValue): Err<ErrorValue> => ({
  ok: false,
  error,
});
