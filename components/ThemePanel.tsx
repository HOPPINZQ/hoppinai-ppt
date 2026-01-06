
import React from 'react';
import { ThemeConfig } from '../types';
import { THEMES } from '../constants';

interface ThemePanelProps {
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ThemePanel: React.FC<ThemePanelProps> = ({ currentTheme, onThemeChange, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-[100] border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h2 className="font-bold text-slate-800">视觉主题定制</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
          </svg>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">预设主题</h3>
          <div className="grid grid-cols-1 gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  currentTheme.id === theme.id 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/30' 
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.bgGradient}`}
                    style={{ border: `2px solid ${theme.primary}` }}
                  ></div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{theme.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">配色、字体、背景</div>
                  </div>
                </div>
                {currentTheme.id === theme.id && (
                  <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">细节配置</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">主色调</span>
                <div className="w-6 h-6 rounded border border-slate-200" style={{ backgroundColor: currentTheme.primary }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">字体库</span>
                <span className="text-[10px] font-bold text-slate-800">Inter / System</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">背景风格</span>
                <span className="text-[10px] font-bold text-slate-800">线性渐变 (Linear)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          主题设置将即时应用于所有幻灯片页面
        </p>
      </div>
    </div>
  );
};

export default ThemePanel;
