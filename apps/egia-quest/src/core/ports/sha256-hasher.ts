import type { DomainError } from "../domain/errors";
import type { Result } from "../domain/result";

export interface Sha256Hasher {
  readonly digestHex: (
    value: string,
  ) => Promise<Result<string, DomainError>>;
}
