import React from 'react';

interface PatternBackgroundProps {
  className?: string;
  variant?: 'subtle' | 'banner' | 'corner' | 'level01' | 'level02' | 'level03';
  opacity?: number;
}

export const PatternBackground: React.FC<PatternBackgroundProps> = ({
  className = '',
  variant = 'subtle',
  opacity = 0.08
}) => {
  if (variant === 'banner') {
    return (
      <div className={`relative overflow-hidden w-full bg-[#032810] border-b border-[#04774D]/40 ${className}`}>
        {/* Heritage, Football & Movement graphical tiles strip (Pages 5, 22-24) */}
        <div className="flex h-12 w-full opacity-45">
          {/* Tile 1: Al-Balad Roshan Diamond */}
          <svg viewBox="0 0 100 100" className="h-full w-auto">
            <rect width="100" height="100" fill="#04774D" />
            <polygon points="50,12 88,50 50,88 12,50" fill="#9ED47D" />
            <polygon points="50,26 74,50 50,74 26,50" fill="#032810" />
            <polygon points="50,38 62,50 50,62 38,50" fill="#F4B335" />
          </svg>
          {/* Tile 2: Football Pitch Center Spot */}
          <svg viewBox="0 0 100 100" className="h-full w-auto">
            <rect width="100" height="100" fill="#032810" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#F4B335" strokeWidth="10" />
            <circle cx="50" cy="50" r="8" fill="#9ED47D" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#0AA771" strokeWidth="6" />
          </svg>
          {/* Tile 3: Chevron Zigzag (Movement) */}
          <svg viewBox="0 0 100 100" className="h-full w-auto">
            <rect width="100" height="100" fill="#F4B335" />
            <path d="M0 25 L50 65 L100 25 L100 45 L50 85 L0 45 Z" fill="#04774D" />
            <path d="M0 5 L50 45 L100 5 L100 20 L50 60 L0 20 Z" fill="#032810" />
            <path d="M0 45 L50 85 L100 45 L100 65 L50 105 L0 65 Z" fill="#9ED47D" />
          </svg>
          {/* Tile 4: Al-Balad Architecture Archway */}
          <svg viewBox="0 0 100 100" className="h-full w-auto">
            <rect width="100" height="100" fill="#032810" />
            <path d="M20 90 L20 45 Q50 15 80 45 L80 90 Z" fill="#0AA771" />
            <path d="M32 90 L32 52 Q50 32 68 52 L68 90 Z" fill="#FFFAF3" />
          </svg>
          {/* Tile 5: Diagonal Movement Stripes */}
          <svg viewBox="0 0 100 100" className="h-full w-auto">
            <rect width="100" height="100" fill="#04774D" />
            <line x1="0" y1="20" x2="20" y2="0" stroke="#F4B335" strokeWidth="12" />
            <line x1="0" y1="60" x2="60" y2="0" stroke="#9ED47D" strokeWidth="12" />
            <line x1="0" y1="100" x2="100" y2="0" stroke="#FFFAF3" strokeWidth="12" />
            <line x1="40" y1="100" x2="100" y2="40" stroke="#F4B335" strokeWidth="12" />
            <line x1="80" y1="100" x2="100" y2="80" stroke="#9ED47D" strokeWidth="12" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="khaleeji-12-grid"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Heritage Al-Balad Roshan Geometry */}
            <path
              d="M0 30 L30 60 L60 30 L30 0 Z"
              fill="none"
              stroke="#9ED47D"
              strokeWidth="2.5"
            />
            <polygon
              points="30,15 45,30 30,45 15,30"
              fill="none"
              stroke="#F4B335"
              strokeWidth="1.5"
            />
            <path
              d="M60 90 L90 120 L120 90 L90 60 Z"
              fill="none"
              stroke="#0AA771"
              strokeWidth="2.5"
            />

            {/* Football Pitch Center Circle & Goalpost Arc */}
            <circle cx="90" cy="30" r="16" fill="none" stroke="#9ED47D" strokeWidth="2.5" />
            <circle cx="90" cy="30" r="4" fill="#F4B335" />
            <line x1="90" y1="10" x2="90" y2="50" stroke="#04774D" strokeWidth="1.5" />

            {/* Gulf Water Waves Ribbon (Movement) - Official Brand Identity Page 1 */}
            <path
              d="M0 80 Q15 65 30 80 T60 80 T90 80 T120 80"
              fill="none"
              stroke="#0AA771"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M0 92 Q15 77 30 92 T60 92 T90 92 T120 92"
              fill="none"
              stroke="#F4B335"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Halftone Dot Matrix / Perforated Wood Lattice (Page 10, 14, 22) */}
            <circle cx="10" cy="110" r="2" fill="#FFFAF3" />
            <circle cx="20" cy="110" r="2" fill="#FFFAF3" />
            <circle cx="30" cy="110" r="2" fill="#FFFAF3" />
            <circle cx="10" cy="118" r="2" fill="#FFFAF3" />
            <circle cx="20" cy="118" r="2" fill="#FFFAF3" />
            <circle cx="30" cy="118" r="2" fill="#FFFAF3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#khaleeji-12-grid)" />
      </svg>
    </div>
  );
};

export const KhaleejiDecorativeCorner: React.FC<{ position?: 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right' }> = ({
  position = 'top-right'
}) => {
  const posClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0'
  }[position];

  return (
    <div className={`absolute ${posClasses} pointer-events-none select-none w-28 h-28 overflow-hidden z-0 opacity-30`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Layered Triangles & Chevron from Brand Guidelines Page 21 */}
        <polygon points="100,0 100,100 0,0" fill="#04774D" />
        <polygon points="100,0 100,65 35,0" fill="#0AA771" />
        <polygon points="100,0 100,35 65,0" fill="#F4B335" />
        <circle cx="85" cy="15" r="4" fill="#FFFAF3" />
      </svg>
    </div>
  );
};
