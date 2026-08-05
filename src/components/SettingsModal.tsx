import React from 'react';
import { ConversionOptions, FileItem } from '../types';
import { X, Sliders, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SettingsModalProps {
  item: FileItem;
  isOpen: boolean;
  onClose: () => void;
  onSaveOptions: (id: string, options: ConversionOptions) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveOptions
}) => {
  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const [options, setOptions] = React.useState<ConversionOptions>({ ...item.options });

  const handleSave = () => {
    onSaveOptions(item.id, options);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-lg backdrop-blur-2xl border rounded-[32px] p-6 shadow-2xl space-y-6 transition-colors duration-300 ${
        isDark ? 'bg-[#0f172a]/95 border-white/20 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.settingsTitle}</h3>
              <p className={`text-xs font-medium truncate max-w-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border-white/10'
                : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options according to File Category */}
        <div className="space-y-5 text-sm">
          {item.category === 'image' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {t.quality} {Math.round((options.image?.quality || 0.9) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={options.image?.quality || 0.9}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      image: { ...options.image!, quality: parseFloat(e.target.value) }
                    })
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                    {t.maxWidth}
                  </label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={options.image?.maxWidth || ''}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        image: { ...options.image!, maxWidth: e.target.value ? parseInt(e.target.value) : undefined }
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                    {t.maxHeight}
                  </label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={options.image?.maxHeight || ''}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        image: { ...options.image!, maxHeight: e.target.value ? parseInt(e.target.value) : undefined }
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {t.bgColor}
                </label>
                <input
                  type="color"
                  value={options.image?.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      image: { ...options.image!, backgroundColor: e.target.value }
                    })
                  }
                  className={`w-12 h-10 rounded-xl border cursor-pointer p-1 ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>
          )}

          {item.category === 'audio' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {t.audioBitrate}
                </label>
                <select
                  value={options.audio?.bitrate || 192}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      audio: { ...options.audio!, bitrate: parseInt(e.target.value) }
                    })
                  }
                  className={`w-full px-3 py-2.5 border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value={128} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>128 kbps</option>
                  <option value={192} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>192 kbps</option>
                  <option value={256} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>256 kbps</option>
                  <option value={320} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>320 kbps</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {t.sampleRate}
                </label>
                <select
                  value={options.audio?.sampleRate || 44100}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      audio: { ...options.audio!, sampleRate: parseInt(e.target.value) }
                    })
                  }
                  className={`w-full px-3 py-2.5 border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value={44100} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>44,100 Hz (Standard)</option>
                  <option value={48000} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>48,000 Hz (High Resolution)</option>
                </select>
              </div>
            </div>
          )}

          {item.category === 'video' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {t.videoScale} {Math.round((options.video?.scale || 0.8) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="1.0"
                  step="0.05"
                  value={options.video?.scale || 0.8}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      video: { ...options.video!, scale: parseFloat(e.target.value) }
                    })
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {t.fps}
                </label>
                <select
                  value={options.video?.fps || 30}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      video: { ...options.video!, fps: parseInt(e.target.value) }
                    })
                  }
                  className={`w-full px-3 py-2.5 border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value={15} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>15 FPS</option>
                  <option value={24} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>24 FPS</option>
                  <option value={30} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>30 FPS</option>
                  <option value={60} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>60 FPS</option>
                </select>
              </div>
            </div>
          )}

          {item.category === 'document' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {t.fontSize}
                </label>
                <input
                  type="number"
                  min="8"
                  max="24"
                  value={options.document?.fontSize || 12}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      document: { ...options.document!, fontSize: parseInt(e.target.value) }
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {t.pageOrientation}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOptions({
                        ...options,
                        document: { ...options.document!, pageOrientation: 'portrait' }
                      })
                    }
                    className={`p-2.5 rounded-xl border font-bold text-xs cursor-pointer transition ${
                      options.document?.pageOrientation === 'portrait'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                        : isDark
                        ? 'bg-white/5 border-white/10 text-white/60'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.portrait}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOptions({
                        ...options,
                        document: { ...options.document!, pageOrientation: 'landscape' }
                      })
                    }
                    className={`p-2.5 rounded-xl border font-bold text-xs cursor-pointer transition ${
                      options.document?.pageOrientation === 'landscape'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                        : isDark
                        ? 'bg-white/5 border-white/10 text-white/60'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.landscape}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              isDark
                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t.saveSettings}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

