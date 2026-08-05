import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StatsBanner: React.FC = () => {
  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: t.featPrivacyTitle,
      desc: t.featPrivacyDesc
    },
    {
      icon: <Cpu className="w-6 h-6 text-blue-500" />,
      title: t.featWasmTitle,
      desc: t.featWasmDesc
    },
    {
      icon: <HardDrive className="w-6 h-6 text-purple-500" />,
      title: t.featFormatsTitle,
      desc: t.featFormatsDesc
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: t.featFreeTitle,
      desc: t.featFreeDesc
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto my-12 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className={`p-6 backdrop-blur-2xl border rounded-[32px] shadow-2xl transition duration-300 space-y-3 ${
              isDark
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/[0.14]'
                : 'bg-white/80 border-slate-200/80 text-slate-800 hover:bg-white shadow-slate-200/60'
            }`}
          >
            <div className={`p-3 rounded-2xl border w-fit shadow-md ${
              isDark ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'
            }`}>
              {feat.icon}
            </div>
            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{feat.title}</h4>
            <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

