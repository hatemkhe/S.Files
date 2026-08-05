import React, { useRef, useState } from 'react';
import { UploadCloud, FilePlus, Sparkles, Image, Video, Music, FileText } from 'lucide-react';
import { FileCategory } from '../types';
import { useApp } from '../context/AppContext';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  selectedCategory: FileCategory;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, selectedCategory }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesAdded(droppedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesAdded(selectedFiles);
      e.target.value = ''; // reset input
    }
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 px-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openPicker}
        className={`relative group cursor-pointer border-2 border-dashed rounded-[32px] py-12 px-6 sm:px-10 text-center transition-all duration-300 backdrop-blur-2xl shadow-2xl ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/20 scale-[1.01] shadow-blue-500/20'
            : isDark
            ? 'border-white/20 hover:border-white/40 bg-white/10 hover:bg-white/[0.14]'
            : 'border-slate-300 hover:border-slate-400 bg-white/80 hover:bg-white shadow-slate-200/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept={
            selectedCategory === 'image'
              ? 'image/*'
              : selectedCategory === 'video'
              ? 'video/*'
              : selectedCategory === 'audio'
              ? 'audio/*'
              : selectedCategory === 'document'
              ? '.pdf,.txt,.html,.md,.doc,.docx'
              : undefined
          }
        />

        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          {/* Icon Badge */}
          <div className={`w-16 h-16 border rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-lg ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-blue-50 border-blue-200'
          }`}>
            {isDragOver ? (
              <FilePlus className="w-8 h-8 text-blue-500 animate-bounce" />
            ) : (
              <UploadCloud className="w-8 h-8 text-blue-500" />
            )}
          </div>

          {/* Titles & Instructions */}
          <div className="space-y-2 max-w-lg">
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.dropTitle}{' '}
              <span className="text-blue-500 underline decoration-blue-500/40 underline-offset-4 group-hover:text-blue-400">
                {t.dropTitleBrowse}
              </span>
            </h2>
            <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              {t.dropSub}
            </p>
          </div>

          {/* Format Chips Preview */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-semibold">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              isDark ? 'bg-black/20 border-white/10 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <Image className="w-3.5 h-3.5" />
              <span>PNG, JPG, WEBP, GIF, SVG, ICO</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              isDark ? 'bg-black/20 border-white/10 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <Video className="w-3.5 h-3.5" />
              <span>MP4, WEBM, AVI, MOV, MKV</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              isDark ? 'bg-black/20 border-white/10 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <Music className="w-3.5 h-3.5" />
              <span>MP3, WAV, OGG, AAC, FLAC</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              isDark ? 'bg-black/20 border-white/10 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}>
              <FileText className="w-3.5 h-3.5" />
              <span>PDF, TXT, HTML, MD</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition duration-200">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              {t.chooseFilesBtn}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

