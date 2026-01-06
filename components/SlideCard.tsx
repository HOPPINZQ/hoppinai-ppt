
import React from 'react';
import { Slide, ThemeConfig } from '../types';
import { ICON_LIBRARY } from '../constants';
import { UI_TRANSLATIONS, Language } from '../locales';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
  PieChart, Pie, Cell as PieCell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, Legend,
  AreaChart, Area
} from 'recharts';

interface SlideCardProps {
  slide: Slide;
  isActive: boolean;
  onRegenerate?: (slide: Slide) => void;
  isRegenerating?: boolean;
  theme?: ThemeConfig;
  onIconClick?: (index: number) => void;
  lang?: Language;
}

// Mock/Generated Data for Cool Visuals
const CAPABILITY_DATA = [
  { subject: '性能', A: 120, fullMark: 150 },
  { subject: '安全', A: 98, fullMark: 150 },
  { subject: '易用性', A: 86, fullMark: 150 },
  { subject: '成本', A: 99, fullMark: 150 },
  { subject: '扩展性', A: 85, fullMark: 150 },
  { subject: '稳定性', A: 65, fullMark: 150 },
];

const ADOPTION_DATA = [
  { name: '企业级', uv: 31.47, fill: '#8884d8' },
  { name: '开发者', uv: 26.69, fill: '#83a6ed' },
  { name: '教育领域', uv: 15.69, fill: '#8dd1e1' },
  { name: '政务领域', uv: 8.22, fill: '#82ca9d' },
];

const TREND_DATA = [
  { name: 'Q1', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Q2', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Q3', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Q4', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Q5', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Q6', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Q7', uv: 3490, pv: 4300, amt: 2100 },
];

// Added missing data constants for charts to resolve reference errors
const WORK_2026_RATIO = [
  { name: '研发', val: 5 },
  { name: '市场', val: 3 },
  { name: '运营', val: 2 },
  { name: '售后', val: 2 },
];

const EFFICIENCY_DATA = [
  { name: 'Automation', zh: '自动化', val: 85 },
  { name: 'Scalability', zh: '可扩展性', val: 92 },
  { name: 'Reliability', zh: '可靠性', val: 78 },
  { name: 'Performance', zh: '性能', val: 95 },
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

const SlideCard: React.FC<SlideCardProps> = ({ slide, isActive, onRegenerate, isRegenerating, theme, onIconClick, lang = 'zh' }) => {
  const isTitleSlide = slide.type === 'title';
  const isSummarySlide = slide.type === 'summary';
  const t = UI_TRANSLATIONS[lang];

  const chartColors = theme ? [theme.primary, theme.secondary, theme.accent, '#94a3b8'] : ['#3b82f6', '#60a5fa', '#8b5cf6', '#10b981'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-3 rounded-xl shadow-xl">
          <p className="text-xs font-black text-slate-900 mb-1">{label || payload[0].name}</p>
          <p className="text-lg font-black" style={{ color: theme?.primary || '#2563eb' }}>
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderVisual = () => {
    // New Radar Chart
    if (slide.visualType === 'radar') {
      return (
        <div className="w-full mt-6 bg-white/40 backdrop-blur-sm rounded-3xl p-4 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[380px] overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={CAPABILITY_DATA}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
              <Radar
                name="Performance"
                dataKey="A"
                stroke={theme?.primary || '#2563eb'}
                fill={theme?.primary || '#2563eb'}
                fillOpacity={0.5}
                animationBegin={500}
                animationDuration={1500}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-center text-[10px] text-slate-400 mb-2 font-bold tracking-widest uppercase shrink-0">Capability Metrics Matrix</p>
        </div>
      );
    }

    // New Radial Bar Chart
    if (slide.visualType === 'radial-bar') {
      return (
        <div className="w-full mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[380px] overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" barSize={14} data={ADOPTION_DATA}>
              <RadialBar
                label={{ position: 'insideStart', fill: '#fff', fontSize: 8, fontWeight: 900 }}
                background
                dataKey="uv"
                cornerRadius={10}
                animationDuration={2000}
              />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 'bold' }} />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-bold tracking-widest uppercase">Target Segment Penetration</p>
        </div>
      );
    }

    // New Area Chart
    if (slide.visualType === 'area-chart') {
      return (
        <div className="w-full mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[380px] overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme?.primary || '#2563eb'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme?.primary || '#2563eb'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="uv" 
                stroke={theme?.primary || '#2563eb'} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorUv)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-between items-center mt-4">
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Projection</span>
                <span className="text-2xl font-black text-slate-900">+240%</span>
             </div>
             <p className="text-right text-[10px] text-slate-400 font-bold tracking-widest uppercase max-w-[100px]">Efficiency Growth Forecast</p>
          </div>
        </div>
      );
    }

    if (slide.visualType === 'pie-chart') {
      const data = WORK_2026_RATIO;
      const RADIAN = Math.PI / 180;
      const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
          <g>
            <text x={x} y={y - 6} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-bold select-none">{name}</text>
            <text x={x} y={y + 8} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[13px] font-black select-none opacity-90">{`${value}/12`}</text>
          </g>
        );
      };

      return (
        <div className="w-full mt-6 bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[360px] overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                dataKey="val"
                paddingAngle={5}
                animationDuration={1500}
              >
                {data.map((entry, index) => <PieCell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-[10px] text-slate-400 mb-2 font-bold tracking-widest uppercase shrink-0">Resource Allocation</p>
        </div>
      );
    }

    if (slide.visualType === 'chart') {
      const data = EFFICIENCY_DATA;
      return (
        <div className="w-full mt-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[320px] overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey={lang === 'zh' ? 'zh' : 'name'} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
              <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
              <Bar dataKey="val" radius={[8, 8, 0, 0]} barSize={40}>
                {data.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />)}
                <LabelList dataKey="val" position="top" style={{ fill: '#475569', fontSize: '13px', fontWeight: 800 }} formatter={(val: number) => `${val}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center text-[10px] text-slate-400 mt-2 font-bold tracking-widest uppercase">Benchmark Analysis</p>
        </div>
      );
    }
    
    // Icon Grid & Flow Chart remain same but with enhanced theme support
    if (slide.visualType === 'icon-grid') {
      const items = slide.content.map(item => {
        const parts = item.split(/[：:]/);
        return { title: parts[0] || t.point, desc: parts[1] || '' };
      });
      return (
        <div className={`grid grid-cols-2 gap-3 mt-4 w-full max-w-lg mx-auto`}>
          {items.map((item, idx) => (
            <div key={idx} className={`bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-500 transition-all hover:shadow-md group relative`}>
              <div className="flex items-start gap-3">
                <button onClick={() => onIconClick?.(idx)} className="p-2 rounded-lg bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all group/icon shrink-0" style={{ color: theme?.primary }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{ICON_LIBRARY[slide.customIcons?.[idx] || 'box'] || ICON_LIBRARY.box}</svg>
                </button>
                <div className="flex-grow">
                  <div className="mb-0.5 font-black text-[10px] group-hover:translate-x-1 transition-transform" style={{ color: theme?.primary || '#2563eb' }}>{t.point} 0{idx + 1}</div>
                  <div className="text-[12px] font-extrabold text-slate-900 leading-tight mb-0.5" style={{ color: theme?.textColor }}>{item.title}</div>
                  <div className="text-[9px] text-slate-500 font-medium line-clamp-2 leading-tight">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (slide.visualType === 'flow-chart') {
      return (
        <div className="mt-8 flex flex-col items-center w-full">
          <div className="flex items-center justify-between w-full max-w-lg mb-8 relative">
            <div className="absolute top-7 left-0 right-0 h-0.5 bg-slate-100 -z-10"></div>
            <FlowNode theme={theme} label="Core" sub="Engine" colorClass="bg-indigo-600 text-white" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
            <div className="flex-grow flex justify-center"><svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
            <FlowNode theme={theme} label="API" sub="Interface" colorClass="bg-blue-50 text-blue-500" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <div className="flex-grow flex justify-center"><svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
            <FlowNode theme={theme} label="Output" sub="Deployment" colorClass="bg-emerald-50 text-emerald-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
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

      <div className="absolute top-6 right-6 z-50 opacity-0 group-hover/slide:opacity-100 transition-opacity">
        <button
          onClick={() => onRegenerate?.(slide)}
          disabled={isRegenerating}
          className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ color: theme?.primary } as any}
          title={t.regenerateTitle}
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

      {isRegenerating && (
        <div className="absolute inset-0 z-40 bg-white/40 backdrop-blur-[2px] flex items-center justify-center transition-all">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme?.primary }}></div>
            <p className="font-bold animate-pulse" style={{ color: theme?.primary }}>{t.regenerating}</p>
          </div>
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col">
        {isTitleSlide || isSummarySlide ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <h1 className={`text-6xl font-extrabold mb-6 tracking-tight leading-tight text-black`} style={{ fontFamily: theme?.headingFont }}>
              {slide.title}
            </h1>
            <p className={`text-2xl font-semibold tracking-wide text-black/70 mb-12`}>{slide.subtitle}</p>
            
            {isSummarySlide && (
              <div className="flex flex-col md:flex-row gap-4 mt-8">
                <button 
                  className="px-10 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 group flex items-center gap-3"
                  style={{ backgroundColor: theme?.primary || '#2563eb', color: '#ffffff' }}
                >
                  {t.ctaContactUs}
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button 
                  className="px-10 py-5 rounded-2xl font-bold text-lg border-2 transition-all hover:bg-black/5 active:scale-95"
                  style={{ borderColor: theme?.primary || '#2563eb', color: theme?.primary || '#2563eb' }}
                >
                  {t.ctaLearnMore}
                </button>
              </div>
            )}
            
            <div className={`mt-16 h-1.5 w-24 rounded-full shadow-sm bg-black/20`}></div>
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
