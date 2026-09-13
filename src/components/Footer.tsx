import React from 'react';
import { CalculatorTab } from './CalculatorShell';

interface FooterProps {
  onSelectTab: (tab: CalculatorTab) => void;
  onOpenHowItWorks?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenHowItWorks }) => {
  const scrollToTab = (tab: CalculatorTab) => {
    onSelectTab(tab);
    const el = document.getElementById('calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full py-3 border-t border-neutral-800/80 shrink-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="text-center sm:text-left">
          <span className="font-medium text-neutral-300">
            SRM GPA Calculator
          </span>
        </div>

        <div className="text-[11px] text-neutral-400 text-center">
          Developed (VibeCoded 😜) by{' '}
          <a
            href="https://www.linkedin.com/in/saishrikarmk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-200 hover:text-white underline underline-offset-2 font-medium transition-colors"
          >
            Sai Shrikar
          </a>
        </div>

        <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
          <button
            type="button"
            onClick={() => scrollToTab('SGPA')}
            className="hover:text-white transition-colors"
          >
            SGPA
          </button>
          <button
            type="button"
            onClick={() => scrollToTab('CGPA')}
            className="hover:text-white transition-colors"
          >
            CGPA
          </button>
          <button
            type="button"
            onClick={onOpenHowItWorks}
            className="hover:text-white transition-colors"
          >
            How it works
          </button>
        </div>
      </div>
    </footer>
  );
};
