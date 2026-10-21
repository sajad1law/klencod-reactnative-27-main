import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TEAMS, STADIUMS, OFFICIAL_SCHEDULE } from '../../data/tournamentData';
import { TeamFlag } from '../brand/TeamFlag';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { PatternBackground } from '../brand/PatternBackground';
import { soundEngine } from '../../utils/audio';
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';

export const ScheduleScreen: React.FC = () => {
  const { tournament, setScreen, language } = useGame();
  const [filter, setFilter] = useState<'ALL' | 'A' | 'B' | 'KNOCKOUT'>('ALL');

  const matches = OFFICIAL_SCHEDULE.filter(m => {
    if (filter === 'ALL') return true;
    if (filter === 'A') return m.group === 'A';
    if (filter === 'B') return m.group === 'B';
    if (filter === 'KNOCKOUT') return m.stage === 'semi' || m.stage === 'final';
    return true;
  });

  return (
    <div className="relative min-h-screen w-full bg-[#032810] text-[#FFFAF3] flex flex-col justify-between items-center px-4 py-5 overflow-x-hidden">
      <PatternBackground opacity={0.06} />

      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 mb-4">
        <button
          onClick={() => {
            soundEngine.playClick();
            setScreen('menu');
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#04774D]/40 hover:bg-[#04774D] text-[#FFFAF3] flex items-center gap-1.5 transition font-bold text-xs"
        >
          <ArrowLeft size={16} />
          <span>{language === 'ar' ? 'الرئيسية' : 'Menu'}</span>
        </button>

        <div className="flex items-center gap-2">
          <KhaleejiLogo variant="emblem" size="sm" />
          <h1 className="text-base sm:text-xl font-black font-['Kufam'] text-[#FFFAF3]">
            {language === 'ar' ? 'جدول مباريات خليجي 27' : 'Khaleeji 27 Fixtures'}
          </h1>
        </div>

        <div className="w-16" />
      </div>

      {/* Stage Filters */}
      <div className="w-full max-w-4xl flex items-center gap-2 z-10 mb-4 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label_ar: 'جميع المباريات (15)', label_en: 'All Matches (15)' },
          { id: 'A', label_ar: 'المجموعة A', label_en: 'Group A' },
          { id: 'B', label_ar: 'المجموعة B', label_en: 'Group B' },
          { id: 'KNOCKOUT', label_ar: 'الأدوار الإقصائية', label_en: 'Knockout Stage' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              soundEngine.playClick();
              setFilter(tab.id as any);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filter === tab.id
                ? 'bg-[#F4B335] text-[#032810]'
                : 'bg-[#04774D]/30 text-[#9ED47D] hover:bg-[#04774D]/60'
            }`}
          >
            {language === 'ar' ? tab.label_ar : tab.label_en}
          </button>
        ))}
      </div>

      {/* Matches List */}
      <div className="w-full max-w-4xl flex-1 flex flex-col gap-3 z-10">
        {matches.map(m => {
          const home = TEAMS[m.homeTeamId];
          const away = TEAMS[m.awayTeamId];
          const stadium = STADIUMS[m.stadiumId];
          const result = tournament.completedMatches[m.matchNumber];

          return (
            <div
              key={m.matchNumber}
              className={`p-4 rounded-2xl border transition-all ${
                result
                  ? 'bg-[#04774D]/20 border-[#04774D]'
                  : 'bg-[#032810] border-[#04774D]/50 hover:border-[#9ED47D]'
              } flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md`}
            >
              {/* Match Header Tag */}
              <div className="flex sm:flex-col items-center sm:items-start justify-between w-full sm:w-36 text-xs text-[#9ED47D]">
                <span className="font-mono font-bold text-[#F4B335]">
                  MATCH #{m.matchNumber}
                </span>
                <span className="font-['Kufam']">
                  {language === 'ar' ? m.stageTitle_ar : m.stageTitle_en}
                </span>
              </div>

              {/* Versus & Score Display */}
              <div className="flex items-center justify-center gap-4 flex-1">
                {/* Home */}
                <div className="flex items-center gap-2.5 flex-1 justify-end">
                  <span className="font-black font-['Kufam'] text-sm sm:text-base text-[#FFFAF3] text-end">
                    {home ? (language === 'ar' ? home.name_ar : home.name_en) : 'TBD'}
                  </span>
                  {home && <TeamFlag teamId={home.id} size="md" />}
                </div>

                {/* Center Score or VS */}
                <div className="px-3 py-1 rounded-xl bg-black/40 border border-[#04774D] font-mono text-sm sm:text-base font-black text-[#F4B335] min-w-[70px] text-center">
                  {result ? (
                    <span>{result.homeScore} - {result.awayScore}</span>
                  ) : (
                    <span className="text-xs text-[#9ED47D]">VS</span>
                  )}
                </div>

                {/* Away */}
                <div className="flex items-center gap-2.5 flex-1 justify-start">
                  {away && <TeamFlag teamId={away.id} size="md" />}
                  <span className="font-black font-['Kufam'] text-sm sm:text-base text-[#FFFAF3] text-start">
                    {away ? (language === 'ar' ? away.name_ar : away.name_en) : 'TBD'}
                  </span>
                </div>
              </div>

              {/* Stadium & Date */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-44 text-[11px] text-[#9ED47D]/80">
                <span className="font-['Noto_Sans']">
                  {m.date} • {m.time}
                </span>
                <span className="text-right">
                  {language === 'ar' ? stadium?.name_ar : stadium?.name_en}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-16 pt-4" />
    </div>
  );
};
