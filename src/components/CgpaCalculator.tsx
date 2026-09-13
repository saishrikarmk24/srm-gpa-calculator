import React, { useState } from 'react';
import { Plus, Calculator, ArrowRight, Layers, BookmarkCheck } from 'lucide-react';
import { ACADEMIC_CONFIG } from '../config/academicRules';
import {
  SemesterInput,
  calculateCgpa,
  calculateCgpaFromPrevious,
  CgpaCalculationResult,
  PreviousCgpaInput,
  validatePreviousCgpa,
} from '../lib/calculations';
import { SemesterRow } from './SemesterRow';
import { ResultCard } from './ResultCard';
import { CalculationBreakdown } from './CalculationBreakdown';
import { EmptyState } from './EmptyState';
import { sanitizeText, MAX_SEMESTERS_LIMIT } from '../lib/security';

type CgpaMode = 'semesters' | 'previousCgpa';

export const CgpaCalculator: React.FC = () => {
  const [mode, setMode] = useState<CgpaMode>('semesters');
  const [precision, setPrecision] = useState<number>(ACADEMIC_CONFIG.defaultPrecision);

  // Mode 1: All Semesters
  const [semesters, setSemesters] = useState<SemesterInput[]>(() =>
    ACADEMIC_CONFIG.defaultSemesters.map((s, i) => ({
      id: `sem-${Date.now()}-${i}`,
      name: s.name,
      sgpa: s.sgpa,
      credits: s.credits,
    }))
  );

  // Mode 2: Input Previous CGPA + New Semester
  const [previousCgpaInput, setPreviousCgpaInput] = useState<PreviousCgpaInput>({
    currentCgpa: ACADEMIC_CONFIG.defaultPreviousCgpaState.currentCgpa,
    completedCredits: ACADEMIC_CONFIG.defaultPreviousCgpaState.completedCredits,
    newSemesterSgpa: ACADEMIC_CONFIG.defaultPreviousCgpaState.newSemesterSgpa,
    newSemesterCredits: ACADEMIC_CONFIG.defaultPreviousCgpaState.newSemesterCredits,
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Calculation Results
  const [result, setResult] = useState<CgpaCalculationResult | null>(() => {
    const initialSemesters = ACADEMIC_CONFIG.defaultSemesters.map((s, i) => ({
      id: `sem-init-${i}`,
      name: s.name,
      sgpa: s.sgpa,
      credits: s.credits,
    }));
    return calculateCgpa(initialSemesters, precision);
  });

  const handleAddSemester = () => {
    if (semesters.length >= MAX_SEMESTERS_LIMIT) return;
    const nextIndex = semesters.length + 1;
    const newSemester: SemesterInput = {
      id: `sem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `Semester ${String(nextIndex).padStart(2, '0')}`,
      sgpa: 9.500,
      credits: 24,
    };
    setSemesters(prev => [...prev, newSemester]);
  };

  const handleUpdateSemester = (id: string, field: keyof SemesterInput, value: any) => {
    setSemesters(prev =>
      prev.map(sem => {
        if (sem.id !== id) return sem;
        if (field === 'name') {
          return { ...sem, name: sanitizeText(value, 30) };
        }
        return { ...sem, [field]: value };
      })
    );
  };

  const handleRemoveSemester = (id: string) => {
    setSemesters(prev => prev.filter(s => s.id !== id));
  };

  const handleCalculate = (e?: React.FormEvent, targetPrecision: number = precision) => {
    if (e) e.preventDefault();
    setHasSubmitted(true);

    if (mode === 'semesters') {
      const res = calculateCgpa(semesters, targetPrecision);
      setResult(res);
    } else {
      const res = calculateCgpaFromPrevious(previousCgpaInput, targetPrecision);
      setResult(res);
    }
  };

  const handlePrecisionChange = (newPrecision: number) => {
    setPrecision(newPrecision);
    handleCalculate(undefined, newPrecision);
  };

  const handleReset = () => {
    if (mode === 'semesters') {
      const fresh = ACADEMIC_CONFIG.defaultSemesters.map((s, i) => ({
        id: `sem-reset-${Date.now()}-${i}`,
        name: s.name,
        sgpa: s.sgpa,
        credits: s.credits,
      }));
      setSemesters(fresh);
      setResult(calculateCgpa(fresh, precision));
    } else {
      const freshPrev = {
        currentCgpa: ACADEMIC_CONFIG.defaultPreviousCgpaState.currentCgpa,
        completedCredits: ACADEMIC_CONFIG.defaultPreviousCgpaState.completedCredits,
        newSemesterSgpa: ACADEMIC_CONFIG.defaultPreviousCgpaState.newSemesterSgpa,
        newSemesterCredits: ACADEMIC_CONFIG.defaultPreviousCgpaState.newSemesterCredits,
      };
      setPreviousCgpaInput(freshPrev);
      setResult(calculateCgpaFromPrevious(freshPrev, precision));
    }
    setHasSubmitted(false);
  };

  const handleModeSwitch = (newMode: CgpaMode) => {
    setMode(newMode);
    setHasSubmitted(false);
    if (newMode === 'semesters') {
      setResult(calculateCgpa(semesters, precision));
    } else {
      setResult(calculateCgpaFromPrevious(previousCgpaInput, precision));
    }
  };

  const semesterErrors = hasSubmitted && mode === 'semesters' ? calculateCgpa(semesters, precision).errors : {};
  const prevCgpaValidation = hasSubmitted && mode === 'previousCgpa' ? validatePreviousCgpa(previousCgpaInput) : { isValid: true };

  return (
    <div className="space-y-6">
      {/* Description header with Mode Switcher & Precision Selector */}
      {/* Header and Sub-mode switcher */}
      <div className="flex flex-col gap-3 pb-2 border-b border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
              Cumulative GPA
            </h2>
          </div>

          {/* Decimal Precision Selector */}
          <div className="flex items-center self-start sm:self-auto bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
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
        </div>

        {/* Sub-mode switcher */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => handleModeSwitch('semesters')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'semesters'
                ? 'bg-white text-neutral-950 font-semibold shadow-sm'
                : 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers size={13} />
            Semester-by-Semester
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('previousCgpa')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'previousCgpa'
                ? 'bg-white text-neutral-950 font-semibold shadow-sm'
                : 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookmarkCheck size={13} />
            Input Existing CGPA
          </button>
        </div>
      </div>

      {/* Mode 1: Semester-by-Semester */}
      {mode === 'semesters' && (
        <>
          {semesters.length === 0 ? (
            <EmptyState type="CGPA" onAdd={handleAddSemester} />
          ) : (
            <form onSubmit={handleCalculate} className="space-y-4">
              {/* Table Header for Desktop */}
              <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 px-3 py-1.5 text-[11px] font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
                <div className="sm:col-span-5">Semester</div>
                <div className="sm:col-span-3 text-center">Semester SGPA (up to 3 dec)</div>
                <div className="sm:col-span-3 text-center">Earned Credits</div>
                <div className="sm:col-span-1 text-center">Action</div>
              </div>

              {/* Semester Rows - Natural growth without cramped internal scrollbar */}
              <div className="space-y-1 sm:space-y-0.5">
                {semesters.map((semester, index) => (
                  <SemesterRow
                    key={semester.id}
                    semester={semester}
                    index={index}
                    validation={semesterErrors[semester.id]}
                    onUpdate={handleUpdateSemester}
                    onRemove={handleRemoveSemester}
                    canRemove={semesters.length > 1}
                  />
                ))}
              </div>

              {/* Action Row: Add Semester & Calculate */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleAddSemester}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
                >
                  <Plus size={14} />
                  Add Semester
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-950 text-xs sm:text-sm font-semibold transition-colors shadow-sm"
                >
                  <Calculator size={15} />
                  Calculate CGPA
                  <ArrowRight size={14} className="opacity-60" />
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Mode 2: Direct Input CGPA Form */}
      {mode === 'previousCgpa' && (
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-4">
            <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              1. Current Academic Standing
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Input Current CGPA <span className="text-[11px] text-neutral-500 font-mono">(up to 3 decimals)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step="any"
                  value={previousCgpaInput.currentCgpa}
                  onChange={e =>
                    setPreviousCgpaInput(prev => ({ ...prev, currentCgpa: e.target.value }))
                  }
                  placeholder="e.g. 9.425"
                  className={`w-full bg-neutral-900 border text-sm font-mono font-medium px-3 py-2 rounded-lg outline-none transition-all ${
                    prevCgpaValidation.currentCgpaError
                      ? 'border-rose-700/60 bg-rose-950/30 text-rose-200'
                      : 'border-neutral-800 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 text-white'
                  }`}
                />
                {prevCgpaValidation.currentCgpaError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">
                    {prevCgpaValidation.currentCgpaError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Total Completed Credits So Far
                </label>
                <input
                  type="number"
                  min={1}
                  max={250}
                  step="any"
                  value={previousCgpaInput.completedCredits}
                  onChange={e =>
                    setPreviousCgpaInput(prev => ({ ...prev, completedCredits: e.target.value }))
                  }
                  placeholder="e.g. 69"
                  className={`w-full bg-neutral-900 border text-sm font-mono font-medium px-3 py-2 rounded-lg outline-none transition-all ${
                    prevCgpaValidation.completedCreditsError
                      ? 'border-rose-700/60 bg-rose-950/30 text-rose-200'
                      : 'border-neutral-800 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 text-white'
                  }`}
                />
                {prevCgpaValidation.completedCreditsError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">
                    {prevCgpaValidation.completedCreditsError}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              2. New Semester Performance
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  New Semester SGPA <span className="text-[11px] text-neutral-500 font-mono">(up to 3 decimals)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step="any"
                  value={previousCgpaInput.newSemesterSgpa}
                  onChange={e =>
                    setPreviousCgpaInput(prev => ({ ...prev, newSemesterSgpa: e.target.value }))
                  }
                  placeholder="e.g. 9.680"
                  className={`w-full bg-neutral-900 border text-sm font-mono font-medium px-3 py-2 rounded-lg outline-none transition-all ${
                    prevCgpaValidation.newSemesterSgpaError
                      ? 'border-rose-700/60 bg-rose-950/30 text-rose-200'
                      : 'border-neutral-800 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 text-white'
                  }`}
                />
                {prevCgpaValidation.newSemesterSgpaError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">
                    {prevCgpaValidation.newSemesterSgpaError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  New Semester Credits
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  step="any"
                  value={previousCgpaInput.newSemesterCredits}
                  onChange={e =>
                    setPreviousCgpaInput(prev => ({ ...prev, newSemesterCredits: e.target.value }))
                  }
                  placeholder="e.g. 24"
                  className={`w-full bg-neutral-900 border text-sm font-mono font-medium px-3 py-2 rounded-lg outline-none transition-all ${
                    prevCgpaValidation.newSemesterCreditsError
                      ? 'border-rose-700/60 bg-rose-950/30 text-rose-200'
                      : 'border-neutral-800 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 text-white'
                  }`}
                />
                {prevCgpaValidation.newSemesterCreditsError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">
                    {prevCgpaValidation.newSemesterCreditsError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-950 text-xs sm:text-sm font-semibold transition-colors shadow-sm"
            >
              <Calculator size={15} />
              Calculate Updated CGPA
              <ArrowRight size={14} className="opacity-60" />
            </button>
          </div>
        </form>
      )}

      {/* Result Display Card */}
      {result && result.isValid && (
        <div className="pt-4 space-y-3">
          <ResultCard
            type="CGPA"
            value={result.cgpa}
            formattedValue={result.formattedCgpa}
            totalCredits={result.totalCredits}
            secondaryMetricLabel="Total Weighted Points"
            secondaryMetricValue={result.formattedTotalWeightedPoints}
            onRecalculate={() => handleCalculate()}
            onReset={handleReset}
          />

          <CalculationBreakdown
            type="CGPA"
            semesterItems={result.items}
            numeratorSum={result.calculationSteps.numeratorSum}
            denominatorSum={result.calculationSteps.denominatorSum}
            finalResult={result.formattedCgpa}
            unroundedValue={result.calculationSteps.unroundedRatio}
          />
        </div>
      )}
    </div>
  );
};
