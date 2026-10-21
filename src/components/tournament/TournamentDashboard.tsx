import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TEAMS, STADIUMS, OFFICIAL_SCHEDULE } from '../../data/tournamentData';
import { TeamFlag } from '../brand/TeamFlag';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { PatternBackground } from '../brand/PatternBackground';
import { soundEngine } from '../../utils/audio';
import { Trophy, Play, ArrowLeft, RotateCcw, Calendar, CheckCircle, Award, Settings as SettingsIcon, AlertCircle, Sparkles } from 'lucide-react';

export const TournamentDashboard: React.FC = () => {
  const {
    tournament,
    startNextTournamentMatch,
    resetTournament,
    setScreen,
    setIsSettingsOpen,
    language
  } = useGame();

  const [showResetModal, setShowResetModal] = useState(false);

  const playerTeam = TEAMS[tournament.playerTeamId] || TEAMS.ksa;
  const currentGroup = playerTeam.group;
  const currentStandings = currentGroup === 'A' ? tournament.standingsA : tournament.standingsB;

  // Has player completed all 3 group matches?
  const playerGroupFixtures = OFFICIAL_SCHEDULE.filter(
    m => m.matchNumber <= 12 && (m.homeTeamId === tournament.playerTeamId || m.awayTeamId === tournament.playerTeamId)
  );
  const playerGroupMatchesDone = playerGroupFixtures.every(m => tournament.completedMatches[m.matchNumber]);

  // Player's ranking in their group (0 = 1st, 1 = 2nd, 2 = 3rd, 3 = 4th)
  const playerRankInGroup = currentStandings.findIndex(s => s.teamId === tournament.playerTeamId);
  const isQualifiedFromGroup = playerGroupMatchesDone && playerRankInGroup >= 0 && playerRankInGroup <= 1;

  // Find next match to play
  let nextMatchNumber = 1;
  let nextMatchDetails: any = null;

  // 1. Check unplayed group fixtures for player's team
  for (let i = 1; i <= 12; i++) {
    if (!tournament.completedMatches[i]) {
      const fix = OFFICIAL_SCHEDULE.find(m => m.matchNumber === i);
      if (fix && (fix.homeTeamId === tournament.playerTeamId || fix.awayTeamId === tournament.playerTeamId)) {
        nextMatchNumber = i;
        nextMatchDetails = fix;
        break;
      }
    }
  }

  // 2. If group stage done and qualified: check semi-finals
  if (!nextMatchDetails && isQualifiedFromGroup) {
    if (tournament.semiFinal1 && (tournament.semiFinal1.homeId === tournament.playerTeamId || tournament.semiFinal1.awayId === tournament.playerTeamId)) {
      if (!tournament.completedMatches[13]) {
        nextMatchNumber = 13;
        nextMatchDetails = {
          matchNumber: 13,
          stage: 'semi',
          stageTitle_ar: 'نصف النهائي (مباراة 1)',
          stageTitle_en: 'Semi-Final 1',
          homeTeamId: tournament.semiFinal1.homeId,
          awayTeamId: tournament.semiFinal1.awayId,
          stadiumId: 'paf',
          date: '2026-10-03',
          time: '18:55',
          isPlayed: false
        };
      }
    } else if (tournament.semiFinal2 && (tournament.semiFinal2.homeId === tournament.playerTeamId || tournament.semiFinal2.awayId === tournament.playerTeamId)) {
      if (!tournament.completedMatches[14]) {
        nextMatchNumber = 14;
        nextMatchDetails = {
          matchNumber: 14,
          stage: 'semi',
          stageTitle_ar: 'نصف النهائي (مباراة 2)',
          stageTitle_en: 'Semi-Final 2',
          homeTeamId: tournament.semiFinal2.homeId,
          awayTeamId: tournament.semiFinal2.awayId,
          stadiumId: 'kasc',
          date: '2026-10-03',
          time: '21:30',
          isPlayed: false
        };
      }
    }
  }

  // 3. Check final
  if (!nextMatchDetails && tournament.finalMatch && !tournament.completedMatches[15]) {
    if (tournament.finalMatch.homeId === tournament.playerTeamId || tournament.finalMatch.awayId === tournament.playerTeamId) {
      nextMatchNumber = 15;
      nextMatchDetails = {
        matchNumber: 15,
        stage: 'final',
        stageTitle_ar: 'المباراة النهائية الكبرى',
        stageTitle_en: 'The Grand Final',
        homeTeamId: tournament.finalMatch.homeId,
        awayTeamId: tournament.finalMatch.awayId,
        stadiumId: 'kasc',
        date: '2026-10-06',
        time: '20:30',
        isPlayed: false
      };
    }
  }

  // Determine if player has been genuinely eliminated:
  const isEliminatedInGroups = playerGroupMatchesDone && playerRankInGroup >= 2;
  
  // Did player play and lose semi-final 1?
  const semi1Done = tournament.completedMatches[13];
  const playerInSemi1 = tournament.semiFinal1 && (tournament.semiFinal1.homeId === tournament.playerTeamId || tournament.semiFinal1.awayId === tournament.playerTeamId);
  const lostSemi1 = playerInSemi1 && semi1Done && (
    (tournament.semiFinal1?.homeId === tournament.playerTeamId && semi1Done.homeScore < semi1Done.awayScore) ||
    (tournament.semiFinal1?.awayId === tournament.playerTeamId && semi1Done.awayScore < semi1Done.homeScore)
  );

  // Did player play and lose semi-final 2?
  const semi2Done = tournament.completedMatches[14];
  const playerInSemi2 = tournament.semiFinal2 && (tournament.semiFinal2.homeId === tournament.playerTeamId || tournament.semiFinal2.awayId === tournament.playerTeamId);
  const lostSemi2 = playerInSemi2 && semi2Done && (
    (tournament.semiFinal2?.homeId === tournament.playerTeamId && semi2Done.homeScore < semi2Done.awayScore) ||
    (tournament.semiFinal2?.awayId === tournament.playerTeamId && semi2Done.awayScore < semi2Done.homeScore)
  );

  // Did player play and lose the final?
  const finalDone = tournament.completedMatches[15];
  const playerInFinal = tournament.finalMatch && (tournament.finalMatch.homeId === tournament.playerTeamId || tournament.finalMatch.awayId === tournament.playerTeamId);
  const lostFinal = playerInFinal && finalDone && tournament.championTeamId !== tournament.playerTeamId;

  const isPlayerEliminated = isEliminatedInGroups || lostSemi1 || lostSemi2 || lostFinal;

  const handleConfirmReset = () => {
    soundEngine.playWhistle();
    resetTournament();
    setShowResetModal(false);
    setScreen('team_select');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#032810] text-[#FFFAF3] flex flex-col justify-between items-center px-4 py-5 overflow-x-hidden">
      <PatternBackground opacity={0.06} />

      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10 mb-4">
        <button
          onClick={() => {
            soundEngine.playClick();
            setScreen('menu');
          }}
          className="px-3 py-1.5 rounded-xl bg-[#04774D]/40 hover:bg-[#04774D] text-[#FFFAF3] flex items-center gap-1.5 transition font-bold text-xs"
        >
          <ArrowLeft size={16} />
          <span>{language === 'ar' ? 'القائمة' : 'Menu'}</span>
        </button>

        <div className="flex items-center gap-2">
          <KhaleejiLogo variant="emblem" size="sm" />
          <h1 className="text-base sm:text-xl font-black font-['Kufam'] text-[#FFFAF3]">
            {language === 'ar' ? 'مشوار بطولة خليجي 27' : 'Khaleeji 27 Campaign'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsSettingsOpen(true);
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#04774D]/40 hover:bg-[#04774D] text-xs text-[#F4B335] flex items-center gap-1.5 transition font-bold"
            title={language === 'ar' ? 'الإعدادات والموسيقى' : 'Settings & Music'}
          >
            <SettingsIcon size={15} />
            <span className="hidden sm:inline">{language === 'ar' ? 'الإعدادات والموسيقى' : 'Settings'}</span>
          </button>

          {/* Reset Tournament Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowResetModal(true);
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-900/30 hover:bg-red-800/60 border border-red-700/50 text-xs text-red-300 flex items-center gap-1 transition font-bold"
            title={language === 'ar' ? 'إعادة ضبط مشوار البطولة' : 'Reset Career'}
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">{language === 'ar' ? 'إعادة البدء' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl flex-1 flex flex-col gap-6 z-10">
        {/* Qualification Congratulations Toast / Badge if qualified */}
        {isQualifiedFromGroup && !tournament.completedMatches[13] && !tournament.completedMatches[14] && (
          <div className="w-full rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#04774D] to-amber-500/20 border border-[#F4B335] p-3 shadow-lg flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F4B335] text-[#032810] flex items-center justify-center font-bold shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <span className="text-xs font-black font-['Kufam'] text-[#F4B335] block">
                  {language === 'ar'
                    ? `تهانينا! تأهل منتخب ${playerTeam.name_ar} رسمياً لنصف النهائي (${playerRankInGroup === 0 ? 'متصدر المجموعة' : 'وصيف المجموعة'})`
                    : `Congratulations! ${playerTeam.name_en} officially qualified for Semi-Finals (${playerRankInGroup === 0 ? '1st Place' : '2nd Place'})`}
                </span>
                <span className="text-[10px] text-[#FFFAF3]/80">
                  {language === 'ar' ? 'مجموع النقاط: ' + (currentStandings[playerRankInGroup]?.points || 7) + ' نقاط' : `Total Points: ${currentStandings[playerRankInGroup]?.points || 7} pts`}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#F4B335] text-[#032810] font-black text-xs font-['Kufam'] shrink-0">
              {language === 'ar' ? 'إلى نصف النهائي 🏆' : 'To Semi-Finals 🏆'}
            </span>
          </div>
        )}

        {/* Next Match Broadcast Banner */}
        {nextMatchDetails ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#04774D] via-[#0AA771] to-[#04774D] border-2 border-[#F4B335] p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col text-center md:text-start">
              <span className="text-xs font-black text-[#F4B335] uppercase tracking-widest font-['Noto_Sans']">
                {language === 'ar' ? nextMatchDetails.stageTitle_ar : nextMatchDetails.stageTitle_en} • MATCH {nextMatchDetails.matchNumber}
              </span>
              <div className="flex items-center gap-3 my-2 justify-center md:justify-start flex-wrap">
                {/* Player's Team */}
                <div className="flex items-center gap-2">
                  <TeamFlag teamId={tournament.playerTeamId} size="md" />
                  <span className="text-lg md:text-xl font-black font-['Kufam'] text-[#FFFAF3]">
                    {language === 'ar' ? TEAMS[tournament.playerTeamId]?.name_ar : TEAMS[tournament.playerTeamId]?.name_en}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#032810] border border-[#F4B335] text-[10px] font-bold text-[#F4B335]">
                    {language === 'ar' ? 'فريقك' : 'Your Team'}
                  </span>
                </div>

                <span className="text-sm font-black text-[#F4B335] px-1">VS</span>

                {/* Opponent Team */}
                {(() => {
                  const opponentId = nextMatchDetails.homeTeamId === tournament.playerTeamId 
                    ? nextMatchDetails.awayTeamId 
                    : nextMatchDetails.homeTeamId;
                  return (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#032810]/70 border border-[#9ED47D]/50 text-[10px] font-bold text-[#9ED47D]">
                        {language === 'ar' ? 'الخصم' : 'Opponent'}
                      </span>
                      <span className="text-lg md:text-xl font-black font-['Kufam'] text-[#FFFAF3]">
                        {language === 'ar' ? TEAMS[opponentId]?.name_ar : TEAMS[opponentId]?.name_en}
                      </span>
                      <TeamFlag teamId={opponentId} size="md" />
                    </div>
                  );
                })()}
              </div>
              <span className="text-xs text-[#FFFAF3]/80">
                {language === 'ar' ? STADIUMS[nextMatchDetails.stadiumId]?.name_ar : STADIUMS[nextMatchDetails.stadiumId]?.name_en} • {nextMatchDetails.time}
              </span>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                startNextTournamentMatch();
              }}
              className="py-3.5 px-8 rounded-2xl bg-[#F4B335] hover:bg-[#E5A122] text-[#032810] font-black font-['Kufam'] text-base shadow-xl flex items-center gap-2 transition hover:scale-105 active:scale-95"
            >
              <Play size={18} fill="#032810" />
              <span>
                {nextMatchDetails.stage === 'semi'
                  ? (language === 'ar' ? 'العب نصف النهائي الآن' : 'Play Semi-Final Now')
                  : nextMatchDetails.stage === 'final'
                  ? (language === 'ar' ? 'العب النهائي الكبير الآن' : 'Play Grand Final Now')
                  : (language === 'ar' ? 'العب المباراة الآن' : 'Play Match Now')}
              </span>
            </button>
          </div>
        ) : tournament.isCompleted ? (
          <div className="rounded-3xl bg-gradient-to-r from-[#04774D] to-[#032810] border-2 border-[#F4B335] p-6 text-center shadow-xl">
            <Trophy size={48} className="text-[#F4B335] mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl font-black font-['Kufam'] text-[#F4B335]">
              {language === 'ar' ? 'اختتام بطولة خليجي 27 بنجاح!' : 'Khaleeji 27 Concluded!'}
            </h2>
            <button
              onClick={() => setScreen('champion')}
              className="mt-3 px-6 py-2.5 rounded-xl bg-[#F4B335] text-[#032810] font-black font-['Kufam'] shadow-lg"
            >
              {language === 'ar' ? 'مشاهدة منصة التتويج' : 'View Trophy Presentation'}
            </button>
          </div>
        ) : isPlayerEliminated ? (
          <div className="rounded-3xl bg-red-950/50 border-2 border-red-500 p-6 text-center shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-xl font-black font-['Kufam'] text-[#FFFAF3]">
              {isEliminatedInGroups
                ? (language === 'ar' ? `ودّع منتخب ${playerTeam.name_ar} البطولة من دور المجموعات` : `${playerTeam.name_en} Eliminated from Group Stage`)
                : (language === 'ar' ? `انتهى مشوار منتخب ${playerTeam.name_ar} في البطولة` : `${playerTeam.name_en}'s Tournament Run has Ended`)}
            </h3>
            <p className="text-xs text-[#FFFAF3]/80 max-w-md mx-auto leading-relaxed">
              {isEliminatedInGroups
                ? (language === 'ar' ? `احتل الفريق المركز ${playerRankInGroup + 1} في المجموعة برصيد ${currentStandings[playerRankInGroup]?.points || 0} نقاط. يمكنك إعادة المحاولة مع أي منتخب خليجي آخر!` : `Finished ${playerRankInGroup + 1} in the group. You can restart anytime!`)
                : (language === 'ar' ? 'حظ أوفر في المحاولة القادمة، شكراً لأدائكم البطولي في خليجي 27.' : 'Good effort! You can restart your campaign anytime.')}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowResetModal(true)}
                className="py-3 px-6 rounded-2xl bg-[#F4B335] hover:bg-[#E5A122] text-[#032810] font-black font-['Kufam'] text-sm shadow-lg transition hover:scale-105 active:scale-95 inline-flex items-center gap-2"
              >
                <RotateCcw size={16} />
                <span>{language === 'ar' ? 'بدء مشوار بطولة جديد الآن' : 'Start New Campaign Now'}</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Dashboard Grid: Group Standings + Knockout Bracket */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Standings Table (7 cols on lg) */}
          <div className="lg:col-span-7 bg-[#032810] border border-[#04774D] rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0AA771]" />
                <h3 className="font-extrabold text-base font-['Kufam'] text-[#FFFAF3]">
                  {language === 'ar' ? `ترتيب المجموعة ${currentGroup}` : `Group ${currentGroup} Standings`}
                </h3>
              </div>
              <button
                onClick={() => setScreen('standings')}
                className="text-xs text-[#F4B335] hover:underline font-bold"
              >
                {language === 'ar' ? 'عرض المجموعتين ←' : 'View All Groups →'}
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-[#04774D]/60 text-[#9ED47D] font-mono">
                    <th className="py-2 px-2 text-start">#</th>
                    <th className="py-2 px-2 text-start font-['Kufam']">{language === 'ar' ? 'المنتخب' : 'Team'}</th>
                    <th className="py-2 px-1 text-center">P</th>
                    <th className="py-2 px-1 text-center">W</th>
                    <th className="py-2 px-1 text-center">D</th>
                    <th className="py-2 px-1 text-center">L</th>
                    <th className="py-2 px-1 text-center">GD</th>
                    <th className="py-2 px-2 text-center font-bold text-[#F4B335]">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#04774D]/30">
                  {currentStandings.map((row, idx) => {
                    const isUserTeam = row.teamId === playerTeam.id;
                    const isQualifyingZone = idx < 2;

                    return (
                      <tr
                        key={row.teamId}
                        className={`transition ${isUserTeam ? 'bg-[#04774D]/40 border-l-4 rtl:border-r-4 border-[#F4B335] font-bold' : 'hover:bg-white/5'}`}
                      >
                        <td className="py-2.5 px-2 font-mono">
                          <span className={`inline-block w-5 h-5 rounded-full text-center leading-5 text-[11px] ${
                            isQualifyingZone ? 'bg-[#0AA771] text-[#FFFAF3]' : 'text-gray-400'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <TeamFlag teamId={row.teamId} size="sm" />
                            <span className="font-['Kufam'] text-[#FFFAF3]">
                              {language === 'ar' ? TEAMS[row.teamId]?.name_ar : TEAMS[row.teamId]?.name_en}
                            </span>
                            {isUserTeam && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F4B335] text-[#032810] font-bold">
                                {language === 'ar' ? 'فريقك' : 'You'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-1 text-center font-mono">{row.played}</td>
                        <td className="py-2.5 px-1 text-center font-mono">{row.won}</td>
                        <td className="py-2.5 px-1 text-center font-mono">{row.drawn}</td>
                        <td className="py-2.5 px-1 text-center font-mono">{row.lost}</td>
                        <td className="py-2.5 px-1 text-center font-mono text-[#9ED47D]">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-black text-[#F4B335] text-sm">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-[#04774D]/40 flex items-center justify-between text-[11px] text-[#9ED47D]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0AA771]" />
                <span>{language === 'ar' ? 'المركزان 1 و 2 يتأهلان لنصف النهائي' : 'Top 2 qualify for Semi-Finals'}</span>
              </div>
            </div>
          </div>

          {/* Knockout Bracket Card (5 cols on lg) */}
          <div className="lg:col-span-5 bg-[#032810] border border-[#04774D] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={18} className="text-[#F4B335]" />
                <h3 className="font-extrabold text-base font-['Kufam'] text-[#FFFAF3]">
                  {language === 'ar' ? 'الأدوار الإقصائية (نصف النهائي والنهائي)' : 'Knockout Stages'}
                </h3>
              </div>

              {/* Semi Final 1 */}
              <div className="p-3 rounded-2xl bg-[#021A0A] border border-[#04774D]/70 mb-3">
                <span className="text-[10px] font-bold text-[#F4B335] uppercase">
                  {language === 'ar' ? 'نصف النهائي 1 (أول A ضد ثاني B)' : 'Semi-Final 1 (1st A vs 2nd B)'}
                </span>
                <div className="mt-2 flex items-center justify-between text-xs font-bold font-['Kufam']">
                  <div className="flex items-center gap-2">
                    {tournament.semiFinal1 ? (
                      <>
                        <TeamFlag teamId={tournament.semiFinal1.homeId} size="sm" />
                        <span className={tournament.semiFinal1.homeId === tournament.playerTeamId ? 'text-[#F4B335] font-black' : ''}>
                          {language === 'ar' ? TEAMS[tournament.semiFinal1.homeId]?.name_ar : TEAMS[tournament.semiFinal1.homeId]?.name_en}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">TBD (1st A)</span>
                    )}
                  </div>
                  <span className="font-mono text-[#F4B335]">
                    {tournament.completedMatches[13] ? `${tournament.completedMatches[13].homeScore} - ${tournament.completedMatches[13].awayScore}` : 'VS'}
                  </span>
                  <div className="flex items-center gap-2">
                    {tournament.semiFinal1 ? (
                      <>
                        <span className={tournament.semiFinal1.awayId === tournament.playerTeamId ? 'text-[#F4B335] font-black' : ''}>
                          {language === 'ar' ? TEAMS[tournament.semiFinal1.awayId]?.name_ar : TEAMS[tournament.semiFinal1.awayId]?.name_en}
                        </span>
                        <TeamFlag teamId={tournament.semiFinal1.awayId} size="sm" />
                      </>
                    ) : (
                      <span className="text-gray-400">TBD (2nd B)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Semi Final 2 */}
              <div className="p-3 rounded-2xl bg-[#021A0A] border border-[#04774D]/70 mb-3">
                <span className="text-[10px] font-bold text-[#F4B335] uppercase">
                  {language === 'ar' ? 'نصف النهائي 2 (أول B ضد ثاني A)' : 'Semi-Final 2 (1st B vs 2nd A)'}
                </span>
                <div className="mt-2 flex items-center justify-between text-xs font-bold font-['Kufam']">
                  <div className="flex items-center gap-2">
                    {tournament.semiFinal2 ? (
                      <>
                        <TeamFlag teamId={tournament.semiFinal2.homeId} size="sm" />
                        <span className={tournament.semiFinal2.homeId === tournament.playerTeamId ? 'text-[#F4B335] font-black' : ''}>
                          {language === 'ar' ? TEAMS[tournament.semiFinal2.homeId]?.name_ar : TEAMS[tournament.semiFinal2.homeId]?.name_en}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">TBD (1st B)</span>
                    )}
                  </div>
                  <span className="font-mono text-[#F4B335]">
                    {tournament.completedMatches[14] ? `${tournament.completedMatches[14].homeScore} - ${tournament.completedMatches[14].awayScore}` : 'VS'}
                  </span>
                  <div className="flex items-center gap-2">
                    {tournament.semiFinal2 ? (
                      <>
                        <span className={tournament.semiFinal2.awayId === tournament.playerTeamId ? 'text-[#F4B335] font-black' : ''}>
                          {language === 'ar' ? TEAMS[tournament.semiFinal2.awayId]?.name_ar : TEAMS[tournament.semiFinal2.awayId]?.name_en}
                        </span>
                        <TeamFlag teamId={tournament.semiFinal2.awayId} size="sm" />
                      </>
                    ) : (
                      <span className="text-gray-400">TBD (2nd A)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Final Match */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#04774D]/40 to-[#032810] border-2 border-[#F4B335]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#F4B335] uppercase tracking-wider">
                    {language === 'ar' ? 'المباراة النهائية - استاد الجوهرة' : 'The Grand Final • Jeddah'}
                  </span>
                  <Award size={15} className="text-[#F4B335]" />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-black font-['Kufam']">
                  <div className="flex items-center gap-2">
                    {tournament.finalMatch ? (
                      <>
                        <TeamFlag teamId={tournament.finalMatch.homeId} size="sm" />
                        <span className={tournament.finalMatch.homeId === tournament.playerTeamId ? 'text-[#F4B335]' : ''}>
                          {language === 'ar' ? TEAMS[tournament.finalMatch.homeId]?.name_ar : TEAMS[tournament.finalMatch.homeId]?.name_en}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">Finalist 1</span>
                    )}
                  </div>
                  <span className="font-mono text-[#F4B335]">
                    {tournament.completedMatches[15] ? `${tournament.completedMatches[15].homeScore} - ${tournament.completedMatches[15].awayScore}` : 'VS'}
                  </span>
                  <div className="flex items-center gap-2">
                    {tournament.finalMatch ? (
                      <>
                        <span className={tournament.finalMatch.awayId === tournament.playerTeamId ? 'text-[#F4B335]' : ''}>
                          {language === 'ar' ? TEAMS[tournament.finalMatch.awayId]?.name_ar : TEAMS[tournament.finalMatch.awayId]?.name_en}
                        </span>
                        <TeamFlag teamId={tournament.finalMatch.awayId} size="sm" />
                      </>
                    ) : (
                      <span className="text-gray-400">Finalist 2</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-[#9ED47D]">
              <button
                onClick={() => setScreen('schedule')}
                className="flex items-center gap-1.5 hover:text-[#FFFAF3] font-bold"
              >
                <Calendar size={14} />
                <span>{language === 'ar' ? 'عرض جدول المباريات الكامل (15)' : 'Full Fixtures List (15)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* In-UI Reset Confirmation Modal (Replacing window.confirm) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm rounded-3xl bg-[#032810] border-2 border-red-500/70 p-6 shadow-2xl text-center space-y-4 text-[#FFFAF3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center mx-auto">
              <RotateCcw size={24} />
            </div>

            <h3 className="text-lg font-black font-['Kufam'] text-[#FFFAF3]">
              {language === 'ar' ? 'إعادة ضبط مشوار البطولة؟' : 'Reset Tournament Career?'}
            </h3>

            <p className="text-xs text-[#FFFAF3]/80 leading-relaxed">
              {language === 'ar'
                ? 'هل أنت متأكد من رغبتك في مسح كافة النتائج الحالية والبدء من جديد مع اختيار فريق جديد؟'
                : 'Are you sure you want to reset all progress and start fresh with a new team selection?'}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
              >
                {language === 'ar' ? 'نعم، أعد البدء' : 'Yes, Reset Now'}
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFFAF3] text-xs font-bold transition"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
