import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { SRM_GRADES, GradeDefinition } from '../config/academicRules';

interface GradeSelectProps {
  value: string;
  onChange: (grade: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const GradeSelect: React.FC<GradeSelectProps> = ({
  value,
  onChange,
  hasError = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedDef = SRM_GRADES.find(g => g.grade.toUpperCase() === value?.toUpperCase());

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const idx = SRM_GRADES.findIndex(g => g.grade.toUpperCase() === value?.toUpperCase());
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < SRM_GRADES.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : SRM_GRADES.length - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < SRM_GRADES.length) {
        onChange(SRM_GRADES[highlightedIndex].grade);
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const handleSelect = (def: GradeDefinition) => {
    onChange(def.grade);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors outline-none
          ${
            hasError
              ? 'border border-rose-700/60 bg-rose-950/30 text-rose-200'
              : isOpen
              ? 'border border-neutral-600 bg-neutral-900 ring-1 ring-neutral-700 text-white'
              : 'border border-neutral-800 bg-neutral-900 hover:border-neutral-700 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <span className="flex items-center gap-2">
          {selectedDef ? (
            <>
              <span className="font-semibold tracking-tight text-white">
                {selectedDef.grade}
              </span>
              <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                {selectedDef.points} {selectedDef.points === 1 ? 'pt' : 'pts'}
              </span>
            </>
          ) : (
            <span className="text-neutral-500 font-normal">Select grade</span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`}
        />
      </button>

      {/* Floating Dropdown List */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 w-full min-w-[170px] bg-[#111214] border border-neutral-800 rounded-lg shadow-xl shadow-black/60 py-1 max-h-60 overflow-auto"
        >
          {SRM_GRADES.map((item, index) => {
            const isSelected = selectedDef?.grade === item.grade;
            const isHighlighted = highlightedIndex === index;

            return (
              <div
                key={item.grade}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(item)}
                className={`flex items-center justify-between px-3 py-1.5 mx-1 rounded-md text-xs cursor-pointer transition-colors ${
                  isHighlighted || isSelected
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm w-7">{item.grade}</span>
                  <span className="text-neutral-500 text-[11px]">
                    {item.description}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-medium text-neutral-400">
                    {item.points} pts
                  </span>
                  {isSelected && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
