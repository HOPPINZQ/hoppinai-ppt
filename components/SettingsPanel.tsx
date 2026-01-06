
import React from 'react';
import { ModelConfig } from '../types';
import { UI_TRANSLATIONS, Language } from '../locales';

interface SettingsPanelProps {
  config: ModelConfig;
  onConfigChange: (config: ModelConfig) => void;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onConfigChange, isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = UI_TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900">{t.settingsTitle}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">GLM-4.5 Advanced Engine</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.modelSelect}</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'glm-4.5-flash', name: t.modelFlash, desc: 'Balanced Performance & Speed' },
                { id: 'glm-4-plus', name: t.modelPlus, desc: 'Highest Reasoning Capability' },
                { id: 'glm-4-air', name: t.modelAir, desc: 'Efficient & Cost-effective' }
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => onConfigChange({ ...config, model: m.id as any })}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${config.model === m.id ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div>
                    <div className={`font-bold text-sm ${config.model === m.id ? 'text-blue-700' : 'text-slate-700'}`}>{m.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium italic">{m.desc}</div>
                  </div>
                  {config.model === m.id && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{t.temperature}</label>
                <span className="text-xs font-black px-2 py-1 bg-slate-100 rounded-md">{config.temperature}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.1"
                value={config.temperature}
                onChange={(e) => onConfigChange({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Top-P (Nucleus Sampling)</label>
                <span className="text-xs font-black px-2 py-1 bg-slate-100 rounded-md">{config.topP}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.1"
                value={config.topP}
                onChange={(e) => onConfigChange({ ...config, topP: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
          </div>

          <div className="pt-4">
             <button onClick={onClose} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl hover:bg-black transition-all">
               {t.saveSettings}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
