import React from 'react';
import { FileCategory } from '../types';
import { Image, Video, Music, FileText, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CategoryTabsProps {
  activeCategory: FileCategory;
  onSelectCategory: (category: FileCategory) => void;
  counts: Record<FileCategory, number>;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  counts
}) => {
  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  const tabs: { id: FileCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t.allFiles, icon: <Layers className="w-4 h-4" /> },
    { id: 'image', label: t.images, icon: <Image className="w-4 h-4" /> },
    { id: 'video', label: t.videos, icon: <Video className="w-4 h-4" /> },
    { id: 'audio', label: t.audio, icon: <Music className="w-4 h-4" /> },
    { id: 'document', label: t.docs, icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="w-full flex items-center justify-center my-4 px-4">
      <div className={`flex items-center gap-2 backdrop-blur-2xl p-1.5 rounded-2xl border shadow-2xl overflow-x-auto max-w-full no-scrollbar transition-colors duration-300 ${
        isDark ? 'bg-black/30 border-white/10' : 'bg-white/80 border-slate-200/80 shadow-slate-200/60'
      }`}>
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                  : isDark
                  ? 'text-white/60 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={isActive ? 'text-white' : isDark ? 'text-white/50' : 'text-slate-400'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDark
                      ? 'bg-white/10 text-white/70'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

