import React from 'react';
import { Plus, BookOpen, Layers } from 'lucide-react';

interface EmptyStateProps {
  type: 'SGPA' | 'CGPA';
  onAdd: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAdd }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30">
      <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-4 text-neutral-400">
        {type === 'SGPA' ? <BookOpen size={20} /> : <Layers size={20} />}
      </div>
      <h3 className="text-base font-semibold text-white mb-1">
        Start calculating
      </h3>
      <p className="text-sm text-neutral-400 max-w-xs mb-5">
        {type === 'SGPA'
          ? 'Add your first course to calculate your SGPA.'
          : 'Add your first semester to calculate your CGPA.'}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-neutral-950 text-xs font-semibold hover:bg-neutral-100 transition-colors shadow-sm"
      >
        <Plus size={14} />
        {type === 'SGPA' ? 'Add Course' : 'Add Semester'}
      </button>
    </div>
  );
};
