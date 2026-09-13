/**
 * SRMIST Academic Regulations & Grading Configuration
 * Standard 10-point relative/absolute grading system
 */

export interface GradeDefinition {
  grade: string;
  points: number;
  description: string;
  isPassing: boolean;
}

export const SRM_GRADES: readonly GradeDefinition[] = [
  { grade: 'O', points: 10, description: 'Outstanding', isPassing: true },
  { grade: 'A+', points: 9, description: 'Excellent', isPassing: true },
  { grade: 'A', points: 8, description: 'Very Good', isPassing: true },
  { grade: 'B+', points: 7, description: 'Good', isPassing: true },
  { grade: 'B', points: 6, description: 'Above Average', isPassing: true },
  { grade: 'C', points: 5, description: 'Average', isPassing: true },
  { grade: 'P', points: 4, description: 'Pass', isPassing: true },
  { grade: 'F', points: 0, description: 'Fail', isPassing: false },
  { grade: 'Ab', points: 0, description: 'Absent', isPassing: false },
] as const;

export type GradeLetter = typeof SRM_GRADES[number]['grade'];

export const ACADEMIC_CONFIG = {
  minCreditsPerCourse: 0.5,
  maxCreditsPerCourse: 12,
  minSemesterSgpa: 0.0,
  maxSemesterSgpa: 10.0,
  minSemesterCredits: 1,
  maxSemesterCredits: 40,
  defaultPrecision: 2, // Standard SRM 2 decimal places e.g. 9.68
  maxInputDecimals: 3, // Allows up to 3 decimal digits for input GPA e.g. 9.425
  roundingMode: 'TRUNC' as const, // SRMIST Official Examination Methodology (truncation to 2 decimal places)
  defaultCourses: [
    { name: 'Course 01', credits: 4, grade: 'O' },
    { name: 'Course 02', credits: 3, grade: 'A+' },
    { name: 'Course 03', credits: 4, grade: 'A' },
    { name: 'Course 04', credits: 3, grade: 'B+' },
  ],
  defaultSemesters: [
    { name: 'Semester 01', sgpa: 9.425, credits: 24 },
    { name: 'Semester 02', sgpa: 9.580, credits: 23 },
    { name: 'Semester 03', sgpa: 9.712, credits: 22 },
    { name: 'Semester 04', sgpa: 9.690, credits: 24 },
  ],
  defaultPreviousCgpaState: {
    currentCgpa: 9.425,
    completedCredits: 69,
    newSemesterSgpa: 9.680,
    newSemesterCredits: 24,
  },
} as const;
