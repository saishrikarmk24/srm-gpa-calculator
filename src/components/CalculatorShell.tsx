import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SgpaCalculator } from './SgpaCalculator';
import { CgpaCalculator } from './CgpaCalculator';

export type CalculatorTab = 'SGPA' | 'CGPA';

interface CalculatorShellProps {
  activeTab?: CalculatorTab;
  onTabChange?: (tab: CalculatorTab) => void;
  isOcrOpen?: boolean;
  onOcrOpenChange?: (open: boolean) => void;
}

export const CalculatorShell: React.FC<CalculatorShellProps> = ({
  activeTab: controlledTab,
  onTabChange,
  isOcrOpen,
  onOcrOpenChange,
}) => {
  const [internalTab, setInternalTab] = useState<CalculatorTab>('SGPA');
  const activeTab = controlledTab ?? internalTab;

  const handleTabClick = (tab: CalculatorTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  return (
    <section id="calculator" className="w-full max-w-3xl mx-auto">
      {/* Main Container Card */}
      <div className="relative rounded-xl border border-neutral-800 bg-[#111214] p-5 sm:p-6 shadow-sm">
        {/* Segmented Control Header */}
        <div className="flex justify-center pb-4 mb-4 border-b border-neutral-800/80">
          {/* Segmented Tab Switcher */}
          <div className="inline-flex p-1 rounded-lg bg-neutral-900 border border-neutral-800">
            {(['SGPA', 'CGPA'] as const).map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={`relative px-6 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 z-10 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-neutral-800 rounded-md border border-neutral-700/60 -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content with smooth cross-fade animation */}
        <AnimatePresence mode="wait">
          {activeTab === 'SGPA' ? (
            <motion.div
              key="sgpa-panel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <SgpaCalculator
                isOcrOpen={isOcrOpen}
                onOcrOpenChange={onOcrOpenChange}
              />
            </motion.div>
          ) : (
            <motion.div
              key="cgpa-panel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <CgpaCalculator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
