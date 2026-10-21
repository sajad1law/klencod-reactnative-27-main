import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TEAMS } from '../../data/tournamentData';
import { TeamFlag } from '../brand/TeamFlag';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { PatternBackground } from '../brand/PatternBackground';
import { soundEngine } from '../../utils/audio';
import { ArrowLeft } from 'lucide-react';

export const StandingsScreen: React.FC = () => {
  const { tournament, setScreen, language } = useGame();
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B'>('A');

  const standings = selectedGroup === 'A' ? tournament.standingsA : tournament.standingsB;

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
            {language === 'ar' ? 'جدول ترتيب المجموعات' : 'Tournament Standings'}
          </h1>
        </div>

        <div className="w-16" />
      </div>

      {/* Group Toggle Pills */}
      <div className="w-full max-w-md flex items-center justify-center gap-3 z-10 mb-6">
        {(['A', 'B'] as const).map(grp => (
          <button
            key={grp}
            onClick={() => {
              soundEngine.playClick();
              setSelectedGroup(grp);
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-black text-sm font-['Kufam'] transition border-2 ${
              selectedGroup === grp
                ? 'bg-gradient-to-r from-[#04774D] to-[#0AA771] border-[#F4B335] text-[#FFFAF3] shadow-lg'
                : 'bg-[#032810] border-[#04774D] text-[#9ED47D] hover:bg-[#04774D]/20'
            }`}
          >
            {language === 'ar' ? `المجموعة ${grp}` : `Group ${grp}`}
          </button>
        ))}
      </div>

      {/* Standings Table Card */}
      <div className="w-full max-w-4xl flex-1 z-10">
        <div className="bg-[#032810] border-2 border-[#04774D] rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-start">
              <thead>
                <tr className="border-b-2 border-[#04774D] text-[#9ED47D] font-mono text-[11px] sm:text-xs">
                  <th className="py-3 px-2 text-start">#</th>
                  <th className="py-3 px-3 text-start font-['Kufam']">{language === 'ar' ? 'المنتخب' : 'Team'}</th>
                  <th className="py-3 px-2 text-center" title="Played">لعب</th>
                  <th className="py-3 px-2 text-center" title="Won">فاز</th>
                  <th className="py-3 px-2 text-center" title="Drawn">تعادل</th>
                  <th className="py-3 px-2 text-center" title="Lost">خسر</th>
                  <th className="py-3 px-2 text-center" title="Goals For">له</th>
                  <th className="py-3 px-2 text-center" title="Goals Against">عليه</th>
                  <th className="py-3 px-2 text-center" title="Goal Difference">الفارق</th>
                  <th className="py-3 px-3 text-center font-bold text-[#F4B335]" title="Points">النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#04774D]/30">
                {standings.map((row, idx) => {
                  const team = TEAMS[row.teamId];
                  const isQualifyingZone = idx < 2;

                  return (
                    <tr
                      key={row.teamId}
                      className="hover:bg-white/5 transition"
                    >
                      <td className="py-3.5 px-2 font-mono">
                        <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold ${
                          isQualifyingZone
                            ? 'bg-[#0AA771] text-[#FFFAF3] shadow-md'
                            : 'text-gray-400 bg-white/5'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <TeamFlag teamId={row.teamId} size="md" />
                          <div className="flex flex-col">
                            <span className="font-black font-['Kufam'] text-[#FFFAF3]">
                              {team ? (language === 'ar' ? team.name_ar : team.name_en) : row.teamId}
                            </span>
                            <span className="text-[10px] text-[#9ED47D]">
                              {team?.shortCode}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono">{row.played}</td>
                      <td className="py-3.5 px-2 text-center font-mono">{row.won}</td>
                      <td className="py-3.5 px-2 text-center font-mono">{row.drawn}</td>
                      <td className="py-3.5 px-2 text-center font-mono">{row.lost}</td>
                      <td className="py-3.5 px-2 text-center font-mono text-[#9ED47D]">{row.goalsFor}</td>
                      <td className="py-3.5 px-2 text-center font-mono text-red-300">{row.goalsAgainst}</td>
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-[#F4B335]">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-black text-[#F4B335] text-base">
                        {row.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t border-[#04774D]/50 flex items-center justify-between text-xs text-[#9ED47D]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0AA771]" />
              <span>{language === 'ar' ? 'المركزان الأول والثاني يتأهلان مباشرة إلى الدور نصف النهائي' : '1st and 2nd place qualify directly to the Semi-Finals'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-16 pt-4" />
    </div>
  );
};
