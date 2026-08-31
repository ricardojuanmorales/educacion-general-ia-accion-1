import { validateProjectInvariants } from "../domain/invariants";
import type {
  CreativeProject,
  PortfolioItem,
  Reflection,
} from "../domain/model";
import { err, ok, type Result } from "../domain/result";
import type { DomainError } from "../domain/errors";

export type PortfolioProjectionResult = Result<CreativeProject, DomainError>;

const reflectionCanLeaveDevice = (
  reflection: Reflection,
): boolean =>
  reflection.selectedForExport &&
  (reflection.privacyClass === "shareable_with_purpose" ||
    reflection.privacyClass === "exportable_after_review");

const comparePortfolioItems = (
  left: PortfolioItem,
  right: PortfolioItem,
): number =>
  left.order - right.order ||
  String(left.id).localeCompare(String(right.id));

export const createPortfolioProjection = (
  project: CreativeProject,
): PortfolioProjectionResult => {
  if (project.portfolio.items.length === 0) {
    return err({
      code: "EXPORT_SELECTION_REQUIRED",
      path: "portfolio.items",
      safeMessage:
        "Incorpore al menos una evidencia al portafolio antes de previsualizar.",
    });
  }

  const projection: CreativeProject = {
    ...structuredClone(project),
    reflections: project.reflections
      .filter(reflectionCanLeaveDevice)
      .map((reflection) => structuredClone(reflection)),
    portfolio: {
      items: [...project.portfolio.items]
        .sort(comparePortfolioItems)
        .map((item) => structuredClone(item)),
    },
  };

  const [firstInvariant] = validateProjectInvariants(projection);
  return firstInvariant ? err(firstInvariant) : ok(projection);
};
