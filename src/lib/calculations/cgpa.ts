import { ACADEMIC_CONFIG } from '../../config/academicRules';
import { roundToPrecision, formatDecimal, safeSum } from './rounding';

export interface SemesterInput {
  id: string;
  name: string;
  sgpa: number | string;
  credits: number | string;
}

export interface SemesterValidation {
  semesterId: string;
  sgpaError?: string;
  creditsError?: string;
  isValid: boolean;
}

export interface SemesterBreakdownItem {
  id: string;
  name: string;
  sgpa: number;
  credits: number;
  contribution: number;
}

export interface CgpaCalculationResult {
  cgpa: number;
  formattedCgpa: string;
  totalCredits: number;
  totalWeightedPoints: number;
  formattedTotalWeightedPoints: string;
  items: SemesterBreakdownItem[];
  isValid: boolean;
  errors: Record<string, SemesterValidation>;
  formulaString: string;
  calculationSteps: {
    numeratorSum: string;
    denominatorSum: string;
    unroundedRatio: number;
  };
}

export interface PreviousCgpaInput {
  currentCgpa: number | string;
  completedCredits: number | string;
  newSemesterSgpa: number | string;
  newSemesterCredits: number | string;
}

export interface PreviousCgpaValidation {
  currentCgpaError?: string;
  completedCreditsError?: string;
  newSemesterSgpaError?: string;
  newSemesterCreditsError?: string;
  isValid: boolean;
}

/**
 * Validates a single semester row input (allows up to 3 decimal digits)
 */
export function validateSemester(semester: SemesterInput): SemesterValidation {
  let sgpaError: string | undefined;
  let creditsError: string | undefined;

  const rawSgpa = typeof semester.sgpa === 'string' ? semester.sgpa.trim() : semester.sgpa;
  const numSgpa = Number(rawSgpa);

  if (rawSgpa === '' || rawSgpa === undefined || isNaN(numSgpa)) {
    sgpaError = 'Enter GPA (0.000 - 10.000)';
  } else if (numSgpa < ACADEMIC_CONFIG.minSemesterSgpa || numSgpa > ACADEMIC_CONFIG.maxSemesterSgpa) {
    sgpaError = 'GPA must be between 0.000 and 10.000';
  }

  const rawCredits = typeof semester.credits === 'string' ? semester.credits.trim() : semester.credits;
  const numCredits = Number(rawCredits);

  if (rawCredits === '' || rawCredits === undefined || isNaN(numCredits)) {
    creditsError = 'Enter credits';
  } else if (numCredits <= 0) {
    creditsError = 'Credits must be > 0';
  } else if (numCredits > ACADEMIC_CONFIG.maxSemesterCredits) {
    creditsError = `Max ${ACADEMIC_CONFIG.maxSemesterCredits} credits`;
  }

  return {
    semesterId: semester.id,
    sgpaError,
    creditsError,
    isValid: !sgpaError && !creditsError,
  };
}

/**
 * Calculates CGPA from an array of semesters
 */
export function calculateCgpa(
  semesters: SemesterInput[],
  precision: number = ACADEMIC_CONFIG.defaultPrecision
): CgpaCalculationResult {
  const errors: Record<string, SemesterValidation> = {};
  let hasErrors = false;

  const validItems: SemesterBreakdownItem[] = [];

  for (const semester of semesters) {
    const validation = validateSemester(semester);
    if (!validation.isValid) {
      errors[semester.id] = validation;
      hasErrors = true;
    } else {
      const sgpa = Number(semester.sgpa);
      const credits = Number(semester.credits);
      const contribution = roundToPrecision(sgpa * credits, 4);

      validItems.push({
        id: semester.id,
        name: semester.name || 'Semester',
        sgpa,
        credits,
        contribution,
      });
    }
  }

  if (semesters.length === 0 || hasErrors || validItems.length === 0) {
    return {
      cgpa: 0,
      formattedCgpa: formatDecimal(0, precision),
      totalCredits: 0,
      totalWeightedPoints: 0,
      formattedTotalWeightedPoints: '0.00',
      items: validItems,
      isValid: false,
      errors,
      formulaString: 'Σ(Semester SGPA × Credits) / Σ(Credits)',
      calculationSteps: {
        numeratorSum: '0',
        denominatorSum: '0',
        unroundedRatio: 0,
      },
    };
  }

  const totalCredits = safeSum(validItems.map(i => i.credits));
  const totalWeightedPoints = safeSum(validItems.map(i => i.contribution));

  if (totalCredits === 0) {
    return {
      cgpa: 0,
      formattedCgpa: formatDecimal(0, precision),
      totalCredits: 0,
      totalWeightedPoints: 0,
      formattedTotalWeightedPoints: '0.00',
      items: validItems,
      isValid: false,
      errors,
      formulaString: 'Σ(Semester SGPA × Credits) / Σ(Credits)',
      calculationSteps: {
        numeratorSum: '0',
        denominatorSum: '0',
        unroundedRatio: 0,
      },
    };
  }

  const rawCgpa = totalWeightedPoints / totalCredits;
  const cgpa = roundToPrecision(rawCgpa, precision, ACADEMIC_CONFIG.roundingMode);

  return {
    cgpa,
    formattedCgpa: formatDecimal(cgpa, precision),
    totalCredits,
    totalWeightedPoints,
    formattedTotalWeightedPoints: formatDecimal(totalWeightedPoints, 2),
    items: validItems,
    isValid: true,
    errors,
    formulaString: `${formatDecimal(totalWeightedPoints, 2)} ÷ ${totalCredits} = ${formatDecimal(cgpa, precision)}`,
    calculationSteps: {
      numeratorSum: formatDecimal(totalWeightedPoints, 2),
      denominatorSum: totalCredits.toString(),
      unroundedRatio: rawCgpa,
    },
  };
}

/**
 * Validates direct Previous CGPA input
 */
export function validatePreviousCgpa(input: PreviousCgpaInput): PreviousCgpaValidation {
  let currentCgpaError: string | undefined;
  let completedCreditsError: string | undefined;
  let newSemesterSgpaError: string | undefined;
  let newSemesterCreditsError: string | undefined;

  const curCgpa = Number(input.currentCgpa);
  if (input.currentCgpa === '' || input.currentCgpa === undefined || isNaN(curCgpa)) {
    currentCgpaError = 'Enter current CGPA (up to 3 decimals)';
  } else if (curCgpa < 0 || curCgpa > 10) {
    currentCgpaError = 'CGPA must be between 0.000 and 10.000';
  }

  const compCredits = Number(input.completedCredits);
  if (input.completedCredits === '' || input.completedCredits === undefined || isNaN(compCredits)) {
    completedCreditsError = 'Enter completed credits';
  } else if (compCredits <= 0) {
    completedCreditsError = 'Credits must be > 0';
  } else if (compCredits > 250) {
    completedCreditsError = 'Max 250 credits';
  }

  const newSgpa = Number(input.newSemesterSgpa);
  if (input.newSemesterSgpa === '' || input.newSemesterSgpa === undefined || isNaN(newSgpa)) {
    newSemesterSgpaError = 'Enter new semester SGPA';
  } else if (newSgpa < 0 || newSgpa > 10) {
    newSemesterSgpaError = 'SGPA must be between 0.000 and 10.000';
  }

  const newCredits = Number(input.newSemesterCredits);
  if (input.newSemesterCredits === '' || input.newSemesterCredits === undefined || isNaN(newCredits)) {
    newSemesterCreditsError = 'Enter semester credits';
  } else if (newCredits <= 0) {
    newSemesterCreditsError = 'Credits must be > 0';
  } else if (newCredits > 40) {
    newSemesterCreditsError = 'Max 40 credits';
  }

  return {
    currentCgpaError,
    completedCreditsError,
    newSemesterSgpaError,
    newSemesterCreditsError,
    isValid: !currentCgpaError && !completedCreditsError && !newSemesterSgpaError && !newSemesterCreditsError,
  };
}

/**
 * Calculates new cumulative CGPA from previous CGPA and current semester SGPA
 */
export function calculateCgpaFromPrevious(
  input: PreviousCgpaInput,
  precision: number = ACADEMIC_CONFIG.defaultPrecision
): CgpaCalculationResult {
  const validation = validatePreviousCgpa(input);

  if (!validation.isValid) {
    return {
      cgpa: 0,
      formattedCgpa: formatDecimal(0, precision),
      totalCredits: 0,
      totalWeightedPoints: 0,
      formattedTotalWeightedPoints: '0.00',
      items: [],
      isValid: false,
      errors: {},
      formulaString: '(Previous Points + New Points) / Total Credits',
      calculationSteps: {
        numeratorSum: '0',
        denominatorSum: '0',
        unroundedRatio: 0,
      },
    };
  }

  const curCgpa = Number(input.currentCgpa);
  const compCredits = Number(input.completedCredits);
  const newSgpa = Number(input.newSemesterSgpa);
  const newCredits = Number(input.newSemesterCredits);

  const prevWeightedPoints = roundToPrecision(curCgpa * compCredits, 4);
  const newWeightedPoints = roundToPrecision(newSgpa * newCredits, 4);

  const totalCredits = safeSum([compCredits, newCredits]);
  const totalWeightedPoints = safeSum([prevWeightedPoints, newWeightedPoints]);

  const rawCgpa = totalWeightedPoints / totalCredits;
  const cgpa = roundToPrecision(rawCgpa, precision, ACADEMIC_CONFIG.roundingMode);

  const items: SemesterBreakdownItem[] = [
    {
      id: 'prev-cgpa-item',
      name: 'Previous Completed Semesters',
      sgpa: curCgpa,
      credits: compCredits,
      contribution: prevWeightedPoints,
    },
    {
      id: 'new-semester-item',
      name: 'Current New Semester',
      sgpa: newSgpa,
      credits: newCredits,
      contribution: newWeightedPoints,
    },
  ];

  return {
    cgpa,
    formattedCgpa: formatDecimal(cgpa, precision),
    totalCredits,
    totalWeightedPoints,
    formattedTotalWeightedPoints: formatDecimal(totalWeightedPoints, 2),
    items,
    isValid: true,
    errors: {},
    formulaString: `(${formatDecimal(prevWeightedPoints, 2)} + ${formatDecimal(newWeightedPoints, 2)}) ÷ ${totalCredits} = ${formatDecimal(cgpa, precision)}`,
    calculationSteps: {
      numeratorSum: formatDecimal(totalWeightedPoints, 2),
      denominatorSum: totalCredits.toString(),
      unroundedRatio: rawCgpa,
    },
  };
}
