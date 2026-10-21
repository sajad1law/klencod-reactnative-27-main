import React from 'react';
import { useGame } from '../../context/GameContext';
import { DevicePlatform } from '../../types';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { soundEngine } from '../../utils/audio';
import { Smartphone, Monitor, CheckCircle, Sparkles, X } from 'lucide-react';

interface PlatformSelectorModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const PlatformSelectorModal: React.FC<PlatformSelectorModalProps> = ({
  isOpen,
  onClose,
  canDismiss = true,
}) => {
  const { devicePlatform, setDevicePlatform, language } = useGame();

  if (!isOpen) return null;

  const handleSelect = (platform: DevicePlatform) => {
    soundEngine.init();
    soundEngine.playClick();
    setDevicePlatform(platform);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#021A0A] to-[#011206] border-2 border-[#04774D] rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(4,119,77,0.4)] text-center">
        {/* Dismiss Button (if already has chosen once) */}
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 rtl:left-auto rtl:right-4 w-9 h-9 rounded-full bg-[#032810] border border-[#04774D] hover:bg-[#04774D]/50 text-[#FFFAF3] flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        )}

        {/* Header Branding */}
        <div className="flex flex-col items-center mb-5">
          <KhaleejiLogo variant="emblem" size="md" className="mb-2" />
          <h2 className="text-xl sm:text-2xl font-black font-['Kufam'] text-[#F4B335] tracking-wide">
            {language === 'ar' ? 'اختر تجربة اللعب المناسبة لك' : 'Choose Your Gaming Experience'}
          </h2>
          <p className="text-xs sm:text-sm text-[#9ED47D] mt-1 max-w-md">
            {language === 'ar'
              ? 'صممنا نسختين مخصصتين بالكامل لتقديم أفضل أداء وأجواء واقعية لكل شاشة'
              : 'Dedicated experiences crafted specifically for mobile and desktop screens'}
          </p>
        </div>

        {/* 2 Platform Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          {/* Card 1: Mobile Phone Version */}
          <div
            onClick={() => handleSelect('mobile')}
            className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between text-start relative overflow-hidden group ${
              devicePlatform === 'mobile'
                ? 'bg-gradient-to-b from-[#04774D]/40 to-[#032810] border-[#F4B335] shadow-[0_0_25px_rgba(244,179,53,0.3)]'
                : 'bg-[#021F0C]/80 border-[#04774D]/60 hover:border-[#0AA771] hover:bg-[#032810]'
            }`}
          >
            {devicePlatform === 'mobile' && (
              <div className="absolute top-3 end-3 flex items-center gap-1 text-[11px] font-bold text-[#F4B335] bg-[#021A0A]/90 px-2 py-0.5 rounded-full border border-[#F4B335]/50">
                <CheckCircle size={12} />
                <span>{language === 'ar' ? 'مفعل حالياً' : 'Active'}</span>
              </div>
            )}

            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#04774D]/50 border border-[#9ED47D]/40 flex items-center justify-center text-[#F4B335] mb-3 group-hover:scale-110 transition">
                <Smartphone size={26} />
              </div>

              <h3 className="text-base sm:text-lg font-bold font-['Kufam'] text-[#FFFAF3]">
                {language === 'ar' ? '📱 نسخة الهاتف' : '📱 Mobile Phone'}
              </h3>
              <p className="text-xs text-[#9ED47D] mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'ملعب رأسي طولي مع مدرجات جماهيرية جانبية تهتف بالأعلام والشالات، وتحكم لمس سلس باليدين.'
                  : 'Vertical portrait pitch flanked by energetic side crowd stands, optimized for one-hand touch control.'}
              </p>

              <ul className="mt-3 text-[11px] text-[#FFFAF3]/80 space-y-1 font-['Noto_Sans']">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#F4B335]">✓</span>
                  <span>{language === 'ar' ? 'مدرجات رأسية على اليمين واليسار' : 'Vertical grandstands on both sides'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#F4B335]">✓</span>
                  <span>{language === 'ar' ? 'رؤية ملء الشاشة للهواتف الذكية' : 'Full-screen fit for mobile displays'}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('mobile');
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#04774D] hover:bg-[#0AA771] text-[#FFFAF3] font-bold font-['Kufam'] text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
            >
              <span>{language === 'ar' ? 'اختيار نسخة الهاتف' : 'Select Mobile Version'}</span>
            </button>
          </div>

          {/* Card 2: Desktop Computer Version */}
          <div
            onClick={() => handleSelect('desktop')}
            className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between text-start relative overflow-hidden group ${
              devicePlatform === 'desktop'
                ? 'bg-gradient-to-b from-[#04774D]/40 to-[#032810] border-[#F4B335] shadow-[0_0_25px_rgba(244,179,53,0.3)]'
                : 'bg-[#021F0C]/80 border-[#04774D]/60 hover:border-[#0AA771] hover:bg-[#032810]'
            }`}
          >
            {devicePlatform === 'desktop' && (
              <div className="absolute top-3 end-3 flex items-center gap-1 text-[11px] font-bold text-[#F4B335] bg-[#021A0A]/90 px-2 py-0.5 rounded-full border border-[#F4B335]/50">
                <CheckCircle size={12} />
                <span>{language === 'ar' ? 'مفعل حالياً' : 'Active'}</span>
              </div>
            )}

            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#04774D]/50 border border-[#9ED47D]/40 flex items-center justify-center text-[#F4B335] mb-3 group-hover:scale-110 transition">
                <Monitor size={26} />
              </div>

              <h3 className="text-base sm:text-lg font-bold font-['Kufam'] text-[#FFFAF3]">
                {language === 'ar' ? '💻 نسخة الكمبيوتر' : '💻 Desktop PC'}
              </h3>
              <p className="text-xs text-[#9ED47D] mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'ملعب أفقي عريض محاط باستاد متكامل بـ 4 مدرجات وأبراج إضاءة كاشفة ودكة بدلاء كبث المباريات العالمية.'
                  : 'Widescreen horizontal pitch surrounded by full 4-sided stadium stands, floodlight towers & TV broadcast atmosphere.'}
              </p>

              <ul className="mt-3 text-[11px] text-[#FFFAF3]/80 space-y-1 font-['Noto_Sans']">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#F4B335]">✓</span>
                  <span>{language === 'ar' ? 'استاد محيطي كامل من 4 جهات' : '4-sided full stadium arena'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#F4B335]">✓</span>
                  <span>{language === 'ar' ? 'دقة عريضة Widescreen للشاشات الكبيرة' : 'Widescreen HD for monitors & laptops'}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('desktop');
              }}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#04774D] hover:bg-[#0AA771] text-[#FFFAF3] font-bold font-['Kufam'] text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
            >
              <span>{language === 'ar' ? 'اختيار نسخة الكمبيوتر' : 'Select Desktop Version'}</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-[#9ED47D]/80 flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="text-[#F4B335]" />
          <span>
            {language === 'ar'
              ? 'يمكنك التبديل بين نسختي الهاتف والكمبيوتر في أي وقت من أعلى الشاشة بضغطة زر واحدة.'
              : 'You can switch between Mobile and Desktop versions anytime from the top bar with one click.'}
          </span>
        </p>
      </div>
    </div>
  );
};
