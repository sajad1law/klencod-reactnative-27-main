import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { TEAMS } from '../../data/tournamentData';
import { TeamFlag } from '../brand/TeamFlag';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { PatternBackground } from '../brand/PatternBackground';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, RotateCcw, Home } from 'lucide-react';

export const ChampionScreen: React.FC = () => {
  const { tournament, resetTournament, setScreen, language } = useGame();
  const championTeam = TEAMS[tournament.championTeamId || tournament.playerTeamId] || TEAMS.ksa;

  useEffect(() => {
    soundEngine.playTrophyFanfare();

    // Multistage celebratory confetti firework bursts
    const end = Date.now() + 3.5 * 1000;
    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#04774D', '#F4B335', '#9ED47D', '#FFFAF3', '#8C2669']
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#021A0A] text-[#FFFAF3] flex flex-col justify-between items-center px-4 py-8 overflow-x-hidden text-center">
      <PatternBackground opacity={0.08} />

      {/* Top Tournament Branding */}
      <div className="z-10 flex flex-col items-center">
        <KhaleejiLogo variant="emblem" size="md" />
        <span className="mt-2 text-xs font-black text-[#F4B335] uppercase tracking-[0.25em] font-['Noto_Sans']">
          Khaleeji 27 • Jeddah 2026
        </span>
      </div>

      {/* Main Champion Card & Trophy Podium */}
      <div className="z-10 my-auto flex flex-col items-center max-w-xl w-full">
        {/* Glow halo */}
        <div className="relative flex flex-col items-center">
          <div className="absolute -inset-10 rounded-full bg-[#F4B335]/20 blur-3xl animate-pulse" />

          {/* Trophy Vector */}
          <div className="relative z-10 animate-bounce duration-1000">
            <KhaleejiLogo variant="emblem" size="xl" />
          </div>

          {/* Champion Flag & Title */}
          <div className="relative z-10 mt-6 flex flex-col items-center">
            <div className="flex items-center gap-3">
              <TeamFlag teamId={championTeam.id} size="xl" className="shadow-[0_0_25px_rgba(244,179,53,0.5)] border-2 border-[#F4B335]" />
            </div>

            <h1 className="mt-4 text-3xl sm:text-5xl font-black font-['Kufam'] text-[#FFFAF3] tracking-wide">
              {language === 'ar' ? `منتخب ${championTeam.name_ar} بطلاً لخليجي 27` : `${championTeam.name_en} Champions of Khaleeji 27`}
            </h1>

            <div className="mt-2 px-4 py-1 rounded-full bg-[#04774D] border-2 border-[#F4B335] text-xs font-black text-[#F4B335] uppercase tracking-widest shadow-xl flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>{language === 'ar' ? 'أبطال كأس الخليج العربي - جدة 2026' : 'Gulf Cup 27 Champions • Jeddah 2026'}</span>
              <Sparkles size={14} />
            </div>
          </div>
        </div>

        {/* Tournament Summary Statistics Card */}
        <div className="mt-8 w-full bg-[#032810]/90 border border-[#04774D] rounded-2xl p-4 shadow-xl grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="flex flex-col items-center p-2 rounded-xl bg-black/20">
            <span className="text-[10px] text-[#9ED47D] font-['Kufam']">{language === 'ar' ? 'المدينة المستضيفة' : 'Host City'}</span>
            <span className="font-bold text-[#FFFAF3] mt-0.5">{language === 'ar' ? 'جدة' : 'Jeddah'}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-black/20">
            <span className="text-[10px] text-[#9ED47D] font-['Kufam']">{language === 'ar' ? 'ملعب النهائي' : 'Final Stadium'}</span>
            <span className="font-bold text-[#FFFAF3] mt-0.5">{language === 'ar' ? 'الجوهرة المشعة' : 'King Abdullah'}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-black/20">
            <span className="text-[10px] text-[#9ED47D] font-['Kufam']">{language === 'ar' ? 'حامل اللقب' : 'Title Holder'}</span>
            <span className="font-bold text-[#F4B335] mt-0.5">{championTeam.shortCode}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3 w-full max-w-sm">
          <button
            onClick={() => {
              soundEngine.playClick();
              resetTournament();
              setScreen('team_select');
            }}
            className="flex-1 py-3.5 rounded-2xl bg-[#04774D] hover:bg-[#0AA771] text-[#FFFAF3] font-bold font-['Kufam'] text-sm shadow-lg flex items-center justify-center gap-2 transition"
          >
            <RotateCcw size={16} />
            <span>{language === 'ar' ? 'بطولة جديدة' : 'New Tournament'}</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setScreen('menu');
            }}
            className="flex-1 py-3.5 rounded-2xl bg-[#032810] border border-[#04774D] hover:bg-[#04774D]/30 text-[#FFFAF3] font-bold font-['Kufam'] text-sm shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Home size={16} />
            <span>{language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</span>
          </button>
        </div>
      </div>

      <div className="z-10 text-xs text-[#9ED47D]">
        {language === 'ar' ? 'تهانينا للبطل المتوّج باللقب الخليجي!' : 'Congratulations to the Champions of the Gulf Cup!'}
      </div>
    </div>
  );
};
