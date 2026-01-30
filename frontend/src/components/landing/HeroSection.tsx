'use client';

import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">

      {/* Badge / Pill */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-md text-emerald-400 text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <ShieldCheck className="w-4 h-4" />
          <span>{t('next_gen_protection')}</span>
        </div>
      </div>

      {/* Main Headline */}
      <h1 className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 max-w-5xl mx-auto text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
        <span className="block mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
          {t('india_first_ai')}
        </span>
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 filter drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
          {t('fraud_before_happens')}
        </span>
      </h1>

      {/* Subtext */}
      <p className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
        {t('hero_subtext')}
        <span className="text-slate-200"> {t('explainable_ai')}</span>.
      </p>

      {/* CTA Button */}
      <div className="animate-in fade-in zoom-in duration-1000 delay-700">
        <Link href="/dashboard" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white transition-all bg-emerald-600 rounded-lg hover:bg-emerald-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] overflow-hidden">
          <span className="relative z-10 flex items-center gap-2">
            {t('enter_command_center')}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </span>
          {/* Button internal glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-100 group-hover:opacity-90 transition-opacity" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        </Link>
      </div>

    </div>
  );
};

export default HeroSection;
