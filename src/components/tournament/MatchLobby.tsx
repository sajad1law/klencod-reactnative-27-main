import React from 'react';
import { useGame } from '../../context/GameContext';
import { TEAMS, STADIUMS, OFFICIAL_SCHEDULE } from '../../data/tournamentData';
import { TeamFlag } from '../brand/TeamFlag';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { PatternBackground } from '../brand/PatternBackground';
import { soundEngine } from '../../utils/audio';
import { ArrowLeft, Play, MapPin, Clock, Calendar, Users, ShieldAlert } from 'lucide-react';

export const MatchLobby: React.FC = () => {
  const {
    homeTeamId,
    awayTeamId,
    currentStadiumId,
    activeMatchNumber,
    gameMode,
    settings,
    updateSettings,
    setScreen,
    language
  } = useGame();

  const homeTeam = TEAMS[homeTeamId] || TEAMS.ksa;
  const awayTeam = TEAMS[awayTeamId] || TEAMS.kwt;
  const stadium = STADIUMS[currentStadiumId] || STADIUMS.kasc;

  const matchFixture = activeMatchNumber
    ? OFFICIAL_SCHEDULE.find(m => m.matchNumber === activeMatchNumber)
    : null;

  const handleStartMatch = () => {
    soundEngine.playClick();
    soundEngine.playWhistle('kickoff');
    setScreen('match');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#032810] text-[#FFFAF3] flex flex-col justify-between items-center px-4 py-5 overflow-x-hidden">
      <PatternBackground opacity={0.07} />

      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 mb-4">
        <button
          onClick={() => {
            soundEngine.playClick();
            setScreen(gameMode === 'tournament' ? 'tournament_dashboard' : 'menu');
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#04774D]/40 hover:bg-[#04774D] text-[#FFFAF3] flex items-center gap-1.5 transition font-bold text-xs"
        >
          <ArrowLeft size={16} />
          <span>{language === 'ar' ? 'رجوع' : 'Back'}</span>
        </button>

        <KhaleejiLogo variant="horizontal" size="sm" />

        <div className="w-16" />
      </div>

      {/* Broadcast Pre-Match Banner */}
      <div className="w-full max-w-4xl z-10 flex flex-col items-center my-auto">
        {/* Match Header Tag */}
        <div className="mb-4 px-4 py-1 rounded-full bg-[#04774D] border border-[#F4B335] text-xs font-black font-['Noto_Sans'] text-[#F4B335] uppercase tracking-widest shadow-md">
          {matchFixture
            ? `${language === 'ar' ? matchFixture.stageTitle_ar : matchFixture.stageTitle_en} • MATCH ${matchFixture.matchNumber}`
            : language === 'ar' ? 'مباراة ودية - جدة 2026' : 'Exhibition Match • Jeddah 2026'}
        </div>

        {/* Cinematic Versus Card */}
        <div className="w-full bg-gradient-to-b from-[#04774D]/40 via-[#032810] to-[#021A0A] border-2 border-[#04774D] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle watermarked trophy in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <KhaleejiLogo variant="emblem" size="xl" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
            {/* Home Team (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center text-center">
              <div className="relative mb-3 group">
                <TeamFlag teamId={homeTeam.id} size="xl" className="shadow-2xl transition group-hover:scale-105" />
                <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#04774D] text-[#FFFAF3] text-[10px] font-bold border border-[#9ED47D]">
                  {language === 'ar' ? 'المستضيف' : 'Home'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-['Kufam'] text-[#FFFAF3]">
                {language === 'ar' ? homeTeam.name_ar : homeTeam.name_en}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs font-bold text-[#F4B335]">
                <span>{homeTeam.rating} OVR</span>
                <span>•</span>
                <span>{language === 'ar' ? `المجموعة ${homeTeam.group}` : `Group ${homeTeam.group}`}</span>
              </div>
            </div>

            {/* VS Emblem in Center (1 col) */}
            <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#04774D] to-[#F4B335] text-[#032810] flex items-center justify-center font-black font-['Kufam'] text-base shadow-lg border-2 border-[#FFFAF3]">
                VS
              </div>
            </div>

            {/* Away Team (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center text-center">
              <div className="relative mb-3 group">
                <TeamFlag teamId={awayTeam.id} size="xl" className="shadow-2xl transition group-hover:scale-105" />
                <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#8C2669] text-[#FFFAF3] text-[10px] font-bold border border-[#F4B335]">
                  {language === 'ar' ? 'الضيف' : 'Away'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-['Kufam'] text-[#FFFAF3]">
                {language === 'ar' ? awayTeam.name_ar : awayTeam.name_en}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs font-bold text-[#F4B335]">
                <span>{awayTeam.rating} OVR</span>
                <span>•</span>
                <span>{language === 'ar' ? `المجموعة ${awayTeam.group}` : `Group ${awayTeam.group}`}</span>
              </div>
            </div>
          </div>

          {/* Stadium & Time Metadata Bar */}
          <div className="mt-8 pt-6 border-t border-[#04774D]/50 flex flex-wrap items-center justify-around gap-4 text-xs text-[#9ED47D]">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#F4B335]" />
              <div className="flex flex-col">
                <span className="font-bold text-[#FFFAF3]">
                  {language === 'ar' ? stadium.name_ar : stadium.name_en}
                </span>
                <span className="text-[10px] text-[#9ED47D]">
                  {language === 'ar' ? `${stadium.city_ar} (${stadium.capacity.toLocaleString()} مشجع)` : `${stadium.city_en} (${stadium.capacity.toLocaleString()} Fans)`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#F4B335]" />
              <div className="flex flex-col">
                <span className="font-bold text-[#FFFAF3]">
                  {matchFixture ? matchFixture.date : '2026-09-23'}
                </span>
                <span className="text-[10px] text-[#9ED47D]">
                  {language === 'ar' ? 'كأس الخليج 27' : 'Khaleeji 27'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#F4B335]" />
              <div className="flex flex-col">
                <span className="font-bold text-[#FFFAF3]">
                  {matchFixture ? matchFixture.time : '21:00'} AST
                </span>
                <span className="text-[10px] text-[#9ED47D]">
                  {language === 'ar' ? 'توقيت مكة المكرمة' : 'Makkah Time'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Settings (Duration selection) */}
        <div className="mt-5 flex items-center gap-3">
          <span className="text-xs font-bold text-[#9ED47D]">
            {language === 'ar' ? 'مدة المباراة:' : 'Duration:'}
          </span>
          {[60, 120, 240].map(dur => (
            <button
              key={dur}
              onClick={() => {
                soundEngine.playClick();
                updateSettings({ durationSeconds: dur });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                settings.durationSeconds === dur
                  ? 'bg-[#F4B335] text-[#032810]'
                  : 'bg-[#04774D]/30 text-[#9ED47D] hover:bg-[#04774D]/60'
              }`}
            >
              {dur === 60 ? (language === 'ar' ? 'دقيقة (سريع)' : '1 Min') :
               dur === 120 ? (language === 'ar' ? 'دقيقتان (رسمي)' : '2 Mins') :
               (language === 'ar' ? '4 دقائق' : '4 Mins')}
            </button>
          ))}
        </div>

        {/* Kickoff CTA Button */}
        <div className="mt-6 w-full max-w-sm">
          <button
            onClick={handleStartMatch}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F4B335] to-[#E5A122] hover:brightness-110 text-[#032810] font-black text-lg font-['Kufam'] shadow-2xl flex items-center justify-center gap-3 transition hover:scale-105 active:scale-95"
          >
            <Play size={20} fill="#032810" />
            <span>{language === 'ar' ? 'صافرة البداية • انطلاق المباراة' : 'Kick Off • Start Match'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-xs text-[#9ED47D]/80 text-center z-10 pt-4">
        {language === 'ar' ? 'المملكة العربية السعودية 2026 • جدة غير' : 'Saudi Arabia 2026 • Jeddah Ghair'}
      </div>
    </div>
  );
};
