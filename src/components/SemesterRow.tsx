import React from 'react';
import { Trash2 } from 'lucide-react';
import { SemesterInput, SemesterValidation } from '../lib/calculations';

interface SemesterRowProps {
  semester: SemesterInput;
  index: number;
  validation?: SemesterValidation;
  onUpdate: (id: string, field: keyof SemesterInput, value: any) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const SemesterRow: React.FC<SemesterRowProps> = ({
  semester,
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
        {/* Semester Name */}
        <div className="sm:col-span-5">
          <input
            type="text"
            value={semester.name}
            onChange={e => onUpdate(semester.id, 'name', e.target.value)}
            placeholder={`Semester ${displayNumber}`}
            aria-label={`Semester ${displayNumber} Name`}
            className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 text-sm font-medium text-white px-3 py-2 rounded-lg outline-none transition-all placeholder:text-neutral-500"
          />
        </div>

        {/* SGPA Input */}
        <div className="sm:col-span-3">
          <div className="relative">
            <input
              type="number"
              min={0}
              max={10}
              step="any"
              value={semester.sgpa}
              onChange={e => onUpdate(semester.id, 'sgpa', e.target.value)}
              placeholder="e.g. 9.425"
              aria-label={`Semester ${displayNumber} SGPA`}
              className={`w-full text-center bg-neutral-900 border hover:border-neutral-700 text-sm font-mono font-medium text-white px-3 py-2 rounded-lg outline-none transition-all ${
                validation?.sgpaError
                  ? 'border-rose-700/60 bg-rose-950/30 text-rose-200'
                  : 'border-neutral-800 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700'
              }`}
            />
          </div>
          {validation?.sgpaError && (
            <p className="text-[11px] text-rose-400 mt-1 pl-1 font-medium">
              {validation.sgpaError}
            </p>
          )}
        </div>

        {/* Credits Input */}
        <div className="sm:col-span-3">
          <div className="relative">
            <input
              type="number"
              min={1}
              max={40}
              step={1}
              value={semester.credits}
              onChange={e => onUpdate(semester.id, 'credits', e.target.value)}
              placeholder="Credits (e.g. 24)"
              aria-label={`Semester ${displayNumber} Credits`}
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

        {/* Delete Action */}
        <div className="sm:col-span-1 flex justify-center">
          <button
            type="button"
            disabled={!canRemove}
            onClick={() => onRemove(semester.id)}
            title="Delete semester"
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
            value={semester.name}
            onChange={e => onUpdate(semester.id, 'name', e.target.value)}
            placeholder={`Semester ${displayNumber}`}
            className="flex-1 bg-neutral-900 border border-neutral-800 text-sm font-medium px-2.5 py-1.5 rounded-lg outline-none text-white placeholder:text-neutral-500"
          />
          <button
            type="button"
            disabled={!canRemove}
            onClick={() => onRemove(semester.id)}
            className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg disabled:opacity-20"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Semester SGPA
            </label>
            <input
              type="number"
              min={0}
              max={10}
              step="any"
              value={semester.sgpa}
              onChange={e => onUpdate(semester.id, 'sgpa', e.target.value)}
              placeholder="e.g. 9.425"
              className={`w-full text-center bg-neutral-900 border text-sm font-mono font-medium text-white py-1.5 px-2 rounded-lg outline-none ${
                validation?.sgpaError
                  ? 'border-rose-700/60 bg-rose-950/30 text-rose-200'
                  : 'border-neutral-800 focus:border-neutral-600'
              }`}
            />
            {validation?.sgpaError && (
              <p className="text-[10px] text-rose-400 mt-1">{validation.sgpaError}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Semester Credits
            </label>
            <input
              type="number"
              min={1}
              max={40}
              step={1}
              value={semester.credits}
              onChange={e => onUpdate(semester.id, 'credits', e.target.value)}
              placeholder="e.g. 24"
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
        </div>
      </div>
    </div>
  );
};
