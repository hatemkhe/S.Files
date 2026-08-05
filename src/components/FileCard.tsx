import React, { useState } from 'react';
import { FileItem, TargetFormat } from '../types';
import {
  formatBytes,
  getAvailableFormats,
  getFormatLabel
} from '../utils/formatUtils';
import {
  Image,
  Video,
  Music,
  FileText,
  Trash2,
  Sliders,
  Play,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { useApp } from '../context/AppContext';

interface FileCardProps {
  item: FileItem;
  onRemove: (id: string) => void;
  onChangeTargetFormat: (id: string, format: TargetFormat) => void;
  onStartConversion: (id: string) => void;
  onSaveOptions: (id: string, options: any) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  item,
  onRemove,
  onChangeTargetFormat,
  onStartConversion,
  onSaveOptions
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';

  const availableFormats = getAvailableFormats(item.category);

  const getCategoryIcon = () => {
    switch (item.category) {
      case 'image':
        return <Image className="w-5 h-5 text-emerald-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-rose-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-amber-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-cyan-500" />;
    }
  };

  const getCategoryBg = () => {
    switch (item.category) {
      case 'image':
        return isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200';
      case 'video':
        return isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200';
      case 'audio':
        return isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200';
      case 'document':
        return isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200';
    }
  };

  return (
    <>
      <div className={`relative group backdrop-blur-md border rounded-2xl p-5 shadow-xl transition-all duration-300 space-y-4 ${
        isDark ? 'bg-black/30 border-white/10 hover:border-white/20' : 'bg-white/90 border-slate-200/80 hover:border-slate-300 shadow-slate-200/60'
      }`}>
        {/* Top Info Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Category Badge Icon */}
            <div className={`p-3 rounded-xl border ${getCategoryBg()} flex items-center justify-center shrink-0`}>
              {getCategoryIcon()}
            </div>

            {/* Name & Size */}
            <div className="min-w-0">
              <h3 className={`text-sm sm:text-base font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`} title={item.name}>
                {item.name}
              </h3>
              <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                <span>{formatBytes(item.size)}</span>
                <span>•</span>
                <span className={`uppercase px-2 py-0.5 rounded font-bold text-[10px] ${
                  isDark ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {item.extension || 'FILE'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Top Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                isDark
                  ? 'bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border-white/5'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
              title={t.settingsTitle}
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                isDark
                  ? 'bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 border-white/5'
                  : 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border-slate-200'
              }`}
              title={t.clearList}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Format Selector & Conversion Actions */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className={`text-xs font-bold whitespace-nowrap ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              {t.convertTo}
            </span>
            <div className="relative flex-1 sm:flex-none">
              <select
                disabled={item.status === 'converting'}
                value={item.targetFormat}
                onChange={(e) => onChangeTargetFormat(item.id, e.target.value as TargetFormat)}
                className={`w-full sm:w-36 px-3 py-1.5 border rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-blue-300'
                    : 'bg-slate-50 border-slate-200 text-blue-600'
                }`}
              >
                {availableFormats.map((fmt) => (
                  <option key={fmt} value={fmt} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    {getFormatLabel(fmt)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Button depending on status */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-2">
            {item.status === 'idle' && (
              <button
                onClick={() => onStartConversion(item.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition duration-200 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.convertNow}</span>
              </button>
            )}

            {item.status === 'converting' && (
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span>{t.converting}</span>
              </div>
            )}

            {item.status === 'completed' && item.convertedUrl && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={item.convertedUrl}
                  download={item.convertedName || `converted.${item.targetFormat}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadCompleted}</span>
                </a>
                <button
                  onClick={() => onStartConversion(item.id)}
                  className={`p-2 rounded-xl transition cursor-pointer border ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title={t.reconvert}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {item.status === 'error' && (
              <button
                onClick={() => onStartConversion(item.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.retry}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar or Status Overlay */}
        {item.status === 'converting' && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={isDark ? 'text-white/60' : 'text-slate-600'}>{item.statusMessage || t.converting}</span>
              <span className="text-blue-500">{item.progress}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 border ${
              isDark ? 'bg-white/10 border-white/10' : 'bg-slate-200 border-slate-300'
            }`}>
              <div
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed Stats Bar */}
        {item.status === 'completed' && item.convertedSize && (
          <div className={`flex items-center justify-between px-3.5 py-2 border rounded-xl text-xs font-bold ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{t.completedSuccess}</span>
            </div>
            <div className={`flex items-center gap-2 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
              <span className="line-through opacity-50">{formatBytes(item.size)}</span>
              {lang === 'ar' ? <ArrowLeft className="w-3 h-3 text-emerald-500" /> : <ArrowRight className="w-3 h-3 text-emerald-500" />}
              <span className="text-emerald-500 font-extrabold">{formatBytes(item.convertedSize)}</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {item.status === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{item.errorMsg || 'An unexpected error occurred during conversion.'}</span>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        item={item}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveOptions={onSaveOptions}
      />
    </>
  );
};

