import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeaderBannerProps {
  onOpenOcr: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({ onOpenOcr }) => {
  return (
    <aside
      aria-label="Result Screenshot Scanner Announcement"
      role="button"
      tabIndex={0}
      onClick={onOpenOcr}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenOcr();
        }
      }}
      className="group w-full bg-white text-neutral-950 py-2 sm:py-2.5 px-4 sm:px-6 cursor-pointer border-b border-neutral-200 hover:bg-neutral-50/90 transition-colors select-none shadow-sm z-30 shrink-0"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h2 className="text-xs sm:text-sm font-bold tracking-tight text-neutral-950 leading-tight">
            Have an SRM result screenshot? Calculate SGPA instantly.
          </h2>
          <p className="text-[11px] text-neutral-600 font-normal mt-0.5">
            Auto-extracts credits and grades. Press{' '}
            <kbd className="px-1.5 py-0.2 rounded bg-neutral-100 border border-neutral-300 font-mono text-[10px] text-neutral-800 font-semibold">
              Ctrl + V
            </kbd>{' '}
            or click to see how it works.
          </p>
        </div>

        <div className="w-full sm:w-auto flex sm:inline-flex justify-end shrink-0">
          <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold transition-all group-hover:bg-neutral-800 shadow-sm">
            <span>See How It Works</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-150" />
          </span>
        </div>
      </div>
    </aside>
  );
};

