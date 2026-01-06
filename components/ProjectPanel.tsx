
import React from 'react';
import { ThemeConfig, Slide } from '../types';
import { UI_TRANSLATIONS, Language } from '../locales';

interface ProjectMetadata {
  id: string;
  name: string;
  updatedAt: number;
  slideCount: number;
}

interface ProjectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  lang?: Language;
}

const ProjectPanel: React.FC<ProjectPanelProps> = ({ isOpen, onClose, onLoadProject, onDeleteProject, lang = 'zh' }) => {
  const [projects, setProjects] = React.useState<ProjectMetadata[]>([]);
  const t = UI_TRANSLATIONS[lang];

  React.useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('ai_ppt_projects');
      if (saved) setProjects(JSON.parse(saved));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-[120] border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">{t.projectTitle}</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
          </svg>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {projects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <p className="text-sm text-slate-400 font-medium">{t.noProjects}</p>
          </div>
        ) : (
          projects.sort((a,b) => b.updatedAt - a.updatedAt).map((p) => (
            <div key={p.id} className="group relative bg-white border border-slate-100 p-4 rounded-xl hover:border-blue-500 transition-all cursor-pointer" onClick={() => onLoadProject(p.id)}>
              <div className="text-xs font-bold text-slate-900 mb-1 line-clamp-1">{p.name}</div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-medium">{p.slideCount} · {new Date(p.updatedAt).toLocaleDateString()}</span>
                <button onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 transition-all">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectPanel;
