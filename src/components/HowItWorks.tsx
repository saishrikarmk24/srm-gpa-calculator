import React from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      number: '01',
      title: 'Enter your courses',
      description: 'Add each course and its credit value (typically 1 to 4 credits per SRM course).',
    },
    {
      number: '02',
      title: 'Select your grades',
      description: 'Choose your letter grade (O=10, A+=9, A=8, B+=7, B=6, C=5, P=4, F=0).',
    },
    {
      number: '03',
      title: 'Get your GPA',
      description: 'Your SGPA or CGPA is calculated with exact SRM truncation rules.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 6 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-2xl bg-[#111214] border border-neutral-800 rounded-xl shadow-2xl p-5 sm:p-6 my-auto"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-200 flex items-center justify-center">
              <BookOpen size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                How Calculation Works
              </h3>
              <p className="text-xs text-neutral-400">
                Official SRMIST grading &amp; truncation rules
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {steps.map(step => (
            <div
              key={step.number}
              className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800"
            >
              <span className="block font-mono text-xs font-semibold text-neutral-400 mb-1">
                {step.number}
              </span>
              <h4 className="text-xs font-semibold text-white mb-1">
                {step.title}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3.5 p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
          <CheckCircle2 size={15} className="text-neutral-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">SRM Truncation Rule:</span> GPA is calculated by taking total grade points earned divided by total credits, truncated to 2 decimal places without rounding up (e.g. 9.6966... becomes 9.69).
          </div>
        </div>

        <div className="mt-2.5 p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
          <CheckCircle2 size={15} className="text-neutral-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Client-Side Privacy:</span> All computations and OCR run directly in your browser. No academic records, grades, or screenshots are ever transmitted to any server.
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
