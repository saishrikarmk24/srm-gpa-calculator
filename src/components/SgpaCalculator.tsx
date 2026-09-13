import React, { useState } from 'react';
import { Plus, Calculator, ArrowRight, ScanLine } from 'lucide-react';
import { ACADEMIC_CONFIG } from '../config/academicRules';
import { CourseInput, calculateSgpa, SgpaCalculationResult } from '../lib/calculations';
import { CourseRow } from './CourseRow';
import { ResultCard } from './ResultCard';
import { CalculationBreakdown } from './CalculationBreakdown';
import { EmptyState } from './EmptyState';
import { OcrModal } from './OcrModal';
import { sanitizeText, MAX_COURSES_LIMIT } from '../lib/security';

interface SgpaCalculatorProps {
  isOcrOpen?: boolean;
  onOcrOpenChange?: (open: boolean) => void;
}

export const SgpaCalculator: React.FC<SgpaCalculatorProps> = ({
  isOcrOpen: externalOcrOpen,
  onOcrOpenChange,
}) => {
  const [courses, setCourses] = useState<CourseInput[]>(() =>
    ACADEMIC_CONFIG.defaultCourses.map((c, i) => ({
      id: `course-${Date.now()}-${i}`,
      name: c.name,
      credits: c.credits,
      grade: c.grade,
    }))
  );

  const [precision, setPrecision] = useState<number>(ACADEMIC_CONFIG.defaultPrecision);
  const [internalOcrOpen, setInternalOcrOpen] = useState(false);
  const isOcrOpen = externalOcrOpen ?? internalOcrOpen;

  const setIsOcrOpen = (open: boolean) => {
    if (onOcrOpenChange) {
      onOcrOpenChange(open);
    } else {
      setInternalOcrOpen(open);
    }
  };

  const [result, setResult] = useState<SgpaCalculationResult | null>(() => {
    const initialCourses = ACADEMIC_CONFIG.defaultCourses.map((c, i) => ({
      id: `course-init-${i}`,
      name: c.name,
      credits: c.credits,
      grade: c.grade,
    }));
    return calculateSgpa(initialCourses, ACADEMIC_CONFIG.defaultPrecision);
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleAddCourse = () => {
    if (courses.length >= MAX_COURSES_LIMIT) return;
    const nextIndex = courses.length + 1;
    const newCourse: CourseInput = {
      id: `course-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `Course ${String(nextIndex).padStart(2, '0')}`,
      credits: 4,
      grade: 'A+',
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const handleUpdateCourse = (id: string, field: keyof CourseInput, value: any) => {
    setCourses(prev =>
      prev.map(course => {
        if (course.id !== id) return course;
        if (field === 'name') {
          return { ...course, name: sanitizeText(value, 60) };
        }
        return { ...course, [field]: value };
      })
    );
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleCalculate = (e?: React.FormEvent, targetPrecision: number = precision) => {
    if (e) e.preventDefault();
    setHasSubmitted(true);
    const res = calculateSgpa(courses, targetPrecision);
    setResult(res);
  };

  const handlePrecisionChange = (newPrecision: number) => {
    setPrecision(newPrecision);
    handleCalculate(undefined, newPrecision);
  };

  const handleReset = () => {
    const fresh = ACADEMIC_CONFIG.defaultCourses.map((c, i) => ({
      id: `course-reset-${Date.now()}-${i}`,
      name: c.name,
      credits: c.credits,
      grade: c.grade,
    }));
    setCourses(fresh);
    setResult(calculateSgpa(fresh, precision));
    setHasSubmitted(false);
  };

  const handleApplyOcrCourses = (scannedCourses: Array<{ name: string; credits: number; grade: string }>) => {
    const formatted: CourseInput[] = scannedCourses.map((c, i) => ({
      id: `course-ocr-${Date.now()}-${i}`,
      name: c.name,
      credits: c.credits,
      grade: c.grade,
    }));
    setCourses(formatted);
    setHasSubmitted(true);
    const res = calculateSgpa(formatted, precision);
    setResult(res);
  };

  const liveValidation = hasSubmitted ? calculateSgpa(courses, precision).errors : {};

  return (
    <div className="space-y-5">
      {/* Header with Precision and Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
            Courses &amp; Grades
          </h2>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Decimal Precision Control */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => handlePrecisionChange(2)}
              className={`px-2 py-0.5 rounded-md text-xs font-mono transition-colors ${
                precision === 2
                  ? 'bg-neutral-800 text-white font-medium shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              .00
            </button>
            <button
              type="button"
              onClick={() => handlePrecisionChange(3)}
              className={`px-2 py-0.5 rounded-md text-xs font-mono transition-colors ${
                precision === 3
                  ? 'bg-neutral-800 text-white font-medium shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              .000
            </button>
          </div>

          {courses.length > 0 && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'}
            </span>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="space-y-4">
          <EmptyState type="SGPA" onAdd={handleAddCourse} />
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsOcrOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <ScanLine size={13} />
              Scan SRM result screenshot
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCalculate} className="space-y-4">
          {/* Table Header for Desktop */}
          <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 px-3 py-1.5 text-[11px] font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
            <div className="sm:col-span-5">Course Title / Code</div>
            <div className="sm:col-span-3 text-center">Credits</div>
            <div className="sm:col-span-3 text-center">Grade</div>
            <div className="sm:col-span-1 text-center">Action</div>
          </div>

          {/* Course Rows - Natural growth without cramped internal scrollbar */}
          <div className="space-y-1 sm:space-y-0.5">
            {courses.map((course, index) => (
              <CourseRow
                key={course.id}
                course={course}
                index={index}
                validation={liveValidation[course.id]}
                onUpdate={handleUpdateCourse}
                onRemove={handleRemoveCourse}
                canRemove={courses.length > 1}
              />
            ))}
          </div>

          {/* Action Row: Add Course & Scan Screenshot & Calculate */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddCourse}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
              >
                <Plus size={14} />
                Add Course
              </button>

              <button
                type="button"
                onClick={() => setIsOcrOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
              >
                <ScanLine size={14} />
                Scan Screenshot
              </button>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-950 text-xs sm:text-sm font-semibold transition-colors shadow-sm"
            >
              <Calculator size={15} />
              Calculate SGPA
              <ArrowRight size={14} className="opacity-60" />
            </button>
          </div>
        </form>
      )}

      {/* Result Display Card */}
      {result && result.isValid && (
        <div className="pt-4 space-y-3">
          <ResultCard
            type="SGPA"
            value={result.sgpa}
            formattedValue={result.formattedSgpa}
            totalCredits={result.totalCredits}
            secondaryMetricLabel="Total Grade Points"
            secondaryMetricValue={result.formattedTotalGradePoints}
            onRecalculate={() => handleCalculate()}
            onReset={handleReset}
          />

          <CalculationBreakdown
            type="SGPA"
            sgpaItems={result.items}
            numeratorSum={result.calculationSteps.numeratorSum}
            denominatorSum={result.calculationSteps.denominatorSum}
            finalResult={result.formattedSgpa}
            unroundedValue={result.calculationSteps.unroundedRatio}
          />
        </div>
      )}

      {/* Free OCR Scanner Modal */}
      <OcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onApplyCourses={handleApplyOcrCourses}
      />
    </div>
  );
};
