import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  return (
    <footer className={`w-full mt-20 border-t backdrop-blur-md py-10 px-4 text-center relative z-10 transition-colors duration-300 ${
      isDark ? 'border-white/10 bg-black/20 text-white' : 'border-slate-200 bg-white/80 text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-6 sm:flex-row">
        {/* Brand & Rights */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-right space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              {t.brandTitle}
            </span>
            <span className={`text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-500'}`}>• {t.rights}</span>
          </div>
          <p className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
            {t.brandSub}
          </p>
        </div>

        {/* Developer / Creator Button */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
            تم التطوير بواسطة
          </span>

          <a
            href="https://hatemkhe.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs border transition-all duration-300 shadow-xl hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600 hover:to-indigo-600 text-white border-white/20'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-600 hover:to-indigo-600 text-slate-800 hover:text-white border-blue-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            <span>Khemamssa Hatem</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-200" />
          </a>
        </div>
      </div>
    </footer>
  );
};
