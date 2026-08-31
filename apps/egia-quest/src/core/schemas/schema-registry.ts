import currentProjectSchema from "./project.schema.json";
import previousProjectSchema from "./project.schema.0.8.0-alpha.1.json";
import {
  CURRENT_SCHEMA_VERSION,
  PREVIOUS_SCHEMA_VERSION,
  type KnownSchemaVersion,
} from "./schema-version";

export type ProjectJsonSchema = Readonly<Record<string, unknown>>;

export const PROJECT_SCHEMA_REGISTRY: Readonly<
  Record<KnownSchemaVersion, ProjectJsonSchema>
> = Object.freeze({
  [PREVIOUS_SCHEMA_VERSION]:
    previousProjectSchema as unknown as ProjectJsonSchema,
  [CURRENT_SCHEMA_VERSION]:
    currentProjectSchema as unknown as ProjectJsonSchema,
});

export const getProjectSchema = (
  version: string,
): ProjectJsonSchema | undefined =>
  PROJECT_SCHEMA_REGISTRY[version as KnownSchemaVersion];
