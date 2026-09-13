import React, { useEffect, useState } from 'react';
import { RotateCcw, RefreshCw, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultCardProps {
  type: 'SGPA' | 'CGPA';
  value: number;
  formattedValue: string;
  totalCredits: number;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
  onRecalculate: () => void;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  type,
  value,
  formattedValue,
  totalCredits,
  secondaryMetricLabel,
  secondaryMetricValue,
  onRecalculate,
  onReset,
}) => {
  const [displayNumber, setDisplayNumber] = useState('0.00');
  const [copied, setCopied] = useState(false);

  // Smooth number counting animation
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 900; // ms
    const target = value;
    let animationFrameId: number;

    const decimals = formattedValue.includes('.') ? formattedValue.split('.')[1].length : 2;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * target;
      setDisplayNumber(current.toFixed(decimals));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayNumber(formattedValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, formattedValue]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${formattedValue} ${type}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Performance classification indicator (quiet, understated)
  const getClassificationText = (score: number) => {
    if (score >= 9.0) return 'Outstanding Performance';
    if (score >= 8.0) return 'Distinction';
    if (score >= 6.5) return 'First Class';
    return 'Passing';
  };

  const performanceText = getClassificationText(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-neutral-800 bg-[#111214] p-6 sm:p-7 text-center shadow-sm"
    >
      <div className="flex flex-col items-center">
        {/* Confident Score Display with 1-click Copy */}
        <div className="inline-flex items-center justify-center gap-2">
          <span className="text-6xl sm:text-7xl font-bold tracking-tight text-white font-sans tabular-nums select-all">
            {displayNumber}
          </span>
          <button
            onClick={handleCopy}
            title="Copy GPA"
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Copy GPA"
          >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
          </button>
        </div>

        {/* Quiet, refined performance indicator (not a floating SaaS badge) */}
        <div className="mt-1.5 text-xs font-medium text-neutral-400">
          {performanceText} · Calculated {type}
        </div>

        {/* Secondary metrics without unnecessary boxed container */}
        <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex items-center justify-center gap-5 text-xs text-neutral-400 w-full max-w-sm">
          <div>
            Total Credits: <span className="text-white font-mono font-medium">{totalCredits}</span>
          </div>
          <span className="text-neutral-600">•</span>
          <div>
            {secondaryMetricLabel}: <span className="text-white font-mono font-medium">{secondaryMetricValue}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onRecalculate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-neutral-950 font-semibold text-xs hover:bg-neutral-100 transition-colors shadow-sm active:scale-[0.99]"
          >
            <RefreshCw size={13} />
            Recalculate
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-neutral-400 hover:text-white text-xs font-medium transition-colors"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>
    </motion.div>
  );
};
