import type { CreativeProject } from "./model";
import type { ISODateTime } from "./types";

export const PORTFOLIO_PACKAGE_TYPE = "storylab_portfolio" as const;
export const PORTFOLIO_PACKAGE_VERSION = "1.0.0" as const;
export const PORTFOLIO_PACKAGE_MEDIA_TYPE = "application/json" as const;
export const PORTFOLIO_PACKAGE_CANONICALIZATION =
  "storylab-canonical-json-v1" as const;
export const PORTFOLIO_PACKAGE_INTEGRITY_ALGORITHM = "SHA-256" as const;
export const PORTFOLIO_PACKAGE_INTEGRITY_SCOPE = "payload" as const;

export interface PortfolioPackagePayload<
  ProjectType extends { readonly schemaVersion: string } = CreativeProject,
> {
  readonly projectSchemaVersion: ProjectType["schemaVersion"];
  readonly project: ProjectType;
}

export interface PortfolioPackageIntegrity {
  readonly algorithm: typeof PORTFOLIO_PACKAGE_INTEGRITY_ALGORITHM;
  readonly canonicalization: typeof PORTFOLIO_PACKAGE_CANONICALIZATION;
  readonly scope: typeof PORTFOLIO_PACKAGE_INTEGRITY_SCOPE;
  readonly digest: string;
}

export interface PortfolioPackageV1<
  ProjectType extends { readonly schemaVersion: string } = CreativeProject,
> {
  readonly packageType: typeof PORTFOLIO_PACKAGE_TYPE;
  readonly packageVersion: typeof PORTFOLIO_PACKAGE_VERSION;
  readonly exportedAt: ISODateTime;
  readonly payload: PortfolioPackagePayload<ProjectType>;
  readonly integrity: PortfolioPackageIntegrity;
}
