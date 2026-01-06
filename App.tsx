
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Slide, GenerationStatus, ThemeConfig, ModelConfig } from './types';
import { THEMES } from './constants';
import { generateMoreSlides, regenerateSingleSlide, generateFullDeck, generateSlidesFromChat } from './services/geminiService';
import { UI_TRANSLATIONS, Language } from './locales';
import SlideCard from './components/SlideCard';
import ChatPanel from './components/ChatPanel';
import ThemePanel from './components/ThemePanel';
import NotesPanel from './components/NotesPanel';
import IconPicker from './components/IconPicker';
import ProjectPanel from './components/ProjectPanel';
import SettingsPanel from './components/SettingsPanel';
import PptxGenJS from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES[0]);
  const [aiConfig, setAiConfig] = useState<ModelConfig>({
    model: 'glm-4.5-flash',
    temperature: 0.7,
    topP: 0.7
  });
  const [regeneratingSlideId, setRegeneratingSlideId] = useState<string | null>(null);
  const [targetIconIndex, setTargetIconIndex] = useState(0);
  const [projectTopic, setProjectTopic] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const t = UI_TRANSLATIONS[lang];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportStageRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const handleTagClick = (idx: number) => {
    const detailedPrompt = t.tagPrompts[idx];
    setProjectTopic(detailedPrompt);
    showToast(t.toastPromptOptimized, 'success');
  };

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const performAutoSave = useCallback((updatedSlides: Slide[], theme: ThemeConfig, id?: string | null) => {
    if (updatedSlides.length === 0) return;
    const targetId = id || currentProjectId || `project-${Date.now()}`;
    const name = updatedSlides[0]?.title || projectTopic.slice(0, 30) || "AI PPT";
    const projectData = { id: targetId, name, slides: updatedSlides, theme, updatedAt: Date.now() };
    localStorage.setItem(`ai_ppt_data_${targetId}`, JSON.stringify(projectData));
    const projectsStr = localStorage.getItem('ai_ppt_projects');
    let projects = projectsStr ? JSON.parse(projectsStr) : [];
    const index = projects.findIndex((p: any) => p.id === targetId);
    if (index > -1) {
      projects[index] = { id: targetId, name, updatedAt: Date.now(), slideCount: updatedSlides.length };
    } else {
      projects.push({ id: targetId, name, updatedAt: Date.now(), slideCount: updatedSlides.length });
    }
    localStorage.setItem('ai_ppt_projects', JSON.stringify(projects));
    if (!currentProjectId) setCurrentProjectId(targetId);
  }, [currentProjectId, projectTopic]);

  const handleGenerate = async () => {
    if (status === GenerationStatus.GENERATING) return;
    setStatus(GenerationStatus.GENERATING);
    try {
      let updatedSlides: Slide[] = [];
      if (slides.length === 0) {
        const topic = projectTopic || (lang === 'zh' ? "AI 技术落地性分析" : "AI Technology Analysis");
        updatedSlides = await generateFullDeck(topic, lang, aiConfig);
        setSlides(updatedSlides);
        setCurrentIndex(0);
      } else {
        const topic = slides.map(s => s.title).join(', ');
        const newSlides = await generateMoreSlides(topic, lang, aiConfig);
        updatedSlides = [...slides, ...newSlides];
        setSlides(updatedSlides);
        setTimeout(() => setCurrentIndex(slides.length), 100);
      }
      performAutoSave(updatedSlides, currentTheme);
      setStatus(GenerationStatus.SUCCESS);
    } catch (error: any) {
      setStatus(GenerationStatus.ERROR);
      showToast(error?.message || 'AI 生成失败，请检查 API Key。', 'error');
    } finally {
      setTimeout(() => setStatus(GenerationStatus.IDLE), 3000);
    }
  };

  const handleSaveManually = () => {
    if (slides.length === 0) {
      showToast(t.toastSaveEmpty, 'info');
      return;
    }
    performAutoSave(slides, currentTheme);
    showToast(t.toastSaved, 'success');
  };

  const handleLoadProject = (id: string) => {
    const dataStr = localStorage.getItem(`ai_ppt_data_${id}`);
    if (dataStr) {
      const data = JSON.parse(dataStr);
      setSlides(data.slides || []);
      setCurrentTheme(data.theme || THEMES[0]);
      setCurrentProjectId(id);
      setCurrentIndex(0);
      setIsProjectOpen(false);
      showToast(`${data.name} 已加载`, 'success');
    }
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm('确定删除此项目？')) return;
    localStorage.removeItem(`ai_ppt_data_${id}`);
    const projectsStr = localStorage.getItem('ai_ppt_projects');
    if (projectsStr) {
      const projects = JSON.parse(projectsStr).filter((p: any) => p.id !== id);
      localStorage.setItem('ai_ppt_projects', JSON.stringify(projects));
    }
    if (currentProjectId === id) { 
      setSlides([]); 
      setCurrentProjectId(null); 
    }
    setIsProjectOpen(false);
    showToast(t.toastDeleted, 'info');
  };

  const handleNewProject = () => {
    if (slides.length > 0 && !confirm('确定放弃当前内容并新建项目？')) return;
    setSlides([]);
    setCurrentProjectId(null);
    setProjectTopic('');
    setCurrentIndex(0);
    showToast(t.toastNewProject, 'success');
  };

  const handleRegenerateSlide = async (slide: Slide) => {
    if (regeneratingSlideId) return;
    setRegeneratingSlideId(slide.id);
    try {
      const updatedSlide = await regenerateSingleSlide(slide, lang, aiConfig);
      const newSlides = slides.map(s => s.id === slide.id ? updatedSlide : s);
      setSlides(newSlides);
      performAutoSave(newSlides, currentTheme);
    } catch (error) { 
      showToast('重新生成失败', 'error'); 
    } finally { 
      setRegeneratingSlideId(null); 
    }
  };

  const handleUpdateNotes = (slideId: string, notes: string) => {
    const newSlides = slides.map(s => s.id === slideId ? { ...s, notes } : s);
    setSlides(newSlides);
    performAutoSave(newSlides, currentTheme);
  };

  const handleIconClick = (index: number) => {
    setTargetIconIndex(index);
    setIsIconPickerOpen(true);
  };

  const handleIconSelect = (iconKey: string) => {
    const currentSlide = slides[currentIndex];
    const newIcons = [...(currentSlide.customIcons || [])];
    while (newIcons.length <= targetIconIndex) newIcons.push('box');
    newIcons[targetIconIndex] = iconKey;
    const newSlides = slides.map((s, idx) => idx === currentIndex ? { ...s, customIcons: newIcons } : s);
    setSlides(newSlides);
    performAutoSave(newSlides, currentTheme);
    setIsIconPickerOpen(false);
  };

  const handleExportPPT = () => {
    if (slides.length === 0) return;
    const pptx = new PptxGenJS();
    slides.forEach((slide) => {
      const pptSlide = pptx.addSlide();
      if (slide.type === 'title') {
        pptSlide.addText(slide.title, { x: 1, y: 1.5, w: '80%', h: 1, fontSize: 44, bold: true, color: '000000', align: 'center' });
        if (slide.subtitle) pptSlide.addText(slide.subtitle, { x: 1, y: 3, w: '80%', h: 0.5, fontSize: 24, color: '333333', align: 'center' });
      } else {
        pptSlide.addText(slide.title, { x: 0.5, y: 0.5, w: '90%', h: 1, fontSize: 32, bold: true, color: currentTheme.textColor.replace('#', '') });
        const bullets = slide.content.map(text => ({ text, options: { bullet: true, fontSize: 18, margin: 5 } }));
        pptSlide.addText(bullets, { x: 0.5, y: 2, w: '50%', h: '60%', valign: 'top', color: '444444' });
      }
    });
    pptx.writeFile({ fileName: `${slides[0]?.title || 'AI_PPT'}.pptx` });
  };

  const handleExportPDF = async () => {
    if (isExportingPDF || slides.length === 0) return;
    setIsExportingPDF(true);
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] });
      const stage = exportStageRef.current;
      if (!stage) throw new Error("Export stage not found");
      for (let i = 0; i < slides.length; i++) {
        const slideElement = stage.querySelector(`#pdf-slide-${i}`) as HTMLElement;
        if (!slideElement) continue;
        const canvas = await html2canvas(slideElement, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage([1280, 720], 'landscape');
        pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
      }
      pdf.save(`${slides[0]?.title || 'AI_PPT'}.pdf`);
    } catch (err) { 
      showToast("PDF 导出失败", 'error'); 
    } finally { 
      setIsExportingPDF(false); 
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden relative">
      {/* Toast Notifications */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-6 py-3 rounded-2xl shadow-2xl border text-sm font-bold animate-in slide-in-from-top duration-300 pointer-events-auto flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
            toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 
            'bg-blue-50 border-blue-100 text-blue-800'
          }`}>
            {toast.message}
          </div>
        ))}
      </div>

      {/* Enhanced Header */}
      <header className="shrink-0 z-50 p-4 md:px-8 md:py-4 flex justify-between items-center bg-white border-b border-slate-100 shadow-sm relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsProjectOpen(true)} 
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-500 border border-transparent hover:border-slate-200"
              title={t.projectTitle}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </button>
            <button 
              onClick={handleNewProject} 
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-500 border border-transparent hover:border-slate-200"
              title={t.newProject}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          
          <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shrink-0" style={{ backgroundColor: currentTheme.primary }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="hidden lg:block overflow-hidden">
              <h1 className="text-base font-bold text-slate-900 truncate max-w-[200px]">{slides.length > 0 ? slides[0].title : t.appName}</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.smartPlatform}</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[9px] text-blue-600 font-black tracking-tight">{aiConfig.model.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Buttons for Desktop */}
          <div className="hidden md:flex items-center gap-1.5 mr-2">
            <button 
              onClick={handleSaveManually} 
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              title={t.saveProject}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            </button>
            <button 
              onClick={() => setIsThemeOpen(true)} 
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              title={t.setTheme}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            </button>
            <button 
              onClick={handleExportPDF} 
              disabled={slides.length === 0}
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30"
              title="导出 PDF"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </button>
            <button 
              onClick={handleExportPPT} 
              disabled={slides.length === 0}
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-30"
              title="导出 PPTX"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
          </div>

          <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block"></div>

          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors" 
            title={t.settingsTitle}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
          </button>

          <button 
            onClick={handleGenerate} 
            disabled={status === GenerationStatus.GENERATING} 
            className={`ml-2 px-4 py-2.5 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 shadow-lg transition-all ${status === GenerationStatus.GENERATING ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'}`} 
            style={status !== GenerationStatus.GENERATING ? { backgroundColor: currentTheme.primary } : {}}
          >
            {status === GenerationStatus.GENERATING ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            <span className="hidden sm:inline">{status === GenerationStatus.GENERATING ? t.generating : slides.length === 0 ? t.generateFull : t.expand}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow w-full flex items-center justify-center p-4 md:p-8 bg-slate-50/30 overflow-hidden">
        {slides.length === 0 ? (
          <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight mb-4">
                {lang === 'zh' ? '用 GLM-4.5 重塑您的演示文稿' : 'Reshape Your Presentations with GLM-4.5'}
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                {lang === 'zh' ? '输入一个主题，让我们为您构建专业的深度演示。' : 'Enter a topic and let us build a professional, deep presentation for you.'}
              </p>
            </div>
            
            <div className="relative group max-w-xl mx-auto">
              <textarea 
                value={projectTopic} 
                onChange={(e) => setProjectTopic(e.target.value)} 
                placeholder={t.placeholder} 
                className="w-full px-8 py-8 rounded-[32px] border-2 border-slate-100 bg-white shadow-2xl text-lg focus:outline-none focus:border-blue-500 transition-all min-h-[160px] resize-none pr-32" 
              />
              <button 
                onClick={handleGenerate} 
                className="absolute right-6 bottom-6 px-8 py-4 rounded-[20px] bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl hover:shadow-blue-200 transition-all" 
                style={{ backgroundColor: currentTheme.primary }}
              >
                {t.startGenerate}
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2.5">
              {t.tags.map((tag: string, idx: number) => (
                <button 
                  key={tag} 
                  onClick={() => handleTagClick(idx)} 
                  className="px-5 py-2.5 rounded-full bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 shadow-sm transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center perspective-2000">
            {slides.map((slide, index) => (
              <div key={slide.id} className={`absolute inset-0 transition-all duration-700 transform ${index === currentIndex ? 'opacity-100 scale-100 translate-z-0' : 'opacity-0 scale-90 translate-z-[-200px] pointer-events-none'}`}>
                <SlideCard slide={slide} isActive={index === currentIndex} onRegenerate={handleRegenerateSlide} isRegenerating={regeneratingSlideId === slide.id} theme={currentTheme} onIconClick={handleIconClick} lang={lang} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Slide Navigation Footer */}
      {slides.length > 0 && (
        <footer className="shrink-0 z-50 p-4 md:p-6 flex flex-col items-center bg-white/50 backdrop-blur-sm border-t border-slate-100">
          <div className="flex items-center gap-6 bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md">
            <button 
              onClick={prevSlide} 
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <div className="flex gap-2.5">
              {slides.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentIndex(idx)} 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-10' : 'bg-slate-200 hover:bg-slate-300'}`} 
                  style={idx === currentIndex ? { backgroundColor: currentTheme.primary } : {}} 
                />
              ))}
            </div>
            
            <button 
              onClick={nextSlide} 
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <div className="mt-2 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <span>Slide {currentIndex + 1} of {slides.length}</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span>Auto-saved to library</span>
          </div>
        </footer>
      )}

      {/* Overlay Panels */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} config={aiConfig} onConfigChange={(newConfig) => { setAiConfig(newConfig); showToast(t.toastSettingsSaved, 'success'); }} lang={lang} />
      <ProjectPanel isOpen={isProjectOpen} onClose={() => setIsProjectOpen(false)} onLoadProject={handleLoadProject} onDeleteProject={handleDeleteProject} lang={lang} />
      <ThemePanel isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentTheme={currentTheme} onThemeChange={setCurrentTheme} lang={lang} />
      <ChatPanel onSlidesGenerated={(newSlides) => { setSlides([...slides, ...newSlides]); setTimeout(() => setCurrentIndex(slides.length), 100); }} currentSlides={slides} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} lang={lang} />
      <NotesPanel isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} currentSlide={slides[currentIndex]} onUpdateNotes={handleUpdateNotes} lang={lang} />
      <IconPicker isOpen={isIconPickerOpen} onClose={() => setIsIconPickerOpen(false)} targetIndex={targetIconIndex} onSelect={handleIconSelect} lang={lang} />

      {/* Floating Buttons */}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-3">
        <button 
          onClick={() => setIsNotesOpen(true)} 
          className="p-4 bg-amber-500 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
          title={t.notesTitle}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button 
          onClick={() => setIsChatOpen(true)} 
          className="p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
          title={t.chatTitle}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      </div>

      {/* Hidden Export Stage */}
      <div id="pdf-export-stage" ref={exportStageRef} className="hidden pointer-events-none">
        {slides.map((slide, index) => (
          <div key={`pdf-${slide.id}`} id={`pdf-slide-${index}`} className="w-[1280px] h-[720px] flex items-center justify-center bg-white">
            <SlideCard slide={slide} isActive={true} theme={currentTheme} lang={lang} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
