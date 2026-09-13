import React from 'react';
import { Trash2 } from 'lucide-react';
import { CourseInput, CourseValidation } from '../lib/calculations';
import { GradeSelect } from './GradeSelect';

interface CourseRowProps {
  course: CourseInput;
  index: number;
  validation?: CourseValidation;
  onUpdate: (id: string, field: keyof CourseInput, value: any) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const CourseRow: React.FC<CourseRowProps> = ({
  course,
  index,
  validation,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const displayNumber = String(index + 1).padStart(2, '0');

  return (
    <div className="group relative transition-all duration-150">
      {/* Desktop / Tablet Row Layout (>= sm) */}
      <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center py-2 px-2.5 rounded-lg hover:bg-neutral-900/40 border border-transparent hover:border-neutral-800/60 transition-colors">
        {/* Course Name */}
        <div className="sm:col-span-5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={course.name}
              onChange={e => onUpdate(course.id, 'name', e.target.value)}
              placeholder={`Course ${displayNumber}`}
              aria-label={`Course ${displayNumber} Name`}
              className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 text-sm font-medium text-white px-3 py-2 rounded-lg outline-none transition-all placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Credits Input */}
        <div className="sm:col-span-3">
          <div className="relative">
            <input
              type="number"
              min={0.5}
              max={12}
              step="any"
              value={course.credits}
              onChange={e => onUpdate(course.id, 'credits', e.target.value)}
              placeholder="Credits"
              aria-label={`Course ${displayNumber} Credits`}
              className={`w-full text-center bg-neutral-900 border hover:border-neutral-700 text-sm font-mono font-medium text-white px-3 py-2 rounded-lg outline-none transition-all ${
                validation?.creditsError
                  ? 'border-rose-700/60 bg-rose-950/30 text-rose-200'
                  : 'border-neutral-800 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700'
              }`}
            />
          </div>
          {validation?.creditsError && (
            <p className="text-[11px] text-rose-400 mt-1 pl-1 font-medium">
              {validation.creditsError}
            </p>
          )}
        </div>

        {/* Grade Custom Select */}
        <div className="sm:col-span-3">
          <GradeSelect
            value={course.grade}
            onChange={grade => onUpdate(course.id, 'grade', grade)}
            hasError={Boolean(validation?.gradeError)}
          />
          {validation?.gradeError && (
            <p className="text-[11px] text-rose-400 mt-1 pl-1 font-medium">
              {validation.gradeError}
            </p>
          )}
        </div>

        {/* Delete Action */}
        <div className="sm:col-span-1 flex justify-center">
          <button
            type="button"
            disabled={!canRemove}
            onClick={() => onRemove(course.id)}
            title="Delete course"
            className="p-2 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-500"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Mobile Card Layout (< sm) */}
      <div className="sm:hidden p-3 mb-2 rounded-lg bg-neutral-900/50 border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            value={course.name}
            onChange={e => onUpdate(course.id, 'name', e.target.value)}
            placeholder={`Course ${displayNumber}`}
            className="flex-1 bg-neutral-900 border border-neutral-800 text-sm font-medium px-2.5 py-1.5 rounded-lg outline-none text-white placeholder:text-neutral-500"
          />
          <button
            type="button"
            disabled={!canRemove}
            onClick={() => onRemove(course.id)}
            className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg disabled:opacity-20"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Credits
            </label>
            <input
              type="number"
              min={0.5}
              max={12}
              step="any"
              value={course.credits}
              onChange={e => onUpdate(course.id, 'credits', e.target.value)}
              placeholder="e.g. 4"
              className={`w-full text-center bg-neutral-900 border text-sm font-mono font-medium text-white py-1.5 px-2 rounded-lg outline-none ${
                validation?.creditsError
                  ? 'border-rose-700/60 bg-rose-950/30 text-rose-200'
                  : 'border-neutral-800 focus:border-neutral-600'
              }`}
            />
            {validation?.creditsError && (
              <p className="text-[10px] text-rose-400 mt-1">{validation.creditsError}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mb-1">
              Grade
            </label>
            <GradeSelect
              value={course.grade}
              onChange={grade => onUpdate(course.id, 'grade', grade)}
              hasError={Boolean(validation?.gradeError)}
            />
            {validation?.gradeError && (
              <p className="text-[10px] text-rose-500 mt-1">{validation.gradeError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
