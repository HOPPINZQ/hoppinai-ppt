
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Slide, GenerationStatus } from '../types';
import { generateSlidesFromChat } from '../services/geminiService';
import { UI_TRANSLATIONS, Language } from '../locales';

interface ChatPanelProps {
  onSlidesGenerated: (newSlides: Slide[]) => void;
  currentSlides: Slide[];
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onSlidesGenerated, currentSlides, isOpen, onClose, lang = 'zh' }) => {
  const t = UI_TRANSLATIONS[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial message based on lang
    const initialText = lang === 'zh' 
      ? '你好！我是你的 AI PPT 助手。你可以告诉我你想添加什么内容，或者让我根据某个主题生成几页幻灯片。'
      : lang === 'en' ? 'Hello! I am your AI assistant. Tell me what content to add or let me generate slides for a topic.'
      : lang === 'ja' ? 'こんにちは！私はあなたのAIアシスタントです。追加したい内容を教えていただくか、トピックに沿ってスライドを生成させることができます。'
      : '안녕하세요! 당신의 AI 보조입니다. 추가하고 싶은 내용을 알려주거나 특정 주제로 슬라이드를 생성하게 할 수 있습니다.';
      
    setMessages([{ role: 'assistant', text: initialText }]);
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    const userText = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    setIsGenerating(true);
    try {
      const result = await generateSlidesFromChat(userText, currentSlides, lang);
      setMessages(prev => [...prev, { role: 'assistant', text: result.reply }]);
      if (result.slides.length > 0) onSlidesGenerated(result.slides);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 md:w-96 bg-white shadow-2xl z-[100] border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="font-bold text-slate-800">{t.chatTitle}</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t.chatPlaceholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-24"
          />
          <button onClick={handleSend} disabled={!inputValue.trim() || isGenerating} className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
