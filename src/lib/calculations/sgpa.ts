import { ACADEMIC_CONFIG } from '../../config/academicRules';
import { getGradePoint } from './gradePoints';
import { roundToPrecision, formatDecimal, safeSum } from './rounding';

export interface CourseInput {
  id: string;
  name: string;
  credits: number | string;
  grade: string;
}

export interface CourseValidation {
  courseId: string;
  creditsError?: string;
  gradeError?: string;
  isValid: boolean;
}

export interface CourseBreakdownItem {
  id: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints: number;
  weightedPoints: number;
}

export interface SgpaCalculationResult {
  sgpa: number;
  formattedSgpa: string;
  totalCredits: number;
  totalGradePoints: number;
  formattedTotalGradePoints: string;
  items: CourseBreakdownItem[];
  isValid: boolean;
  errors: Record<string, CourseValidation>;
  formulaString: string;
  calculationSteps: {
    numeratorSum: string;
    denominatorSum: string;
    unroundedRatio: number;
  };
}

/**
 * Validates a single course input
 */
export function validateCourse(course: CourseInput): CourseValidation {
  let creditsError: string | undefined;
  let gradeError: string | undefined;

  const rawCredits = typeof course.credits === 'string' ? course.credits.trim() : course.credits;
  const numCredits = Number(rawCredits);

  if (rawCredits === '' || rawCredits === undefined || isNaN(numCredits)) {
    creditsError = 'Enter course credits';
  } else if (numCredits <= 0) {
    creditsError = 'Credits must be greater than 0';
  } else if (numCredits > ACADEMIC_CONFIG.maxCreditsPerCourse) {
    creditsError = `Max ${ACADEMIC_CONFIG.maxCreditsPerCourse} credits`;
  }

  if (!course.grade || course.grade.trim() === '') {
    gradeError = 'Select a grade';
  } else if (getGradePoint(course.grade) === null) {
    gradeError = 'Invalid grade selected';
  }

  return {
    courseId: course.id,
    creditsError,
    gradeError,
    isValid: !creditsError && !gradeError,
  };
}

/**
 * Calculates SGPA from an array of courses
 */
export function calculateSgpa(
  courses: CourseInput[],
  precision: number = ACADEMIC_CONFIG.defaultPrecision
): SgpaCalculationResult {
  const errors: Record<string, CourseValidation> = {};
  let hasErrors = false;

  const validItems: CourseBreakdownItem[] = [];

  for (const course of courses) {
    const validation = validateCourse(course);
    if (!validation.isValid) {
      errors[course.id] = validation;
      hasErrors = true;
    } else {
      const credits = Number(course.credits);
      const gradePoints = getGradePoint(course.grade)!;
      const weightedPoints = roundToPrecision(credits * gradePoints, 4);

      validItems.push({
        id: course.id,
        name: course.name || 'Course',
        credits,
        grade: course.grade.toUpperCase(),
        gradePoints,
        weightedPoints,
      });
    }
  }

  if (courses.length === 0 || hasErrors || validItems.length === 0) {
    return {
      sgpa: 0,
      formattedSgpa: formatDecimal(0, precision),
      totalCredits: 0,
      totalGradePoints: 0,
      formattedTotalGradePoints: '0.00',
      items: validItems,
      isValid: false,
      errors,
      formulaString: 'Σ(Credits × Grade Points) / Σ(Credits)',
      calculationSteps: {
        numeratorSum: '0',
        denominatorSum: '0',
        unroundedRatio: 0,
      },
    };
  }

  const totalCredits = safeSum(validItems.map(i => i.credits));
  const totalGradePoints = safeSum(validItems.map(i => i.weightedPoints));

  if (totalCredits === 0) {
    return {
      sgpa: 0,
      formattedSgpa: formatDecimal(0, precision),
      totalCredits: 0,
      totalGradePoints: 0,
      formattedTotalGradePoints: '0.00',
      items: validItems,
      isValid: false,
      errors,
      formulaString: 'Σ(Credits × Grade Points) / Σ(Credits)',
      calculationSteps: {
        numeratorSum: '0',
        denominatorSum: '0',
        unroundedRatio: 0,
      },
    };
  }

  const rawSgpa = totalGradePoints / totalCredits;
  const sgpa = roundToPrecision(rawSgpa, precision, ACADEMIC_CONFIG.roundingMode);

  return {
    sgpa,
    formattedSgpa: formatDecimal(sgpa, precision),
    totalCredits,
    totalGradePoints,
    formattedTotalGradePoints: formatDecimal(totalGradePoints, 2),
    items: validItems,
    isValid: true,
    errors,
    formulaString: `${formatDecimal(totalGradePoints, 2)} ÷ ${totalCredits} = ${formatDecimal(sgpa, precision)}`,
    calculationSteps: {
      numeratorSum: formatDecimal(totalGradePoints, 2),
      denominatorSum: totalCredits.toString(),
      unroundedRatio: rawSgpa,
    },
  };
}
