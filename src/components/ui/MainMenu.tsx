import React from 'react';
import { useGame } from '../../context/GameContext';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { PatternBackground, KhaleejiDecorativeCorner } from '../brand/PatternBackground';
import { soundEngine } from '../../utils/audio';
import {
  Trophy,
  Zap,
  Users,
  Target,
  Dumbbell,
  Calendar,
  ListOrdered,
  Settings as SettingsIcon,
  Play,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield
} from 'lucide-react';

export const MainMenu: React.FC = () => {
  const {
    setScreen,
    setGameMode,
    language,
    tournament,
    startPracticeMode,
    setIsSettingsOpen,
    devicePlatform
  } = useGame();

  const handleNav = (targetScreen: any, mode?: any) => {
    soundEngine.playClick();
    if (mode) setGameMode(mode);
    setScreen(targetScreen);
  };

  const isDesktop = devicePlatform === 'desktop';

  return (
    <div className="relative min-h-screen w-full bg-[#032810] text-[#FFFAF3] flex flex-col justify-between items-center px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
      {/* 12x12 Brand Pattern Background */}
      <PatternBackground opacity={0.06} />
      <KhaleejiDecorativeCorner position="top-right" />
      <KhaleejiDecorativeCorner position="bottom-left" />

      {/* Top Bar for Desktop */}
      {isDesktop ? (
        <div className="w-full max-w-5xl flex items-center justify-between z-10 mb-2">
          <div className="flex items-center gap-3">
            <KhaleejiLogo variant="emblem" size="sm" />
            <div className="flex flex-col text-start">
              <span className="text-xs font-extrabold text-[#F4B335] tracking-wider uppercase font-mono">
                Official Edition • Jeddah 2026
              </span>
              <span className="text-sm font-black font-['Kufam'] text-[#FFFAF3]">
                كأس الخليج العربي 27 - الإصدار المكتبي
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04774D]/30 hover:bg-[#04774D] border border-[#9ED47D]/40 text-[#FFFAF3] transition font-bold text-xs shadow-md group"
          >
            <SettingsIcon size={16} className="text-[#F4B335] group-hover:rotate-45 transition-transform duration-300" />
            <span>{language === 'ar' ? 'الإعدادات والمنصة' : 'Settings'}</span>
          </button>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="my-auto flex flex-col items-center text-center z-10 w-full">
        {isDesktop ? (
          /* ========================================================================= */
          /* 💻 DESKTOP TAILORED MENU: Wide 5XL Layout, Majestic Typography & 3-Col Grid */
          /* ========================================================================= */
          <div className="w-full max-w-5xl flex flex-col items-center">
            {/* Header / Brand Title */}
            <div className="mb-6 flex flex-col items-center">
              <KhaleejiLogo variant="vertical" size="lg" className="drop-shadow-2xl mb-1 scale-105" />
              <div className="flex items-center gap-2 text-xs font-bold text-[#9ED47D] mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#04774D]/60 border border-[#9ED47D]/30">
                  {language === 'ar' ? '8 منتخبات خليجية • 15 مباراة رسمية' : '8 Gulf Teams • 15 Official Fixtures'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#04774D]/60 border border-[#9ED47D]/30 text-[#F4B335]">
                  {language === 'ar' ? 'استاد الجوهرة المشعة' : 'King Abdullah Sports City'}
                </span>
              </div>
            </div>

            {/* Featured Tournament Hero Card */}
            <div className="w-full mb-5">
              <button
                onClick={() => handleNav(tournament.completedMatches[1] ? 'tournament_dashboard' : 'team_select', 'tournament')}
                className="w-full group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-[#04774D] via-[#088c5c] to-[#032810] border-2 border-[#F4B335] shadow-[0_12px_36px_rgba(4,119,77,0.45)] hover:shadow-[0_16px_48px_rgba(244,179,53,0.35)] transition-all duration-300 flex items-center justify-between text-start hover:scale-[1.01]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#032810]/60 border-2 border-[#F4B335] flex items-center justify-center text-[#F4B335] shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                    <Trophy size={34} className="animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black font-['Kufam'] text-[#FFFAF3] group-hover:text-[#F4B335] transition">
                        {language === 'ar' ? 'البطولة الرسمية (خليجي 27)' : 'Official Khaleeji 27 Tournament'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#F4B335] text-[#032810] text-[11px] font-black uppercase tracking-wider">
                        {tournament.completedMatches[1] ? (language === 'ar' ? 'جارية' : 'In Progress') : (language === 'ar' ? 'النمط الرئيسي' : 'Premier Mode')}
                      </span>
                    </div>
                    <span className="text-sm text-[#FFFAF3]/85 mt-1">
                      {tournament.completedMatches[1]
                        ? (language === 'ar' ? 'متابعة جدول المباريات ومرحلة الحسم للتتويج باللقب' : 'Resume tournament campaign and fight for the trophy')
                        : (language === 'ar' ? 'اختر منتخبك المفضل، وخض دور المجموعات ونصف النهائي والنهائي الكبير في جدة' : 'Select your Gulf team, conquer the groups, semis, and grand final in Jeddah')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F4B335] text-[#032810] font-black font-['Kufam'] text-sm shadow-lg group-hover:bg-[#FFD166] transition shrink-0">
                  <span>{tournament.completedMatches[1] ? (language === 'ar' ? 'متابعة البطولة' : 'Resume') : (language === 'ar' ? 'ابدأ البطولة الآن' : 'Start Tournament')}</span>
                  {language === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </div>
              </button>
            </div>

            {/* 6 Desktop Secondary Cards Grid (3 Columns) */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {/* 1. Quick Match */}
              <button
                onClick={() => handleNav('team_select', 'quick')}
                className="p-5 rounded-2xl bg-[#032810]/85 hover:bg-[#04774D]/30 border border-[#04774D] hover:border-[#9ED47D] transition-all duration-200 flex flex-col items-start gap-3 group shadow-lg text-start hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#04774D]/50 border border-[#9ED47D]/30 flex items-center justify-center text-[#9ED47D] group-hover:text-[#F4B335] transition">
                  <Zap size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base font-['Kufam'] text-[#FFFAF3] group-hover:text-[#F4B335] transition">
                    {language === 'ar' ? 'مباراة ودية سريعة' : 'Quick Match'}
                  </span>
                  <span className="text-xs text-[#9ED47D] mt-0.5">
                    {language === 'ar' ? 'مواجهة مباشرة ضد الذكاء الاصطناعي مع حرية اختيار الاستاد' : 'Play a single match against AI with custom stadium selection'}
                  </span>
                </div>
              </button>

              {/* 2. Play With Friends */}
              <button
                onClick={() => handleNav('team_select', 'multiplayer')}
                className="p-5 rounded-2xl bg-[#032810]/85 hover:bg-[#04774D]/30 border border-[#04774D] hover:border-[#9ED47D] transition-all duration-200 flex flex-col items-start gap-3 group shadow-lg text-start hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#04774D]/50 border border-[#9ED47D]/30 flex items-center justify-center text-[#9ED47D] group-hover:text-[#F4B335] transition">
                  <Users size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base font-['Kufam'] text-[#FFFAF3] group-hover:text-[#F4B335] transition">
                    {language === 'ar' ? 'العب مع أصدقائك' : 'Local 2 Players'}
                  </span>
                  <span className="text-xs text-[#9ED47D] mt-0.5">
                    {language === 'ar' ? 'مباراة ثنائية حماسية بين لاعبين على نفس الشاشة بالتناوب' : 'Head-to-head turn-based local match on one device'}
                  </span>
                </div>
              </button>

              {/* 3. Penalty Shootout */}
              <button
                onClick={() => handleNav('team_select', 'penalties')}
                className="p-5 rounded-2xl bg-[#032810]/85 hover:bg-[#04774D]/30 border border-[#04774D] hover:border-[#9ED47D] transition-all duration-200 flex flex-col items-start gap-3 group shadow-lg text-start hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#04774D]/50 border border-[#9ED47D]/30 flex items-center justify-center text-[#9ED47D] group-hover:text-[#F4B335] transition">
                  <Target size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base font-['Kufam'] text-[#FFFAF3] group-hover:text-[#F4B335] transition">
                    {language === 'ar' ? 'ركلات الترجيح' : 'Penalty Shootout'}
                  </span>
                  <span className="text-xs text-[#9ED47D] mt-0.5">
                    {language === 'ar' ? 'تحدي الحسم والأعصاب وتسديد الركلات والتحكم بالحارس' : 'Sudden death shootout with goalkeeper control & power kicks'}
                  </span>
                </div>
              </button>

              {/* 4. Practice Mode */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  startPracticeMode('ksa');
                }}
                className="p-5 rounded-2xl bg-[#032810]/85 hover:bg-[#04774D]/30 border border-[#04774D] hover:border-[#9ED47D] transition-all duration-200 flex flex-col items-start gap-3 group shadow-lg text-start hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#04774D]/50 border border-[#9ED47D]/30 flex items-center justify-center text-[#9ED47D] group-hover:text-[#F4B335] transition">
                  <Dumbbell size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base font-['Kufam'] text-[#FFFAF3] group-hover:text-[#F4B335] transition">
                    {language === 'ar' ? 'ملعب التدريب الحر' : 'Training Ground'}
                  </span>
                  <span className="text-xs text-[#9ED47D] mt-0.5">
                    {language === 'ar' ? 'تدريب فردي بدون مؤقت لاحتراف زوايا الارتداد وقوة التسديد' : 'Free sandbox to hone bounce angles and shooting precision'}
                  </span>
                </div>
              </button>

              {/* 5. Schedule */}
              <button
                onClick={() => handleNav('schedule')}
                className="p-5 rounded-2xl bg-[#032810]/85 hover:bg-[#04774D]/30 border border-[#04774D] hover:border-[#9ED47D] transition-all duration-200 flex flex-col items-start gap-3 group shadow-lg text-start hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#04774D]/50 border border-[#9ED47D]/30 flex items-center justify-center text-[#9ED47D] group-hover:text-[#F4B335] transition">
                  <Calendar size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base font-['Kufam'] text-[#FFFAF3] group-hover:text-[#F4B335] transition">
                    {language === 'ar' ? 'جدول مباريات البطولة' : 'Official Fixtures'}
                  </span>
                  <span className="text-xs text-[#9ED47D] mt-0.5">
                    {language === 'ar' ? 'استعراض الـ 15 مباراة والمواعيد الرسمية وملاعب البطولة' : 'Browse all 15 official matches, stadium venues and dates'}
                  </span>
                </div>
              </button>

              {/* 6. Standings */}
              <button
                onClick={() => handleNav('standings')}
                className="p-5 rounded-2xl bg-[#032810]/85 hover:bg-[#04774D]/30 border border-[#04774D] hover:border-[#9ED47D] transition-all duration-200 flex flex-col items-start gap-3 group shadow-lg text-start hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#04774D]/50 border border-[#9ED47D]/30 flex items-center justify-center text-[#9ED47D] group-hover:text-[#F4B335] transition">
                  <ListOrdered size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base font-['Kufam'] text-[#FFFAF3] group-hover:text-[#F4B335] transition">
                    {language === 'ar' ? 'ترتيب المجموعات' : 'Tournament Standings'}
                  </span>
                  <span className="text-xs text-[#9ED47D] mt-0.5">
                    {language === 'ar' ? 'جدول النقاط وفارق الأهداف للمجموعتين A و B' : 'Live points, goal differences, and qualification status'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 📱 MOBILE TAILORED MENU: Ultra Compact, Zero Text Overflow, Thumb Ready   */
          /* ========================================================================= */
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Mobile Brand Emblem */}
            <div className="mb-4 flex flex-col items-center">
              <KhaleejiLogo variant="vertical" size="md" className="drop-shadow-xl scale-95" />
            </div>

            {/* Mobile Tournament Banner Button */}
            <button
              onClick={() => handleNav(tournament.completedMatches[1] ? 'tournament_dashboard' : 'team_select', 'tournament')}
              className="w-full mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#04774D] via-[#0AA771] to-[#04774D] border-2 border-[#F4B335] shadow-[0_6px_20px_rgba(4,119,77,0.4)] active:scale-95 transition flex items-center justify-between text-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#032810]/50 border border-[#F4B335] flex items-center justify-center text-[#F4B335] shrink-0">
                  <Trophy size={20} className="animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black font-['Kufam'] text-[#FFFAF3] leading-tight">
                    {language === 'ar' ? 'البطولة الرسمية' : 'Official Tournament'}
                  </span>
                  <span className="text-[11px] text-[#9ED47D] leading-tight mt-0.5">
                    {tournament.completedMatches[1]
                      ? (language === 'ar' ? 'متابعة مشوار البطولة' : 'Continue Campaign')
                      : (language === 'ar' ? 'تنافس على اللقب الخليجي' : 'Fight for Gulf Trophy')}
                  </span>
                </div>
              </div>
              <span className="text-base text-[#F4B335] font-bold shrink-0">
                {language === 'ar' ? '←' : '→'}
              </span>
            </button>

            {/* Mobile 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {/* Quick Match */}
              <button
                onClick={() => handleNav('team_select', 'quick')}
                className="p-3 rounded-xl bg-[#032810]/90 active:bg-[#04774D]/40 border border-[#04774D] transition flex flex-col items-start gap-1.5 shadow-sm text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-[#04774D]/50 flex items-center justify-center text-[#9ED47D]">
                  <Zap size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs font-['Kufam'] text-[#FFFAF3] leading-tight">
                    {language === 'ar' ? 'مباراة سريعة' : 'Quick Match'}
                  </span>
                  <span className="text-[10px] text-[#9ED47D]/85 mt-0.5 leading-tight">
                    {language === 'ar' ? 'ضد الكمبيوتر' : 'vs AI Opponent'}
                  </span>
                </div>
              </button>

              {/* 2 Players */}
              <button
                onClick={() => handleNav('team_select', 'multiplayer')}
                className="p-3 rounded-xl bg-[#032810]/90 active:bg-[#04774D]/40 border border-[#04774D] transition flex flex-col items-start gap-1.5 shadow-sm text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-[#04774D]/50 flex items-center justify-center text-[#9ED47D]">
                  <Users size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs font-['Kufam'] text-[#FFFAF3] leading-tight">
                    {language === 'ar' ? 'مع أصدقائك' : 'With Friends'}
                  </span>
                  <span className="text-[10px] text-[#9ED47D]/85 mt-0.5 leading-tight">
                    {language === 'ar' ? 'لاعبان على جهازك' : '2 Players Same Device'}
                  </span>
                </div>
              </button>

              {/* Penalty */}
              <button
                onClick={() => handleNav('team_select', 'penalties')}
                className="p-3 rounded-xl bg-[#032810]/90 active:bg-[#04774D]/40 border border-[#04774D] transition flex flex-col items-start gap-1.5 shadow-sm text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-[#04774D]/50 flex items-center justify-center text-[#9ED47D]">
                  <Target size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs font-['Kufam'] text-[#FFFAF3] leading-tight">
                    {language === 'ar' ? 'ركلات الترجيح' : 'Penalties'}
                  </span>
                  <span className="text-[10px] text-[#9ED47D]/85 mt-0.5 leading-tight">
                    {language === 'ar' ? 'تحدي الحسم والأعصاب' : 'Sudden Death'}
                  </span>
                </div>
              </button>

              {/* Practice */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  startPracticeMode('ksa');
                }}
                className="p-3 rounded-xl bg-[#032810]/90 active:bg-[#04774D]/40 border border-[#04774D] transition flex flex-col items-start gap-1.5 shadow-sm text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-[#04774D]/50 flex items-center justify-center text-[#9ED47D]">
                  <Dumbbell size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs font-['Kufam'] text-[#FFFAF3] leading-tight">
                    {language === 'ar' ? 'التدريب' : 'Practice'}
                  </span>
                  <span className="text-[10px] text-[#9ED47D]/85 mt-0.5 leading-tight">
                    {language === 'ar' ? 'تطوير التسديد' : 'Free Training'}
                  </span>
                </div>
              </button>

              {/* Schedule */}
              <button
                onClick={() => handleNav('schedule')}
                className="p-3 rounded-xl bg-[#032810]/90 active:bg-[#04774D]/40 border border-[#04774D] transition flex flex-col items-start gap-1.5 shadow-sm text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-[#04774D]/50 flex items-center justify-center text-[#9ED47D]">
                  <Calendar size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs font-['Kufam'] text-[#FFFAF3] leading-tight">
                    {language === 'ar' ? 'جدول المباريات' : 'Fixtures'}
                  </span>
                  <span className="text-[10px] text-[#9ED47D]/85 mt-0.5 leading-tight">
                    {language === 'ar' ? '15 مباراة رسمية' : '15 Matches in Jeddah'}
                  </span>
                </div>
              </button>

              {/* Standings */}
              <button
                onClick={() => handleNav('standings')}
                className="p-3 rounded-xl bg-[#032810]/90 active:bg-[#04774D]/40 border border-[#04774D] transition flex flex-col items-start gap-1.5 shadow-sm text-start"
              >
                <div className="w-7 h-7 rounded-lg bg-[#04774D]/50 flex items-center justify-center text-[#9ED47D]">
                  <ListOrdered size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs font-['Kufam'] text-[#FFFAF3] leading-tight">
                    {language === 'ar' ? 'جدول الترتيب' : 'Standings'}
                  </span>
                  <span className="text-[10px] text-[#9ED47D]/85 mt-0.5 leading-tight">
                    {language === 'ar' ? 'المجموعتان A و B' : 'Groups A & B'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Clean Settings Access */}
      <div className={`w-full ${isDesktop ? 'max-w-5xl' : 'max-w-sm'} flex items-center justify-between pt-3 border-t border-[#04774D]/30 z-10 text-xs mt-3`}>
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsSettingsOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#04774D]/30 hover:bg-[#04774D]/60 border border-[#04774D] text-[#FFFAF3] transition font-bold"
        >
          <SettingsIcon size={15} className="text-[#F4B335]" />
          <span>{language === 'ar' ? 'الإعدادات والخيارات' : 'Settings & Options'}</span>
        </button>

        <div className="flex items-center gap-2 text-[10px] text-[#9ED47D] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0AA771]" />
          <span>{isDesktop ? 'DESKTOP 1080p' : 'MOBILE UI'}</span>
        </div>
      </div>
    </div>
  );
};
