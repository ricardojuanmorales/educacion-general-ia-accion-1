import type { ISODateTime } from "../domain/types";

export interface Clock {
  now(): ISODateTime;
}
