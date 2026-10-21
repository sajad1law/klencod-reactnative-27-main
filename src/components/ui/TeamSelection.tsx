import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TEAMS } from '../../data/tournamentData';
import { TeamFlag } from '../brand/TeamFlag';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { PatternBackground } from '../brand/PatternBackground';
import { soundEngine } from '../../utils/audio';
import { ArrowLeft, Check, Shield, Zap, Sparkles } from 'lucide-react';

export const TeamSelection: React.FC = () => {
  const {
    gameMode,
    startTournament,
    startQuickMatch,
    startLocalMultiplayer,
    startPenaltyMode,
    setScreen,
    language
  } = useGame();

  const [selectedHomeId, setSelectedHomeId] = useState<string>('ksa');
  const [selectedAwayId, setSelectedAwayId] = useState<string>('kwt');
  const [activeTab, setActiveTab] = useState<'home' | 'away'>('home');
  const [groupFilter, setGroupFilter] = useState<'ALL' | 'A' | 'B'>('ALL');

  const teamsList = Object.values(TEAMS).filter(t => {
    if (groupFilter === 'ALL') return true;
    return t.group === groupFilter;
  });

  const selectedTeam = TEAMS[activeTab === 'home' ? selectedHomeId : selectedAwayId] || TEAMS.ksa;

  const handleSelectTeam = (teamId: string) => {
    soundEngine.playClick();
    if (gameMode === 'tournament') {
      setSelectedHomeId(teamId);
    } else {
      if (activeTab === 'home') {
        setSelectedHomeId(teamId);
        // Automatically prompt to select away team if same
        if (teamId === selectedAwayId) {
          const alternate = Object.keys(TEAMS).find(id => id !== teamId) || 'irq';
          setSelectedAwayId(alternate);
        }
      } else {
        setSelectedAwayId(teamId);
      }
    }
  };

  const handleProceed = () => {
    soundEngine.playClick();
    if (gameMode === 'tournament') {
      startTournament(selectedHomeId);
    } else if (gameMode === 'quick') {
      startQuickMatch(selectedHomeId, selectedAwayId);
    } else if (gameMode === 'multiplayer') {
      startLocalMultiplayer(selectedHomeId, selectedAwayId);
    } else if (gameMode === 'penalties') {
      startPenaltyMode(selectedHomeId, selectedAwayId);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#032810] text-[#FFFAF3] flex flex-col justify-between items-center px-4 py-5 overflow-x-hidden">
      <PatternBackground opacity={0.06} />

      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10 mb-4">
        <button
          onClick={() => {
            soundEngine.playClick();
            setScreen('menu');
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#04774D]/40 hover:bg-[#04774D] text-[#FFFAF3] flex items-center gap-1.5 transition font-bold text-xs"
        >
          <ArrowLeft size={16} />
          <span>{language === 'ar' ? 'الرئيسية' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2">
          <KhaleejiLogo variant="emblem" size="sm" />
          <h1 className="text-base sm:text-xl font-black font-['Kufam'] text-[#FFFAF3]">
            {gameMode === 'tournament'
              ? language === 'ar' ? 'اختر منتخبك للبطولة' : 'Choose Your Tournament Team'
              : language === 'ar' ? 'اختيار الفرق' : 'Select Teams'}
          </h1>
        </div>

        <div className="w-16" /> {/* spacer */}
      </div>

      {/* Selector Tabs (if multi-team mode) */}
      {gameMode !== 'tournament' && (
        <div className="w-full max-w-md flex items-center justify-center gap-2 z-10 mb-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 border ${
              activeTab === 'home'
                ? 'bg-[#04774D] border-[#F4B335] text-[#FFFAF3] shadow-lg'
                : 'bg-[#032810] border-[#04774D] text-[#9ED47D]'
            }`}
          >
            <TeamFlag teamId={selectedHomeId} size="sm" />
            <span>{language === 'ar' ? 'الفريق الأول (المستضيف)' : 'Team 1 (Home)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('away')}
            className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 border ${
              activeTab === 'away'
                ? 'bg-[#8C2669] border-[#F4B335] text-[#FFFAF3] shadow-lg'
                : 'bg-[#032810] border-[#04774D] text-[#9ED47D]'
            }`}
          >
            <TeamFlag teamId={selectedAwayId} size="sm" />
            <span>{language === 'ar' ? 'الفريق الثاني (الضيف)' : 'Team 2 (Away)'}</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-5xl flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 items-start">
        {/* Left / Grid of Collectible Team Cards (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Group Filter Pills */}
          <div className="flex items-center gap-2">
            {(['ALL', 'A', 'B'] as const).map(grp => (
              <button
                key={grp}
                onClick={() => {
                  soundEngine.playClick();
                  setGroupFilter(grp);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  groupFilter === grp
                    ? 'bg-[#F4B335] text-[#032810]'
                    : 'bg-[#04774D]/30 text-[#9ED47D] hover:bg-[#04774D]/60'
                }`}
              >
                {grp === 'ALL'
                  ? language === 'ar' ? 'جميع المنتخبات (8)' : 'All Teams (8)'
                  : language === 'ar' ? `المجموعة ${grp}` : `Group ${grp}`}
              </button>
            ))}
          </div>

          {/* Collectible Team Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {teamsList.map(t => {
              const isSelected = (activeTab === 'home' && selectedHomeId === t.id) ||
                (activeTab === 'away' && selectedAwayId === t.id);

              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTeam(t.id)}
                  className={`relative p-3 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col items-center text-center border-2 group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#04774D] to-[#032810] border-[#F4B335] shadow-[0_0_16px_rgba(244,179,53,0.4)] scale-[1.03]'
                      : 'bg-[#032810]/80 hover:bg-[#04774D]/20 border-[#04774D]/60 hover:border-[#9ED47D]'
                  }`}
                >
                  {/* Selected check badge */}
                  {isSelected && (
                    <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-[#F4B335] text-[#032810] flex items-center justify-center font-bold shadow-md">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  {/* Group Tag */}
                  <span className="self-start text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-[#9ED47D]">
                    {language === 'ar' ? `مجموعة ${t.group}` : `Grp ${t.group}`}
                  </span>

                  {/* Flag with Official Holding Shape */}
                  <div className="my-2.5">
                    <TeamFlag teamId={t.id} size="lg" />
                  </div>

                  {/* Team Name */}
                  <span className="font-extrabold text-sm font-['Kufam'] text-[#FFFAF3]">
                    {language === 'ar' ? t.name_ar : t.name_en}
                  </span>

                  {/* Rating Stars or Value */}
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-[#F4B335] font-bold">
                    <Sparkles size={11} />
                    <span>{t.rating} OVR</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right / Selected Team Showcase Card (5 cols on lg) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#04774D]/30 to-[#032810] border-2 border-[#04774D] rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#04774D]/50 pb-3 mb-4">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#F4B335] uppercase tracking-wider">
                  {language === 'ar' ? 'بطاقة المنتخب الخليجي' : 'Gulf Team Profile'}
                </span>
                <span className="text-2xl font-black font-['Kufam'] text-[#FFFAF3]">
                  {language === 'ar' ? selectedTeam.name_ar : selectedTeam.name_en}
                </span>
              </div>
              <TeamFlag teamId={selectedTeam.id} size="xl" />
            </div>

            <p className="text-xs text-[#9ED47D] leading-relaxed mb-5 font-['Noto_Sans']">
              {language === 'ar' ? selectedTeam.description_ar : selectedTeam.description_en}
            </p>

            {/* Team Attributes Bar Breakdown */}
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1 text-[#FFFAF3]">
                  <span className="flex items-center gap-1 font-['Kufam']">
                    <Zap size={13} className="text-[#F4B335]" />
                    {language === 'ar' ? 'الهجوم' : 'Attack'}
                  </span>
                  <span className="font-bold text-[#F4B335]">{selectedTeam.attack}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0AA771] to-[#F4B335] rounded-full transition-all duration-500"
                    style={{ width: `${selectedTeam.attack}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[#FFFAF3]">
                  <span className="flex items-center gap-1 font-['Kufam']">
                    <Shield size={13} className="text-[#9ED47D]" />
                    {language === 'ar' ? 'الدفاع' : 'Defense'}
                  </span>
                  <span className="font-bold text-[#9ED47D]">{selectedTeam.defense}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#04774D] to-[#9ED47D] rounded-full transition-all duration-500"
                    style={{ width: `${selectedTeam.defense}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[#FFFAF3]">
                  <span className="flex items-center gap-1 font-['Kufam']">
                    <Zap size={13} className="text-[#BDF0F0]" />
                    {language === 'ar' ? 'السرعة والمهارة' : 'Speed & Pace'}
                  </span>
                  <span className="font-bold text-[#BDF0F0]">{selectedTeam.speed}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2E73E5] to-[#BDF0F0] rounded-full transition-all duration-500"
                    style={{ width: `${selectedTeam.speed}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-8">
            <button
              onClick={handleProceed}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F4B335] to-[#E5A122] hover:brightness-110 text-[#032810] font-black text-base font-['Kufam'] shadow-xl transition flex items-center justify-center gap-2"
            >
              <span>
                {gameMode === 'tournament'
                  ? language === 'ar' ? 'تأكيد ودخول البطولة' : 'Confirm & Enter Tournament'
                  : language === 'ar' ? 'الانتقال إلى الملعب' : 'Proceed to Stadium'}
              </span>
              <span>{language === 'ar' ? '←' : '→'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
