import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { FileItem, FileCategory, TargetFormat, ConversionOptions } from './types';
import {
  detectCategory,
  getDefaultTargetFormat,
  getFileExtension
} from './utils/formatUtils';
import { processFileConversion } from './utils/converterEngine';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { Dropzone } from './components/Dropzone';
import { FileCard } from './components/FileCard';
import { StatsBanner } from './components/StatsBanner';
import { Footer } from './components/Footer';
import { Play, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<FileCategory>('all');
  const [isBatchConverting, setIsBatchConverting] = useState(false);
  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  // Add files to state
  const handleFilesAdded = (newFiles: File[]) => {
    const items: FileItem[] = newFiles.map((f) => {
      const ext = getFileExtension(f.name);
      const category = detectCategory(f);
      const targetFormat = getDefaultTargetFormat(category, ext);

      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        extension: ext,
        category,
        targetFormat,
        status: 'idle',
        progress: 0,
        convertedUrl: null,
        convertedBlob: null,
        convertedName: null,
        convertedSize: null,
        errorMsg: null,
        options: {
          image: { quality: 0.9, backgroundColor: '#ffffff' },
          audio: { bitrate: 192, sampleRate: 44100 },
          video: { fps: 30, scale: 0.8, quality: 0.8 },
          document: { fontSize: 12, pageOrientation: 'portrait' }
        }
      };
    });

    setFiles((prev) => [...items, ...prev]);
  };

  // Remove individual file
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((item) => item.id === id);
      if (fileToRemove?.convertedUrl) {
        URL.revokeObjectURL(fileToRemove.convertedUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Clear all files
  const handleClearAll = () => {
    files.forEach((item) => {
      if (item.convertedUrl) {
        URL.revokeObjectURL(item.convertedUrl);
      }
    });
    setFiles([]);
  };

  // Change target format
  const handleChangeTargetFormat = (id: string, format: TargetFormat) => {
    setFiles((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            targetFormat: format,
            status: 'idle',
            progress: 0,
            convertedUrl: null,
            convertedBlob: null
          };
        }
        return item;
      })
    );
  };

  // Save options
  const handleSaveOptions = (id: string, options: ConversionOptions) => {
    setFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, options } : item))
    );
  };

  // Start converting a single file
  const handleStartConversion = async (id: string) => {
    const item = files.find((f) => f.id === id);
    if (!item) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: 'converting', progress: 5, errorMsg: null } : f
      )
    );

    try {
      const result = await processFileConversion(item, (progress, statusMessage) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress, statusMessage } : f))
        );
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'completed',
                progress: 100,
                convertedUrl: result.url,
                convertedBlob: result.blob,
                convertedName: result.convertedName,
                convertedSize: result.size
              }
            : f
        )
      );

      // Trigger Confetti effect on completion
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'error',
                errorMsg: err instanceof Error ? err.message : 'Conversion failed'
              }
            : f
        )
      );
    }
  };

  // Start batch converting all files
  const handleConvertAll = async () => {
    const pendingFiles = filteredFiles.filter((f) => f.status === 'idle' || f.status === 'error');
    if (pendingFiles.length === 0) return;

    setIsBatchConverting(true);

    for (const item of pendingFiles) {
      await handleStartConversion(item.id);
    }

    setIsBatchConverting(false);

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  // Download all completed converted files
  const handleDownloadAll = () => {
    const completed = filteredFiles.filter((f) => f.status === 'completed' && f.convertedUrl);
    completed.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = item.convertedUrl!;
        link.download = item.convertedName || `converted_${item.id}.${item.targetFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 300);
    });
  };

  // Counts by Category
  const categoryCounts = useMemo(() => {
    const counts: Record<FileCategory, number> = {
      all: files.length,
      image: 0,
      video: 0,
      audio: 0,
      document: 0
    };

    files.forEach((f) => {
      if (f.category in counts) {
        counts[f.category]++;
      }
    });

    return counts;
  }, [files]);

  // Filtered files for current tab view
  const filteredFiles = useMemo(() => {
    if (activeCategory === 'all') return files;
    return files.filter((f) => f.category === activeCategory);
  }, [files, activeCategory]);

  const idleCount = filteredFiles.filter((f) => f.status === 'idle' || f.status === 'error').length;
  const completedCount = filteredFiles.filter((f) => f.status === 'completed').length;

  return (
    <div className={`min-h-screen flex flex-col font-['Cairo',sans-serif] relative overflow-x-hidden transition-colors duration-300 selection:bg-blue-500 selection:text-white ${
      isDark ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Ambient Frosted Glass Blur Orbs */}
      <div className={`fixed -top-[10%] -left-[10%] w-[45%] h-[45%] rounded-full blur-[140px] pointer-events-none transition-opacity duration-300 ${
        isDark ? 'bg-blue-600 opacity-25' : 'bg-blue-400 opacity-20'
      }`} />
      <div className={`fixed -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[160px] pointer-events-none transition-opacity duration-300 ${
        isDark ? 'bg-purple-600 opacity-25' : 'bg-purple-400 opacity-20'
      }`} />
      <div className={`fixed top-[40%] right-[20%] w-[30%] h-[30%] rounded-full blur-[130px] pointer-events-none transition-opacity duration-300 ${
        isDark ? 'bg-indigo-600 opacity-15' : 'bg-indigo-400 opacity-15'
      }`} />

      {/* Header */}
      <Header filesCount={files.length} onClearAll={handleClearAll} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Category Tabs */}
        <CategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          counts={categoryCounts}
        />

        {/* Drag & Drop Upload Zone */}
        <Dropzone
          onFilesAdded={handleFilesAdded}
          selectedCategory={activeCategory}
        />

        {/* Files List & Batch Actions */}
        {filteredFiles.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Batch Controls Bar */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-5 backdrop-blur-2xl border rounded-2xl shadow-2xl transition-colors duration-300 ${
              isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-slate-200 shadow-slate-200/60'
            }`}>
              <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                <span>{t.selectedFiles} {filteredFiles.length}</span>
                {completedCount > 0 && (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ({completedCount} {t.completed})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {idleCount > 0 && (
                  <button
                    disabled={isBatchConverting}
                    onClick={handleConvertAll}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition duration-200 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t.convertAll} ({idleCount})</span>
                  </button>
                )}

                {completedCount > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition duration-200 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.downloadAll} ({completedCount})</span>
                  </button>
                )}

                <button
                  onClick={handleClearAll}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isDark
                      ? 'bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-300 border-white/10'
                      : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200'
                  }`}
                  title={t.clearList}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of File Cards */}
            <div className="space-y-3">
              {filteredFiles.map((fileItem) => (
                <FileCard
                  key={fileItem.id}
                  item={fileItem}
                  onRemove={handleRemoveFile}
                  onChangeTargetFormat={handleChangeTargetFormat}
                  onStartConversion={handleStartConversion}
                  onSaveOptions={handleSaveOptions}
                />
              ))}
            </div>
          </div>
        )}

        {/* Feature Highlights / Stats */}
        <StatsBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

