import React, { useState } from 'react';
import { ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseBreakdownItem, SemesterBreakdownItem } from '../lib/calculations';

interface CalculationBreakdownProps {
  type: 'SGPA' | 'CGPA';
  sgpaItems?: CourseBreakdownItem[];
  semesterItems?: SemesterBreakdownItem[];
  numeratorSum: string;
  denominatorSum: string;
  finalResult: string;
  unroundedValue: number;
}

export const CalculationBreakdown: React.FC<CalculationBreakdownProps> = ({
  type,
  sgpaItems,
  semesterItems,
  numeratorSum,
  denominatorSum,
  finalResult,
  unroundedValue,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full mt-3">
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <span className="flex items-center gap-2">
          <HelpCircle size={14} className="text-neutral-500" />
          <span>{isExpanded ? 'Hide calculation details' : 'View calculation breakdown & formula'}</span>
        </span>
        <ChevronDown
          size={14}
          className={`transform transition-transform duration-200 text-neutral-500 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-4 rounded-lg bg-[#111214] border border-neutral-800 text-xs space-y-4 shadow-sm">
              {/* Formula explanation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                <div>
                  <span className="font-semibold text-neutral-200">
                    Official SRM Formula
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {type === 'SGPA'
                      ? 'Weighted sum of course grade points divided by total course credits'
                      : 'Weighted sum of semester SGPAs divided by cumulative earned credits'}
                  </p>
                </div>
                <div className="font-mono text-[11px] bg-neutral-900 px-2.5 py-1 rounded-md text-neutral-300 border border-neutral-800">
                  {type === 'SGPA' ? 'SGPA = Σ(Ci × GPi) / Σ(Ci)' : 'CGPA = Σ(Ci × SGPAi) / Σ(Ci)'}
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                      <th className="py-2 pr-4">{type === 'SGPA' ? 'Course' : 'Semester'}</th>
                      <th className="py-2 px-3 text-center">{type === 'SGPA' ? 'Grade' : 'SGPA'}</th>
                      <th className="py-2 px-3 text-center">{type === 'SGPA' ? 'Grade Pts' : 'Credits'}</th>
                      <th className="py-2 px-3 text-center">{type === 'SGPA' ? 'Credits' : 'Multiplier'}</th>
                      <th className="py-2 pl-3 text-right">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                    {type === 'SGPA' &&
                      sgpaItems?.map(item => (
                        <tr key={item.id} className="hover:bg-neutral-800/30">
                          <td className="py-2 pr-4 font-sans font-medium text-neutral-200 truncate max-w-[140px]">
                            {item.name}
                          </td>
                          <td className="py-2 px-3 text-center font-semibold text-neutral-300">
                            {item.grade}
                          </td>
                          <td className="py-2 px-3 text-center text-neutral-400">
                            {item.gradePoints}
                          </td>
                          <td className="py-2 px-3 text-center text-neutral-400">
                            {item.credits}
                          </td>
                          <td className="py-2 pl-3 text-right font-medium text-white">
                            {item.weightedPoints.toFixed(2)}
                          </td>
                        </tr>
                      ))}

                    {type === 'CGPA' &&
                      semesterItems?.map(item => (
                        <tr key={item.id} className="hover:bg-neutral-800/30">
                          <td className="py-2 pr-4 font-sans font-medium text-neutral-200 truncate max-w-[140px]">
                            {item.name}
                          </td>
                          <td className="py-2 px-3 text-center font-semibold text-neutral-300">
                            {item.sgpa.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-center text-neutral-400">
                            {item.credits}
                          </td>
                          <td className="py-2 px-3 text-center text-neutral-400">
                            ×
                          </td>
                          <td className="py-2 pl-3 text-right font-medium text-white">
                            {item.contribution.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mathematical Proof Computation Box */}
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Numerator (Total Grade Points):</span>
                  <span className="font-mono font-medium text-white">{numeratorSum}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Denominator (Total Registered Credits):</span>
                  <span className="font-mono font-medium text-white">{denominatorSum}</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    Exact Ratio &amp; SRM Truncation:
                  </span>
                  <span className="font-mono font-semibold text-white">
                    {numeratorSum} ÷ {denominatorSum} = {unroundedValue.toFixed(6)} →{' '}
                    <span className="text-emerald-400 font-bold">{finalResult}</span>
                    <span className="ml-1 text-[11px] font-normal text-neutral-500">(Truncated)</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
