import React from 'react';
import { Check } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="pt-3 pb-3 text-center max-w-xl mx-auto px-4 shrink-0">
      <div className="inline-flex items-center justify-center flex-wrap gap-2 sm:gap-2.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Calculate your GPA.
        </h1>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
          <Check size={12} className="stroke-[2.5]" />
          100% Accurate
        </span>
      </div>
      <p className="text-xs text-neutral-400 mt-1 font-normal">
        Zero rounding discrepancies. Exact match with your official SRM grade sheet.
      </p>
    </section>
  );
};
