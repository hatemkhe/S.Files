import React from 'react';
import { ShieldCheck, Zap, Layers, Sparkles, Sun, Moon, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  filesCount: number;
  onClearAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ filesCount, onClearAll }) => {
  const { lang, theme, setLang, setTheme, t } = useApp();

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 border-b ${
      isDark ? 'bg-slate-950/70 border-white/10 text-white' : 'bg-white/80 border-slate-200 text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 text-white">
              S
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t.brandTitle}
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 font-semibold">
                  {t.brandBadge}
                </span>
              </h1>
            </div>
            <p className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              {t.brandSub}
            </p>
          </div>
        </div>

        {/* Center Badges */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-semibold ${
            isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.privacy100}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-semibold ${
            isDark ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <Zap className="w-4 h-4 text-blue-500" />
            <span>{t.fastProcessing}</span>
          </div>
        </div>

        {/* Actions (Language, Theme & Buttons) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition duration-200 border cursor-pointer ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-full text-xs font-bold transition duration-200 border cursor-pointer ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title={isDark ? t.lightMode : t.darkMode}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {filesCount > 0 && (
            <button
              onClick={onClearAll}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition duration-200 border flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.clearAll} ({filesCount})</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>{t.free100}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

