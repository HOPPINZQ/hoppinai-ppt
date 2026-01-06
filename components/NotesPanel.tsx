
import React from 'react';
import { Slide } from '../types';

interface NotesPanelProps {
  currentSlide: Slide;
  onUpdateNotes: (slideId: string, notes: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ currentSlide, onUpdateNotes, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 md:w-96 bg-white shadow-2xl z-[110] border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="font-bold text-amber-900 uppercase text-xs tracking-widest">演讲者备注</h2>
        </div>
        <button onClick={onClose} className="text-amber-700/50 hover:text-amber-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col h-full">
        <div className="mb-4">
          <div className="text-[10px] font-bold text-slate-400 mb-1">当前幻灯片</div>
          <div className="text-sm font-bold text-slate-800 line-clamp-1">{currentSlide.title}</div>
        </div>

        <div className="flex-grow flex flex-col">
          <label htmlFor="speaker-notes" className="text-[10px] font-bold text-slate-400 mb-2">备注内容 (仅演讲者可见)</label>
          <textarea
            id="speaker-notes"
            value={currentSlide.notes || ''}
            onChange={(e) => onUpdateNotes(currentSlide.id, e.target.value)}
            placeholder="在这里输入你的演讲要点..."
            className="flex-grow w-full border border-amber-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 bg-amber-50/20 resize-none font-medium text-slate-700 leading-relaxed"
          />
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center">
          备注将自动保存，并在导出时被排除。
        </p>
      </div>
    </div>
  );
};

export default NotesPanel;
