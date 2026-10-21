import React from 'react';
import officialLogoDarkBg from '../../assets/khaleeji27_official_logo_white.png';
import officialLogoLightBg from '../../assets/khaleeji27_official_logo.png';
import officialEmblem from '../../assets/khaleeji27_emblem_only.png';

interface KhaleejiLogoProps {
  variant?: 'vertical' | 'horizontal' | 'emblem' | 'linear';
  theme?: 'dark' | 'light' | 'colored';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

export const KhaleejiLogo: React.FC<KhaleejiLogoProps> = ({
  variant = 'vertical',
  theme = 'dark',
  className = '',
  size = 'md'
}) => {
  // Height and width presets adhering to brand guide clear space rules
  const sizeMap = {
    xs: {
      emblemH: 'h-6',
      verticalH: 'h-12',
      horizontalH: 'h-7'
    },
    sm: {
      emblemH: 'h-8 sm:h-9',
      verticalH: 'h-16 sm:h-20',
      horizontalH: 'h-9 sm:h-10'
    },
    md: {
      emblemH: 'h-12 sm:h-14',
      verticalH: 'h-28 sm:h-32',
      horizontalH: 'h-12 sm:h-14'
    },
    lg: {
      emblemH: 'h-16 sm:h-20',
      verticalH: 'h-40 sm:h-48',
      horizontalH: 'h-16 sm:h-18'
    },
    xl: {
      emblemH: 'h-24 sm:h-28',
      verticalH: 'h-56 sm:h-64',
      horizontalH: 'h-20 sm:h-24'
    }
  }[size];

  // Trophy Emblem-only presentation (transparent Al-Balad architectural trophy)
  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <img
          src={officialEmblem}
          alt="كأس الخليج العربي 27 - Official Emblem"
          className={`${sizeMap.emblemH} w-auto object-contain drop-shadow-md transition-transform duration-200 hover:scale-105`}
          loading="eager"
        />
      </div>
    );
  }

  // Horizontal lockup (Trophy + Bilingual Wordmark + Descriptor side by side)
  if (variant === 'horizontal' || variant === 'linear') {
    const textColor = theme === 'light' ? 'text-[#032810]' : 'text-[#FFFAF3]';

    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <img
          src={officialEmblem}
          alt="كأس الخليج العربي 27"
          className={`${sizeMap.horizontalH} w-auto object-contain drop-shadow-sm`}
          loading="eager"
        />
        <div className="flex flex-col text-start justify-center border-s-2 border-[#0AA771]/40 ps-3">
          <div className="flex items-baseline gap-2">
            <span className={`font-black tracking-tight text-base md:text-lg font-['Kufam'] ${textColor}`}>
              خليجي <span className="text-[#F4B335]">27</span>
            </span>
            <span className="text-xs font-black text-[#9ED47D] tracking-wider uppercase font-['Noto_Sans']">
              Khaleeji 27
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-[#F4B335] tracking-widest uppercase">
            <span>السعودية 2026</span>
            <span>•</span>
            <span>SAUDI 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // Vertical (Preferred official tournament signature as per Brand Guidelines Page 5 & 9)
  const fullLogoSrc = theme === 'light' ? officialLogoLightBg : officialLogoDarkBg;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <img
        src={fullLogoSrc}
        alt="شعار خليجي 27 الرسمي - Official Khaleeji 27 Saudi 2026 Logo"
        className={`${sizeMap.verticalH} w-auto object-contain drop-shadow-2xl transition-transform duration-300`}
        loading="eager"
      />
    </div>
  );
};
