import React from 'react';
import { CalculatorTab } from './CalculatorShell';

interface NavbarProps {
  activeTab: CalculatorTab;
  onSelectTab: (tab: CalculatorTab) => void;
  onOpenHowItWorks?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenHowItWorks,
}) => {
  const scrollToCalculator = (tab: CalculatorTab) => {
    onSelectTab(tab);
    const el = document.getElementById('calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0c0d0e]/80 border-b border-neutral-800/60 transition-colors shrink-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        {/* Left: Brand Mark & Title */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center group text-left outline-none"
        >
          <span className="text-sm font-semibold tracking-tight text-white leading-none">
            SRM GPA
          </span>
        </button>

        {/* Right Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-1 text-xs font-medium text-neutral-400">
            <button
              onClick={() => scrollToCalculator('SGPA')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'SGPA'
                  ? 'text-white font-semibold'
                  : 'hover:text-neutral-200'
              }`}
            >
              SGPA
            </button>
            <button
              onClick={() => scrollToCalculator('CGPA')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'CGPA'
                  ? 'text-white font-semibold'
                  : 'hover:text-neutral-200'
              }`}
            >
              CGPA
            </button>
            <button
              onClick={onOpenHowItWorks}
              className="px-2.5 py-1.5 rounded-lg hover:text-neutral-200 transition-colors hidden sm:inline"
            >
              How it works
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
