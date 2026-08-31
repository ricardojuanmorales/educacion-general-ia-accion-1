import type { ISODateTime } from "../../domain/types";
import type { Clock } from "../../ports";

export class SystemClock implements Clock {
  now(): ISODateTime {
    return new Date().toISOString() as ISODateTime;
  }
}
