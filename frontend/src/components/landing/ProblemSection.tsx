'use client';

import React from 'react';
import { AlertTriangle, Lock, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const ProblemSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full py-24 bg-slate-950 overflow-hidden">

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-red-800/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container relative mx-auto px-6 z-10">

        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-800 text-red-400 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            {t('critical_threat_level')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('digital_trust_crisis')}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t('traditional_security_no_more')}
          </p>
        </div>

        {/* Shock Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-red-800/50 transition-colors duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity duration-500">
              <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-2">
              ₹1.25L
            </div>
            <div className="text-xl font-bold text-white mb-4">{t('crore_lost')}</div>
            <p className="text-slate-400">
              {t('money_lost_text')}
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-red-800/50 transition-colors duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity duration-500">
              <Lock className="w-12 h-12 text-red-600" />
            </div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-2">
              40%
            </div>
            <div className="text-xl font-bold text-white mb-4">{t('rise_in_scams')}</div>
            <p className="text-slate-400">
              {t('scams_increase_text')}
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-red-800/50 transition-colors duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity duration-500">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-2">
              &lt; 1%
            </div>
            <div className="text-xl font-bold text-white mb-4">{t('recovery_rate')}</div>
            <p className="text-slate-400">
              {t('recovery_rate_text')}
            </p>
          </div>

        </div>

        {/* Panic/Urgency Banner */}
        <div className="mt-20 p-1 rounded-xl bg-gradient-to-r from-transparent via-red-900/50 to-transparent">
          <div className="px-8 py-6 text-center">
            <p className="text-2xl font-bold text-red-100/90 tracking-wide uppercase glitch-effect">
              {t('rule_based_failing')}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProblemSection;
