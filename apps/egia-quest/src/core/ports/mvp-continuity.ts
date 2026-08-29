export interface LegacyMvpContinuitySummary {
  readonly storageAvailable: boolean;
  readonly progressPresent: boolean;
  readonly groupPresent: boolean;
  readonly hasLegacyData: boolean;
  readonly invalidJsonKeys: readonly string[];
}
