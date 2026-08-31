import type { LegacyMvpContinuitySummary } from "../../ports/mvp-continuity";
import type { StorageLike } from "./local-storage-project-repository";

export const LEGACY_MVP_STORAGE_KEYS = Object.freeze({
  progress: "aistorylab_student_progress_v0_2",
  group: "aistorylab_group_progress_v0_2",
});

type ReadOnlyStorage = Pick<StorageLike, "getItem">;

const containsInvalidJson = (storage: ReadOnlyStorage, key: string): boolean => {
  const raw = storage.getItem(key);
  if (raw === null) return false;
  try {
    JSON.parse(raw);
    return false;
  } catch {
    return true;
  }
};

export const inspectLegacyMvpContinuity = (
  storage: ReadOnlyStorage | null,
): LegacyMvpContinuitySummary => {
  if (!storage) {
    return {
      storageAvailable: false,
      progressPresent: false,
      groupPresent: false,
      hasLegacyData: false,
      invalidJsonKeys: [],
    };
  }
  const progressPresent = storage.getItem(LEGACY_MVP_STORAGE_KEYS.progress) !== null;
  const groupPresent = storage.getItem(LEGACY_MVP_STORAGE_KEYS.group) !== null;
  const invalidJsonKeys = [
    LEGACY_MVP_STORAGE_KEYS.progress,
    LEGACY_MVP_STORAGE_KEYS.group,
  ].filter((key) => containsInvalidJson(storage, key));
  return {
    storageAvailable: true,
    progressPresent,
    groupPresent,
    hasLegacyData: progressPresent || groupPresent,
    invalidJsonKeys,
  };
};
