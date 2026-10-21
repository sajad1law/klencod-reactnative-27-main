import React from 'react';

interface TeamFlagProps {
  teamId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'token';
  shape?: 'official' | 'circle' | 'rect';
  hasBorder?: boolean;
}

export const TeamFlag: React.FC<TeamFlagProps> = ({
  teamId,
  className = '',
  size = 'md',
  shape = 'official',
  hasBorder = true
}) => {
  const sizeClasses = {
    sm: 'w-7 h-5',
    md: 'w-11 h-7',
    lg: 'w-16 h-10',
    xl: 'w-24 h-15',
    token: 'w-full h-full'
  }[size];

  // Official holding shape per Brand Guidelines Page 26:
  // Rounded rectangle with smooth curve on top-left and bottom-right, or distinctive rounded pill
  const shapeClass = shape === 'circle' 
    ? 'rounded-full' 
    : shape === 'official' 
      ? 'rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md overflow-hidden' 
      : 'rounded-md overflow-hidden';

  const borderClass = hasBorder 
    ? 'border border-[#FFFAF3]/20 shadow-sm' 
    : '';

  const renderFlagSvg = () => {
    switch (teamId.toLowerCase()) {
      case 'ksa':
        // Saudi Arabia
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full object-cover">
            <rect width="100" height="65" fill="#04774D" />
            {/* Arabic Script representation & Sword */}
            <path
              d="M22 26 Q35 22 50 25 Q65 20 78 26 Q70 32 50 30 Q30 32 22 26 Z"
              fill="#FFFAF3"
            />
            <line x1="26" y1="40" x2="74" y2="40" stroke="#FFFAF3" strokeWidth="3" strokeLinecap="round" />
            <path d="M26 36 L26 44 L32 40 Z" fill="#FFFAF3" />
            <path d="M74 38 L80 40 L74 42 Z" fill="#FFFAF3" />
          </svg>
        );

      case 'irq':
        // Iraq: Red, White, Black with green Takbir
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full object-cover">
            <rect width="100" height="21.67" y="0" fill="#CE1126" />
            <rect width="100" height="21.67" y="21.67" fill="#FFFAF3" />
            <rect width="100" height="21.67" y="43.34" fill="#032810" />
            {/* Kufic Takbir "الله أكبر" in green */}
            <text
              x="50"
              y="37"
              fill="#04774D"
              fontSize="12"
              fontWeight="900"
              fontFamily="'Kufam', sans-serif"
              textAnchor="middle"
              direction="rtl"
            >
              الله أكبر
            </text>
          </svg>
        );

      case 'kwt':
        // Kuwait: Green, White, Red with black trapezoid
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full object-cover">
            <rect width="100" height="21.67" y="0" fill="#04774D" />
            <rect width="100" height="21.67" y="21.67" fill="#FFFAF3" />
            <rect width="100" height="21.67" y="43.34" fill="#CE1126" />
            <polygon points="0,0 28,21.67 28,43.33 0,65" fill="#032810" />
          </svg>
        );

      case 'omn':
        // Oman: White, Red, Green stripes with red vertical hoist + Khanjar emblem
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full object-cover">
            <rect width="100" height="21.67" y="0" fill="#FFFAF3" />
            <rect width="100" height="21.67" y="21.67" fill="#CE1126" />
            <rect width="100" height="21.67" y="43.34" fill="#04774D" />
            <rect width="28" height="65" x="0" y="0" fill="#CE1126" />
            {/* Emblem / Khanjar symbol */}
            <circle cx="14" cy="14" r="5" fill="#FFFAF3" />
            <line x1="8" y1="14" x2="20" y2="14" stroke="#FFFAF3" strokeWidth="1.5" />
            <line x1="14" y1="8" x2="14" y2="20" stroke="#FFFAF3" strokeWidth="1.5" />
          </svg>
        );

      case 'uae':
        // UAE: Green, White, Black with vertical red hoist
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full object-cover">
            <rect width="100" height="21.67" y="0" fill="#04774D" />
            <rect width="100" height="21.67" y="21.67" fill="#FFFAF3" />
            <rect width="100" height="21.67" y="43.34" fill="#032810" />
            <rect width="28" height="65" x="0" y="0" fill="#CE1126" />
          </svg>
        );

      case 'qat':
        // Qatar: White hoist with 9 serrated points and maroon fly
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full object-cover">
            <rect width="100" height="65" fill="#8C2669" />
            <rect width="28" height="65" fill="#FFFAF3" />
            <polygon
              points="
                28,0 35,3.6 28,7.2 35,10.8 28,14.4 35,18 28,21.6 35,25.2 28,28.8
                35,32.4 28,36 35,39.6 28,43.2 35,46.8 28,50.4 35,54 28,57.6 35,61.2 28,65
              "
              fill="#FFFAF3"
            />
          </svg>
        );

      case 'bhr':
        // Bahrain: White hoist with 5 serrated points and red fly
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full object-cover">
            <rect width="100" height="65" fill="#CE1126" />
            <rect width="26" height="65" fill="#FFFAF3" />
            <polygon
              points="
                26,0 35,6.5 26,13 35,19.5 26,26 35,32.5 26,39 35,45.5 26,52 35,58.5 26,65
              "
              fill="#FFFAF3"
            />
          </svg>
        );

      case 'yem':
        // Yemen: Red, White, Black horizontal triband
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full object-cover">
            <rect width="100" height="21.67" y="0" fill="#CE1126" />
            <rect width="100" height="21.67" y="21.67" fill="#FFFAF3" />
            <rect width="100" height="21.67" y="43.34" fill="#032810" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full bg-[#04774D] flex items-center justify-center font-bold text-white text-xs">
            {teamId.toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div className={`relative inline-block shrink-0 select-none ${shapeClass} ${borderClass} ${sizeClasses} ${className}`}>
      {renderFlagSvg()}
    </div>
  );
};
