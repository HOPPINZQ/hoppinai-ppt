
import React from 'react';
import { Slide, ThemeConfig } from './types';

// Use React.ReactNode instead of JSX.Element to resolve "Cannot find namespace 'JSX'" error
export const ICON_LIBRARY: Record<string, React.ReactNode> = {
  cloud: <path d="M17.5 19c-3.037 0-5.5-2.463-5.5-5.5 0-.115.004-.229.011-.342A4.502 4.502 0 0113 4.5c.129 0 .256.005.382.016a7 7 0 0113.118 3.484 4.501 4.501 0 01-9 11z" />,
  code: <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
  security: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
  database: <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />,
  zap: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
  cpu: <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />,
  globe: <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />,
  trend: <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
  box: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  share: <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />,
  search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  tool: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  chat: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
  user: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  atom: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  api: <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
  beaker: <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
};

export const THEMES: ThemeConfig[] = [
  {
    id: 'modern-blue',
    name: '现代商务 (蓝)',
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#3b82f6',
    bgGradient: 'from-slate-50 to-blue-50',
    textColor: '#1e293b',
    fontFamily: "'Inter', sans-serif",
    headingFont: "'Inter', sans-serif"
  },
  {
    id: 'emerald-forest',
    name: '翡翠森系 (绿)',
    primary: '#059669',
    secondary: '#064e3b',
    accent: '#10b981',
    bgGradient: 'from-emerald-50 to-teal-50',
    textColor: '#064e3b',
    fontFamily: "'Inter', sans-serif",
    headingFont: "'Inter', sans-serif"
  },
  {
    id: 'cyberpunk',
    name: '赛博未来 (紫)',
    primary: '#7c3aed',
    secondary: '#4c1d95',
    accent: '#a855f7',
    bgGradient: 'from-purple-50 to-indigo-50',
    textColor: '#1e1b4b',
    fontFamily: "'Inter', sans-serif",
    headingFont: "'Inter', sans-serif"
  },
  {
    id: 'minimalist',
    name: '极简主义 (灰)',
    primary: '#334155',
    secondary: '#0f172a',
    accent: '#64748b',
    bgGradient: 'from-white to-slate-100',
    textColor: '#334155',
    fontFamily: "'Inter', sans-serif",
    headingFont: "'Inter', sans-serif"
  }
];

export const GRADIENTS = [
  'from-white to-slate-50',
  'from-blue-50 to-indigo-50',
  'from-emerald-50 to-teal-50',
  'from-slate-50 to-gray-100'
];
