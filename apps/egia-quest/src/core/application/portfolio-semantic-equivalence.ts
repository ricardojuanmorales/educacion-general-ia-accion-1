import type { CreativeProject } from "../domain/model";

export type SemanticEquivalenceResult =
  | { readonly equivalent: true }
  | {
      readonly equivalent: false;
      readonly firstDifferencePath: string;
      readonly reason: string;
    };

type ComparableJson =
  | null
  | boolean
  | number
  | string
  | readonly ComparableJson[]
  | { readonly [key: string]: ComparableJson };

const compareStrings = (left: unknown, right: unknown): number =>
  String(left).localeCompare(String(right));

export const normalizePortfolioProject = (
  project: CreativeProject,
): ComparableJson => {
  const {
    id: _projectId,
    missions,
    activityResponses,
    evidence,
    reflections,
    decisions,
    portfolio,
    ...rest
  } = structuredClone(project);

  return {
    ...rest,
    missions: [...missions].sort((left, right) =>
      compareStrings(left.missionId, right.missionId),
    ) as unknown as ComparableJson,
    activityResponses: [...activityResponses].sort((left, right) =>
      compareStrings(left.id, right.id),
    ) as unknown as ComparableJson,
    evidence: [...evidence].sort((left, right) =>
      compareStrings(left.id, right.id),
    ) as unknown as ComparableJson,
    reflections: [...reflections].sort((left, right) =>
      compareStrings(left.id, right.id),
    ) as unknown as ComparableJson,
    decisions: [...decisions].sort((left, right) =>
      compareStrings(left.id, right.id),
    ) as unknown as ComparableJson,
    portfolio: {
      items: [...portfolio.items].sort((left, right) => {
        const byOrder = left.order - right.order;
        return byOrder !== 0
          ? byOrder
          : compareStrings(left.id, right.id);
      }),
    } as unknown as ComparableJson,
  } as unknown as ComparableJson;
};

const isRecord = (
  value: unknown,
): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value);

const difference = (
  left: unknown,
  right: unknown,
  path: string,
): Exclude<SemanticEquivalenceResult, { equivalent: true }> | null => {
  if (Object.is(left, right)) return null;

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      return {
        equivalent: false,
        firstDifferencePath: path,
        reason: "TYPE_MISMATCH",
      };
    }
    if (left.length !== right.length) {
      return {
        equivalent: false,
        firstDifferencePath: `${path}.length`,
        reason: "ARRAY_LENGTH_MISMATCH",
      };
    }
    for (let index = 0; index < left.length; index += 1) {
      const nested = difference(
        left[index],
        right[index],
        `${path}[${index}]`,
      );
      if (nested !== null) return nested;
    }
    return null;
  }

  if (isRecord(left) || isRecord(right)) {
    if (!isRecord(left) || !isRecord(right)) {
      return {
        equivalent: false,
        firstDifferencePath: path,
        reason: "TYPE_MISMATCH",
      };
    }

    const keys = Array.from(
      new Set([...Object.keys(left), ...Object.keys(right)]),
    ).sort();

    for (const key of keys) {
      const leftHas = Object.hasOwn(left, key);
      const rightHas = Object.hasOwn(right, key);
      const keyPath = `${path}.${key}`;

      if (!leftHas || !rightHas) {
        return {
          equivalent: false,
          firstDifferencePath: keyPath,
          reason: "PROPERTY_PRESENCE_MISMATCH",
        };
      }

      const nested = difference(left[key], right[key], keyPath);
      if (nested !== null) return nested;
    }
    return null;
  }

  return {
    equivalent: false,
    firstDifferencePath: path,
    reason: "VALUE_MISMATCH",
  };
};

export const comparePortfolioProjectsSemantically = (
  left: CreativeProject,
  right: CreativeProject,
): SemanticEquivalenceResult => {
  const mismatch = difference(
    normalizePortfolioProject(left),
    normalizePortfolioProject(right),
    "$",
  );
  return mismatch ?? { equivalent: true };
};
