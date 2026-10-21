import React from 'react';
import { useGame } from '../../context/GameContext';
import { TEAMS } from '../../data/tournamentData';
import { TeamFlag } from '../brand/TeamFlag';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { PatternBackground } from '../brand/PatternBackground';
import { soundEngine } from '../../utils/audio';
import { Trophy, ArrowLeft, ArrowRight, Play, CheckCircle } from 'lucide-react';

export const MatchResult: React.FC = () => {
  const {
    homeTeamId,
    awayTeamId,
    lastMatchResult,
    gameMode,
    startNextTournamentMatch,
    setScreen,
    language
  } = useGame();

  const homeTeam = TEAMS[homeTeamId] || TEAMS.ksa;
  const awayTeam = TEAMS[awayTeamId] || TEAMS.kwt;

  const homeScore = lastMatchResult?.homeScore ?? 0;
  const awayScore = lastMatchResult?.awayScore ?? 0;

  // Simulate realistic match stats based on score
  const homePossession = Math.round(48 + (homeScore - awayScore) * 3 + Math.random() * 4);
  const awayPossession = 100 - homePossession;
  const homeShots = Math.max(homeScore + 2, Math.floor(Math.random() * 5 + 6));
  const awayShots = Math.max(awayScore + 1, Math.floor(Math.random() * 5 + 5));

  const isDraw = homeScore === awayScore;
  const isHomeWinner = homeScore > awayScore;

  return (
    <div className="relative min-h-screen w-full bg-[#032810] text-[#FFFAF3] flex flex-col justify-between items-center px-4 py-5 overflow-x-hidden">
      <PatternBackground opacity={0.07} />

      {/* Top Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between z-10 mb-2">
        <button
          onClick={() => {
            soundEngine.playClick();
            setScreen(gameMode === 'tournament' ? 'tournament_dashboard' : 'menu');
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#04774D]/40 hover:bg-[#04774D] text-[#FFFAF3] flex items-center gap-1.5 transition font-bold text-xs"
        >
          <ArrowLeft size={16} />
          <span>{language === 'ar' ? 'الخروج' : 'Exit'}</span>
        </button>

        <KhaleejiLogo variant="emblem" size="sm" />

        <div className="w-16" />
      </div>

      {/* Main Full-Time Card */}
      <div className="w-full max-w-3xl z-10 flex flex-col items-center my-auto">
        <div className="px-4 py-1 rounded-full bg-[#04774D] border border-[#F4B335] text-xs font-black font-['Noto_Sans'] text-[#F4B335] uppercase tracking-widest shadow-md mb-3">
          {language === 'ar' ? 'صافرة النهاية • نتيجة المباراة' : 'FULL TIME • MATCH RESULT'}
        </div>

        <div className="w-full bg-gradient-to-b from-[#04774D]/40 via-[#032810] to-[#021A0A] border-2 border-[#04774D] rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Teams & Score */}
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1">
              <TeamFlag teamId={homeTeam.id} size="xl" className="shadow-lg mb-2" />
              <span className="font-black text-base sm:text-xl font-['Kufam'] text-[#FFFAF3] text-center">
                {language === 'ar' ? homeTeam.name_ar : homeTeam.name_en}
              </span>
              {isHomeWinner && (
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#0AA771] text-[#FFFAF3] text-[10px] font-bold">
                  {language === 'ar' ? 'الفائز' : 'Winner'}
                </span>
              )}
            </div>

            {/* Score Display */}
            <div className="flex flex-col items-center px-4">
              <div className="text-4xl sm:text-6xl font-black font-['Kufam'] text-[#F4B335] tracking-widest">
                <span>{homeScore}</span>
                <span className="mx-2 text-2xl text-[#9ED47D]/50">-</span>
                <span>{awayScore}</span>
              </div>
              <span className="mt-1 text-[11px] font-bold text-[#9ED47D] uppercase font-mono tracking-wider">
                FT
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1">
              <TeamFlag teamId={awayTeam.id} size="xl" className="shadow-lg mb-2" />
              <span className="font-black text-base sm:text-xl font-['Kufam'] text-[#FFFAF3] text-center">
                {language === 'ar' ? awayTeam.name_ar : awayTeam.name_en}
              </span>
              {!isDraw && !isHomeWinner && (
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#0AA771] text-[#FFFAF3] text-[10px] font-bold">
                  {language === 'ar' ? 'الفائز' : 'Winner'}
                </span>
              )}
            </div>
          </div>

          {/* Match Statistics */}
          <div className="mt-8 pt-6 border-t border-[#04774D]/50 flex flex-col gap-3 font-mono text-xs">
            <h4 className="text-center font-['Kufam'] font-bold text-[#F4B335] mb-1">
              {language === 'ar' ? 'إحصائيات المباراة' : 'Match Statistics'}
            </h4>

            {/* Possession */}
            <div>
              <div className="flex justify-between text-[#FFFAF3] mb-1">
                <span>{homePossession}%</span>
                <span className="font-['Kufam'] text-[#9ED47D]">{language === 'ar' ? 'الاستحواذ' : 'Possession'}</span>
                <span>{awayPossession}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden flex">
                <div className="bg-[#0AA771] h-full transition-all" style={{ width: `${homePossession}%` }} />
                <div className="bg-[#8C2669] h-full transition-all" style={{ width: `${awayPossession}%` }} />
              </div>
            </div>

            {/* Total Shots */}
            <div className="flex justify-between items-center text-[#FFFAF3] py-1 border-b border-[#04774D]/20">
              <span className="font-bold">{homeShots}</span>
              <span className="font-['Kufam'] text-[#9ED47D]">{language === 'ar' ? 'التسديدات' : 'Total Shots'}</span>
              <span className="font-bold">{awayShots}</span>
            </div>

            {/* Shots On Target */}
            <div className="flex justify-between items-center text-[#FFFAF3] py-1 border-b border-[#04774D]/20">
              <span className="font-bold">{Math.max(homeScore, Math.floor(homeShots * 0.6))}</span>
              <span className="font-['Kufam'] text-[#9ED47D]">{language === 'ar' ? 'التسديدات على المرمى' : 'Shots on Target'}</span>
              <span className="font-bold">{Math.max(awayScore, Math.floor(awayShots * 0.6))}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-md">
          {gameMode === 'tournament' ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                setScreen('tournament_dashboard');
              }}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#F4B335] to-[#E5A122] hover:brightness-110 text-[#032810] font-black font-['Kufam'] text-base shadow-xl flex items-center justify-center gap-2 transition"
            >
              <span>{language === 'ar' ? 'متابعة مشوار البطولة' : 'Continue Tournament'}</span>
              <span>{language === 'ar' ? '←' : '→'}</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setScreen('match');
                }}
                className="flex-1 py-3.5 rounded-2xl bg-[#04774D] hover:bg-[#0AA771] text-[#FFFAF3] font-bold font-['Kufam'] transition text-sm flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'إعادة المباراة' : 'Rematch'}</span>
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setScreen('menu');
                }}
                className="flex-1 py-3.5 rounded-2xl bg-[#032810] border border-[#04774D] hover:bg-[#04774D]/30 text-[#FFFAF3] font-bold font-['Kufam'] transition text-sm flex items-center justify-center gap-2"
              >
                <span>{language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="w-16" />
    </div>
  );
};
