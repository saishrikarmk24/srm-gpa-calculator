import { SRM_GRADES, GradeDefinition } from '../../config/academicRules';

const GRADE_MAP = new Map<string, GradeDefinition>(
  SRM_GRADES.map(def => [def.grade.toUpperCase(), def])
);

/**
 * Returns the grade point for a given grade letter.
 * Returns null if grade is unrecognized.
 */
export function getGradePoint(grade: string): number | null {
  const normalized = grade.trim().toUpperCase();
  const def = GRADE_MAP.get(normalized);
  return def ? def.points : null;
}

/**
 * Returns the full GradeDefinition for a given grade letter.
 */
export function getGradeDefinition(grade: string): GradeDefinition | undefined {
  const normalized = grade.trim().toUpperCase();
  return GRADE_MAP.get(normalized);
}

/**
 * Validates if the string is a recognized SRM letter grade.
 */
export function isValidGrade(grade: string): boolean {
  return GRADE_MAP.has(grade.trim().toUpperCase());
}

/**
 * Returns all available grade options.
 */
export function getAllGradeDefinitions(): readonly GradeDefinition[] {
  return SRM_GRADES;
}
