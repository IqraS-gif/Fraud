'use client';

import React from 'react';
import LandingBackground from './LandingBackground';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';

const LandingPage: React.FC = () => {
  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-slate-950">
      {/* Background Layer - Fixed to viewport or covering the main container */}
      <LandingBackground />

      {/* Content Layer */}
      <div className="relative z-10 w-full">
        <HeroSection />
        <ProblemSection />
      </div>
    </main>
  );
};

export default LandingPage;
