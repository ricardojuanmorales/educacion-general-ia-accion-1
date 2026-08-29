import { randomUUID } from "node:crypto";
import type { IdGenerator } from "../../ports";

export class RandomUuidGenerator implements IdGenerator {
  next(namespace: string): string {
    const prefix = namespace.trim() || "id";
    return `${prefix}:${randomUUID()}`;
  }
}
