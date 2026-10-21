import React, { useMemo } from 'react';
import { Team, Stadium } from '../../../types';
import { KhaleejiLogo } from '../../brand/KhaleejiLogo';

interface DesktopStadiumArenaProps {
  homeTeam: Team;
  awayTeam: Team;
  stadium?: Stadium;
  homeScore: number;
  awayScore: number;
  timeLeft: number;
  isGoalCelebration?: boolean;
  children: React.ReactNode; // The pitch canvas container
}

/**
 * Desktop Stadium Arena: A true 4-sided football stadium atmosphere
 * Surrounding the horizontal pitch canvas on all four sides with:
 * - Upper Main Grandstand (Top)
 * - Lower Touchline Grandstand with Technical Benches (Bottom)
 * - North Goal Ultras Stand (Left)
 * - South Goal Ultras Stand (Right)
 * - 4 Corner Floodlight Towers
 */
export const DesktopStadiumArena: React.FC<DesktopStadiumArenaProps> = ({
  homeTeam,
  awayTeam,
  stadium,
  homeScore,
  awayScore,
  timeLeft,
  isGoalCelebration = false,
  children,
}) => {
  const homeColor = homeTeam?.primaryColor || '#04774D';
  const awayColor = awayTeam?.primaryColor || '#8C2669';

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Generate top stand spectator rows
  const topStandFans = useMemo(() => {
    const rows = 3;
    const cols = 36;
    const list = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const isHome = c < cols / 2;
        const color = isHome ? homeColor : awayColor;
        const hasFlag = (r * 7 + c) % 6 === 0;
        const hasScarf = (r * 3 + c) % 5 === 0;
        const hasFlash = (r * 5 + c) % 9 === 0;
        const animDelay = ((r * 0.2 + c * 0.1) % 1.5).toFixed(2);
        row.push({ id: `${r}-${c}`, color, hasFlag, hasScarf, hasFlash, animDelay });
      }
      list.push(row);
    }
    return list;
  }, [homeColor, awayColor]);

  // Generate bottom stand spectator rows
  const bottomStandFans = useMemo(() => {
    const rows = 3;
    const cols = 36;
    const list = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const isHome = c < cols / 2;
        const color = isHome ? homeColor : awayColor;
        const hasFlag = (r * 4 + c) % 7 === 0;
        const hasScarf = (r * 5 + c) % 6 === 0;
        const hasFlash = (r * 3 + c) % 8 === 0;
        const animDelay = ((r * 0.15 + c * 0.12) % 1.4).toFixed(2);
        row.push({ id: `${r}-${c}`, color, hasFlag, hasScarf, hasFlash, animDelay });
      }
      list.push(row);
    }
    return list;
  }, [homeColor, awayColor]);

  // Generate left goal ultras stand (home team fans)
  const leftGoalFans = useMemo(() => {
    const rows = 12;
    const cols = 4;
    const list = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const hasFlag = (r + c) % 4 === 0;
        const hasFlash = (r * 2 + c) % 5 === 0;
        const animDelay = ((r * 0.2 + c * 0.1) % 1.3).toFixed(2);
        row.push({ id: `l-${r}-${c}`, color: homeColor, hasFlag, hasFlash, animDelay });
      }
      list.push(row);
    }
    return list;
  }, [homeColor]);

  // Generate right goal ultras stand (away team fans)
  const rightGoalFans = useMemo(() => {
    const rows = 12;
    const cols = 4;
    const list = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const hasFlag = (r + c) % 4 === 0;
        const hasFlash = (r * 2 + c) % 5 === 0;
        const animDelay = ((r * 0.2 + c * 0.1) % 1.3).toFixed(2);
        row.push({ id: `r-${r}-${c}`, color: awayColor, hasFlag, hasFlash, animDelay });
      }
      list.push(row);
    }
    return list;
  }, [awayColor]);

  return (
    <div className="relative w-full max-w-[1240px] mx-auto flex flex-col items-center select-none overflow-hidden my-auto rounded-3xl bg-[#011406] border-2 border-[#04774D]/70 shadow-[0_0_50px_rgba(0,0,0,0.9)] p-1.5 sm:p-2.5">
      {/* Stadium Corner Floodlight Glow Effects */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-[#9ED47D]/20 via-[#F4B335]/10 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#9ED47D]/20 via-[#F4B335]/10 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#9ED47D]/15 via-transparent to-transparent blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-[#9ED47D]/15 via-transparent to-transparent blur-2xl pointer-events-none" />

      {/* ================= TOP UPPER GRANDSTAND (MAIN STAND) ================= */}
      <div className="relative w-full bg-gradient-to-b from-[#011206] via-[#021A0A] to-[#03230E] border border-[#04774D]/50 rounded-2xl overflow-hidden mb-1.5 shadow-lg flex flex-col">
        {/* Stadium Roof Gantry with Floodlights & Giant Digital Scoreboard */}
        <div className="relative w-full px-4 py-1.5 bg-[#010D05]/95 border-b border-[#04774D]/60 flex items-center justify-between z-20">
          {/* Left Floodlight Array */}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FFFAF3] shadow-[0_0_8px_#ffffff] animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-[#FFFAF3] shadow-[0_0_8px_#ffffff] animate-pulse delay-75" />
            <span className="w-2 h-2 rounded-full bg-[#FFFAF3] shadow-[0_0_8px_#ffffff] animate-pulse delay-150" />
            <span className="text-[10px] font-mono font-bold text-[#9ED47D] ms-2 hidden sm:inline">
              {stadium?.name_ar || 'مدينة الملك عبدالله الرياضية'}
            </span>
          </div>

          {/* Center Digital Ribbon */}
          <div className="flex items-center gap-2 bg-[#021A0A] px-3 py-0.5 rounded-full border border-[#F4B335]/40 shadow-inner">
            <KhaleejiLogo variant="emblem" size="xs" />
            <span className="text-[10px] font-bold font-['Kufam'] text-[#F4B335] tracking-wider uppercase">
              KHALEEJI 27 JEDDAH • {formatTime(timeLeft)} • {homeScore} - {awayScore}
            </span>
          </div>

          {/* Right Floodlight Array */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono font-bold text-[#9ED47D] me-2 hidden sm:inline">
              الجوهرة المشعة
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FFFAF3] shadow-[0_0_8px_#ffffff] animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-[#FFFAF3] shadow-[0_0_8px_#ffffff] animate-pulse delay-75" />
            <span className="w-2 h-2 rounded-full bg-[#FFFAF3] shadow-[0_0_8px_#ffffff] animate-pulse delay-150" />
          </div>
        </div>

        {/* Tiered Upper Grandstand Rows */}
        <div className="w-full py-1 px-3 flex flex-col gap-1 relative overflow-hidden">
          {topStandFans.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center justify-between w-full relative">
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/5" />
              {row.map((fan) => (
                <div
                  key={fan.id}
                  className="relative flex flex-col items-center"
                  style={{
                    animation: isGoalCelebration
                      ? `fanCrazyJump 0.45s ease-in-out infinite alternate ${fan.animDelay}s`
                      : `fanCheerBounce 1.5s ease-in-out infinite alternate ${fan.animDelay}s`,
                  }}
                >
                  {fan.hasFlash && (
                    <div className="absolute -top-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                  )}
                  {fan.hasFlag && (
                    <div
                      className="absolute -top-2.5 w-2.5 h-1.5 rounded-xs"
                      style={{
                        backgroundColor: '#F4B335',
                        animation: 'flagWave 1.2s ease-in-out infinite alternate',
                      }}
                    />
                  )}
                  <div className="w-2 h-2 rounded-full bg-[#E0AC69]" />
                  <div
                    className="w-2.5 h-2 rounded-t-xs mt-0.5"
                    style={{ backgroundColor: fan.color }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Upper Stand Railing */}
        <div className="w-full h-1 bg-gradient-to-r from-[#032810] via-[#0AA771] to-[#032810] shadow-[0_0_6px_rgba(10,167,113,0.5)]" />
      </div>

      {/* ================= MIDDLE ARENA ROW: LEFT GOAL STAND + PITCH CANVAS + RIGHT GOAL STAND ================= */}
      <div className="relative w-full flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Goal Stand (North Ultras - Home Team Section) */}
        <div className="w-10 sm:w-16 md:w-20 self-stretch rounded-2xl bg-gradient-to-r from-[#011206] via-[#021A0A] to-[#03230E] border border-[#04774D]/50 flex flex-col items-center justify-between p-1 overflow-hidden shadow-lg">
          <div className="w-full text-center py-0.5 bg-[#010D05]/90 rounded-md border border-[#04774D]/40 mb-1">
            <span className="text-[7px] sm:text-[9px] font-bold font-['Kufam'] text-[#FFFAF3] truncate block">
              مدرج الشمال
            </span>
          </div>

          <div className="flex-1 w-full flex flex-col justify-around py-1">
            {leftGoalFans.map((row, rIdx) => (
              <div key={rIdx} className="flex items-center justify-around w-full">
                {row.map((fan) => (
                  <div
                    key={fan.id}
                    className="relative flex flex-col items-center"
                    style={{
                      animation: isGoalCelebration
                        ? `fanCrazyJump 0.45s ease-in-out infinite alternate ${fan.animDelay}s`
                        : `fanCheerBounce 1.5s ease-in-out infinite alternate ${fan.animDelay}s`,
                    }}
                  >
                    {fan.hasFlash && (
                      <div className="absolute -top-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                    )}
                    {fan.hasFlag && (
                      <div
                        className="absolute -top-2 w-2 h-1.5 rounded-xs"
                        style={{
                          backgroundColor: '#F4B335',
                          animation: 'flagWave 1.2s ease-in-out infinite alternate',
                        }}
                      />
                    )}
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#E0AC69]" />
                    <div
                      className="w-2 sm:w-2.5 h-2 rounded-t-xs mt-0.5"
                      style={{ backgroundColor: fan.color }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="w-full text-center py-0.5 bg-[#010D05]/90 rounded-md border border-[#04774D]/40 mt-1">
            <span className="text-[6px] sm:text-[8px] font-mono text-[#9ED47D] tracking-widest uppercase">
              NORTH ULTRAS
            </span>
          </div>
        </div>

        {/* Center Pitch Canvas Wrapper */}
        <div className="relative flex-1 flex items-center justify-center min-w-0">
          {children}
        </div>

        {/* Right Goal Stand (South Ultras - Away Team Section) */}
        <div className="w-10 sm:w-16 md:w-20 self-stretch rounded-2xl bg-gradient-to-l from-[#011206] via-[#021A0A] to-[#03230E] border border-[#04774D]/50 flex flex-col items-center justify-between p-1 overflow-hidden shadow-lg">
          <div className="w-full text-center py-0.5 bg-[#010D05]/90 rounded-md border border-[#04774D]/40 mb-1">
            <span className="text-[7px] sm:text-[9px] font-bold font-['Kufam'] text-[#FFFAF3] truncate block">
              مدرج الجنوب
            </span>
          </div>

          <div className="flex-1 w-full flex flex-col justify-around py-1">
            {rightGoalFans.map((row, rIdx) => (
              <div key={rIdx} className="flex items-center justify-around w-full">
                {row.map((fan) => (
                  <div
                    key={fan.id}
                    className="relative flex flex-col items-center"
                    style={{
                      animation: isGoalCelebration
                        ? `fanCrazyJump 0.45s ease-in-out infinite alternate ${fan.animDelay}s`
                        : `fanCheerBounce 1.5s ease-in-out infinite alternate ${fan.animDelay}s`,
                    }}
                  >
                    {fan.hasFlash && (
                      <div className="absolute -top-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                    )}
                    {fan.hasFlag && (
                      <div
                        className="absolute -top-2 w-2 h-1.5 rounded-xs"
                        style={{
                          backgroundColor: '#F4B335',
                          animation: 'flagWave 1.2s ease-in-out infinite alternate',
                        }}
                      />
                    )}
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#E0AC69]" />
                    <div
                      className="w-2 sm:w-2.5 h-2 rounded-t-xs mt-0.5"
                      style={{ backgroundColor: fan.color }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="w-full text-center py-0.5 bg-[#010D05]/90 rounded-md border border-[#04774D]/40 mt-1">
            <span className="text-[6px] sm:text-[8px] font-mono text-[#9ED47D] tracking-widest uppercase">
              SOUTH ULTRAS
            </span>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM LOWER GRANDSTAND ================= */}
      <div className="relative w-full bg-gradient-to-t from-[#011206] via-[#021A0A] to-[#03230E] border border-[#04774D]/50 rounded-2xl overflow-hidden mt-1.5 shadow-lg flex flex-col">
        {/* Lower Stand Railing */}
        <div className="w-full h-1 bg-gradient-to-r from-[#032810] via-[#0AA771] to-[#032810] shadow-[0_0_6px_rgba(10,167,113,0.5)]" />

        {/* Tiered Lower Grandstand Rows */}
        <div className="w-full py-1 px-3 flex flex-col gap-1 relative overflow-hidden">
          {bottomStandFans.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center justify-between w-full relative">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/5" />
              {row.map((fan) => (
                <div
                  key={fan.id}
                  className="relative flex flex-col items-center"
                  style={{
                    animation: isGoalCelebration
                      ? `fanCrazyJump 0.45s ease-in-out infinite alternate ${fan.animDelay}s`
                      : `fanCheerBounce 1.5s ease-in-out infinite alternate ${fan.animDelay}s`,
                  }}
                >
                  {fan.hasFlash && (
                    <div className="absolute -top-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                  )}
                  {fan.hasScarf && (
                    <div
                      className="absolute -top-1 w-3.5 h-1 rounded-full"
                      style={{
                        backgroundColor: '#F4B335',
                        animation: 'scarfWave 1.6s ease-in-out infinite alternate',
                      }}
                    />
                  )}
                  <div className="w-2 h-2 rounded-full bg-[#E0AC69]" />
                  <div
                    className="w-2.5 h-2 rounded-t-xs mt-0.5"
                    style={{ backgroundColor: fan.color }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Technical Area Benches & Photographers Line */}
        <div className="relative w-full px-4 py-1 bg-[#010D05]/95 border-t border-[#04774D]/60 flex items-center justify-between z-20 text-[9px] text-[#9ED47D]/90">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs bg-[#04774D] border border-white/40" />
            <span className="font-['Kufam'] font-semibold">دكة بدلاء: {homeTeam?.name_ar}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#F4B335]">
            <span>📷 TV BROADCAST 4K</span>
            <span>•</span>
            <span>FIFA OFFICIAL PITCH</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-['Kufam'] font-semibold">دكة بدلاء: {awayTeam?.name_ar}</span>
            <span className="w-2 h-2 rounded-xs bg-[#8C2669] border border-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
