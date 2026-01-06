
import React from 'react';
import { Slide, ThemeConfig } from '../types';
import { ICON_LIBRARY } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
  PieChart, Pie, Cell as PieCell
} from 'recharts';

interface SlideCardProps {
  slide: Slide;
  isActive: boolean;
  onRegenerate?: (slide: Slide) => void;
  isRegenerating?: boolean;
  theme?: ThemeConfig;
  onIconClick?: (index: number) => void;
}

const EFFICIENCY_DATA = [
  { name: '直接开发', val: 100 },
  { name: 'Vibe Coding', val: 40 },
  { name: 'SDD 模式', val: 15 },
];

const PROJECTION_2026_DATA = [
  { name: '传统模式', val: 100 },
  { name: 'AI 辅助', val: 35 },
  { name: 'Agent 自主', val: 12 },
];

const WORK_2026_RATIO = [
  { name: 'AI框架研发', val: 5 },
  { name: 'MCP生态', val: 2 },
  { name: '智擎云智能', val: 2 },
  { name: '开发范式普及', val: 3 },
];

const FlowNode: React.FC<{ label: string; sub: string; icon: React.ReactNode; colorClass: string; theme?: ThemeConfig }> = ({ label, sub, icon, colorClass, theme }) => (
  <div className="flex flex-col items-center group">
    <div 
      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 mb-2 ${colorClass}`}
      style={theme ? { backgroundColor: colorClass.includes('bg-indigo-600') || colorClass.includes('bg-white') ? undefined : `${theme.primary}20`, color: theme.primary } : {}}
    >
      {icon}
    </div>
    <span className="text-xs font-bold text-slate-800" style={{ color: theme?.textColor }}>{label}</span>
    <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">{sub}</span>
  </div>
);

const SlideCard: React.FC<SlideCardProps> = ({ slide, isActive, onRegenerate, isRegenerating, theme, onIconClick }) => {
  const isTitleSlide = slide.type === 'title';
  const isSummarySlide = slide.type === 'summary';

  const chartColors = theme ? [theme.primary, theme.secondary, theme.accent, '#94a3b8'] : ['#3b82f6', '#60a5fa', '#8b5cf6', '#10b981'];

  const renderVisual = () => {
    if (slide.visualType === 'pie-chart') {
      const data = slide.title.includes('2026') ? WORK_2026_RATIO : WORK_2026_RATIO;
      const RADIAN = Math.PI / 180;
      const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const isSmall = value <= 1;

        return (
          <g>
            <text x={x} y={y - 6} fill="white" textAnchor="middle" dominantBaseline="central" className={`${isSmall ? 'text-[9px]' : 'text-[11px]'} font-bold select-none`}>
              {name}
            </text>
            <text x={x} y={y + 8} fill="white" textAnchor="middle" dominantBaseline="central" className={`${isSmall ? 'text-[10px]' : 'text-[13px]'} font-black select-none opacity-90`}>
              {`${value}/12`}
            </text>
          </g>
        );
      };

      return (
        <div className="w-full mt-6 bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[360px] overflow-hidden">
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={140}
                  dataKey="val"
                  animationDuration={1200}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  stroke="white"
                  strokeWidth={3}
                >
                  {data.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px'}}
                   formatter={(value: number, name: string) => [`${value}/12 个月`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[10px] text-slate-400 mb-2 font-bold tracking-widest uppercase shrink-0">
            2026 YEARLY RESOURCE ALLOCATION
          </p>
        </div>
      );
    }

    if (slide.visualType === 'chart') {
      const isEffProjection = slide.title.includes('研发效能') || slide.title.includes('总结') || isSummarySlide;
      const data = isEffProjection ? PROJECTION_2026_DATA : EFFICIENCY_DATA;
      
      return (
        <div className="w-full mt-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[320px] overflow-hidden">
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis hide axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                />
                <Bar dataKey="val" radius={[6, 6, 0, 0]} barSize={40}>
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                  <LabelList dataKey="val" position="top" style={{ fill: '#475569', fontSize: '13px', fontWeight: 800 }} formatter={(val: number) => `${val}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-bold tracking-widest uppercase">
            {isEffProjection ? '2026 EFFICIENCY PROJECTION' : 'RESOURCE ANALYSIS'}
          </p>
        </div>
      );
    }
    
    if (slide.visualType === 'icon-grid') {
      const items = slide.content.map(item => {
        const parts = item.split(/[：:]/);
        return { title: parts[0] || '核心点', desc: parts[1] || '详细规划' };
      });

      return (
        <div className={`grid ${items.length > 4 ? 'grid-cols-2' : 'grid-cols-2'} gap-3 mt-4 w-full max-w-lg mx-auto`}>
          {items.map((item, idx) => {
            const iconKey = slide.customIcons?.[idx] || 'box';
            const iconSvg = ICON_LIBRARY[iconKey] || ICON_LIBRARY.box;
            
            return (
              <div key={idx} className={`bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-500 transition-all hover:shadow-md group relative ${items.length === 5 && idx === 4 ? 'col-span-2 mx-auto max-w-[50%]' : ''}`}>
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => onIconClick?.(idx)}
                    className="p-2 rounded-lg bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all group/icon shrink-0"
                    title="点击更换图标"
                    style={{ color: theme?.primary }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {iconSvg}
                    </svg>
                  </button>
                  <div className="flex-grow">
                    <div className="mb-0.5 font-black text-[10px] group-hover:translate-x-1 transition-transform" style={{ color: theme?.primary || '#2563eb' }}>POINT 0{idx + 1}</div>
                    <div className="text-[12px] font-extrabold text-slate-900 leading-tight mb-0.5" style={{ color: theme?.textColor }}>{item.title}</div>
                    <div className="text-[9px] text-slate-500 font-medium line-clamp-2 leading-tight">{item.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (slide.visualType === 'flow-chart') {
      return (
        <div className="mt-8 flex flex-col items-center w-full">
          <div className="flex items-center justify-between w-full max-w-lg mb-8 relative">
            <div className="absolute top-7 left-0 right-0 h-0.5 bg-slate-100 -z-10"></div>
            <FlowNode theme={theme} label="Agentic" sub="架构内核" colorClass="bg-indigo-600 text-white" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
            <div className="flex-grow flex justify-center"><svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
            <FlowNode theme={theme} label="MCP" sub="标准通信" colorClass="bg-blue-50 text-blue-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <div className="flex-grow flex justify-center"><svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
            <FlowNode theme={theme} label="Self-Heal" sub="自愈闭环" colorClass="bg-emerald-50 text-emerald-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
          </div>
          <div className="mt-6 flex gap-3">
             <span className="px-3 py-1 rounded-full text-[9px] font-bold border" style={{ backgroundColor: `${theme?.primary}10`, borderColor: `${theme?.primary}30`, color: theme?.primary }}>FRAMEWORK 6.0</span>
             <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[9px] font-bold border border-slate-100">AI NATIVE</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const currentBgGradient = theme ? theme.bgGradient : (slide.backgroundGradient || 'from-white to-slate-50');

  return (
    <div 
      className={`w-full max-w-5xl aspect-video rounded-3xl p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden slide-transition bg-gradient-to-br ${currentBgGradient} relative group/slide`}
      style={{ fontFamily: theme?.fontFamily }}
    >
      <div className={`absolute top-[-10%] right-[-10%] w-64 h-64 ${isTitleSlide || isSummarySlide ? 'bg-black/5' : 'bg-blue-500/5'} rounded-full blur-3xl`}></div>
      <div className={`absolute bottom-[-10%] left-[-10%] w-96 h-96 ${isTitleSlide || isSummarySlide ? 'bg-black/5' : 'bg-indigo-500/5'} rounded-full blur-3xl`}></div>

      {/* Slide Tools */}
      <div className="absolute top-6 right-6 z-50 opacity-0 group-hover/slide:opacity-100 transition-opacity">
        <button
          onClick={() => onRegenerate?.(slide)}
          disabled={isRegenerating}
          className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ color: theme?.primary } as any}
          title="重新生成本页内容"
        >
          {isRegenerating ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>

      {/* Loading Overlay */}
      {isRegenerating && (
        <div className="absolute inset-0 z-40 bg-white/40 backdrop-blur-[2px] flex items-center justify-center transition-all">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme?.primary }}></div>
            <p className="font-bold animate-pulse" style={{ color: theme?.primary }}>正在重构内容...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col">
        {isTitleSlide || isSummarySlide ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <h1 className={`text-6xl font-extrabold mb-6 tracking-tight leading-tight text-black`} style={{ fontFamily: theme?.headingFont }}>
              {slide.title}
            </h1>
            <p className={`text-2xl font-semibold tracking-wide text-black/70`}>{slide.subtitle}</p>
            <div className={`mt-12 h-1.5 w-24 rounded-full shadow-sm bg-black/20`}></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-4xl font-bold mb-1 tracking-tight" style={{ color: theme?.textColor, fontFamily: theme?.headingFont }}>{slide.title}</h2>
              <p className="text-xl font-bold opacity-80" style={{ color: theme?.primary }}>{slide.subtitle}</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 flex-grow">
              <div className="flex-1">
                <ul className="space-y-4">
                  {slide.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-md" style={{ backgroundColor: theme?.primary }}></span>
                      <span className="text-lg leading-tight font-medium" style={{ color: theme?.textColor }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                {renderVisual()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SlideCard;
