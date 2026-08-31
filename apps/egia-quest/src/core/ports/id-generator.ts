export interface IdGenerator {
  next(namespace: string): string;
}
