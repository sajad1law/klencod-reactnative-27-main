import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TOURNAMENT_PLAYLIST } from '../audio/TournamentMusicPlayer';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Globe,
  Clock,
  Volume1,
  X,
  ListMusic,
  Check,
  AlertTriangle,
  Music,
  Flame,
  Smartphone,
  Monitor
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    language,
    setLanguage,
    settings,
    updateSettings,
    resetTournament,
    setScreen,
    tournament,
    devicePlatform,
    setDevicePlatform
  } = useGame();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'audio' | 'tournament' | 'match'>('audio');

  if (!isOpen) return null;

  const currentTrackIndex = settings.currentTrackIndex ?? 0;

  const handleSelectTrack = (index: number) => {
    soundEngine.playClick();
    updateSettings({ currentTrackIndex: index, musicEnabled: true });
    window.dispatchEvent(
      new CustomEvent('khaleeji_music_cmd', {
        detail: { action: 'select', payload: index }
      })
    );
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value, 10);
    updateSettings({ musicVolume: vol, musicEnabled: vol > 0 });
    window.dispatchEvent(
      new CustomEvent('khaleeji_music_cmd', {
        detail: { action: 'setVolume', payload: vol }
      })
    );
  };

  const handleToggleMute = () => {
    soundEngine.playClick();
    const newVol = settings.musicVolume === 0 ? 70 : 0;
    updateSettings({ musicVolume: newVol, musicEnabled: newVol > 0 });
    window.dispatchEvent(
      new CustomEvent('khaleeji_music_cmd', {
        detail: { action: 'setVolume', payload: newVol }
      })
    );
  };

  const handleConfirmReset = () => {
    soundEngine.playWhistle();
    resetTournament();
    setShowResetConfirm(false);
    onClose();
    setScreen('team_select');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#032810] via-[#021A0A] to-[#011206] border-2 border-[#04774D] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-[#FFFAF3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#04774D]/50 bg-[#04774D]/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F4B335] text-[#032810] flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg font-black font-['Kufam'] text-[#FFFAF3]">
                {language === 'ar' ? 'إعدادات خليجي 27' : 'Khaleeji 27 Settings'}
              </h2>
              <p className="text-[11px] text-[#9ED47D]">
                {language === 'ar' ? 'الموسيقى، مشوار البطولة، وخيارات اللعبة' : 'Music, Career Mode, & Game Options'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FFFAF3] flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#04774D]/40 bg-[#032810]">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-3 px-2 text-xs font-bold font-['Kufam'] flex items-center justify-center gap-1.5 transition border-b-2 ${
              activeTab === 'audio'
                ? 'border-[#F4B335] text-[#F4B335] bg-[#04774D]/30'
                : 'border-transparent text-[#9ED47D] hover:text-white'
            }`}
          >
            <Music size={15} />
            <span>{language === 'ar' ? 'موسيقى البطولة' : 'Music Player'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tournament')}
            className={`flex-1 py-3 px-2 text-xs font-bold font-['Kufam'] flex items-center justify-center gap-1.5 transition border-b-2 ${
              activeTab === 'tournament'
                ? 'border-[#F4B335] text-[#F4B335] bg-[#04774D]/30'
                : 'border-transparent text-[#9ED47D] hover:text-white'
            }`}
          >
            <RotateCcw size={15} />
            <span>{language === 'ar' ? 'مشوار البطولة' : 'Tournament'}</span>
          </button>

          <button
            onClick={() => setActiveTab('match')}
            className={`flex-1 py-3 px-2 text-xs font-bold font-['Kufam'] flex items-center justify-center gap-1.5 transition border-b-2 ${
              activeTab === 'match'
                ? 'border-[#F4B335] text-[#F4B335] bg-[#04774D]/30'
                : 'border-transparent text-[#9ED47D] hover:text-white'
            }`}
          >
            <Globe size={15} />
            <span>{language === 'ar' ? 'اللغة والخيارات' : 'Language & Options'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: MUSIC PLAYER */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Volume Slider */}
              <div className="rounded-2xl bg-[#032810]/60 border border-[#04774D] p-4 flex items-center gap-3">
                <button
                  onClick={handleToggleMute}
                  className="w-8 h-8 rounded-lg bg-[#04774D]/40 hover:bg-[#04774D] text-[#F4B335] flex items-center justify-center transition shrink-0"
                >
                  {settings.musicVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold text-[#9ED47D]">
                    <span>{language === 'ar' ? 'مستوى صوت الموسيقى' : 'Music Volume'}</span>
                    <span>{settings.musicVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.musicVolume}
                    onChange={handleVolumeChange}
                    className="w-full accent-[#F4B335] h-1.5 bg-[#04774D]/50 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Full Playlist Selection */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-[#F4B335]">
                  <ListMusic size={15} />
                  <span>{language === 'ar' ? 'قائمة أغاني البطولة الرسمية (تشغيل تلقائي متكرر)' : 'Official Tournament Playlist (Continuous Loop)'}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {TOURNAMENT_PLAYLIST.map((track, idx) => {
                    const isSelected = idx === currentTrackIndex;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(idx)}
                        className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition text-start border ${
                          isSelected
                            ? 'bg-[#04774D] border-[#F4B335] text-[#FFFAF3] shadow-md'
                            : 'bg-[#032810]/40 border-[#04774D]/50 hover:bg-[#04774D]/20 text-[#9ED47D]'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                              isSelected
                                ? 'bg-[#F4B335] text-[#032810]'
                                : 'bg-[#04774D]/40 text-[#9ED47D]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="flex flex-col truncate">
                            <span className="font-bold text-xs truncate text-[#FFFAF3]">
                              {language === 'ar' ? track.title_ar : track.title_en}
                            </span>
                            <span className="text-[10px] text-[#9ED47D] truncate">
                              {language === 'ar' ? track.subtitle_ar : track.subtitle_en}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-1 text-[#F4B335] shrink-0">
                            <span className="text-[10px] font-bold">{language === 'ar' ? 'تعمل الآن' : 'Playing'}</span>
                            <Check size={16} />
                          </div>
                        ) : (
                          <Play size={14} className="text-[#9ED47D] opacity-60 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOURNAMENT CAREER SETTINGS */}
          {activeTab === 'tournament' && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-[#032810]/70 border border-[#04774D] p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#F4B335] font-black font-['Kufam'] text-sm">
                  <Flame size={18} />
                  <span>{language === 'ar' ? 'حالة المشوار الحالي' : 'Current Tournament State'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/20 border border-[#04774D]/40">
                    <span className="text-[10px] text-[#9ED47D] block mb-0.5">
                      {language === 'ar' ? 'فريقك المختار' : 'Selected Team'}
                    </span>
                    <span className="font-bold font-['Kufam'] text-[#FFFAF3]">
                      {tournament.playerTeamId.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/20 border border-[#04774D]/40">
                    <span className="text-[10px] text-[#9ED47D] block mb-0.5">
                      {language === 'ar' ? 'المباريات المكتملة' : 'Matches Completed'}
                    </span>
                    <span className="font-bold font-['Kufam'] text-[#FFFAF3]">
                      {Object.keys(tournament.completedMatches).length} / 15
                    </span>
                  </div>
                </div>
              </div>

              {/* Reset Confirmation or Trigger */}
              <div className="rounded-2xl bg-red-950/30 border border-red-800/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <AlertTriangle size={16} />
                  <span>{language === 'ar' ? 'إعادة ضبط المشوار من البداية' : 'Reset Tournament Progress'}</span>
                </div>

                <p className="text-[11px] text-red-200/80 leading-relaxed">
                  {language === 'ar'
                    ? 'سيؤدي هذا إلى مسح كافة نتائج المباريات والترتيب في المجموعتين والبدء من جديد مع إمكانية اختيار فريق آخر.'
                    : 'This will reset all group standings and match results, allowing you to start fresh and select a new nation.'}
                </p>

                {showResetConfirm ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleConfirmReset}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
                    >
                      {language === 'ar' ? 'نعم، تأكيد إعادة البدء' : 'Yes, Confirm Reset'}
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFFAF3] text-xs font-bold transition"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setShowResetConfirm(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-700/60 hover:bg-red-600 text-white font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={15} />
                    <span>{language === 'ar' ? 'إعادة ضبط مشوار البطولة الآن' : 'Reset Career Mode Now'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GAME OPTIONS */}
          {activeTab === 'match' && (
            <div className="space-y-4">
              {/* Platform Version Selection (Exclusively here in Settings as requested) */}
              <div className="rounded-2xl bg-gradient-to-b from-[#04774D]/25 to-[#032810]/70 border-2 border-[#04774D] p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F4B335] flex items-center gap-1.5 font-['Kufam']">
                    <Monitor size={15} />
                    <span>{language === 'ar' ? 'نمط العرض والمنصة (كمبيوتر / هاتف)' : 'Display Platform (PC / Mobile)'}</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#04774D]/50 text-[#9ED47D] font-mono">
                    {devicePlatform === 'desktop' ? (language === 'ar' ? 'شاشة كمبيوتر' : 'Desktop') : (language === 'ar' ? 'شاشة هاتف' : 'Mobile')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Mobile Option */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setDevicePlatform('mobile');
                    }}
                    className={`p-3 rounded-xl text-start transition flex flex-col gap-1 border-2 relative ${
                      devicePlatform === 'mobile'
                        ? 'bg-[#04774D]/80 border-[#F4B335] text-[#FFFAF3] shadow-[0_0_12px_rgba(244,179,53,0.35)]'
                        : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/5 hover:border-[#9ED47D]/40'
                    }`}
                  >
                    {devicePlatform === 'mobile' && (
                      <div className="absolute top-2.5 end-2.5 w-4 h-4 rounded-full bg-[#F4B335] text-[#032810] flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 font-extrabold text-xs font-['Kufam']">
                      <Smartphone size={15} className="text-[#9ED47D]" />
                      <span>{language === 'ar' ? 'نسخة الهاتف' : 'Mobile Version'}</span>
                    </div>
                    <span className="text-[10px] text-[#9ED47D]/90 leading-tight">
                      {language === 'ar' ? 'وضع رأسي ملائم للهاتف مع مدرجات جانبية' : 'Vertical view tailored for mobile screens'}
                    </span>
                  </button>

                  {/* Desktop Option */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setDevicePlatform('desktop');
                    }}
                    className={`p-3 rounded-xl text-start transition flex flex-col gap-1 border-2 relative ${
                      devicePlatform === 'desktop'
                        ? 'bg-[#04774D]/80 border-[#F4B335] text-[#FFFAF3] shadow-[0_0_12px_rgba(244,179,53,0.35)]'
                        : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/5 hover:border-[#9ED47D]/40'
                    }`}
                  >
                    {devicePlatform === 'desktop' && (
                      <div className="absolute top-2.5 end-2.5 w-4 h-4 rounded-full bg-[#F4B335] text-[#032810] flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 font-extrabold text-xs font-['Kufam']">
                      <Monitor size={15} className="text-[#F4B335]" />
                      <span>{language === 'ar' ? 'نسخة الكمبيوتر' : 'Desktop Version'}</span>
                    </div>
                    <span className="text-[10px] text-[#9ED47D]/90 leading-tight">
                      {language === 'ar' ? 'وضع أفقي عريض مع استاد كامل 4 جهات وتحكم الفأرة' : 'Widescreen horizontal with 4-sided arena & mouse precision'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="rounded-2xl bg-[#032810]/60 border border-[#04774D] p-4 space-y-2">
                <label className="text-xs font-bold text-[#F4B335] flex items-center gap-1.5">
                  <Globe size={15} />
                  <span>{language === 'ar' ? 'لغة اللعبة' : 'Game Language'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setLanguage('ar');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      language === 'ar'
                        ? 'bg-[#04774D] border-[#F4B335] text-[#FFFAF3]'
                        : 'bg-black/20 border-white/10 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    العربية (Arabic)
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setLanguage('en');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      language === 'en'
                        ? 'bg-[#04774D] border-[#F4B335] text-[#FFFAF3]'
                        : 'bg-black/20 border-white/10 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Match Duration */}
              <div className="rounded-2xl bg-[#032810]/60 border border-[#04774D] p-4 space-y-2">
                <label className="text-xs font-bold text-[#F4B335] flex items-center gap-1.5">
                  <Clock size={15} />
                  <span>{language === 'ar' ? 'مدة شوط المباراة' : 'Match Duration'}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => {
                        soundEngine.playClick();
                        updateSettings({ durationSeconds: dur });
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition border ${
                        settings.durationSeconds === dur
                          ? 'bg-[#04774D] border-[#F4B335] text-[#FFFAF3]'
                          : 'bg-black/20 border-white/10 text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      {dur}s ({dur / 60}m)
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Effects Toggle */}
              <div className="rounded-2xl bg-[#032810]/60 border border-[#04774D] p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#FFFAF3] block">
                    {language === 'ar' ? 'المؤثرات الصوتية وصوت الجماهير' : 'SFX & Stadium Crowds'}
                  </span>
                  <span className="text-[10px] text-[#9ED47D]">
                    {language === 'ar' ? 'صافرة الحكم، صوت الركلات وهتاف المدرجات' : 'Whistle, kick impact and roar'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    updateSettings({ soundEnabled: !settings.soundEnabled });
                  }}
                  className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
                    settings.soundEnabled ? 'bg-[#0AA771] justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#04774D]/40 bg-[#021A0A] flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-[#F4B335] hover:bg-[#E5A122] text-[#032810] font-black text-xs font-['Kufam'] transition"
          >
            {language === 'ar' ? 'حفظ وإغلاق' : 'Save & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
