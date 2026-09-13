import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Trash2, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { scanSrmResultScreenshot, ScanProgress } from '../lib/ocr/scanner';
import { ParsedOcrCourse } from '../lib/ocr/parser';
import { GradeSelect } from './GradeSelect';
import { calculateSgpa } from '../lib/calculations';
import { OcrDemoAnimation } from './OcrDemoAnimation';
import { validateUploadedFile, sanitizeText, MAX_COURSES_LIMIT } from '../lib/security';

interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCourses: (courses: Array<{ name: string; credits: number; grade: string }>) => void;
}

export const OcrModal: React.FC<OcrModalProps> = ({
  isOpen,
  onClose,
  onApplyCourses,
}) => {
  const [viewMode, setViewMode] = useState<'demo' | 'upload'>('demo');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({ status: '', progress: 0 });
  const [extractedCourses, setExtractedCourses] = useState<ParsedOcrCourse[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL when unmounting or when image changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Reset to demo view whenever modal opens anew (unless already scanned)
  useEffect(() => {
    if (isOpen && !hasScanned) {
      setViewMode('demo');
    }
  }, [isOpen]);

  // Clipboard paste listener (Ctrl+V anywhere in modal)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFileSelect(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleFileSelect = async (selectedFile: File) => {
    if (isScanning) return;

    // Security validation against oversized files and malicious file types
    const validation = validateUploadedFile(selectedFile);
    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Invalid file.');
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setViewMode('upload');
    setFile(selectedFile);
    setErrorMsg(null);
    const previewUrl = URL.createObjectURL(selectedFile);
    setImagePreview(previewUrl);

    // Auto-start scanning
    setIsScanning(true);
    setHasScanned(false);
    setScanProgress({ status: 'Starting scan...', progress: 0.05 });

    try {
      const result = await scanSrmResultScreenshot(selectedFile, progress => {
        setScanProgress(progress);
      });

      if (result.courses.length === 0) {
        setErrorMsg('Could not detect distinct course rows. You can add them below or try a clearer screenshot.');
      }

      setExtractedCourses(result.courses.slice(0, MAX_COURSES_LIMIT));
      setHasScanned(true);
    } catch (err: any) {
      console.error('OCR processing error:', err);
      const detail = typeof err === 'string' ? err : err?.message || err?.error;
      setErrorMsg(
        detail
          ? `Could not process image: ${detail}`
          : 'Failed to process screenshot. Please ensure the grades and courses are clearly visible and try again.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpdateCourse = (index: number, field: keyof ParsedOcrCourse, val: any) => {
    setExtractedCourses(prev =>
      prev.map((c, i) => {
        if (i !== index) return c;
        if (field === 'name') {
          return { ...c, name: sanitizeText(val, 60) };
        }
        return { ...c, [field]: val };
      })
    );
  };

  const handleRemoveCourse = (index: number) => {
    setExtractedCourses(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    if (extractedCourses.length === 0) return;
    onApplyCourses(
      extractedCourses.slice(0, MAX_COURSES_LIMIT).map(c => ({
        name: sanitizeText(c.name, 60),
        credits: typeof c.credits === 'number' && !isNaN(c.credits) ? Math.min(Math.max(c.credits, 0.5), 12) : 3,
        grade: c.grade,
      }))
    );
    onClose();
  };

  const previewSgpa = calculateSgpa(
    extractedCourses.map((c, i) => ({
      id: `preview-${i}`,
      name: c.name,
      credits: c.credits,
      grade: c.grade,
    }))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 6 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-4xl bg-[#111214] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[88vh] flex flex-col"
      >
        {/* Header with Navigation Tabs */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              SRM Result Screenshot Scanner
            </h3>
            <p className="text-[11px] text-neutral-400">
              Client-side OCR • Instant course &amp; grade detection
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!hasScanned && !isScanning && (
              <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('demo')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'demo'
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Demo
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'upload'
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-hidden flex-1 flex flex-col justify-center">
          {!hasScanned && !isScanning && viewMode === 'demo' && (
            <OcrDemoAnimation
              onUploadClick={() => {
                setViewMode('upload');
                setTimeout(() => fileInputRef.current?.click(), 50);
              }}
              onComplete={() => {
                setViewMode('upload');
              }}
            />
          )}

          {!hasScanned && (viewMode === 'upload' || isScanning) && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 h-[380px] sm:h-[400px]">
              {/* Dropzone */}
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => !isScanning && fileInputRef.current?.click()}
                className={`md:col-span-6 relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                  isScanning
                    ? 'border-neutral-700 bg-neutral-900/40 cursor-wait'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                {isScanning ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 size={28} className="animate-spin text-neutral-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {scanProgress.status}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Reading course codes, credits, and grades...
                      </p>
                    </div>
                    <div className="w-44 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-400 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.round(scanProgress.progress * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
                      <Upload size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">
                        Click to upload screenshot
                      </p>
                      <p className="text-xs text-neutral-400">
                        or drag &amp; drop your SRM result sheet
                      </p>
                      <p className="text-[11px] text-neutral-500 pt-1.5">
                        Paste anytime with <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono font-semibold text-neutral-300">Ctrl + V</kbd>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference Mock Screenshot */}
              <div className="md:col-span-6 rounded-xl border border-neutral-800 bg-[#0e0f10] p-3 flex flex-col justify-between min-h-0">
                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800 shrink-0">
                  <span className="text-xs font-semibold text-white">
                    Sample Screenshot Format
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    What to capture
                  </span>
                </div>

                <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 flex items-center justify-center p-1.5 my-1.5">
                  <img
                    src="/mock_result_sample.png"
                    alt="Sample SRM Result Screenshot"
                    className="max-h-full max-w-full object-contain select-none pointer-events-none rounded"
                  />
                </div>

                <div className="text-[10px] sm:text-[11px] text-neutral-500 text-center shrink-0">
                  Ensure Course Code, Credit, and Grade columns are clear
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300">
              {errorMsg}
            </div>
          )}

          {hasScanned && (
            <div className="space-y-3 h-[380px] sm:h-[400px] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 shrink-0">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Extracted Courses ({extractedCourses.length})
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Review and verify before applying to the calculator
                  </p>
                </div>

                {previewSgpa.isValid && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
                    <span className="text-neutral-400">Preview SGPA:</span>
                    <span className="font-bold text-white font-mono text-sm">
                      {previewSgpa.formattedSgpa}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
                {extractedCourses.map((course, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2.5 items-center p-2 rounded-lg bg-neutral-900/60 border border-neutral-800"
                  >
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={course.name}
                        onChange={e => handleUpdateCourse(idx, 'name', e.target.value)}
                        placeholder="Course Title"
                        className="w-full text-xs font-medium bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-lg text-neutral-200 outline-none focus:border-neutral-700"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min={0.5}
                        max={12}
                        step="any"
                        value={course.credits}
                        onChange={e => handleUpdateCourse(idx, 'credits', parseFloat(e.target.value) || 0)}
                        placeholder="Credits"
                        className="w-full text-center text-xs font-mono font-medium bg-neutral-900 border border-neutral-800 px-1 py-1.5 rounded-lg text-neutral-200 outline-none focus:border-neutral-700"
                      />
                    </div>

                    <div className="col-span-3">
                      <GradeSelect
                        value={course.grade}
                        onChange={grade => handleUpdateCourse(idx, 'grade', grade)}
                      />
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(idx)}
                        className="text-neutral-500 hover:text-rose-400 p-1 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasScanned(false);
                    setExtractedCourses([]);
                    setImagePreview(null);
                  }}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  ← Scan different screenshot
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setExtractedCourses(prev => [
                      ...prev,
                      { code: '', name: `Course ${String(prev.length + 1).padStart(2, '0')}`, credits: 3, grade: 'O' },
                    ])
                  }
                  className="text-neutral-300 hover:text-white font-medium transition-colors"
                >
                  + Add missing course
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <ShieldCheck size={14} className="shrink-0 text-emerald-500" />
            <span className="text-[11px]">Client-Side Privacy • No data leaves your browser</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            {hasScanned && extractedCourses.length > 0 && (
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-semibold shadow-sm transition-colors"
              >
                <Check size={14} />
                Apply {extractedCourses.length} Courses
                <ArrowRight size={13} className="opacity-70" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
