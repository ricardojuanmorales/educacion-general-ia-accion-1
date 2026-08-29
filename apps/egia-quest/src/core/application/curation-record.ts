import type { EvidenceId } from "../domain/types";

export const CURATION_RECORD_PREFIX = "[curation_record:v1]\n";

export interface CurationRecordDocument {
  readonly version: 1;
  readonly selectedEvidenceIds: readonly EvidenceId[];
  readonly statement: string;
  readonly handoff: string;
}

export interface CreateCurationRecordDocumentInput {
  readonly selectedEvidenceIds: readonly EvidenceId[];
  readonly statement: string;
  readonly handoff: string;
}

export const encodeCurationRecord = (
  input: CreateCurationRecordDocumentInput,
): string =>
  `${CURATION_RECORD_PREFIX}${JSON.stringify({
    version: 1,
    selectedEvidenceIds: input.selectedEvidenceIds,
    statement: input.statement,
    handoff: input.handoff,
  })}`;

export const parseCurationRecord = (
  summary: string,
): CurationRecordDocument | null => {
  if (!summary.startsWith(CURATION_RECORD_PREFIX)) return null;

  try {
    const parsed: unknown = JSON.parse(
      summary.slice(CURATION_RECORD_PREFIX.length),
    );

    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Readonly<Record<string, unknown>>;
    const selectedEvidenceIds = candidate.selectedEvidenceIds;

    if (
      candidate.version !== 1 ||
      !Array.isArray(selectedEvidenceIds) ||
      !selectedEvidenceIds.every(
        (value) => typeof value === "string" && value.trim().length > 0,
      ) ||
      typeof candidate.statement !== "string" ||
      typeof candidate.handoff !== "string"
    ) {
      return null;
    }

    return {
      version: 1,
      selectedEvidenceIds: selectedEvidenceIds as readonly EvidenceId[],
      statement: candidate.statement,
      handoff: candidate.handoff,
    };
  } catch {
    return null;
  }
};
