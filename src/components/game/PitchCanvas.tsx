import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { DevicePlatform } from '../../types';
import { TEAMS, STADIUMS } from '../../data/tournamentData';
import { soundEngine, toggleGlobalMute, isGlobalMuted } from '../../utils/audio';
import { TeamFlag } from '../brand/TeamFlag';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { VerticalCrowdStands } from './stadium/CheeringCrowd';
import { DesktopStadiumArena } from './stadium/DesktopStadiumArena';
import { Pause, Play, RotateCcw, Volume2, VolumeX, ArrowLeft, Monitor, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Token {
  id: number;
  team: 'home' | 'away';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  isGoalkeeper?: boolean;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

type Orientation = 'horizontal' | 'vertical';

export const PitchCanvas: React.FC = () => {
  const {
    homeTeamId,
    awayTeamId,
    currentStadiumId,
    gameMode,
    settings,
    recordMatchResult,
    setScreen,
    language,
    devicePlatform,
    setDevicePlatform,
    setIsDeviceModalOpen
  } = useGame();

  const homeTeam = TEAMS[homeTeamId] || TEAMS.ksa;
  const awayTeam = TEAMS[awayTeamId] || TEAMS.kwt;
  const stadium = STADIUMS[currentStadiumId] || STADIUMS.kasc;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync orientation with selected devicePlatform ('desktop' -> horizontal, 'mobile' -> vertical)
  const [orientation, setOrientation] = useState<Orientation>(() => {
    return devicePlatform === 'desktop' ? 'horizontal' : 'vertical';
  });

  useEffect(() => {
    setOrientation(devicePlatform === 'desktop' ? 'horizontal' : 'vertical');
  }, [devicePlatform]);

  // Match State
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.durationSeconds || 120);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<'home' | 'away'>('home');
  const [turnState, setTurnState] = useState<'aiming' | 'moving' | 'goal_celebration' | 'game_over'>('aiming');
  const [goalCelebration, setGoalCelebration] = useState<{ team: 'home' | 'away' } | null>(null);
  const [isMuted, setIsMuted] = useState(() => isGlobalMuted());

  // Preload tournament sponsor logos for perimeter LED ad boards
  const sponsorImagesRef = useRef<HTMLImageElement[]>([]);
  useEffect(() => {
    const urls = [
      '/assets/sponsors/kinza.svg',
      '/assets/sponsors/hankook.svg',
      '/assets/sponsors/tiktok.svg',
      '/assets/sponsors/albaik.svg',
      '/assets/sponsors/byd.svg',
      '/assets/sponsors/dyar.svg',
      '/assets/sponsors/alnasser.svg',
    ];
    sponsorImagesRef.current = urls.map(url => {
      const img = new Image();
      img.src = url;
      return img;
    });
  }, []);

  const handleToggleMute = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextMuted = toggleGlobalMute();
    setIsMuted(nextMuted);
  }, []);

  // Single Source of Truth for physics & turn synchronization
  const worldRef = useRef<{
    orientation: Orientation;
    width: number;
    height: number;
    pitchLeft: number;
    pitchRight: number;
    pitchTop: number;
    pitchBottom: number;
    tokens: Token[];
    ball: Ball;
    selectedTokenId: number | null;
    dragStart: { x: number; y: number } | null;
    dragCurrent: { x: number; y: number } | null;
    isAiming: boolean;
    goalWidth: number;
    goalDepth: number;
    friction: number;
    ballFriction: number;
    restitution: number;
    isGoalProcessing: boolean;
    currentTurn: 'home' | 'away';
    turnState: 'aiming' | 'moving' | 'goal_celebration' | 'game_over';
    movingFrames: number;
  }>({
    orientation: 'horizontal',
    width: 960,
    height: 560,
    pitchLeft: 44,
    pitchRight: 916,
    pitchTop: 24,
    pitchBottom: 536,
    tokens: [],
    ball: { x: 480, y: 280, vx: 0, vy: 0, radius: 13 },
    selectedTokenId: null,
    dragStart: null,
    dragCurrent: null,
    isAiming: false,
    goalWidth: 160,
    goalDepth: 40,
    friction: 0.968,
    ballFriction: 0.978,
    restitution: 0.78,
    isGoalProcessing: false,
    currentTurn: 'home',
    turnState: 'aiming',
    movingFrames: 0
  });

  // Setup formation according to active orientation
  const setupFormation = useCallback((kickoffTeam: 'home' | 'away' = 'home', targetOrientation?: Orientation) => {
    const orient = targetOrientation || worldRef.current.orientation;
    worldRef.current.orientation = orient;

    if (orient === 'horizontal') {
      // Horizontal Dimensions for Desktop/Laptop screens
      const W = 960;
      const H = 560;
      worldRef.current.width = W;
      worldRef.current.height = H;
      worldRef.current.pitchLeft = 44;
      worldRef.current.pitchRight = W - 44;
      worldRef.current.pitchTop = 24;
      worldRef.current.pitchBottom = H - 24;
      worldRef.current.goalWidth = 160;
      worldRef.current.goalDepth = 40;

      const centerY = H / 2;
      const tokenRadius = 24;

      // Home tokens on Left (attacking Right towards away goal)
      const homeTokens: Token[] = [
        { id: 1, team: 'home', x: W * 0.10, y: centerY, vx: 0, vy: 0, radius: tokenRadius, mass: 2.2, isGoalkeeper: true },
        { id: 2, team: 'home', x: W * 0.24, y: centerY - 110, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 3, team: 'home', x: W * 0.24, y: centerY + 110, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 4, team: 'home', x: W * 0.38, y: centerY - 65, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 5, team: 'home', x: W * 0.38, y: centerY + 65, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 }
      ];

      // Away tokens on Right (attacking Left towards home goal)
      const awayTokens: Token[] = [
        { id: 6, team: 'away', x: W * 0.90, y: centerY, vx: 0, vy: 0, radius: tokenRadius, mass: 2.2, isGoalkeeper: true },
        { id: 7, team: 'away', x: W * 0.76, y: centerY - 110, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 8, team: 'away', x: W * 0.76, y: centerY + 110, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 9, team: 'away', x: W * 0.62, y: centerY - 65, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 10, team: 'away', x: W * 0.62, y: centerY + 65, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 }
      ];

      worldRef.current.tokens = [...homeTokens, ...awayTokens];
      worldRef.current.ball = { x: W / 2, y: centerY, vx: 0, vy: 0, radius: 13 };
    } else {
      // Vertical Dimensions for Mobile Phones
      const W = 540;
      const H = 960;
      worldRef.current.width = W;
      worldRef.current.height = H;
      worldRef.current.pitchLeft = 24;
      worldRef.current.pitchRight = W - 24;
      worldRef.current.pitchTop = 44;
      worldRef.current.pitchBottom = H - 44;
      worldRef.current.goalWidth = 160;
      worldRef.current.goalDepth = 40;

      const centerX = W / 2;
      const centerY = H / 2;
      const tokenRadius = 23;

      // Home tokens on Bottom (defending bottom goal, attacking UPWARDS)
      const homeTokens: Token[] = [
        { id: 1, team: 'home', x: centerX, y: H * 0.90, vx: 0, vy: 0, radius: tokenRadius, mass: 2.2, isGoalkeeper: true },
        { id: 2, team: 'home', x: centerX - 120, y: centerY + 230, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 3, team: 'home', x: centerX + 120, y: centerY + 230, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 4, team: 'home', x: centerX - 65, y: centerY + 110, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 5, team: 'home', x: centerX + 65, y: centerY + 110, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 }
      ];

      // Away tokens on Top (defending top goal, attacking DOWNWARDS)
      const awayTokens: Token[] = [
        { id: 6, team: 'away', x: centerX, y: H * 0.10, vx: 0, vy: 0, radius: tokenRadius, mass: 2.2, isGoalkeeper: true },
        { id: 7, team: 'away', x: centerX - 120, y: centerY - 230, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 8, team: 'away', x: centerX + 120, y: centerY - 230, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 9, team: 'away', x: centerX - 65, y: centerY - 110, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 },
        { id: 10, team: 'away', x: centerX + 65, y: centerY - 110, vx: 0, vy: 0, radius: tokenRadius, mass: 2.0 }
      ];

      worldRef.current.tokens = [...homeTokens, ...awayTokens];
      worldRef.current.ball = { x: centerX, y: centerY, vx: 0, vy: 0, radius: 13 };
    }

    worldRef.current.selectedTokenId = null;
    worldRef.current.dragStart = null;
    worldRef.current.dragCurrent = null;
    worldRef.current.isAiming = false;
    worldRef.current.isGoalProcessing = false;
    worldRef.current.currentTurn = kickoffTeam;
    worldRef.current.turnState = 'aiming';
    worldRef.current.movingFrames = 0;

    setCurrentTurn(kickoffTeam);
    setTurnState('aiming');
  }, []);

  // Initialize pitch once on mount (only if not already set up)
  useEffect(() => {
    if (worldRef.current.tokens.length === 0) {
      setupFormation('home', orientation);
      soundEngine.playWhistle('kickoff');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Orientation toggle handler
  const handleToggleOrientation = () => {
    const newPlatform: DevicePlatform = devicePlatform === 'desktop' ? 'mobile' : 'desktop';
    setDevicePlatform(newPlatform);
    const newOrient: Orientation = newPlatform === 'desktop' ? 'horizontal' : 'vertical';
    setOrientation(newOrient);
    setupFormation(worldRef.current.currentTurn, newOrient);
    soundEngine.playClick();
  };

  // Match countdown timer
  useEffect(() => {
    if (isPaused || turnState === 'goal_celebration' || turnState === 'game_over') return;
    if (gameMode === 'practice') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTurnState('game_over');
          soundEngine.playWhistle('fulltime');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, turnState, gameMode]);

  // Handle Game Over
  useEffect(() => {
    if (turnState === 'game_over') {
      const timeout = setTimeout(() => {
        recordMatchResult(homeScore, awayScore);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [turnState, homeScore, awayScore, recordMatchResult]);

  // AI Turn Handling (Supports both Horizontal & Vertical Pitch)
  useEffect(() => {
    if (turnState !== 'aiming' || isPaused) return;

    const isAiTurn = (gameMode === 'tournament' || gameMode === 'quick') && currentTurn === 'away';
    if (!isAiTurn) return;

    const aiDelay = setTimeout(() => {
      const world = worldRef.current;
      // Double check state hasn't changed during delay
      if (world.turnState !== 'aiming' || world.currentTurn !== 'away') return;

      const awayTokens = world.tokens.filter(t => t.team === 'away');
      const ball = world.ball;

      if (!awayTokens.length) return;

      let bestToken: Token = awayTokens[0];
      let bestScore = -99999;

      if (world.orientation === 'horizontal') {
        // Horizontal: Away on right, shooting LEFT towards Home Goal at (pitchLeft, centerY)
        awayTokens.forEach(token => {
          const dx = ball.x - token.x;
          const dy = ball.y - token.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let score = -dist;
          if (token.x > ball.x) {
            score += 260; // good shooting position to the left
          }
          if (token.isGoalkeeper) {
            score -= 120;
          }

          if (score > bestScore) {
            bestScore = score;
            bestToken = token;
          }
        });

        const targetGoalX = world.pitchLeft - 15;
        const targetGoalY = world.height / 2 + (Math.random() - 0.5) * 80;

        const ballToGoalX = targetGoalX - ball.x;
        const ballToGoalY = targetGoalY - ball.y;
        const len = Math.sqrt(ballToGoalX * ballToGoalX + ballToGoalY * ballToGoalY) || 1;
        const dirX = ballToGoalX / len;
        const dirY = ballToGoalY / len;

        const idealContactX = ball.x - dirX * (ball.radius + bestToken.radius);
        const idealContactY = ball.y - dirY * (ball.radius + bestToken.radius);

        const shootVx = (idealContactX - bestToken.x);
        const shootVy = (idealContactY - bestToken.y);
        const shootDist = Math.sqrt(shootVx * shootVx + shootVy * shootVy) || 1;

        const variance = settings.difficulty === 'easy' ? 0.35 : settings.difficulty === 'medium' ? 0.18 : 0.05;
        const angleOffset = (Math.random() - 0.5) * variance;
        const cosA = Math.cos(angleOffset);
        const sinA = Math.sin(angleOffset);
        const adjustedX = (shootVx / shootDist) * cosA - (shootVy / shootDist) * sinA;
        const adjustedY = (shootVx / shootDist) * sinA + (shootVy / shootDist) * cosA;

        const power = Math.min(22, Math.max(9, shootDist * 0.07 + 8));

        bestToken.vx = (isNaN(adjustedX) ? -1 : adjustedX) * power;
        bestToken.vy = (isNaN(adjustedY) ? 0 : adjustedY) * power;
      } else {
        // Vertical: Away on top, shooting DOWNWARDS towards Home Goal at (centerX, pitchBottom)
        awayTokens.forEach(token => {
          const dx = ball.x - token.x;
          const dy = ball.y - token.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let score = -dist;
          if (token.y < ball.y) {
            score += 260; // good shooting position downwards
          }
          if (token.isGoalkeeper) {
            score -= 120;
          }

          if (score > bestScore) {
            bestScore = score;
            bestToken = token;
          }
        });

        const targetGoalX = world.width / 2 + (Math.random() - 0.5) * 80;
        const targetGoalY = world.pitchBottom + 15;

        const ballToGoalX = targetGoalX - ball.x;
        const ballToGoalY = targetGoalY - ball.y;
        const len = Math.sqrt(ballToGoalX * ballToGoalX + ballToGoalY * ballToGoalY) || 1;
        const dirX = ballToGoalX / len;
        const dirY = ballToGoalY / len;

        const idealContactX = ball.x - dirX * (ball.radius + bestToken.radius);
        const idealContactY = ball.y - dirY * (ball.radius + bestToken.radius);

        const shootVx = (idealContactX - bestToken.x);
        const shootVy = (idealContactY - bestToken.y);
        const shootDist = Math.sqrt(shootVx * shootVx + shootVy * shootVy) || 1;

        const variance = settings.difficulty === 'easy' ? 0.35 : settings.difficulty === 'medium' ? 0.18 : 0.05;
        const angleOffset = (Math.random() - 0.5) * variance;
        const cosA = Math.cos(angleOffset);
        const sinA = Math.sin(angleOffset);
        const adjustedX = (shootVx / shootDist) * cosA - (shootVy / shootDist) * sinA;
        const adjustedY = (shootVx / shootDist) * sinA + (shootVy / shootDist) * cosA;

        const power = Math.min(22, Math.max(9, shootDist * 0.07 + 8));

        bestToken.vx = (isNaN(adjustedX) ? 0 : adjustedX) * power;
        bestToken.vy = (isNaN(adjustedY) ? 1 : adjustedY) * power;
      }

      soundEngine.playKick(1.0);
      world.turnState = 'moving';
      world.movingFrames = 0;
      setTurnState('moving');
    }, 950);

    return () => clearTimeout(aiDelay);
  }, [currentTurn, turnState, isPaused, gameMode, settings.difficulty]);

  // Goal Handler
  const handleGoal = useCallback((scoringTeam: 'home' | 'away') => {
    if (worldRef.current.turnState === 'goal_celebration' || worldRef.current.turnState === 'game_over') return;
    worldRef.current.isGoalProcessing = true;
    worldRef.current.turnState = 'goal_celebration';
    setTurnState('goal_celebration');
    setGoalCelebration({ team: scoringTeam });

    if (scoringTeam === 'home') {
      setHomeScore(s => s + 1);
    } else {
      setAwayScore(s => s + 1);
    }

    soundEngine.playGoalRoar();

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#04774D', '#F4B335', '#9ED47D', '#FFFAF3']
    });

    setTimeout(() => {
      setGoalCelebration(null);
      setupFormation(scoringTeam === 'home' ? 'away' : 'home');
    }, 2800);
  }, [setupFormation]);

  // Physics Loop & Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const updatePhysics = () => {
      if (isPaused) return;

      const world = worldRef.current;
      const isHoriz = world.orientation === 'horizontal';
      const { pitchLeft, pitchRight, pitchTop, pitchBottom, goalWidth, goalDepth } = world;

      let anyMoving = false;
      const stopThreshold = 0.22;

      // 1. Move Tokens
      world.tokens.forEach(token => {
        token.x += token.vx;
        token.y += token.vy;
        token.vx *= world.friction;
        token.vy *= world.friction;

        // Zero out small velocities to prevent infinite micro-jiggle
        if (Math.abs(token.vx) < stopThreshold && Math.abs(token.vy) < stopThreshold) {
          token.vx = 0;
          token.vy = 0;
        }

        if (token.vx !== 0 || token.vy !== 0) anyMoving = true;

        if (isHoriz) {
          const centerY = world.height / 2;
          const goalTop = centerY - goalWidth / 2;
          const goalBottom = centerY + goalWidth / 2;
          const inGoalY = token.y > goalTop && token.y < goalBottom;

          // Top/bottom walls
          if (token.y - token.radius < pitchTop) {
            token.y = pitchTop + token.radius;
            token.vy = -token.vy * world.restitution;
          } else if (token.y + token.radius > pitchBottom) {
            token.y = pitchBottom - token.radius;
            token.vy = -token.vy * world.restitution;
          }

          // Left/right borders
          if (token.x - token.radius < pitchLeft) {
            if (!inGoalY || token.x < 15) {
              token.x = Math.max(15, pitchLeft + token.radius);
              token.vx = -token.vx * world.restitution;
            }
          } else if (token.x + token.radius > pitchRight) {
            if (!inGoalY || token.x > world.width - 15) {
              token.x = Math.min(world.width - 15, pitchRight - token.radius);
              token.vx = -token.vx * world.restitution;
            }
          }
        } else {
          // Vertical Mode
          const centerX = world.width / 2;
          const goalLeft = centerX - goalWidth / 2;
          const goalRight = centerX + goalWidth / 2;
          const inGoalX = token.x > goalLeft && token.x < goalRight;

          // Left/right walls
          if (token.x - token.radius < pitchLeft) {
            token.x = pitchLeft + token.radius;
            token.vx = -token.vx * world.restitution;
          } else if (token.x + token.radius > pitchRight) {
            token.x = pitchRight - token.radius;
            token.vx = -token.vx * world.restitution;
          }

          // Top/bottom borders
          if (token.y - token.radius < pitchTop) {
            if (!inGoalX || token.y < 15) {
              token.y = Math.max(15, pitchTop + token.radius);
              token.vy = -token.vy * world.restitution;
            }
          } else if (token.y + token.radius > pitchBottom) {
            if (!inGoalX || token.y > world.height - 15) {
              token.y = Math.min(world.height - 15, pitchBottom - token.radius);
              token.vy = -token.vy * world.restitution;
            }
          }
        }
      });

      // 2. Move Ball
      const ball = world.ball;
      ball.x += ball.vx;
      ball.y += ball.vy;
      ball.vx *= world.ballFriction;
      ball.vy *= world.ballFriction;

      if (Math.abs(ball.vx) < stopThreshold && Math.abs(ball.vy) < stopThreshold) {
        ball.vx = 0;
        ball.vy = 0;
      }
      if (ball.vx !== 0 || ball.vy !== 0) anyMoving = true;

      // Post Collision helper
      const checkPostCollision = (post: { x: number; y: number }) => {
        const dx = ball.x - post.x;
        const dy = ball.y - post.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ball.radius + 6) {
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const dot = ball.vx * nx + ball.vy * ny;
          ball.vx -= 1.8 * dot * nx;
          ball.vy -= 1.8 * dot * ny;
          ball.x = post.x + nx * (ball.radius + 7);
          ball.y = post.y + ny * (ball.radius + 7);
          if (!isMuted) soundEngine.playPost();
        }
      };

      if (isHoriz) {
        // Horizontal: Goals on Left & Right
        const centerY = world.height / 2;
        const goalTop = centerY - goalWidth / 2;
        const goalBottom = centerY + goalWidth / 2;
        const ballInGoalY = ball.y > goalTop + 6 && ball.y < goalBottom - 6;

        // Top/bottom walls
        if (ball.y - ball.radius < pitchTop) {
          ball.y = pitchTop + ball.radius;
          ball.vy = -ball.vy * 0.85;
          if (!isMuted && Math.abs(ball.vy) > 1) soundEngine.playCollision();
        } else if (ball.y + ball.radius > pitchBottom) {
          ball.y = pitchBottom - ball.radius;
          ball.vy = -ball.vy * 0.85;
          if (!isMuted && Math.abs(ball.vy) > 1) soundEngine.playCollision();
        }

        // Posts
        checkPostCollision({ x: pitchLeft, y: goalTop });
        checkPostCollision({ x: pitchLeft, y: goalBottom });
        checkPostCollision({ x: pitchRight, y: goalTop });
        checkPostCollision({ x: pitchRight, y: goalBottom });

        // Left Goal (Away scores if ball enters left goal)
        if (ball.x - ball.radius < pitchLeft) {
          if (ballInGoalY) {
            if (ball.x < pitchLeft - 18 && !world.isGoalProcessing && world.turnState !== 'goal_celebration' && world.turnState !== 'game_over') {
              world.isGoalProcessing = true;
              handleGoal('away');
            }
            if (ball.x < pitchLeft - goalDepth + 10) {
              ball.x = pitchLeft - goalDepth + 10;
              ball.vx = -ball.vx * 0.3;
            }
          } else {
            ball.x = pitchLeft + ball.radius;
            ball.vx = -ball.vx * 0.85;
            if (!isMuted && Math.abs(ball.vx) > 1) soundEngine.playCollision();
          }
        }

        // Right Goal (Home scores if ball enters right goal)
        if (ball.x + ball.radius > pitchRight) {
          if (ballInGoalY) {
            if (ball.x > pitchRight + 18 && !world.isGoalProcessing && world.turnState !== 'goal_celebration' && world.turnState !== 'game_over') {
              world.isGoalProcessing = true;
              handleGoal('home');
            }
            if (ball.x > pitchRight + goalDepth - 10) {
              ball.x = pitchRight + goalDepth - 10;
              ball.vx = -ball.vx * 0.3;
            }
          } else {
            ball.x = pitchRight - ball.radius;
            ball.vx = -ball.vx * 0.85;
            if (!isMuted && Math.abs(ball.vx) > 1) soundEngine.playCollision();
          }
        }
      } else {
        // Vertical: Goals on Top & Bottom
        const centerX = world.width / 2;
        const goalLeft = centerX - goalWidth / 2;
        const goalRight = centerX + goalWidth / 2;
        const ballInGoalX = ball.x > goalLeft + 6 && ball.x < goalRight - 6;

        // Left/right touchlines
        if (ball.x - ball.radius < pitchLeft) {
          ball.x = pitchLeft + ball.radius;
          ball.vx = -ball.vx * 0.85;
          if (!isMuted && Math.abs(ball.vx) > 1) soundEngine.playCollision();
        } else if (ball.x + ball.radius > pitchRight) {
          ball.x = pitchRight - ball.radius;
          ball.vx = -ball.vx * 0.85;
          if (!isMuted && Math.abs(ball.vx) > 1) soundEngine.playCollision();
        }

        // Posts
        checkPostCollision({ x: goalLeft, y: pitchTop });
        checkPostCollision({ x: goalRight, y: pitchTop });
        checkPostCollision({ x: goalLeft, y: pitchBottom });
        checkPostCollision({ x: goalRight, y: pitchBottom });

        // Top Goal (Home scores attacking UPWARDS)
        if (ball.y - ball.radius < pitchTop) {
          if (ballInGoalX) {
            if (ball.y < pitchTop - 18 && !world.isGoalProcessing && world.turnState !== 'goal_celebration' && world.turnState !== 'game_over') {
              world.isGoalProcessing = true;
              handleGoal('home');
            }
            if (ball.y < pitchTop - goalDepth + 10) {
              ball.y = pitchTop - goalDepth + 10;
              ball.vy = -ball.vy * 0.3;
            }
          } else {
            ball.y = pitchTop + ball.radius;
            ball.vy = -ball.vy * 0.85;
            if (!isMuted && Math.abs(ball.vy) > 1) soundEngine.playCollision();
          }
        }

        // Bottom Goal (Away scores attacking DOWNWARDS)
        if (ball.y + ball.radius > pitchBottom) {
          if (ballInGoalX) {
            if (ball.y > pitchBottom + 18 && !world.isGoalProcessing && world.turnState !== 'goal_celebration' && world.turnState !== 'game_over') {
              world.isGoalProcessing = true;
              handleGoal('away');
            }
            if (ball.y > pitchBottom + goalDepth - 10) {
              ball.y = pitchBottom + goalDepth - 10;
              ball.vy = -ball.vy * 0.3;
            }
          } else {
            ball.y = pitchBottom - ball.radius;
            ball.vy = -ball.vy * 0.85;
            if (!isMuted && Math.abs(ball.vy) > 1) soundEngine.playCollision();
          }
        }
      }

      // 3. Token-to-Ball Collisions (Apply impulse ONLY when approaching)
      world.tokens.forEach(token => {
        const dx = ball.x - token.x;
        const dy = ball.y - token.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = token.radius + ball.radius;

        if (dist < minDist) {
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);

          // Position separation
          const overlap = minDist - dist;
          ball.x += nx * overlap * 0.7;
          ball.y += ny * overlap * 0.7;
          token.x -= nx * overlap * 0.3;
          token.y -= ny * overlap * 0.3;

          // Normal relative velocity: positive means approaching
          const relVel = (token.vx - ball.vx) * nx + (token.vy - ball.vy) * ny;
          if (relVel > 0) {
            const p = (2 * relVel) / (token.mass + 1);
            token.vx -= p * 0.9 * nx;
            token.vy -= p * 0.9 * ny;
            ball.vx += p * 1.5 * nx;
            ball.vy += p * 1.5 * ny;

            if (!isMuted) {
              const hitSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
              soundEngine.playKick(Math.min(1.2, hitSpeed / 8));
            }
          }
        }
      });

      // 4. Token-to-Token Collisions (Apply impulse ONLY when approaching)
      for (let i = 0; i < world.tokens.length; i++) {
        for (let j = i + 1; j < world.tokens.length; j++) {
          const t1 = world.tokens[i];
          const t2 = world.tokens[j];
          const dx = t2.x - t1.x;
          const dy = t2.y - t1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = t1.radius + t2.radius;

          if (dist < minDist) {
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            const overlap = (minDist - dist) / 2;

            t1.x -= nx * overlap;
            t1.y -= ny * overlap;
            t2.x += nx * overlap;
            t2.y += ny * overlap;

            const relVel = (t1.vx - t2.vx) * nx + (t1.vy - t2.vy) * ny;
            if (relVel > 0) {
              const p = (2 * relVel) / (t1.mass + t2.mass);
              t1.vx -= p * t2.mass * nx * 0.85;
              t1.vy -= p * t2.mass * ny * 0.85;
              t2.vx += p * t1.mass * nx * 0.85;
              t2.vy += p * t1.mass * ny * 0.85;

              if (!isMuted) soundEngine.playCollision();
            }
          }
        }
      }

      // 5. Turn Transition Watchdog & Completion
      if (world.turnState === 'moving') {
        world.movingFrames = (world.movingFrames || 0) + 1;

        // If stopped naturally OR movement watchdog triggered (3.5 seconds = 210 frames)
        if (!anyMoving || world.movingFrames > 210) {
          // Zero out any residual micro-velocities
          world.tokens.forEach(t => { t.vx = 0; t.vy = 0; });
          world.ball.vx = 0;
          world.ball.vy = 0;
          world.movingFrames = 0;

          // Switch state synchronously on ref to prevent multiple triggers in subsequent animation frames!
          world.turnState = 'aiming';
          const nextTurn: 'home' | 'away' = world.currentTurn === 'home' ? 'away' : 'home';
          world.currentTurn = nextTurn;

          setCurrentTurn(nextTurn);
          setTurnState('aiming');
        }
      } else {
        world.movingFrames = 0;
      }
    };

    const drawPitch = () => {
      const world = worldRef.current;
      const isHoriz = world.orientation === 'horizontal';
      const { width: W, height: H, pitchLeft, pitchRight, pitchTop, pitchBottom, goalWidth, goalDepth } = world;
      const pitchW = pitchRight - pitchLeft;
      const pitchH = pitchBottom - pitchTop;
      const centerX = W / 2;
      const centerY = H / 2;

      ctx.clearRect(0, 0, W, H);

      // Stadium surround background
      ctx.fillStyle = '#021A0A';
      ctx.fillRect(0, 0, W, H);

      if (isHoriz) {
        // --- HORIZONTAL DESKTOP PITCH DRAWING ---
        // Perimeter LED Ad Boards (Top & Bottom)
        ctx.fillStyle = '#011206';
        ctx.fillRect(pitchLeft, 2, pitchW, 20);
        ctx.fillRect(pitchLeft, H - 22, pitchW, 20);

        ctx.fillStyle = '#F4B335';
        ctx.fillRect(pitchLeft, 21, pitchW, 1.5);
        ctx.fillRect(pitchLeft, H - 23, pitchW, 1.5);

        // Draw glowing sponsor logos along the top & bottom perimeter boards
        const loadedSponsors = sponsorImagesRef.current.filter(img => img.complete && img.naturalWidth > 0);
        if (loadedSponsors.length > 0) {
          const slotW = 44;
          const slotH = 16;
          const spacing = 75;
          const count = Math.floor((pitchW - 40) / spacing);
          for (let i = 0; i < count; i++) {
            const imgTop = loadedSponsors[i % loadedSponsors.length];
            const imgBottom = loadedSponsors[(i + 2) % loadedSponsors.length];
            const x = pitchLeft + 25 + i * spacing;
            ctx.drawImage(imgTop, x, 4, slotW, slotH);
            ctx.drawImage(imgBottom, x, H - 20, slotW, slotH);
          }
        } else {
          ctx.fillStyle = '#9ED47D';
          ctx.font = 'bold 9px "Kufam", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('خليجي 27 • KHALEEJI 27 JEDDAH 2026 • كأس الخليج العربي • MATCH HOSPITALITY', W / 2, 11);
          ctx.fillText('ملعب مدينة الملك عبدالله الرياضية • الجوهرة المشعة • JEDDAH 2026', W / 2, H - 11);
        }

        // Lawn Stripes (Vertical bands across width)
        const numStripes = 14;
        const stripeW = pitchW / numStripes;
        for (let i = 0; i < numStripes; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#0B6639' : '#0F7342';
          ctx.fillRect(pitchLeft + i * stripeW, pitchTop, stripeW, pitchH);
        }

        // Outer Boundary
        ctx.strokeStyle = 'rgba(255, 250, 243, 0.9)';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(pitchLeft, pitchTop, pitchW, pitchH);

        // Halfway Line & Center Circle (Vertical)
        ctx.beginPath();
        ctx.moveTo(centerX, pitchTop);
        ctx.lineTo(centerX, pitchBottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 68, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 250, 243, 0.95)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Penalty boxes (Left & Right)
        const boxW = 115;
        const boxH = 240;
        const boxTop = centerY - boxH / 2;

        // Left Penalty Box
        ctx.strokeRect(pitchLeft, boxTop, boxW, boxH);
        ctx.strokeRect(pitchLeft, centerY - 65, 45, 130);
        ctx.beginPath();
        ctx.arc(pitchLeft + 85, centerY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pitchLeft + 85, centerY, 42, -0.3 * Math.PI, 0.3 * Math.PI);
        ctx.stroke();

        // Right Penalty Box
        ctx.strokeRect(pitchRight - boxW, boxTop, boxW, boxH);
        ctx.strokeRect(pitchRight - 45, centerY - 65, 45, 130);
        ctx.beginPath();
        ctx.arc(pitchRight - 85, centerY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pitchRight - 85, centerY, 42, 0.7 * Math.PI, 1.3 * Math.PI);
        ctx.stroke();

        // Corner Arcs
        const cornerR = 15;
        ctx.beginPath();
        ctx.arc(pitchLeft, pitchTop, cornerR, 0, Math.PI / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pitchLeft, pitchBottom, cornerR, -Math.PI / 2, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pitchRight, pitchTop, cornerR, Math.PI / 2, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pitchRight, pitchBottom, cornerR, Math.PI, 1.5 * Math.PI);
        ctx.stroke();

        // Goals (Left & Right)
        const goalTop = centerY - goalWidth / 2;
        const drawGoalNet = (x: number, y: number, w: number, h: number) => {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1;
          for (let gx = x; gx <= x + w; gx += 6) {
            ctx.beginPath();
            ctx.moveTo(gx, y);
            ctx.lineTo(gx, y + h);
            ctx.stroke();
          }
          for (let gy = y; gy <= y + h; gy += 6) {
            ctx.beginPath();
            ctx.moveTo(x, gy);
            ctx.lineTo(x + w, gy);
            ctx.stroke();
          }
        };

        // Left Goal Net & Frame
        drawGoalNet(pitchLeft - goalDepth, goalTop, goalDepth, goalWidth);
        ctx.strokeStyle = '#FFFAF3';
        ctx.lineWidth = 5;
        ctx.strokeRect(pitchLeft - goalDepth, goalTop, goalDepth, goalWidth);

        // Right Goal Net & Frame
        drawGoalNet(pitchRight, goalTop, goalDepth, goalWidth);
        ctx.strokeStyle = '#FFFAF3';
        ctx.lineWidth = 5;
        ctx.strokeRect(pitchRight, goalTop, goalDepth, goalWidth);

        // Posts
        const drawPost = (px: number, py: number) => {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#999999';
          ctx.lineWidth = 1;
          ctx.stroke();
        };
        drawPost(pitchLeft, goalTop);
        drawPost(pitchLeft, goalTop + goalWidth);
        drawPost(pitchRight, goalTop);
        drawPost(pitchRight, goalTop + goalWidth);
      } else {
        // --- VERTICAL MOBILE PITCH DRAWING ---
        // Perimeter LED Ad Boards (Left & Right)
        ctx.fillStyle = '#011206';
        ctx.fillRect(2, pitchTop, 18, pitchH);
        ctx.fillRect(W - 20, pitchTop, 18, pitchH);

        ctx.fillStyle = '#F4B335';
        ctx.fillRect(20, pitchTop, 1.5, pitchH);
        ctx.fillRect(W - 22, pitchTop, 1.5, pitchH);

        // Draw glowing sponsor logos along the left & right perimeter boards
        const loadedSponsors = sponsorImagesRef.current.filter(img => img.complete && img.naturalWidth > 0);
        if (loadedSponsors.length > 0) {
          const slotW = 14;
          const slotH = 34;
          const spacing = 72;
          const count = Math.floor((pitchH - 40) / spacing);
          for (let i = 0; i < count; i++) {
            const imgLeft = loadedSponsors[i % loadedSponsors.length];
            const imgRight = loadedSponsors[(i + 3) % loadedSponsors.length];
            const y = pitchTop + 20 + i * spacing;

            ctx.save();
            ctx.translate(11, y + slotH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(imgLeft, -slotH / 2, -slotW / 2, slotH, slotW);
            ctx.restore();

            ctx.save();
            ctx.translate(W - 11, y + slotH / 2);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(imgRight, -slotH / 2, -slotW / 2, slotH, slotW);
            ctx.restore();
          }
        } else {
          ctx.save();
          ctx.fillStyle = '#9ED47D';
          ctx.font = 'bold 10px "Kufam", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.translate(11, centerY);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText('خليجي 27 • KHALEEJI 27 JEDDAH 2026 • MATCH HOSPITALITY', 0, 0);
          ctx.restore();

          ctx.save();
          ctx.fillStyle = '#9ED47D';
          ctx.font = 'bold 10px "Kufam", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.translate(W - 11, centerY);
          ctx.rotate(Math.PI / 2);
          ctx.fillText('ملعب مدينة الملك عبدالله الرياضية • الجوهرة المشعة • JEDDAH 2026', 0, 0);
          ctx.restore();
        }

        // Lawn Stripes (Horizontal bands down height)
        const numStripes = 14;
        const stripeH = pitchH / numStripes;
        for (let i = 0; i < numStripes; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#0B6639' : '#0F7342';
          ctx.fillRect(pitchLeft, pitchTop + i * stripeH, pitchW, stripeH);
        }

        // Outer Boundary
        ctx.strokeStyle = 'rgba(255, 250, 243, 0.9)';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(pitchLeft, pitchTop, pitchW, pitchH);

        // Halfway Line & Center Circle (Horizontal)
        ctx.beginPath();
        ctx.moveTo(pitchLeft, centerY);
        ctx.lineTo(pitchRight, centerY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 68, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 250, 243, 0.95)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Penalty Boxes (Top & Bottom)
        const penaltyBoxW = 240;
        const penaltyBoxH = 115;
        const goalAreaW = 130;
        const goalAreaH = 45;

        // Top Penalty Box
        ctx.strokeRect(centerX - penaltyBoxW / 2, pitchTop, penaltyBoxW, penaltyBoxH);
        ctx.strokeRect(centerX - goalAreaW / 2, pitchTop, goalAreaW, goalAreaH);
        ctx.beginPath();
        ctx.arc(centerX, pitchTop + 85, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, pitchTop + 85, 42, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Bottom Penalty Box
        ctx.strokeRect(centerX - penaltyBoxW / 2, pitchBottom - penaltyBoxH, penaltyBoxW, penaltyBoxH);
        ctx.strokeRect(centerX - goalAreaW / 2, pitchBottom - goalAreaH, goalAreaW, goalAreaH);
        ctx.beginPath();
        ctx.arc(centerX, pitchBottom - 85, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, pitchBottom - 85, 42, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();

        // Corner Arcs
        const cornerR = 15;
        ctx.beginPath();
        ctx.arc(pitchLeft, pitchTop, cornerR, 0, Math.PI / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pitchRight, pitchTop, cornerR, Math.PI / 2, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pitchLeft, pitchBottom, cornerR, -Math.PI / 2, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pitchRight, pitchBottom, cornerR, Math.PI, 1.5 * Math.PI);
        ctx.stroke();

        // Goals (Top & Bottom)
        const goalLeft = centerX - goalWidth / 2;
        const drawGoalNet = (x: number, y: number, w: number, h: number) => {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1;
          for (let gx = x; gx <= x + w; gx += 6) {
            ctx.beginPath();
            ctx.moveTo(gx, y);
            ctx.lineTo(gx, y + h);
            ctx.stroke();
          }
          for (let gy = y; gy <= y + h; gy += 6) {
            ctx.beginPath();
            ctx.moveTo(x, gy);
            ctx.lineTo(x + w, gy);
            ctx.stroke();
          }
        };

        // Top Goal Net & Frame
        drawGoalNet(goalLeft, pitchTop - goalDepth, goalWidth, goalDepth);
        ctx.strokeStyle = '#FFFAF3';
        ctx.lineWidth = 5;
        ctx.strokeRect(goalLeft, pitchTop - goalDepth, goalWidth, goalDepth);

        // Bottom Goal Net & Frame
        drawGoalNet(goalLeft, pitchBottom, goalWidth, goalDepth);
        ctx.strokeStyle = '#FFFAF3';
        ctx.lineWidth = 5;
        ctx.strokeRect(goalLeft, pitchBottom, goalWidth, goalDepth);

        // Posts
        const drawPost = (px: number, py: number) => {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#999999';
          ctx.lineWidth = 1;
          ctx.stroke();
        };
        drawPost(goalLeft, pitchTop);
        drawPost(goalLeft + goalWidth, pitchTop);
        drawPost(goalLeft, pitchBottom);
        drawPost(goalLeft + goalWidth, pitchBottom);
      }

      // Aim Line (Drag Guide)
      if (world.isAiming && world.selectedTokenId !== null && world.dragStart && world.dragCurrent) {
        const token = world.tokens.find(t => t.id === world.selectedTokenId);
        if (token) {
          const dx = world.dragStart.x - world.dragCurrent.x;
          const dy = world.dragStart.y - world.dragCurrent.y;
          const pullDist = Math.min(140, Math.sqrt(dx * dx + dy * dy));

          if (pullDist > 8) {
            const angle = Math.atan2(dy, dx);
            const aimDist = pullDist * 2.5;
            const targetX = token.x + Math.cos(angle) * aimDist;
            const targetY = token.y + Math.sin(angle) * aimDist;

            const grad = ctx.createLinearGradient(token.x, token.y, targetX, targetY);
            grad.addColorStop(0, '#9ED47D');
            grad.addColorStop(0.65, '#F4B335');
            grad.addColorStop(1, '#CE1126');

            ctx.strokeStyle = grad;
            ctx.lineWidth = Math.max(3, pullDist / 16);
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.moveTo(token.x, token.y);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#F4B335';
            ctx.beginPath();
            ctx.arc(targetX, targetY, 7.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(token.x, token.y);
            ctx.lineTo(world.dragCurrent.x, world.dragCurrent.y);
            ctx.stroke();
          }
        }
      }

      // Tokens (Discs with metallic rims and country badges)
      world.tokens.forEach(token => {
        const isSelected = token.id === world.selectedTokenId;
        const isCurrentTeam = token.team === world.currentTurn;
        const teamData = token.team === 'home' ? homeTeam : awayTeam;

        ctx.save();
        ctx.translate(token.x, token.y);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        const rimGrad = ctx.createLinearGradient(-token.radius, -token.radius, token.radius, token.radius);
        if (isSelected) {
          rimGrad.addColorStop(0, '#F4B335');
          rimGrad.addColorStop(0.5, '#FFFFFF');
          rimGrad.addColorStop(1, '#F4B335');
        } else {
          rimGrad.addColorStop(0, '#D4D8DC');
          rimGrad.addColorStop(0.5, '#FFFFFF');
          rimGrad.addColorStop(1, '#8A929B');
        }

        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(0, 0, token.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';

        ctx.fillStyle = teamData.primaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, token.radius - 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = teamData.accentColor || '#F4B335';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, token.radius - 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = teamData.secondaryColor || '#FFFAF3';
        ctx.font = `bold ${token.isGoalkeeper ? '9px' : '10px'} "Kufam", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(token.isGoalkeeper ? 'GK' : teamData.shortCode, 0, 1);

        if (isCurrentTeam && world.turnState === 'aiming') {
          ctx.strokeStyle = isSelected ? '#F4B335' : 'rgba(158, 212, 125, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, token.radius + 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      });

      // Ball
      const ball = world.ball;
      ctx.save();
      ctx.translate(ball.x, ball.y);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      const ballGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, ball.radius);
      ballGrad.addColorStop(0, '#FFFFFF');
      ballGrad.addColorStop(0.8, '#EEEEEE');
      ballGrad.addColorStop(1, '#B0B5BA');

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#032810';
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      const patchAngle = 0.8;
      for (let p = 0; p < 4; p++) {
        const ang = patchAngle + (p * Math.PI) / 2;
        const px = Math.cos(ang) * (ball.radius * 0.7);
        const py = Math.sin(ang) * (ball.radius * 0.7);
        ctx.beginPath();
        ctx.arc(px, py, ball.radius * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const loop = () => {
      updatePhysics();
      drawPitch();
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, orientation, homeTeam, awayTeam, handleGoal]);

  // Touch & Mouse Coordinates conversion with rock-solid precision
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const world = worldRef.current;
    if (world.turnState !== 'aiming' || isPaused) return;

    const isPlayerTurn =
      gameMode === 'multiplayer' ||
      gameMode === 'practice' ||
      (world.currentTurn === 'home');

    if (!isPlayerTurn) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    const allowedTeam = world.currentTurn;

    // Generous hit tolerance for mouse & touch
    let token = world.tokens.find(t => {
      if (t.team !== allowedTeam) return false;
      const dx = coords.x - t.x;
      const dy = coords.y - t.y;
      return Math.sqrt(dx * dx + dy * dy) <= t.radius + 26;
    });

    // Fallback: If clicked slightly outside, select the closest player of the allowed team within 65px
    if (!token) {
      let minDist = 65;
      world.tokens.forEach(t => {
        if (t.team !== allowedTeam) return;
        const dx = coords.x - t.x;
        const dy = coords.y - t.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          token = t;
        }
      });
    }

    if (token) {
      world.selectedTokenId = token.id;
      world.dragStart = { x: token.x, y: token.y };
      world.dragCurrent = { x: coords.x, y: coords.y };
      world.isAiming = true;
      if (!isMuted) soundEngine.playClick();

      // Attach global listeners to window so dragging outside the canvas never drops or freezes!
      const onGlobalMove = (ev: PointerEvent) => {
        const w = worldRef.current;
        if (!w.isAiming || !w.dragStart) return;
        const c = getCanvasCoords(ev.clientX, ev.clientY);
        w.dragCurrent = c;
      };

      const onGlobalUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onGlobalMove);
        window.removeEventListener('pointerup', onGlobalUp);
        window.removeEventListener('pointercancel', onGlobalUp);

        const w = worldRef.current;
        if (!w.isAiming || !w.dragStart || !w.dragCurrent || w.selectedTokenId === null) {
          w.isAiming = false;
          w.selectedTokenId = null;
          w.dragStart = null;
          w.dragCurrent = null;
          return;
        }

        const releaseCoords = getCanvasCoords(ev.clientX, ev.clientY);
        const selToken = w.tokens.find(t => t.id === w.selectedTokenId);
        if (selToken) {
          const dx = w.dragStart.x - releaseCoords.x;
          const dy = w.dragStart.y - releaseCoords.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 5) {
            const maxForce = 26;
            const force = Math.min(maxForce, dist * 0.22);
            const angle = Math.atan2(dy, dx);

            selToken.vx = Math.cos(angle) * force;
            selToken.vy = Math.sin(angle) * force;

            if (!isMuted) soundEngine.playKick(force / maxForce);
            w.turnState = 'moving';
            w.movingFrames = 0;
            setTurnState('moving');
          }
        }

        w.isAiming = false;
        w.selectedTokenId = null;
        w.dragStart = null;
        w.dragCurrent = null;
      };

      window.addEventListener('pointermove', onGlobalMove);
      window.addEventListener('pointerup', onGlobalUp);
      window.addEventListener('pointercancel', onGlobalUp);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const world = worldRef.current;
    if (!world.isAiming || !world.dragStart) return;
    world.dragCurrent = getCanvasCoords(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Handled primarily by the global window listener, but keeping as safeguard
    const world = worldRef.current;
    if (!world.isAiming) return;
    world.isAiming = false;
    world.selectedTokenId = null;
    world.dragStart = null;
    world.dragCurrent = null;
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isHoriz = orientation === 'horizontal';

  return (
    <div className="relative w-full h-screen bg-[#021A0A] flex flex-col justify-between items-center select-none overflow-hidden py-1 px-1 sm:px-3">
      {/* Top Header & Broadcast Scoreboard */}
      <div className={`w-full ${isHoriz ? 'max-w-6xl' : 'max-w-md'} px-2 z-20 flex flex-col items-center shrink-0`}>
        {/* Stadium Info & Controls */}
        <div className="w-full flex items-center justify-between text-xs text-[#9ED47D] mb-1 font-['Noto_Sans']">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreen(gameMode === 'tournament' ? 'tournament_dashboard' : 'menu')}
              className="px-2.5 py-1 rounded-lg bg-[#04774D]/50 hover:bg-[#04774D] text-[#FFFAF3] flex items-center gap-1 transition text-xs font-bold"
            >
              <ArrowLeft size={13} />
              <span>{language === 'ar' ? 'خروج' : 'Exit'}</span>
            </button>
            <span className="truncate max-w-[150px] sm:max-w-xs font-semibold text-[#FFFAF3]/80 text-[11px] sm:text-xs">
              {language === 'ar' ? stadium.name_ar : stadium.name_en}
            </span>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Master Sound & Music Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg border transition flex items-center justify-center min-w-[32px] min-h-[32px] ${
                isMuted
                  ? 'bg-[#CE1126]/20 border-[#CE1126]/50 text-[#FF6B6B] hover:bg-[#CE1126]/30'
                  : 'bg-[#04774D]/40 border-[#9ED47D]/30 text-[#9ED47D] hover:bg-[#04774D] hover:text-[#FFFAF3]'
              }`}
              title={isMuted ? (language === 'ar' ? 'تشغيل الصوت والموسيقى' : 'Unmute All Sounds & Music') : (language === 'ar' ? 'كتم جميع الأصوات والموسيقى' : 'Mute All Sounds & Music')}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Pause Toggle */}
            <button
              onClick={() => setIsPaused(p => !p)}
              className="p-1.5 rounded-lg bg-[#04774D]/40 hover:bg-[#04774D] text-[#FFFAF3] transition"
              title="Pause"
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>
          </div>
        </div>

        {/* Khaleeji 27 Broadcast Scoreboard */}
        <div className="w-full bg-[#032810]/95 border border-[#04774D] rounded-xl px-3 sm:px-6 py-1.5 sm:py-2 shadow-xl flex items-center justify-between">
          {/* Left/First Team */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-start">
            <TeamFlag teamId={isHoriz ? homeTeam.id : awayTeam.id} size={isHoriz ? 'md' : 'sm'} />
            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-base font-['Kufam'] text-[#FFFAF3] leading-tight">
                {isHoriz
                  ? (language === 'ar' ? homeTeam.name_ar : homeTeam.name_en)
                  : (language === 'ar' ? awayTeam.name_ar : awayTeam.name_en)}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#9ED47D] font-bold">
                {isHoriz
                  ? (gameMode === 'multiplayer' ? (language === 'ar' ? 'لاعب 1 (يسار)' : 'P1 (Left)') : (language === 'ar' ? 'أنت' : 'You'))
                  : (gameMode === 'multiplayer' ? (language === 'ar' ? 'لاعب 2 (أعلى)' : 'P2 (Top)') : (language === 'ar' ? 'الكمبيوتر' : 'AI'))
                }
              </span>
            </div>
          </div>

          {/* Central Score & Clock */}
          <div className="flex flex-col items-center px-2 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4 text-xl sm:text-3xl font-black font-['Kufam'] text-[#F4B335] tracking-widest leading-none">
              <span>{isHoriz ? homeScore : awayScore}</span>
              <span className="text-xs sm:text-base text-[#9ED47D] opacity-60">:</span>
              <span>{isHoriz ? awayScore : homeScore}</span>
            </div>
            <div className="mt-0.5 px-2.5 py-0.5 rounded-full bg-[#04774D]/70 border border-[#9ED47D]/30 text-[10px] sm:text-[11px] font-mono font-bold text-[#FFFAF3]">
              {gameMode === 'practice' ? (language === 'ar' ? 'تدريب' : 'Practice') : formatTimer(timeLeft)}
            </div>
          </div>

          {/* Right/Second Team */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end text-end">
            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-base font-['Kufam'] text-[#FFFAF3] leading-tight">
                {isHoriz
                  ? (language === 'ar' ? awayTeam.name_ar : awayTeam.name_en)
                  : (language === 'ar' ? homeTeam.name_ar : homeTeam.name_en)}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#9ED47D] font-bold">
                {isHoriz
                  ? (gameMode === 'multiplayer' ? (language === 'ar' ? 'لاعب 2 (يمين)' : 'P2 (Right)') : (language === 'ar' ? 'الكمبيوتر' : 'AI'))
                  : (gameMode === 'multiplayer' ? (language === 'ar' ? 'لاعب 1 (أسفل)' : 'P1 (Bottom)') : (language === 'ar' ? 'أنت' : 'You'))
                }
              </span>
            </div>
            <TeamFlag teamId={isHoriz ? awayTeam.id : homeTeam.id} size={isHoriz ? 'md' : 'sm'} />
          </div>
        </div>

        {/* Turn Indicator Banner */}
        <div className="mt-1 flex items-center justify-center">
          <div className={`px-3 py-0.5 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm ${
            currentTurn === 'home'
              ? 'bg-[#04774D] text-[#FFFAF3] border border-[#9ED47D]'
              : 'bg-[#8C2669] text-[#FFFAF3] border border-[#F4B335]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4B335] animate-ping" />
            <span>
              {isHoriz
                ? (language === 'ar'
                    ? currentTurn === 'home'
                      ? `دورك: ${homeTeam.name_ar} (سدد نحو اليمين)`
                      : `دور ${awayTeam.name_ar} (يسدد نحو اليسار)`
                    : currentTurn === 'home'
                      ? `Your Turn: ${homeTeam.name_en} (Shoot Right)`
                      : `${awayTeam.name_en}'s Turn (Shooting Left)`
                  )
                : (language === 'ar'
                    ? currentTurn === 'home'
                      ? `دورك: ${homeTeam.name_ar} (سدد للأعلى)`
                      : `دور ${awayTeam.name_ar} (يسدد للأسفل)`
                    : currentTurn === 'home'
                      ? `Your Turn: ${homeTeam.name_en} (Shoot Up)`
                      : `${awayTeam.name_en}'s Turn (Shooting Down)`
                  )
              }
            </span>
          </div>
        </div>
      </div>

      {/* Main Pitch Viewport: Desktop Stadium Arena vs Mobile Vertical Stands */}
      {isHoriz ? (
        <DesktopStadiumArena
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          stadium={stadium}
          homeScore={homeScore}
          awayScore={awayScore}
          timeLeft={timeLeft}
          isGoalCelebration={!!goalCelebration}
        >
          <div className="relative flex items-center justify-center w-full max-h-[70vh] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={960}
              height={560}
              className="max-w-full h-auto max-h-[70vh] aspect-[960/560] rounded-2xl shadow-2xl border-2 border-[#04774D]/80 touch-none cursor-crosshair bg-[#021A0A]"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />

            {/* Goal Overlay Animation */}
            {goalCelebration && (
              <div className="absolute inset-0 bg-[#032810]/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-in fade-in zoom-in duration-300 p-4">
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#04774D] to-[#032810] border-2 border-[#F4B335] shadow-2xl text-center flex flex-col items-center max-w-sm w-full">
                  <span className="text-5xl sm:text-6xl font-black font-['Kufam'] text-[#F4B335] tracking-wider animate-bounce">
                    {language === 'ar' ? 'هــــدف!' : 'GOAL!'}
                  </span>
                  <div className="mt-3 flex items-center gap-3">
                    <TeamFlag
                      teamId={goalCelebration.team === 'home' ? homeTeam.id : awayTeam.id}
                      size="lg"
                    />
                    <span className="text-xl sm:text-2xl font-bold font-['Kufam'] text-[#FFFAF3]">
                      {language === 'ar'
                        ? goalCelebration.team === 'home' ? homeTeam.name_ar : awayTeam.name_ar
                        : goalCelebration.team === 'home' ? homeTeam.name_en : awayTeam.name_en
                      }
                    </span>
                  </div>
                  <span className="mt-2 text-xs font-semibold text-[#9ED47D] tracking-widest uppercase">
                    Khaleeji 27 Jeddah 2026
                  </span>
                </div>
              </div>
            )}

            {/* Pause Modal */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-4">
                <div className="p-5 sm:p-6 rounded-2xl bg-[#032810] border border-[#04774D] text-center max-w-sm w-full shadow-2xl">
                  <h3 className="text-lg sm:text-xl font-black font-['Kufam'] text-[#F4B335] mb-3">
                    {language === 'ar' ? 'المباراة متوقفة' : 'Match Paused'}
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => setIsPaused(false)}
                      className="w-full py-2.5 rounded-xl bg-[#04774D] hover:bg-[#0AA771] text-[#FFFAF3] font-bold font-['Kufam'] flex items-center justify-center gap-2 transition"
                    >
                      <Play size={15} />
                      <span>{language === 'ar' ? 'استئناف' : 'Resume'}</span>
                    </button>
                    <button
                      onClick={() => setupFormation(worldRef.current.currentTurn)}
                      className="w-full py-2.5 rounded-xl bg-[#032810] hover:bg-[#04774D]/30 border border-[#04774D] text-[#FFFAF3] font-semibold flex items-center justify-center gap-2 transition text-xs"
                    >
                      <RotateCcw size={14} />
                      <span>{language === 'ar' ? 'إعادة التشكيلة' : 'Reset Positions'}</span>
                    </button>
                    <button
                      onClick={() => setScreen(gameMode === 'tournament' ? 'tournament_dashboard' : 'menu')}
                      className="w-full py-2.5 rounded-xl bg-[#CE1126]/80 hover:bg-[#CE1126] text-white font-semibold transition text-xs"
                    >
                      <span>{language === 'ar' ? 'إنهاء المباراة' : 'Quit Match'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DesktopStadiumArena>
      ) : (
        <div
          ref={containerRef}
          className="relative w-full max-w-3xl flex-1 flex flex-row items-center justify-center gap-1 sm:gap-2 px-0.5 sm:px-2 overflow-hidden my-auto"
        >
          {/* Left Cheering Crowd (Vertical Mobile: Home Team Supporters Section) */}
          <VerticalCrowdStands
            side="left"
            team={homeTeam}
            opponentTeam={awayTeam}
            isGoalCelebration={!!goalCelebration}
            className="w-8 xs:w-10 sm:w-14 md:w-18 h-full max-h-[82vh] shrink-0"
          />

          {/* Mobile Pitch Canvas Container */}
          <div className="relative flex items-center justify-center h-full max-h-[82vh] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={540}
              height={960}
              className="w-auto h-full max-h-[82vh] aspect-[9/16] rounded-2xl shadow-2xl border-2 border-[#04774D]/80 touch-none cursor-crosshair bg-[#021A0A]"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />

            {/* Goal Overlay Animation */}
            {goalCelebration && (
              <div className="absolute inset-0 bg-[#032810]/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-in fade-in zoom-in duration-300 p-4">
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#04774D] to-[#032810] border-2 border-[#F4B335] shadow-2xl text-center flex flex-col items-center max-w-sm w-full">
                  <span className="text-5xl sm:text-6xl font-black font-['Kufam'] text-[#F4B335] tracking-wider animate-bounce">
                    {language === 'ar' ? 'هــــدف!' : 'GOAL!'}
                  </span>
                  <div className="mt-3 flex items-center gap-3">
                    <TeamFlag
                      teamId={goalCelebration.team === 'home' ? homeTeam.id : awayTeam.id}
                      size="lg"
                    />
                    <span className="text-xl sm:text-2xl font-bold font-['Kufam'] text-[#FFFAF3]">
                      {language === 'ar'
                        ? goalCelebration.team === 'home' ? homeTeam.name_ar : awayTeam.name_ar
                        : goalCelebration.team === 'home' ? homeTeam.name_en : awayTeam.name_en
                      }
                    </span>
                  </div>
                  <span className="mt-2 text-xs font-semibold text-[#9ED47D] tracking-widest uppercase">
                    Khaleeji 27 Jeddah 2026
                  </span>
                </div>
              </div>
            )}

            {/* Pause Modal */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-4">
                <div className="p-5 sm:p-6 rounded-2xl bg-[#032810] border border-[#04774D] text-center max-w-sm w-full shadow-2xl">
                  <h3 className="text-lg sm:text-xl font-black font-['Kufam'] text-[#F4B335] mb-3">
                    {language === 'ar' ? 'المباراة متوقفة' : 'Match Paused'}
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => setIsPaused(false)}
                      className="w-full py-2.5 rounded-xl bg-[#04774D] hover:bg-[#0AA771] text-[#FFFAF3] font-bold font-['Kufam'] flex items-center justify-center gap-2 transition"
                    >
                      <Play size={15} />
                      <span>{language === 'ar' ? 'استئناف' : 'Resume'}</span>
                    </button>
                    <button
                      onClick={() => setupFormation(worldRef.current.currentTurn)}
                      className="w-full py-2.5 rounded-xl bg-[#032810] hover:bg-[#04774D]/30 border border-[#04774D] text-[#FFFAF3] font-semibold flex items-center justify-center gap-2 transition text-xs"
                    >
                      <RotateCcw size={14} />
                      <span>{language === 'ar' ? 'إعادة التشكيلة' : 'Reset Positions'}</span>
                    </button>
                    <button
                      onClick={() => setScreen(gameMode === 'tournament' ? 'tournament_dashboard' : 'menu')}
                      className="w-full py-2.5 rounded-xl bg-[#CE1126]/80 hover:bg-[#CE1126] text-white font-semibold transition text-xs"
                    >
                      <span>{language === 'ar' ? 'إنهاء المباراة' : 'Quit Match'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Cheering Crowd (Vertical Mobile: Away Team Supporters Section) */}
          <VerticalCrowdStands
            side="right"
            team={awayTeam}
            opponentTeam={homeTeam}
            isGoalCelebration={!!goalCelebration}
            className="w-8 xs:w-10 sm:w-14 md:w-18 h-full max-h-[82vh] shrink-0"
          />
        </div>
      )}

      {/* Bottom Tournament Status Bar */}
      <div className={`w-full ${isHoriz ? 'max-w-6xl' : 'max-w-md'} px-4 py-1.5 z-10 flex items-center justify-between text-[11px] text-[#9ED47D]/90 shrink-0 border-t border-[#04774D]/30`}>
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#0AA771] animate-ping" />
          <span>{language === 'ar' ? 'بطولة كأس الخليج العربي 27 - جدة' : 'Arabian Gulf Cup 27 - Jeddah'}</span>
        </div>
        <div className="ms-auto flex items-center gap-1.5 shrink-0">
          <KhaleejiLogo variant="emblem" size="xs" />
          <span className="text-[9px] font-bold tracking-widest text-[#F4B335] uppercase font-mono">
            JEDDAH 2026
          </span>
        </div>
      </div>
    </div>
  );
};
