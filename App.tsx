
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Slide, GenerationStatus, ThemeConfig } from './types';
import { THEMES } from './constants';
import { generateMoreSlides, regenerateSingleSlide, generateFullDeck, processTemplateContent } from './services/geminiService';
import { UI_TRANSLATIONS, Language } from './locales';
import SlideCard from './components/SlideCard';
import ChatPanel from './components/ChatPanel';
import ThemePanel from './components/ThemePanel';
import NotesPanel from './components/NotesPanel';
import IconPicker from './components/IconPicker';
import ProjectPanel from './components/ProjectPanel';
import PptxGenJS from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

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
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES[0]);
  const [regeneratingSlideId, setRegeneratingSlideId] = useState<string | null>(null);
  const [targetIconIndex, setTargetIconIndex] = useState(0);
  const [projectTopic, setProjectTopic] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isParsingTemplate, setIsParsingTemplate] = useState(false);

  const t = UI_TRANSLATIONS[lang];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportStageRef = useRef<HTMLDivElement>(null);

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
    const name = updatedSlides[0]?.title || projectTopic || "AI PPT";
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsParsingTemplate(true);
    setStatus(GenerationStatus.GENERATING);
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const slideFiles = Object.keys(content.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
      let allText = '';
      for (const slideFile of slideFiles) {
        const xmlText = await content.files[slideFile].async('string');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        const textNodes = xmlDoc.getElementsByTagName('a:t');
        for (let i = 0; i < textNodes.length; i++) {
          allText += (textNodes[i].textContent || '') + ' ';
        }
        allText += '\n--- Slide Boundary ---\n';
      }
      if (!allText.trim()) throw new Error('No valid text extracted');
      const newSlides = await processTemplateContent(allText, lang);
      setSlides(newSlides);
      setCurrentIndex(0);
      performAutoSave(newSlides, currentTheme);
      setStatus(GenerationStatus.SUCCESS);
    } catch (error) {
      alert('Error parsing template.');
      setStatus(GenerationStatus.ERROR);
    } finally {
      setIsParsingTemplate(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setStatus(GenerationStatus.IDLE), 3000);
    }
  };

  const handleGenerate = async () => {
    if (status === GenerationStatus.GENERATING) return;
    setStatus(GenerationStatus.GENERATING);
    try {
      let updatedSlides: Slide[] = [];
      if (slides.length === 0) {
        const topic = projectTopic || (lang === 'zh' ? "AI 技术落地性分析" : "AI Technology Analysis");
        updatedSlides = await generateFullDeck(topic, lang);
        setSlides(updatedSlides);
        setCurrentIndex(0);
      } else {
        const topic = slides.map(s => s.title).join(', ');
        const newSlides = await generateMoreSlides(topic, lang);
        updatedSlides = [...slides, ...newSlides];
        setSlides(updatedSlides);
        setTimeout(() => setCurrentIndex(slides.length), 100);
      }
      performAutoSave(updatedSlides, currentTheme);
      setStatus(GenerationStatus.SUCCESS);
    } catch (error) {
      setStatus(GenerationStatus.ERROR);
      alert('Generation failed.');
    } finally {
      setTimeout(() => setStatus(GenerationStatus.IDLE), 3000);
    }
  };

  const handleSaveManually = () => {
    performAutoSave(slides, currentTheme);
    alert('Project saved.');
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
    }
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm('Delete this project?')) return;
    localStorage.removeItem(`ai_ppt_data_${id}`);
    const projectsStr = localStorage.getItem('ai_ppt_projects');
    if (projectsStr) {
      const projects = JSON.parse(projectsStr).filter((p: any) => p.id !== id);
      localStorage.setItem('ai_ppt_projects', JSON.stringify(projects));
    }
    if (currentProjectId === id) { setSlides([]); setCurrentProjectId(null); }
    setIsProjectOpen(false);
    setTimeout(() => setIsProjectOpen(true), 10);
  };

  const handleNewProject = () => {
    if (slides.length > 0 && !confirm('Create new?')) return;
    setSlides([]);
    setCurrentProjectId(null);
    setProjectTopic('');
    setCurrentIndex(0);
  };

  const handleRegenerateSlide = async (slide: Slide) => {
    if (regeneratingSlideId) return;
    setRegeneratingSlideId(slide.id);
    try {
      const updatedSlide = await regenerateSingleSlide(slide, lang);
      const newSlides = slides.map(s => s.id === slide.id ? updatedSlide : s);
      setSlides(newSlides);
      performAutoSave(newSlides, currentTheme);
    } catch (error) { alert('Regenerate failed'); } finally { setRegeneratingSlideId(null); }
  };

  const handleUpdateNotes = (slideId: string, notes: string) => {
    const newSlides = slides.map(s => s.id === slideId ? { ...s, notes } : s);
    setSlides(newSlides);
    performAutoSave(newSlides, currentTheme);
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

  const handleIconClick = (index: number) => {
    setTargetIconIndex(index);
    setIsIconPickerOpen(true);
  };

  const handleExportPPT = () => {
    const pptx = new PptxGenJS();
    slides.forEach((slide) => {
      const pptSlide = pptx.addSlide();
      if (slide.type === 'title') {
        pptx.defineSlideMaster({ title: 'TITLE_MASTER', background: { color: 'f1f5f9' } });
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
    } catch (err) { alert("PDF Export failed"); } finally { setIsExportingPDF(false); }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden relative">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pptx" className="hidden" />
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-50 bg-[radial-gradient(circle_at_50%_50%,rgba(241,245,249,1)_0%,rgba(255,255,255,1)_100%)]"></div>

      <div id="pdf-export-stage" ref={exportStageRef}>
        {slides.map((slide, index) => (
          <div key={`pdf-${slide.id}`} id={`pdf-slide-${index}`} style={{ width: '1280px', height: '720px', overflow: 'hidden' }}>
            <SlideCard slide={slide} isActive={true} theme={currentTheme} lang={lang} />
          </div>
        ))}
      </div>

      <header className="shrink-0 z-50 p-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsProjectOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600" title={t.projectTitle}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: currentTheme.primary }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{slides[0]?.title || t.appName}</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
              <span>{t.smartPlatform}</span>
              {currentProjectId && <span className="flex items-center gap-1 text-emerald-500 ml-2"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>{t.synced}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
               <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
               </svg>
               <span className="text-xs font-bold text-slate-700">{UI_TRANSLATIONS[lang].languageName}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] min-w-[120px]">
              {Object.keys(UI_TRANSLATIONS).map((l) => (
                <button 
                  key={l}
                  onClick={() => setLang(l as Language)}
                  className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${lang === l ? 'text-blue-600' : 'text-slate-600'}`}
                >
                  {UI_TRANSLATIONS[l as Language].languageName}
                </button>
              ))}
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>

          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title={t.uploadTemplate}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
          <button onClick={handleNewProject} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title={t.newProject}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button onClick={handleSaveManually} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title={t.saveProject}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <button onClick={() => setIsThemeOpen(true)} className="px-4 py-2 rounded-full font-bold text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            {t.setTheme}
          </button>
          <button onClick={handleExportPDF} disabled={isExportingPDF || slides.length === 0} className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${isExportingPDF ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg active:scale-95'}`}>
            {isExportingPDF ? t.exporting : t.exportPdf}
          </button>
          <button onClick={handleExportPPT} disabled={slides.length === 0} className="px-4 py-2 rounded-full font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
            {t.exportPptx}
          </button>
          <button onClick={handleGenerate} disabled={status === GenerationStatus.GENERATING} className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${status === GenerationStatus.GENERATING ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'}`} style={status !== GenerationStatus.GENERATING ? { backgroundColor: currentTheme.primary } : {}}>
            {status === GenerationStatus.GENERATING ? t.generating : slides.length === 0 ? t.generateFull : t.expand}
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-grow w-full flex items-center justify-center p-4 md:p-8">
        {slides.length === 0 ? (
          <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-4">
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter">{t.landingTitle}</h2>
              <p className="text-slate-400 text-xl font-medium max-w-lg mx-auto leading-relaxed">{t.landingSub}</p>
            </div>
            
            <div className="relative group max-w-xl mx-auto">
              <input type="text" value={projectTopic} onChange={(e) => setProjectTopic(e.target.value)} placeholder={t.placeholder} className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 bg-white shadow-2xl text-xl focus:outline-none focus:border-blue-500 transition-all" />
              <button onClick={handleGenerate} disabled={status === GenerationStatus.GENERATING} className="absolute right-4 top-4 bottom-4 px-6 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-all">
                {status === GenerationStatus.GENERATING ? t.generating : t.startGenerate}
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-wrap justify-center gap-3">
                {t.tags.map((tag: string) => (
                  <button key={tag} onClick={() => setProjectTopic(tag)} className="px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500 hover:bg-white hover:border-blue-200 transition-all">
                    {tag}
                  </button>
                ))}
              </div>
              <div className="h-px w-24 bg-slate-100"></div>
              <button onClick={() => fileInputRef.current?.click()} className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-white transition-all">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <div className="text-left">
                  <div className="font-black text-indigo-900 leading-tight">{t.uploadTemplate}</div>
                  <div className="text-sm text-indigo-400 font-medium">{t.uploadHint}</div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center perspective-2000">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              const isPrev = index < currentIndex;
              return (
                <div key={slide.id} className={`absolute inset-0 transition-all duration-700 ease-in-out transform flex items-center justify-center ${isActive ? 'opacity-100 scale-100 translate-z-0 z-20' : isPrev ? 'opacity-0 -translate-x-[50%] scale-90 -rotate-y-[20deg] z-10 pointer-events-none' : 'opacity-0 translate-x-[50%] scale-90 rotate-y-[20deg] z-10 pointer-events-none'}`}>
                  <SlideCard slide={slide} isActive={isActive} onRegenerate={handleRegenerateSlide} isRegenerating={regeneratingSlideId === slide.id} theme={currentTheme} onIconClick={handleIconClick} lang={lang} />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {slides.length > 0 && (
        <footer className="shrink-0 z-50 p-8 flex flex-col items-center">
          <div className="flex items-center gap-6 bg-white/90 border border-slate-200 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md">
            <button onClick={prevSlide} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <div className="flex gap-2.5 overflow-x-auto max-w-[300px] md:max-w-md no-scrollbar px-2">
              {slides.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentIndex(idx)} className={`flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 shadow-sm' : 'bg-slate-200'}`} style={idx === currentIndex ? { backgroundColor: currentTheme.primary } : {}} />
              ))}
            </div>
            <button onClick={nextSlide} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </footer>
      )}

      <ProjectPanel isOpen={isProjectOpen} onClose={() => setIsProjectOpen(false)} onLoadProject={handleLoadProject} onDeleteProject={handleDeleteProject} lang={lang} />
      <ThemePanel isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentTheme={currentTheme} onThemeChange={setCurrentTheme} lang={lang} />
      <ChatPanel onSlidesGenerated={(newSlides) => { const updatedSlides = [...slides, ...newSlides]; setSlides(updatedSlides); performAutoSave(updatedSlides, currentTheme); setTimeout(() => setCurrentIndex(slides.length), 100); }} currentSlides={slides} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} lang={lang} />
      <NotesPanel isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} currentSlide={slides[currentIndex]} onUpdateNotes={handleUpdateNotes} lang={lang} />
      <IconPicker isOpen={isIconPickerOpen} onClose={() => setIsIconPickerOpen(false)} targetIndex={targetIconIndex} onSelect={handleIconSelect} lang={lang} />

      {slides.length > 0 && (
        <div className="fixed left-6 bottom-6 z-50">
          <button onClick={() => setIsNotesOpen(true)} className="p-4 bg-amber-500 text-white rounded-full shadow-2xl hover:bg-amber-600 transition-all hover:scale-110 active:scale-95" title={t.notesTitle}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
        </div>
      )}

      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-3">
        <button onClick={() => setIsChatOpen(true)} className="p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95" title={t.chatTitle}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default App;
