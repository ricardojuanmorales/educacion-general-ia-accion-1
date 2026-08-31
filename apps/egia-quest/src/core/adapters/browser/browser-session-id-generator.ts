import type { IdGenerator } from "../../ports";

export class BrowserSessionIdGenerator implements IdGenerator {
  #counter = 0;

  next(namespace: string): string {
    const prefix = namespace.trim() || "id";
    const randomPart =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${(this.#counter += 1).toString(36)}`;

    return `${prefix}:${randomPart}`;
  }
}
