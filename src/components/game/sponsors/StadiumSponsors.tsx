import React from 'react';

export interface Sponsor {
  id: string;
  name: string;
  name_ar: string;
  logoUrl: string;
  bgColor: string;
  category_ar: string;
  category_en: string;
}

export const TOURNAMENT_SPONSORS: Sponsor[] = [
  {
    id: 'kinza',
    name: 'Kinza',
    name_ar: 'كينزا',
    logoUrl: '/assets/sponsors/kinza.svg',
    bgColor: '#0e327d',
    category_ar: 'المشروب الرسمي',
    category_en: 'Official Beverage'
  },
  {
    id: 'hankook',
    name: 'Hankook',
    name_ar: 'هانكوك',
    logoUrl: '/assets/sponsors/hankook.svg',
    bgColor: '#ffffff',
    category_ar: 'الإطار الرسمي',
    category_en: 'Official Tire'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    name_ar: 'تيك توك',
    logoUrl: '/assets/sponsors/tiktok.svg',
    bgColor: '#000000',
    category_ar: 'الشريك الرقمي',
    category_en: 'Digital Partner'
  },
  {
    id: 'albaik',
    name: 'ALBAIK',
    name_ar: 'البيك',
    logoUrl: '/assets/sponsors/albaik.svg',
    bgColor: '#ffffff',
    category_ar: 'شريك الضيافة',
    category_en: 'Hospitality Partner'
  },
  {
    id: 'byd',
    name: 'BYD',
    name_ar: 'بي واي دي',
    logoUrl: '/assets/sponsors/byd.svg',
    bgColor: '#0055b8',
    category_ar: 'السيارة الرسمية',
    category_en: 'Official Car'
  },
  {
    id: 'dyar',
    name: 'Arabian Dyar',
    name_ar: 'الديار العربية',
    logoUrl: '/assets/sponsors/dyar.svg',
    bgColor: '#ffffff',
    category_ar: 'الشريك العقاري',
    category_en: 'Real Estate Partner'
  },
  {
    id: 'alnasser',
    name: 'Alnasser',
    name_ar: 'النصر',
    logoUrl: '/assets/sponsors/alnasser.svg',
    bgColor: '#005ea6',
    category_ar: 'شريك الإنارة',
    category_en: 'Lighting Partner'
  }
];

interface VerticalRibbonProps {
  side: 'left' | 'right';
  className?: string;
}

/**
 * Vertical LED Perimeter Board (for left & right margins of the pitch)
 * Perfectly fills empty space on mobile and wide desktop screens
 */
export const VerticalSponsorRibbon: React.FC<VerticalRibbonProps> = ({ side, className = '' }) => {
  // Duplicate sponsor list for infinite seamless vertical LED scrolling
  const sponsorsCycle = [...TOURNAMENT_SPONSORS, ...TOURNAMENT_SPONSORS, ...TOURNAMENT_SPONSORS];

  return (
    <div
      className={`relative h-full flex flex-col items-center justify-start overflow-hidden pointer-events-none select-none z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Stadium LED Outer Rigging Frame */}
      <div className="absolute inset-y-0 inset-x-0 bg-gradient-to-b from-[#011406] via-[#021A0A] to-[#011406] border-x border-[#04774D]/40 rounded-xl shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]" />

      {/* Subtle LED Scanline / Screen Texture Overlay */}
      <div
        className="absolute inset-0 z-20 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]"
      />

      {/* LED Header Bar */}
      <div className="relative z-10 w-full py-1 text-center bg-[#011206]/90 border-b border-[#F4B335]/30">
        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-[#F4B335] px-1 font-mono">
          {side === 'left' ? '★ KHALEEJI 27' : 'JEDDAH 2026 ★'}
        </span>
      </div>

      {/* Scrolling / Animated LED Track */}
      <div className="relative z-10 w-full flex-1 overflow-hidden flex flex-col items-center py-2">
        <div
          className="flex flex-col gap-2.5 sm:gap-3 w-full items-center"
          style={{
            animation: `${side === 'left' ? 'sponsorScrollUp' : 'sponsorScrollDown'} 35s linear infinite`
          }}
        >
          {sponsorsCycle.map((s, idx) => (
            <div
              key={`${s.id}-${idx}`}
              className="w-[92%] max-w-[68px] sm:max-w-[76px] aspect-[2.2/1] rounded-lg p-0.5 bg-[#032810] border border-[#04774D]/60 shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden transition-transform duration-300"
            >
              <img
                src={s.logoUrl}
                alt={s.name}
                className="w-full h-full object-contain rounded-md drop-shadow-sm"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* LED Footer Bar */}
      <div className="relative z-10 w-full py-1 text-center bg-[#011206]/90 border-t border-[#F4B335]/30">
        <span className="text-[7px] sm:text-[8px] font-black text-[#9ED47D] tracking-wider uppercase font-mono">
          LED BOARD
        </span>
      </div>
    </div>
  );
};

interface HorizontalRibbonProps {
  className?: string;
  position?: 'top' | 'bottom';
}

/**
 * Horizontal LED Perimeter Board (for top/bottom touchlines in desktop horizontal mode)
 */
export const HorizontalSponsorRibbon: React.FC<HorizontalRibbonProps> = ({
  className = '',
  position = 'top'
}) => {
  const sponsorsCycle = [...TOURNAMENT_SPONSORS, ...TOURNAMENT_SPONSORS, ...TOURNAMENT_SPONSORS];

  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none z-10 h-7 sm:h-9 bg-gradient-to-r from-[#011406] via-[#021A0A] to-[#011406] border-y border-[#04774D]/60 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] flex items-center ${className}`}
      aria-hidden="true"
    >
      {/* LED Scanline Texture */}
      <div
        className="absolute inset-0 z-20 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_3px]"
      />

      {/* Left/Right LED Corner Accents */}
      <div className="absolute left-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-r from-[#011206] to-transparent z-30 flex items-center px-1">
        <span className="text-[8px] font-black text-[#F4B335] font-mono hidden sm:inline">OFFICIAL</span>
      </div>
      <div className="absolute right-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-l from-[#011206] to-transparent z-30 flex items-center justify-end px-1">
        <span className="text-[8px] font-black text-[#F4B335] font-mono hidden sm:inline">SPONSORS</span>
      </div>

      {/* Scrolling Strip */}
      <div
        className="flex items-center gap-3 sm:gap-4 shrink-0 px-4"
        style={{
          animation: `${position === 'top' ? 'sponsorScrollLeft' : 'sponsorScrollRight'} 40s linear infinite`
        }}
      >
        {sponsorsCycle.map((s, idx) => (
          <div
            key={`${s.id}-${idx}`}
            className="h-5 sm:h-6 w-14 sm:w-18 aspect-[2.2/1] rounded-md p-0.5 bg-[#032810] border border-[#04774D]/70 shadow-[0_2px_6px_rgba(0,0,0,0.6)] flex items-center justify-center shrink-0 overflow-hidden"
          >
            <img
              src={s.logoUrl}
              alt={s.name}
              className="w-full h-full object-contain rounded drop-shadow-sm"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
