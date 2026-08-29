import { TEXT_SCALES } from "./constants";
import type { DomainError } from "./errors";
import type { AccessibilityPreferences } from "./model";
import { err, ok, type Result } from "./result";

const EXPECTED_KEYS = [
  "reducedMotion",
  "highContrast",
  "textScale",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const invalid = (path: string, reason: string): DomainError => ({
  code: "ACCESSIBILITY_PREFERENCES_INVALID",
  path,
  safeMessage: "Las preferencias de accesibilidad no son válidas.",
  details: { reason },
});

export const parseAccessibilityPreferences = (
  value: unknown,
): Result<AccessibilityPreferences, DomainError> => {
  if (!isRecord(value)) {
    return err(invalid("profile.accessibility", "NOT_OBJECT"));
  }

  const keys = Object.keys(value);
  if (
    keys.length !== EXPECTED_KEYS.length ||
    keys.some(
      (key) =>
        !EXPECTED_KEYS.includes(
          key as (typeof EXPECTED_KEYS)[number],
        ),
    )
  ) {
    return err(invalid("profile.accessibility", "UNEXPECTED_FIELDS"));
  }

  if (typeof value.reducedMotion !== "boolean") {
    return err(
      invalid(
        "profile.accessibility.reducedMotion",
        "BOOLEAN_REQUIRED",
      ),
    );
  }

  if (typeof value.highContrast !== "boolean") {
    return err(
      invalid(
        "profile.accessibility.highContrast",
        "BOOLEAN_REQUIRED",
      ),
    );
  }

  if (
    typeof value.textScale !== "string" ||
    !(TEXT_SCALES as readonly string[]).includes(value.textScale)
  ) {
    return err(
      invalid(
        "profile.accessibility.textScale",
        "TEXT_SCALE_INVALID",
      ),
    );
  }

  return ok({
    reducedMotion: value.reducedMotion,
    highContrast: value.highContrast,
    textScale: value.textScale as AccessibilityPreferences["textScale"],
  });
};
