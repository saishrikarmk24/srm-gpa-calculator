import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Upload, ArrowRight } from 'lucide-react';

interface OcrDemoAnimationProps {
  onUploadClick: () => void;
  onComplete: () => void;
}

const MOCK_COURSES = [
  { name: 'Course Code 1 (Course Name 1)', credits: 4, grade: 'O' },
  { name: 'Course Code 2 (Course Name 2)', credits: 4, grade: 'O' },
  { name: 'Course Code 3 (Course Name 3)', credits: 4, grade: 'O' },
  { name: 'Course Code 4 (Course Name 4)', credits: 3, grade: 'O' },
  { name: 'Course Code 5 (Course Name 5)', credits: 3, grade: 'O' },
  { name: 'Course Code 6 (Course Name 6)', credits: 3, grade: 'O' },
  { name: 'Course Code 7 (Course Name 7)', credits: 2, grade: 'O' },
];

export const OcrDemoAnimation: React.FC<OcrDemoAnimationProps> = ({
  onUploadClick,
  onComplete,
}) => {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [scannedRowCount, setScannedRowCount] = useState<number>(0);

  const startAnimation = () => {
    setPhase(0);
    setScannedRowCount(0);

    const t1 = setTimeout(() => {
      setPhase(1);
    }, 900);

    const rowTimers = [
      setTimeout(() => setScannedRowCount(1), 1200),
      setTimeout(() => setScannedRowCount(2), 1500),
      setTimeout(() => setScannedRowCount(3), 1800),
      setTimeout(() => setScannedRowCount(4), 2100),
      setTimeout(() => setScannedRowCount(5), 2400),
      setTimeout(() => setScannedRowCount(6), 2700),
      setTimeout(() => setScannedRowCount(7), 3000),
    ];

    const t2 = setTimeout(() => {
      setPhase(2);
    }, 3200);

    const t3 = setTimeout(() => {
      onComplete();
    }, 4800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      rowTimers.forEach(clearTimeout);
    };
  };

  useEffect(() => {
    const cleanup = startAnimation();
    return cleanup;
  }, []);

  return (
    <div className="w-full flex flex-col h-[380px] sm:h-[400px] justify-between">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 flex-1 min-h-0">
        {/* Left Column: Mock Screenshot + Scanning Beam */}
        <div className="md:col-span-7 relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center p-2 min-h-0">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src="/mock_result_sample.png"
              alt="SRM Result Screenshot Mock"
              className="max-h-full max-w-full object-contain select-none pointer-events-none rounded"
            />

            {phase === 1 && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{
                  duration: 2.1,
                  ease: 'linear',
                }}
                className="absolute left-0 right-0 h-0.5 bg-neutral-200 shadow-[0_0_12px_rgba(255,255,255,0.7)] z-20 pointer-events-none"
              >
                <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-b from-transparent to-white/10" />
              </motion.div>
            )}

            {phase === 1 && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {[...Array(scannedRowCount)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute left-2 right-2 border border-neutral-600/60 bg-neutral-700/20 rounded"
                    style={{
                      top: `${14 + i * 12.2}%`,
                      height: '10.5%',
                    }}
                  >
                    <span className="absolute right-2 top-0.5 text-[8px] font-medium text-neutral-300 bg-neutral-900/90 px-1 rounded">
                      READ
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Feed & Results */}
        <div className="md:col-span-5 flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 min-h-0">
          <div className="space-y-2.5 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {phase === 1 ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-200" />
                    </>
                  ) : phase === 2 ? (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-500" />
                  )}
                </span>
                <span className="text-xs font-semibold text-white">
                  {phase === 0 && 'Sample Screenshot'}
                  {phase === 1 && `Scanning rows (${scannedRowCount}/7)...`}
                  {phase === 2 && 'Scan Complete'}
                </span>
              </div>

              {phase === 2 && (
                <button
                  type="button"
                  onClick={startAnimation}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                >
                  <RotateCcw size={11} />
                  <span>Replay</span>
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {phase === 2 ? (
                <motion.div
                  key="done-view"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 flex-1 min-h-0 flex flex-col"
                >
                  <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-400">
                        Calculated SGPA
                      </span>
                      <span className="text-base font-bold text-white font-mono">
                        10.00
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      7 Courses • 23 Credits • All Grade O (PASS)
                    </p>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1 text-[11px]">
                    {MOCK_COURSES.slice(0, 5).map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-neutral-900/50 border border-neutral-800/80"
                      >
                        <span className="truncate font-medium text-neutral-300 max-w-[130px]">
                          {c.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-neutral-500 text-[10px]">{c.credits}c</span>
                          <span className="font-semibold text-white bg-neutral-800 px-1 rounded text-[10px]">
                            {c.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="text-[10px] text-neutral-500 text-center py-0.5">
                      + 2 more courses recognized
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="scanning-feed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1.5 flex-1 min-h-0 overflow-hidden flex flex-col justify-center text-center p-2"
                >
                  <p className="text-xs text-neutral-400">
                    {phase === 1 ? 'Reading course codes, credits, and grades...' : 'SRM result sheet detected.'}
                  </p>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden my-2">
                    <div
                      className="bg-neutral-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${(scannedRowCount / 7) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    {scannedRowCount} of 7 course rows recognized
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-2 border-t border-neutral-800 shrink-0">
            <button
              type="button"
              onClick={onUploadClick}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-semibold transition-colors shadow-sm"
            >
              <Upload size={13} />
              <span>Upload Your Screenshot</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-500 px-1 shrink-0">
        <span>
          {phase === 2
            ? 'Redirecting to upload...'
            : 'Paste your screenshot anytime with Ctrl + V'}
        </span>
        <span className="font-mono">SRM 10-Point Scale</span>
      </div>
    </div>
  );
};
