import React, { useMemo } from 'react';
import { Team } from '../../../types';

interface VerticalCrowdProps {
  side: 'left' | 'right';
  team: Team;
  opponentTeam?: Team;
  className?: string;
  isGoalCelebration?: boolean;
}

/**
 * Vertical Grandstand with Cheering Fans flanking the pitch
 * Replaces distracting scrolling ads with an electric football stadium crowd!
 */
export const VerticalCrowdStands: React.FC<VerticalCrowdProps> = ({
  side,
  team,
  className = '',
  isGoalCelebration = false,
}) => {
  const primaryColor = team?.primaryColor || '#04774D';
  const secondaryColor = team?.secondaryColor || '#FFFAF3';
  const accentColor = team?.accentColor || '#F4B335';

  // Seed rows of crowd fans
  const fansGrid = useMemo(() => {
    const rows = 14;
    const cols = 3;
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const rowFans = [];
      for (let c = 0; c < cols; c++) {
        const type = (r * 3 + c) % 5; // 0: wave, 1: scarf, 2: jump, 3: flag, 4: clap
        const animDelay = ((r * 0.18 + c * 0.23) % 1.5).toFixed(2);
        const animDuration = (1.4 + ((r + c) % 3) * 0.3).toFixed(2);
        const hasFlash = (r * 7 + c * 11) % 6 === 0;
        const flashDelay = ((r * 1.1 + c * 0.7) % 4).toFixed(1);
        rowFans.push({
          id: `${r}-${c}`,
          type,
          animDelay,
          animDuration,
          hasFlash,
          flashDelay,
          isPrimary: (r + c) % 2 === 0,
        });
      }
      grid.push(rowFans);
    }
    return grid;
  }, []);

  return (
    <div
      className={`relative h-full flex flex-col items-center justify-between overflow-hidden pointer-events-none select-none z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Stadium Stand Concrete Gradient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#011406] via-[#021F0C] to-[#011406] border-x border-[#04774D]/30 shadow-[inset_0_0_16px_rgba(0,0,0,0.9)]" />

      {/* Stadium Floodlight Overhead Warm Glow */}
      <div className="absolute -top-6 inset-x-0 h-24 bg-gradient-to-b from-[#9ED47D]/15 via-[#F4B335]/10 to-transparent blur-md pointer-events-none" />

      {/* Stadium Pitch Perimeter Barrier / Metal Handrail */}
      <div
        className={`absolute top-0 bottom-0 ${
          side === 'left' ? 'right-0 border-r-2' : 'left-0 border-l-2'
        } border-[#0AA771]/60 w-1 bg-gradient-to-b from-[#032810] via-[#04774D] to-[#032810] shadow-[0_0_8px_rgba(10,167,113,0.5)] z-20`}
      />

      {/* Grandstand Header Badge */}
      <div className="relative z-10 w-full py-1 px-0.5 text-center bg-[#011206]/95 border-b border-[#04774D]/50 flex items-center justify-center gap-1">
        <span
          className="w-2 h-2 rounded-full border border-white/50 shadow-xs shrink-0"
          style={{ backgroundColor: primaryColor }}
        />
        <span className="text-[8px] sm:text-[9px] font-black font-['Kufam'] text-[#FFFAF3] truncate">
          {team?.shortCode || (side === 'left' ? 'HOME' : 'AWAY')}
        </span>
      </div>

      {/* Cheering Spectators Rows */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-around py-1 px-0.5 overflow-hidden">
        {fansGrid.map((row, rIdx) => (
          <div
            key={rIdx}
            className="flex items-center justify-around w-full relative py-0.5"
          >
            {/* Stadium Step Railing Line */}
            <div className="absolute inset-x-1 bottom-0 h-[1px] bg-white/10" />

            {row.map((fan) => {
              const jerseyColor = fan.isPrimary ? primaryColor : secondaryColor;
              const textColor = fan.isPrimary ? '#FFFFFF' : '#111111';

              return (
                <div
                  key={fan.id}
                  className="relative flex flex-col items-center group"
                  style={{
                    animation: isGoalCelebration
                      ? `fanCrazyJump 0.5s ease-in-out infinite alternate ${fan.animDelay}s`
                      : `fanCheerBounce ${fan.animDuration}s ease-in-out infinite alternate ${fan.animDelay}s`,
                  }}
                >
                  {/* Camera Phone Flash */}
                  {fan.hasFlash && (
                    <div
                      className="absolute -top-2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
                      style={{
                        animation: `cameraFlash 3s ease-in-out infinite ${fan.flashDelay}s`,
                      }}
                    />
                  )}

                  {/* Fan Holding Waving Flag */}
                  {fan.type === 3 && (
                    <div
                      className="absolute -top-3 -right-1 w-3.5 h-2.5 rounded-sm shadow-sm origin-bottom-left"
                      style={{
                        backgroundColor: accentColor,
                        border: '1px solid rgba(255,255,255,0.4)',
                        animation: 'flagWave 1.2s ease-in-out infinite alternate',
                      }}
                    >
                      <div className="w-full h-1/2 bg-white/30" />
                    </div>
                  )}

                  {/* Fan Holding Scarf */}
                  {fan.type === 1 && (
                    <div
                      className="absolute -top-1.5 w-5 h-1 rounded-full shadow-sm"
                      style={{
                        backgroundColor: accentColor,
                        border: '1px solid rgba(255,255,255,0.6)',
                        animation: 'scarfWave 1.8s ease-in-out infinite alternate',
                      }}
                    />
                  )}

                  {/* Fan Head & Cheering Face / Cap */}
                  <div className="relative w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#E0AC69] shadow-xs flex items-center justify-center">
                    {/* Headband / Cap */}
                    <div
                      className="absolute top-0 inset-x-0 h-1 rounded-t-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>

                  {/* Fan Body / Jersey */}
                  <div
                    className="w-3.5 sm:w-4 h-3 sm:h-3.5 rounded-t-md shadow-sm mt-0.5 flex items-center justify-center"
                    style={{
                      backgroundColor: jerseyColor,
                      border: '1px solid rgba(0,0,0,0.2)',
                    }}
                  >
                    <span
                      className="text-[5px] font-black leading-none"
                      style={{ color: textColor }}
                    >
                      •
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Grandstand Footing Banner */}
      <div className="relative z-10 w-full py-0.5 px-0.5 text-center bg-[#011206]/95 border-t border-[#04774D]/50">
        <span className="text-[7px] sm:text-[8px] font-bold text-[#F4B335] tracking-widest font-mono">
          ★ 2026
        </span>
      </div>
    </div>
  );
};

interface HorizontalCrowdProps {
  team: Team;
  opponentTeam?: Team;
  position?: 'top' | 'bottom';
  className?: string;
  isGoalCelebration?: boolean;
}

/**
 * Horizontal Grandstand with Cheering Fans for desktop top/bottom
 */
export const HorizontalCrowdStands: React.FC<HorizontalCrowdProps> = ({
  team,
  opponentTeam,
  position = 'top',
  className = '',
  isGoalCelebration = false,
}) => {
  const primaryColor = team?.primaryColor || '#04774D';
  const oppColor = opponentTeam?.primaryColor || '#8C2669';

  // Seed wide horizontal row of fans
  const fans = useMemo(() => {
    const list = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const isHomeFan = i < count / 2;
      const type = i % 4; // 0: wave, 1: scarf, 2: flag, 3: jump
      const animDelay = ((i * 0.13) % 1.6).toFixed(2);
      const animDuration = (1.3 + (i % 3) * 0.3).toFixed(2);
      const hasFlash = i % 5 === 0;
      const flashDelay = ((i * 0.8) % 3.5).toFixed(1);

      list.push({
        id: i,
        isHomeFan,
        type,
        animDelay,
        animDuration,
        hasFlash,
        flashDelay,
      });
    }
    return list;
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none z-10 h-8 sm:h-10 bg-gradient-to-r from-[#011406] via-[#021F0C] to-[#011406] border-y border-[#04774D]/50 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] flex items-center justify-between px-2 ${className}`}
      aria-hidden="true"
    >
      {/* Stadium Pitch Barrier Line */}
      <div
        className={`absolute inset-x-0 ${
          position === 'top' ? 'bottom-0' : 'top-0'
        } h-1 bg-[#0AA771]/60 shadow-[0_0_6px_rgba(10,167,113,0.6)] z-20`}
      />

      {/* Floodlight Shine */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {/* Cheering Fans Line */}
      <div className="relative z-10 w-full flex items-end justify-between px-2 sm:px-6 h-full pb-1">
        {fans.map((fan) => {
          const color = fan.isHomeFan ? primaryColor : oppColor;
          return (
            <div
              key={fan.id}
              className="relative flex flex-col items-center"
              style={{
                animation: isGoalCelebration
                  ? `fanCrazyJump 0.45s ease-in-out infinite alternate ${fan.animDelay}s`
                  : `fanCheerBounce ${fan.animDuration}s ease-in-out infinite alternate ${fan.animDelay}s`,
              }}
            >
              {/* Flashlight */}
              {fan.hasFlash && (
                <div
                  className="absolute -top-2.5 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
                  style={{
                    animation: `cameraFlash 2.8s ease-in-out infinite ${fan.flashDelay}s`,
                  }}
                />
              )}

              {/* Scarf / Flag */}
              {fan.type === 2 && (
                <div
                  className="absolute -top-3 w-3 h-2 rounded-xs shadow-xs"
                  style={{
                    backgroundColor: fan.isHomeFan ? '#F4B335' : '#FFFAF3',
                    animation: 'flagWave 1.3s ease-in-out infinite alternate',
                  }}
                />
              )}
              {fan.type === 1 && (
                <div
                  className="absolute -top-1 w-4 h-1 rounded-full shadow-xs bg-[#F4B335]"
                  style={{
                    animation: 'scarfWave 1.6s ease-in-out infinite alternate',
                  }}
                />
              )}

              {/* Fan Head */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#E0AC69] shadow-xs" />

              {/* Fan Body */}
              <div
                className="w-3.5 h-3 rounded-t-md shadow-xs mt-0.5"
                style={{ backgroundColor: color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
