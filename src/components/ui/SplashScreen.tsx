import React from 'react';
import { useGame } from '../../context/GameContext';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { PatternBackground } from '../brand/PatternBackground';
import { soundEngine } from '../../utils/audio';
import { Play } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { setScreen, language } = useGame();

  const handleStart = () => {
    // Initialize Web Audio API on first user gesture
    soundEngine.init();
    soundEngine.playWhistle('kickoff');
    setScreen('menu');
  };

  return (
    <div
      onClick={handleStart}
      className="relative min-h-screen w-full bg-[#021A0A] text-[#FFFAF3] flex flex-col justify-between items-center px-4 py-10 cursor-pointer select-none overflow-hidden"
    >
      <PatternBackground opacity={0.08} />

      {/* Top Spacer */}
      <div className="h-4 z-10" />

      {/* Center Cinematic Lockup */}
      <div className="z-10 flex flex-col items-center text-center my-auto">
        <div className="relative mb-6">
          {/* Subtle golden pulse */}
          <div className="absolute -inset-8 rounded-full bg-[#F4B335]/20 blur-2xl animate-pulse" />
          <KhaleejiLogo variant="vertical" size="xl" className="relative z-10 drop-shadow-2xl" />
        </div>

        <p className="text-xs sm:text-sm text-[#9ED47D] font-medium max-w-sm font-['Noto_Sans'] leading-relaxed">
          {language === 'ar'
            ? 'اللعبة الرسمية لبطولة كأس الخليج العربي 27'
            : 'The Official Game of Arabian Gulf Cup 27'}
        </p>
      </div>

      {/* Bottom Tap to Play Prompt */}
      <div className="z-10 flex flex-col items-center gap-3 animate-pulse pb-4">
        <div className="w-14 h-14 rounded-full bg-[#F4B335] text-[#032810] flex items-center justify-center shadow-[0_0_20px_rgba(244,179,53,0.5)]">
          <Play size={24} fill="#032810" className="ml-1 rtl:mr-1 rtl:ml-0" />
        </div>
        <span className="text-base font-black font-['Kufam'] text-[#FFFAF3] tracking-wider">
          {language === 'ar' ? 'انقر للبدأ' : 'TAP TO START'}
        </span>
      </div>
    </div>
  );
};
