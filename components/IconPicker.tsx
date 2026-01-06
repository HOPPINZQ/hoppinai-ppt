
import React from 'react';
import { ICON_LIBRARY } from '../constants';

interface IconPickerProps {
  onSelect: (iconKey: string) => void;
  isOpen: boolean;
  onClose: () => void;
  targetIndex: number;
}

const IconPicker: React.FC<IconPickerProps> = ({ onSelect, isOpen, onClose, targetIndex }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">选择图标</h3>
            <p className="text-xs text-slate-400">正在为第 {targetIndex + 1} 项内容选择图标</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto">
          {Object.entries(ICON_LIBRARY).map(([key, svgPath]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <svg 
                className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {svgPath}
              </svg>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-bold uppercase tracking-tighter">{key}</span>
            </button>
          ))}
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Icon Library 2026</p>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
