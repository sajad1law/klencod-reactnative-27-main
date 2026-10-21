import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { DevicePlatform } from '../../types';
import { TEAMS } from '../../data/tournamentData';
import { soundEngine, toggleGlobalMute, isGlobalMuted } from '../../utils/audio';
import { TeamFlag } from '../brand/TeamFlag';
import { KhaleejiLogo } from '../brand/KhaleejiLogo';
import { VerticalCrowdStands } from './stadium/CheeringCrowd';
import { DesktopStadiumArena } from './stadium/DesktopStadiumArena';
import { ArrowLeft, RotateCcw, Monitor, Smartphone, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Token {
  id: number;
  team: 'home' | 'away';
  role: 'shooter' | 'goalkeeper';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

type Orientation = 'horizontal' | 'vertical';

export const PenaltyShootout: React.FC = () => {
  const {
    homeTeamId,
    awayTeamId,
    setScreen,
    language,
    recordMatchResult,
    activeMatchNumber,
    settings,
    devicePlatform,
    setDevicePlatform
  } = useGame();

  const homeTeam = TEAMS[homeTeamId] || TEAMS.ksa;
  const awayTeam = TEAMS[awayTeamId] || TEAMS.kwt;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync orientation with devicePlatform ('desktop' -> horizontal, 'mobile' -> vertical)
  const [orientation, setOrientation] = useState<Orientation>(() => {
    return devicePlatform === 'desktop' ? 'horizontal' : 'vertical';
  });

  useEffect(() => {
    setOrientation(devicePlatform === 'desktop' ? 'horizontal' : 'vertical');
  }, [devicePlatform]);

  const [isMuted, setIsMuted] = useState(() => isGlobalMuted());

  const handleToggleMute = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextMuted = toggleGlobalMute();
    setIsMuted(nextMuted);
  }, []);

  // Shootout Score & Progress
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<'home_kick' | 'away_kick'>('home_kick');
  const [homeKicks, setHomeKicks] = useState<boolean[]>([]);
  const [awayKicks, setAwayKicks] = useState<boolean[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<'home' | 'away' | null>(null);

  // Kick status
  const [turnState, setTurnState] = useState<'aiming' | 'moving' | 'celebration'>('aiming');
  const [kickResultBanner, setKickResultBanner] = useState<{ text: string; isGoal: boolean } | null>(null);

  const homeScore = homeKicks.filter(Boolean).length;
  const awayScore = awayKicks.filter(Boolean).length;

  // Single Source of Truth for physics & rendering
  const worldRef = useRef<{
    orientation: Orientation;
    width: number;
    height: number;
    pitchLeft: number;
    pitchRight: number;
    pitchTop: number;
    pitchBottom: number;
    goalWidth: number;
    goalDepth: number;
    goalX: number;
    goalY: number;
    penaltySpot: { x: number; y: number };
    tokens: Token[];
    ball: Ball;
    selectedTokenId: number | null;
    dragStart: { x: number; y: number } | null;
    dragCurrent: { x: number; y: number } | null;
    isAiming: boolean;
    currentPhase: 'home_kick' | 'away_kick';
    turnState: 'aiming' | 'moving' | 'celebration';
    isKickingConcluded: boolean;
    movingFrames: number;
    friction: number;
    ballFriction: number;
  }>({
    orientation: 'horizontal',
    width: 960,
    height: 560,
    pitchLeft: 60,
    pitchRight: 900,
    pitchTop: 30,
    pitchBottom: 530,
    goalWidth: 170,
    goalDepth: 45,
    goalX: 900,
    goalY: 280,
    penaltySpot: { x: 580, y: 280 },
    tokens: [],
    ball: { x: 580, y: 280, vx: 0, vy: 0, radius: 13 },
    selectedTokenId: null,
    dragStart: null,
    dragCurrent: null,
    isAiming: false,
    currentPhase: 'home_kick',
    turnState: 'aiming',
    isKickingConcluded: false,
    movingFrames: 0,
    friction: 0.966,
    ballFriction: 0.978
  });

  // Setup setupShootoutRound based on phase and active orientation
  const setupShootoutRound = useCallback((phase: 'home_kick' | 'away_kick', targetOrient?: Orientation) => {
    const orient = targetOrient || worldRef.current.orientation;
    worldRef.current.orientation = orient;
    worldRef.current.currentPhase = phase;
    worldRef.current.turnState = 'aiming';
    worldRef.current.isKickingConcluded = false;
    worldRef.current.movingFrames = 0;
    worldRef.current.selectedTokenId = null;
    worldRef.current.dragStart = null;
    worldRef.current.dragCurrent = null;
    worldRef.current.isAiming = false;

    const tokenRadius = 24;

    if (orient === 'horizontal') {
      // Horizontal desktop penalty half-pitch
      const W = 960;
      const H = 560;
      worldRef.current.width = W;
      worldRef.current.height = H;
      worldRef.current.pitchLeft = 50;
      worldRef.current.pitchRight = 910;
      worldRef.current.pitchTop = 26;
      worldRef.current.pitchBottom = 534;
      worldRef.current.goalWidth = 175;
      worldRef.current.goalDepth = 48;
      worldRef.current.goalX = 910;
      worldRef.current.goalY = H / 2;

      // Penalty spot is at 65% of the pitch width towards the right goal
      const spotX = W * 0.60;
      const spotY = H / 2;
      worldRef.current.penaltySpot = { x: spotX, y: spotY };
      worldRef.current.ball = { x: spotX, y: spotY, vx: 0, vy: 0, radius: 13 };

      const isHomeShooting = phase === 'home_kick';
      const shooterTeam = isHomeShooting ? 'home' : 'away';
      const goalieTeam = isHomeShooting ? 'away' : 'home';

      // Shooter stands to the left of the ball
      const shooter: Token = {
        id: 1,
        team: shooterTeam,
        role: 'shooter',
        x: spotX - 70,
        y: spotY,
        vx: 0,
        vy: 0,
        radius: tokenRadius,
        mass: 2.1
      };

      // Goalkeeper stands on the goal line on the right
      const goalie: Token = {
        id: 2,
        team: goalieTeam,
        role: 'goalkeeper',
        x: 910 - tokenRadius,
        y: spotY,
        vx: 0,
        vy: 0,
        radius: tokenRadius,
        mass: 2.4
      };

      worldRef.current.tokens = [shooter, goalie];
    } else {
      // Vertical mobile penalty pitch (Goal at TOP)
      const W = 540;
      const H = 960;
      worldRef.current.width = W;
      worldRef.current.height = H;
      worldRef.current.pitchLeft = 25;
      worldRef.current.pitchRight = W - 25;
      worldRef.current.pitchTop = 45;
      worldRef.current.pitchBottom = H - 40;
      worldRef.current.goalWidth = 180;
      worldRef.current.goalDepth = 48;
      worldRef.current.goalX = W / 2;
      worldRef.current.goalY = 45;

      const spotX = W / 2;
      const spotY = H * 0.58; // Penalty spot in upper-middle
      worldRef.current.penaltySpot = { x: spotX, y: spotY };
      worldRef.current.ball = { x: spotX, y: spotY, vx: 0, vy: 0, radius: 13 };

      const isHomeShooting = phase === 'home_kick';
      const shooterTeam = isHomeShooting ? 'home' : 'away';
      const goalieTeam = isHomeShooting ? 'away' : 'home';

      // Shooter stands below the ball
      const shooter: Token = {
        id: 1,
        team: shooterTeam,
        role: 'shooter',
        x: spotX,
        y: spotY + 70,
        vx: 0,
        vy: 0,
        radius: tokenRadius,
        mass: 2.1
      };

      // Goalkeeper stands in front of the top goal line
      const goalie: Token = {
        id: 2,
        team: goalieTeam,
        role: 'goalkeeper',
        x: spotX,
        y: 45 + tokenRadius,
        vx: 0,
        vy: 0,
        radius: tokenRadius,
        mass: 2.4
      };

      worldRef.current.tokens = [shooter, goalie];
    }

    setTurnState('aiming');
    setKickResultBanner(null);
  }, []);

  // Initialize round on mount
  useEffect(() => {
    setupShootoutRound('home_kick', orientation);
    if (!isMuted) soundEngine.playWhistle('kickoff');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle Orientation Handler
  const handleToggleOrientation = () => {
    const newPlatform: DevicePlatform = devicePlatform === 'desktop' ? 'mobile' : 'desktop';
    setDevicePlatform(newPlatform);
    const newOrient: Orientation = newPlatform === 'desktop' ? 'horizontal' : 'vertical';
    setOrientation(newOrient);
    setupShootoutRound(currentPhase, newOrient);
    if (!isMuted) soundEngine.playClick();
  };

  // Conclude kick result
  const finishKick = useCallback((isGoal: boolean) => {
    const world = worldRef.current;
    if (world.isKickingConcluded) return;
    world.isKickingConcluded = true;
    world.turnState = 'celebration';
    setTurnState('celebration');

    const isHome = world.currentPhase === 'home_kick';

    if (isGoal) {
      if (!isMuted) soundEngine.playGoalRoar();
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#04774D', '#F4B335', '#9ED47D', '#FFFAF3']
      });
      setKickResultBanner({
        text: isHome
          ? (language === 'ar' ? 'هــــــــدف!' : 'GOAL!')
          : (language === 'ar' ? 'هـــدف للخصم!' : 'GOAL FOR OPPONENT!'),
        isGoal: true
      });
    } else {
      if (!isMuted) soundEngine.playPost();
      setKickResultBanner({
        text: isHome
          ? (language === 'ar' ? 'ضاعت / تصــدي!' : 'SAVED / MISSED!')
          : (language === 'ar' ? 'تصــدي بطولي!' : 'BRILLIANT SAVE!'),
        isGoal: false
      });
    }

    // Update Scores and Progression
    setTimeout(() => {
      let nextHomeKicks = [...homeKicks];
      let nextAwayKicks = [...awayKicks];

      if (isHome) {
        nextHomeKicks = [...homeKicks, isGoal];
        setHomeKicks(nextHomeKicks);

        // Transition to away kick
        setCurrentPhase('away_kick');
        setupShootoutRound('away_kick');
      } else {
        nextAwayKicks = [...awayKicks, isGoal];
        setAwayKicks(nextAwayKicks);

        // Evaluate if shootout is decided
        const hScore = nextHomeKicks.filter(Boolean).length;
        const aScore = nextAwayKicks.filter(Boolean).length;
        const hKicksCount = nextHomeKicks.length;
        const aKicksCount = nextAwayKicks.length;
        const hRemaining = Math.max(0, 5 - hKicksCount);
        const aRemaining = Math.max(0, 5 - aKicksCount);

        let gameDecided = false;
        let victoriousTeam: 'home' | 'away' | null = null;

        // Normal 5 rounds rule
        if (hKicksCount <= 5 && aKicksCount <= 5) {
          if (hScore > aScore + aRemaining) {
            gameDecided = true;
            victoriousTeam = 'home';
          } else if (aScore > hScore + hRemaining) {
            gameDecided = true;
            victoriousTeam = 'away';
          } else if (hKicksCount === 5 && aKicksCount === 5) {
            if (hScore !== aScore) {
              gameDecided = true;
              victoriousTeam = hScore > aScore ? 'home' : 'away';
            }
          }
        } else {
          // Sudden death
          if (hKicksCount === aKicksCount && hScore !== aScore) {
            gameDecided = true;
            victoriousTeam = hScore > aScore ? 'home' : 'away';
          }
        }

        if (gameDecided && victoriousTeam) {
          setIsGameOver(true);
          setWinner(victoriousTeam);
          soundEngine.playTrophyFanfare();

          confetti({
            particleCount: 110,
            spread: 100,
            origin: { y: 0.4 },
            colors: ['#04774D', '#F4B335', '#9ED47D', '#FFFAF3']
          });

          if (activeMatchNumber) {
            setTimeout(() => {
              recordMatchResult(0, 0, hScore, aScore);
            }, 3000);
          }
        } else {
          // Move to next round
          setCurrentRound(r => r + 1);
          setCurrentPhase('home_kick');
          setupShootoutRound('home_kick');
        }
      }
    }, 2200);
  }, [homeKicks, awayKicks, language, activeMatchNumber, recordMatchResult, setupShootoutRound]);

  // AI Goalkeeper reaction when user shoots (Home Kick)
  const triggerAiGoalkeeperDive = useCallback(() => {
    const world = worldRef.current;
    const goalie = world.tokens.find(t => t.role === 'goalkeeper');
    if (!goalie) return;

    const isHoriz = world.orientation === 'horizontal';
    const diveReactionTime = settings.difficulty === 'easy' ? 420 : settings.difficulty === 'medium' ? 260 : 150;

    setTimeout(() => {
      if (world.turnState !== 'moving' || world.isKickingConcluded) return;

      const ball = world.ball;
      if (isHoriz) {
        // Goalkeeper is on the right, moves along Y axis towards ball trajectory
        const targetY = ball.y + ball.vy * 8 + (Math.random() - 0.5) * (settings.difficulty === 'easy' ? 90 : 35);
        const diffY = targetY - goalie.y;
        const divePower = Math.min(18, Math.max(7, Math.abs(diffY) * 0.16));
        goalie.vy = Math.sign(diffY) * divePower;
        // slight forward leap
        goalie.vx = -Math.random() * 3.5;
      } else {
        // Goalkeeper is at the top, moves along X axis towards ball trajectory
        const targetX = ball.x + ball.vx * 8 + (Math.random() - 0.5) * (settings.difficulty === 'easy' ? 90 : 35);
        const diffX = targetX - goalie.x;
        const divePower = Math.min(18, Math.max(7, Math.abs(diffX) * 0.16));
        goalie.vx = Math.sign(diffX) * divePower;
        // slight downward dive
        goalie.vy = Math.random() * 3.5;
      }
    }, diveReactionTime);
  }, [settings.difficulty]);

  // AI Shooter kick when opponent shoots (Away Kick)
  useEffect(() => {
    if (currentPhase !== 'away_kick' || turnState !== 'aiming' || isGameOver) return;

    // AI takes a moment to aim and strike the ball
    const aiShootTimer = setTimeout(() => {
      const world = worldRef.current;
      if (world.turnState !== 'aiming' || world.currentPhase !== 'away_kick') return;

      const shooter = world.tokens.find(t => t.role === 'shooter');
      const ball = world.ball;
      if (!shooter) return;

      const isHoriz = world.orientation === 'horizontal';

      if (isHoriz) {
        // Target random quadrant of right goal
        const goalTop = world.height / 2 - world.goalWidth / 2 + 15;
        const goalBottom = world.height / 2 + world.goalWidth / 2 - 15;
        const targetY = goalTop + Math.random() * (goalBottom - goalTop);
        const targetX = world.pitchRight + 10;

        const dx = targetX - ball.x;
        const dy = targetY - ball.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const dirX = dx / len;
        const dirY = dy / len;

        // Shooter aims at ball
        const contactX = ball.x - dirX * (ball.radius + shooter.radius);
        const contactY = ball.y - dirY * (ball.radius + shooter.radius);

        const shootDx = contactX - shooter.x;
        const shootDy = contactY - shooter.y;
        const shootDist = Math.sqrt(shootDx * shootDx + shootDy * shootDy) || 1;

        const power = 19 + Math.random() * 4;
        shooter.vx = (shootDx / shootDist) * power;
        shooter.vy = (shootDy / shootDist) * power;
      } else {
        // Target random quadrant of top goal
        const goalLeft = world.width / 2 - world.goalWidth / 2 + 15;
        const goalRight = world.width / 2 + world.goalWidth / 2 - 15;
        const targetX = goalLeft + Math.random() * (goalRight - goalLeft);
        const targetY = world.pitchTop - 10;

        const dx = targetX - ball.x;
        const dy = targetY - ball.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const dirX = dx / len;
        const dirY = dy / len;

        const contactX = ball.x - dirX * (ball.radius + shooter.radius);
        const contactY = ball.y - dirY * (ball.radius + shooter.radius);

        const shootDx = contactX - shooter.x;
        const shootDy = contactY - shooter.y;
        const shootDist = Math.sqrt(shootDx * shootDx + shootDy * shootDy) || 1;

        const power = 19 + Math.random() * 4;
        shooter.vx = (shootDx / shootDist) * power;
        shooter.vy = (shootDy / shootDist) * power;
      }

      soundEngine.playKick(1.0);
      world.turnState = 'moving';
      world.movingFrames = 0;
      setTurnState('moving');
    }, 1800);

    return () => clearTimeout(aiShootTimer);
  }, [currentPhase, turnState, isGameOver]);

  // Main Physics Engine & Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updatePhysics = () => {
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

          // Pitch borders bounce
          if (token.y - token.radius < pitchTop) {
            token.y = pitchTop + token.radius;
            token.vy = -token.vy * 0.75;
          } else if (token.y + token.radius > pitchBottom) {
            token.y = pitchBottom - token.radius;
            token.vy = -token.vy * 0.75;
          }

          if (token.x - token.radius < pitchLeft) {
            token.x = pitchLeft + token.radius;
            token.vx = -token.vx * 0.75;
          } else if (token.x + token.radius > pitchRight) {
            if (!inGoalY || token.x > world.width - 15) {
              token.x = Math.min(world.width - 15, pitchRight - token.radius);
              token.vx = -token.vx * 0.75;
            }
          }
        } else {
          // Vertical
          const centerX = world.width / 2;
          const goalLeft = centerX - goalWidth / 2;
          const goalRight = centerX + goalWidth / 2;
          const inGoalX = token.x > goalLeft && token.x < goalRight;

          if (token.x - token.radius < pitchLeft) {
            token.x = pitchLeft + token.radius;
            token.vx = -token.vx * 0.75;
          } else if (token.x + token.radius > pitchRight) {
            token.x = pitchRight - token.radius;
            token.vx = -token.vx * 0.75;
          }

          if (token.y - token.radius < pitchTop) {
            if (!inGoalX || token.y < 15) {
              token.y = Math.max(15, pitchTop + token.radius);
              token.vy = -token.vy * 0.75;
            }
          } else if (token.y + token.radius > pitchBottom) {
            token.y = pitchBottom - token.radius;
            token.vy = -token.vy * 0.75;
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
      const checkPost = (post: { x: number; y: number }) => {
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
        // Horizontal: Goal is on the RIGHT
        const centerY = world.height / 2;
        const goalTop = centerY - goalWidth / 2;
        const goalBottom = centerY + goalWidth / 2;
        const ballInGoalY = ball.y > goalTop + 6 && ball.y < goalBottom - 6;

        // Wall collisions
        if (ball.y - ball.radius < pitchTop) {
          ball.y = pitchTop + ball.radius;
          ball.vy = -ball.vy * 0.85;
          if (!isMuted && Math.abs(ball.vy) > 1) soundEngine.playCollision();
        } else if (ball.y + ball.radius > pitchBottom) {
          ball.y = pitchBottom - ball.radius;
          ball.vy = -ball.vy * 0.85;
          if (!isMuted && Math.abs(ball.vy) > 1) soundEngine.playCollision();
        }

        if (ball.x - ball.radius < pitchLeft) {
          ball.x = pitchLeft + ball.radius;
          ball.vx = -ball.vx * 0.85;
          if (!isMuted && Math.abs(ball.vx) > 1) soundEngine.playCollision();
        }

        // Posts
        checkPost({ x: pitchRight, y: goalTop });
        checkPost({ x: pitchRight, y: goalBottom });

        // Goal Line Detection
        if (ball.x + ball.radius > pitchRight) {
          if (ballInGoalY) {
            // Ball enters the goal!
            if (ball.x > pitchRight + 16 && !world.isKickingConcluded) {
              finishKick(true);
            }
            if (ball.x > pitchRight + goalDepth - 10) {
              ball.x = pitchRight + goalDepth - 10;
              ball.vx = -ball.vx * 0.3;
            }
          } else {
            // Missed wide
            ball.x = pitchRight - ball.radius;
            ball.vx = -ball.vx * 0.85;
            if (!isMuted && Math.abs(ball.vx) > 1) soundEngine.playCollision();
          }
        }
      } else {
        // Vertical: Goal is at the TOP
        const centerX = world.width / 2;
        const goalLeft = centerX - goalWidth / 2;
        const goalRight = centerX + goalWidth / 2;
        const ballInGoalX = ball.x > goalLeft + 6 && ball.x < goalRight - 6;

        // Walls
        if (ball.x - ball.radius < pitchLeft) {
          ball.x = pitchLeft + ball.radius;
          ball.vx = -ball.vx * 0.85;
          if (!isMuted && Math.abs(ball.vx) > 1) soundEngine.playCollision();
        } else if (ball.x + ball.radius > pitchRight) {
          ball.x = pitchRight - ball.radius;
          ball.vx = -ball.vx * 0.85;
          if (!isMuted && Math.abs(ball.vx) > 1) soundEngine.playCollision();
        }

        if (ball.y + ball.radius > pitchBottom) {
          ball.y = pitchBottom - ball.radius;
          ball.vy = -ball.vy * 0.85;
          if (!isMuted && Math.abs(ball.vy) > 1) soundEngine.playCollision();
        }

        // Posts
        checkPost({ x: goalLeft, y: pitchTop });
        checkPost({ x: goalRight, y: pitchTop });

        // Goal Line Detection
        if (ball.y - ball.radius < pitchTop) {
          if (ballInGoalX) {
            if (ball.y < pitchTop - 16 && !world.isKickingConcluded) {
              finishKick(true);
            }
            if (ball.y < pitchTop - goalDepth + 10) {
              ball.y = pitchTop - goalDepth + 10;
              ball.vy = -ball.vy * 0.3;
            }
          } else {
            // Missed wide
            ball.y = pitchTop + ball.radius;
            ball.vy = -ball.vy * 0.85;
            if (!isMuted && Math.abs(ball.vy) > 1) soundEngine.playCollision();
          }
        }
      }

      // 3. Token-to-Ball Collisions
      world.tokens.forEach(token => {
        const dx = ball.x - token.x;
        const dy = ball.y - token.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = token.radius + ball.radius;

        if (dist < minDist) {
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);

          const overlap = minDist - dist;
          ball.x += nx * overlap * 0.7;
          ball.y += ny * overlap * 0.7;
          token.x -= nx * overlap * 0.3;
          token.y -= ny * overlap * 0.3;

          const relVel = (token.vx - ball.vx) * nx + (token.vy - ball.vy) * ny;
          if (relVel > 0) {
            const p = (2 * relVel) / (token.mass + 1);
            token.vx -= p * 0.9 * nx;
            token.vy -= p * 0.9 * ny;
            ball.vx += p * 1.55 * nx;
            ball.vy += p * 1.55 * ny;

            if (!isMuted) {
              const hitSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
              soundEngine.playKick(Math.min(1.2, hitSpeed / 8));
            }
          }
        }
      });

      // 4. Token-to-Token Collisions
      if (world.tokens.length >= 2) {
        const t1 = world.tokens[0];
        const t2 = world.tokens[1];
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

      // 5. Watchdog & Motion Ending Check
      if (world.turnState === 'moving') {
        world.movingFrames = (world.movingFrames || 0) + 1;

        // Check if motion has settled or after 3.2s
        if (!anyMoving || world.movingFrames > 190) {
          if (!world.isKickingConcluded) {
            // Ball stopped without crossing goal line -> SAVED / MISSED!
            finishKick(false);
          }
        }
      }
    };

    const drawPitch = () => {
      const world = worldRef.current;
      const isHoriz = world.orientation === 'horizontal';
      const { width: W, height: H, pitchLeft, pitchRight, pitchTop, pitchBottom, goalWidth, goalDepth, penaltySpot } = world;
      const pitchW = pitchRight - pitchLeft;
      const pitchH = pitchBottom - pitchTop;
      const centerX = W / 2;
      const centerY = H / 2;

      ctx.clearRect(0, 0, W, H);

      // Stadium surround background
      ctx.fillStyle = '#021A0A';
      ctx.fillRect(0, 0, W, H);

      if (isHoriz) {
        // --- HORIZONTAL DESKTOP PENALTY BOX PITCH ---
        // LED Ad Boards (Top & Bottom)
        ctx.fillStyle = '#032810';
        ctx.fillRect(pitchLeft, 2, pitchW, 20);
        ctx.fillRect(pitchLeft, H - 22, pitchW, 20);

        ctx.fillStyle = '#F4B335';
        ctx.fillRect(pitchLeft, 20, pitchW, 2);
        ctx.fillRect(pitchLeft, H - 22, pitchW, 2);

        ctx.fillStyle = '#9ED47D';
        ctx.font = 'bold 9px "Kufam", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('خليجي 27 • KHALEEJI 27 JEDDAH 2026 • ركلات الترجيح الرسمية • PENALTY SHOOTOUT', W / 2, 11);
        ctx.fillText('ملعب مدينة الملك عبدالله الرياضية • الجوهرة المشعة • OFFICIAL TOURNAMENT PITCH', W / 2, H - 11);

        // Lawn Stripes (Vertical bands)
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

        // Penalty Box & 6-Yard Box (Facing Right Goal)
        const boxW = 260;
        const boxH = 340;
        const boxTop = centerY - boxH / 2;
        ctx.strokeRect(pitchRight - boxW, boxTop, boxW, boxH);

        const smallBoxW = 90;
        const smallBoxH = 190;
        ctx.strokeRect(pitchRight - smallBoxW, centerY - smallBoxH / 2, smallBoxW, smallBoxH);

        // Penalty D Arc
        ctx.beginPath();
        ctx.arc(penaltySpot.x, penaltySpot.y, 65, 0.65 * Math.PI, 1.35 * Math.PI);
        ctx.stroke();

        // Penalty Spot Mark
        ctx.fillStyle = '#FFFAF3';
        ctx.beginPath();
        ctx.arc(penaltySpot.x, penaltySpot.y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Right Goal Net & Frame
        const goalTop = centerY - goalWidth / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(pitchRight, goalTop, goalDepth, goalWidth);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        for (let gx = pitchRight; gx <= pitchRight + goalDepth; gx += 6) {
          ctx.beginPath();
          ctx.moveTo(gx, goalTop);
          ctx.lineTo(gx, goalTop + goalWidth);
          ctx.stroke();
        }
        for (let gy = goalTop; gy <= goalTop + goalWidth; gy += 6) {
          ctx.beginPath();
          ctx.moveTo(pitchRight, gy);
          ctx.lineTo(pitchRight + goalDepth, gy);
          ctx.stroke();
        }

        ctx.strokeStyle = '#FFFAF3';
        ctx.lineWidth = 5;
        ctx.strokeRect(pitchRight, goalTop, goalDepth, goalWidth);

        // Posts
        const drawPost = (px: number, py: number) => {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#888888';
          ctx.lineWidth = 1;
          ctx.stroke();
        };
        drawPost(pitchRight, goalTop);
        drawPost(pitchRight, goalTop + goalWidth);
      } else {
        // --- VERTICAL MOBILE PENALTY PITCH (Goal at TOP) ---
        // Side Ad Boards
        ctx.fillStyle = '#032810';
        ctx.fillRect(2, pitchTop, 18, pitchH);
        ctx.fillRect(W - 20, pitchTop, 18, pitchH);

        ctx.fillStyle = '#F4B335';
        ctx.fillRect(20, pitchTop, 2, pitchH);
        ctx.fillRect(W - 22, pitchTop, 2, pitchH);

        ctx.save();
        ctx.fillStyle = '#9ED47D';
        ctx.font = 'bold 10px "Kufam", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(11, centerY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('خليجي 27 • KHALEEJI 27 • PENALTY SHOOTOUT', 0, 0);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#9ED47D';
        ctx.font = 'bold 10px "Kufam", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(W - 11, centerY);
        ctx.rotate(Math.PI / 2);
        ctx.fillText('الجوهرة المشعة • JEDDAH 2026', 0, 0);
        ctx.restore();

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

        // Penalty Box & 6-Yard Box at TOP
        const boxW = 340;
        const boxH = 260;
        ctx.strokeRect(centerX - boxW / 2, pitchTop, boxW, boxH);

        const smallBoxW = 190;
        const smallBoxH = 90;
        ctx.strokeRect(centerX - smallBoxW / 2, pitchTop, smallBoxW, smallBoxH);

        // Penalty D Arc
        ctx.beginPath();
        ctx.arc(penaltySpot.x, penaltySpot.y, 65, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();

        // Penalty Spot Mark
        ctx.fillStyle = '#FFFAF3';
        ctx.beginPath();
        ctx.arc(penaltySpot.x, penaltySpot.y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Top Goal Net & Frame
        const goalLeft = centerX - goalWidth / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(goalLeft, pitchTop - goalDepth, goalWidth, goalDepth);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        for (let gx = goalLeft; gx <= goalLeft + goalWidth; gx += 6) {
          ctx.beginPath();
          ctx.moveTo(gx, pitchTop - goalDepth);
          ctx.lineTo(gx, pitchTop);
          ctx.stroke();
        }
        for (let gy = pitchTop - goalDepth; gy <= pitchTop; gy += 6) {
          ctx.beginPath();
          ctx.moveTo(goalLeft, gy);
          ctx.lineTo(goalLeft + goalWidth, gy);
          ctx.stroke();
        }

        ctx.strokeStyle = '#FFFAF3';
        ctx.lineWidth = 5;
        ctx.strokeRect(goalLeft, pitchTop - goalDepth, goalWidth, goalDepth);

        // Posts
        const drawPost = (px: number, py: number) => {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#888888';
          ctx.lineWidth = 1;
          ctx.stroke();
        };
        drawPost(goalLeft, pitchTop);
        drawPost(goalLeft + goalWidth, pitchTop);
      }

      // Drag Aim Guide Line
      if (world.isAiming && world.selectedTokenId !== null && world.dragStart && world.dragCurrent) {
        const token = world.tokens.find(t => t.id === world.selectedTokenId);
        if (token) {
          const dx = world.dragStart.x - world.dragCurrent.x;
          const dy = world.dragStart.y - world.dragCurrent.y;
          const pullDist = Math.min(140, Math.sqrt(dx * dx + dy * dy));

          if (pullDist > 8) {
            const angle = Math.atan2(dy, dx);
            const aimDist = pullDist * 2.8;
            const targetX = token.x + Math.cos(angle) * aimDist;
            const targetY = token.y + Math.sin(angle) * aimDist;

            const grad = ctx.createLinearGradient(token.x, token.y, targetX, targetY);
            grad.addColorStop(0, '#9ED47D');
            grad.addColorStop(0.65, '#F4B335');
            grad.addColorStop(1, '#CE1126');

            ctx.strokeStyle = grad;
            ctx.lineWidth = Math.max(3, pullDist / 14);
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

            // Pullback rubber line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(token.x, token.y);
            ctx.lineTo(world.dragCurrent.x, world.dragCurrent.y);
            ctx.stroke();
          }
        }
      }

      // Draw Tokens (Shooter & Goalkeeper)
      world.tokens.forEach(token => {
        const isSelected = token.id === world.selectedTokenId;
        const teamData = token.team === 'home' ? homeTeam : awayTeam;
        const isUserControllable =
          (world.currentPhase === 'home_kick' && token.role === 'shooter') ||
          (world.currentPhase === 'away_kick' && token.role === 'goalkeeper');

        ctx.save();
        ctx.translate(token.x, token.y);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        // Rim
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

        // Inner Team Color Disc
        ctx.fillStyle = teamData.primaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, token.radius - 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = teamData.accentColor || '#F4B335';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, token.radius - 4, 0, Math.PI * 2);
        ctx.stroke();

        // Label: GK for goalkeeper, team shortcode or '9' for shooter
        ctx.fillStyle = teamData.secondaryColor || '#FFFAF3';
        ctx.font = `bold ${token.role === 'goalkeeper' ? '10px' : '11px'} "Kufam", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(token.role === 'goalkeeper' ? 'GK' : teamData.shortCode, 0, 1);

        // Highlight ring on user's active token
        if (isUserControllable && world.turnState === 'aiming') {
          ctx.strokeStyle = isSelected ? '#F4B335' : 'rgba(158, 212, 125, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, token.radius + 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      });

      // Draw Ball
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

      for (let p = 0; p < 4; p++) {
        const ang = 0.8 + (p * Math.PI) / 2;
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
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [finishKick, homeTeam, awayTeam]);

  // Pointer & Drag handling with rock-solid coordinate precision
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
    if (isGameOver || world.isKickingConcluded) return;

    const isHomeKick = world.currentPhase === 'home_kick';

    // If home kick, user can only aim when turnState is 'aiming'
    if (isHomeKick && world.turnState !== 'aiming') return;

    const allowedRole = isHomeKick ? 'shooter' : 'goalkeeper';
    const coords = getCanvasCoords(e.clientX, e.clientY);

    // Generous hit tolerance
    let token = world.tokens.find(t => {
      if (t.role !== allowedRole) return false;
      const dx = coords.x - t.x;
      const dy = coords.y - t.y;
      return Math.sqrt(dx * dx + dy * dy) <= t.radius + 32;
    });

    // Fallback for goalkeeper: clicking near the goal line controls the goalie
    if (!token && !isHomeKick) {
      token = world.tokens.find(t => t.role === 'goalkeeper');
    }

    if (token) {
      world.selectedTokenId = token.id;
      world.dragStart = { x: token.x, y: token.y };
      world.dragCurrent = { x: coords.x, y: coords.y };
      world.isAiming = true;
      if (!isMuted) soundEngine.playClick();

      // Global window listeners so dragging outside canvas never drops
      const onGlobalMove = (ev: PointerEvent) => {
        const w = worldRef.current;
        if (!w.isAiming || !w.dragStart) return;
        w.dragCurrent = getCanvasCoords(ev.clientX, ev.clientY);
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
            const maxForce = selToken.role === 'shooter' ? 24 : 16;
            const force = Math.min(maxForce, dist * 0.22);
            const angle = Math.atan2(dy, dx);

            selToken.vx = Math.cos(angle) * force;
            selToken.vy = Math.sin(angle) * force;

            if (!isMuted) soundEngine.playKick(force / maxForce);

            if (selToken.role === 'shooter') {
              triggerAiGoalkeeperDive();
              w.turnState = 'moving';
              w.movingFrames = 0;
              setTurnState('moving');
            }
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
    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (world.isAiming && world.dragStart) {
      world.dragCurrent = coords;
      return;
    }

    // Goalkeeper active positioning when defending (away kick)
    if (world.currentPhase === 'away_kick' && !world.isKickingConcluded && !isGameOver) {
      const goalie = world.tokens.find(t => t.role === 'goalkeeper');
      if (goalie) {
        const isHoriz = world.orientation === 'horizontal';
        if (isHoriz) {
          // Slide vertically along goal line
          const centerY = world.height / 2;
          const minY = centerY - world.goalWidth / 2 + goalie.radius + 6;
          const maxY = centerY + world.goalWidth / 2 - goalie.radius - 6;
          goalie.y = Math.max(minY, Math.min(maxY, coords.y));
          goalie.x = world.pitchRight - goalie.radius - 4;
        } else {
          // Slide horizontally along top goal line
          const centerX = world.width / 2;
          const minX = centerX - world.goalWidth / 2 + goalie.radius + 6;
          const maxX = centerX + world.goalWidth / 2 - goalie.radius - 6;
          goalie.x = Math.max(minX, Math.min(maxX, coords.x));
          goalie.y = world.pitchTop + goalie.radius + 4;
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const world = worldRef.current;
    if (!world.isAiming) return;
    world.isAiming = false;
    world.selectedTokenId = null;
    world.dragStart = null;
    world.dragCurrent = null;
  };

  const resetGame = () => {
    setCurrentRound(1);
    setCurrentPhase('home_kick');
    setHomeKicks([]);
    setAwayKicks([]);
    setIsGameOver(false);
    setWinner(null);
    setupShootoutRound('home_kick');
  };

  const isHoriz = orientation === 'horizontal';

  return (
    <div className="relative w-full h-screen bg-[#021A0A] flex flex-col justify-between items-center select-none overflow-hidden py-1 px-1 sm:px-3">
      {/* Top Header & Broadcast Scoreboard */}
      <div className={`w-full ${isHoriz ? 'max-w-6xl' : 'max-w-md'} px-2 z-20 flex flex-col items-center shrink-0`}>
        {/* Navigation & Controls */}
        <div className="w-full flex items-center justify-between text-xs text-[#9ED47D] mb-1 font-['Noto_Sans']">
          <button
            onClick={() => setScreen('menu')}
            className="px-2.5 py-1 rounded-lg bg-[#04774D]/40 hover:bg-[#04774D] text-[#FFFAF3] flex items-center gap-1.5 transition font-bold"
          >
            <ArrowLeft size={14} />
            <span>{language === 'ar' ? 'القائمة الرئيسية' : 'Menu'}</span>
          </button>

          {/* Audio */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg border transition flex items-center justify-center min-w-[32px] min-h-[32px] ${
                isMuted
                  ? 'bg-[#CE1126]/20 border-[#CE1126]/50 text-[#FF6B6B] hover:bg-[#CE1126]/30'
                  : 'bg-[#032810] border-[#04774D] text-[#FFFAF3] hover:text-[#F4B335]'
              }`}
              title={isMuted ? (language === 'ar' ? 'تشغيل الصوت والموسيقى' : 'Unmute All') : (language === 'ar' ? 'كتم جميع الأصوات والموسيقى' : 'Mute All')}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>

        {/* Penalty Scoreboard */}
        <div className="w-full bg-[#032810]/95 border border-[#04774D] rounded-xl px-3 py-1.5 shadow-xl flex flex-col gap-1.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex items-center gap-2">
              <TeamFlag teamId={homeTeam.id} size="sm" />
              <div className="flex flex-col">
                <span className="font-extrabold text-xs sm:text-sm font-['Kufam'] text-[#FFFAF3]">
                  {language === 'ar' ? homeTeam.name_ar : homeTeam.name_en}
                </span>
                <span className="text-[9px] text-[#9ED47D]">
                  {language === 'ar' ? 'فريقك' : 'Your Team'}
                </span>
              </div>
            </div>

            {/* Score & Phase Badge */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 text-xl sm:text-2xl font-black font-['Kufam'] text-[#F4B335]">
                <span>{homeScore}</span>
                <span className="text-sm text-[#9ED47D]/50">-</span>
                <span>{awayScore}</span>
              </div>
              <span className="text-[10px] font-bold text-[#9ED47D] uppercase tracking-wider">
                {language === 'ar' ? `الجولة ${currentRound}` : `Round ${currentRound}`}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 flex-row-reverse text-end">
              <TeamFlag teamId={awayTeam.id} size="sm" />
              <div className="flex flex-col">
                <span className="font-extrabold text-xs sm:text-sm font-['Kufam'] text-[#FFFAF3]">
                  {language === 'ar' ? awayTeam.name_ar : awayTeam.name_en}
                </span>
                <span className="text-[9px] text-[#9ED47D]">
                  {language === 'ar' ? 'الخصم' : 'Opponent'}
                </span>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-between border-t border-[#04774D]/40 pt-1">
            {/* Home Dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map(idx => {
                const res = homeKicks[idx];
                return (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full border border-white/20 transition ${
                      res === true
                        ? 'bg-[#0AA771] border-[#9ED47D] shadow-[0_0_8px_#0AA771]'
                        : res === false
                          ? 'bg-[#CE1126] border-red-400'
                          : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>

            {/* Status Instruction Badge */}
            <span className="text-[11px] font-bold font-['Kufam'] text-[#FFFAF3] bg-[#04774D]/60 px-2.5 py-0.5 rounded-full border border-[#9ED47D]/40">
              {currentPhase === 'home_kick'
                ? (language === 'ar' ? '⚽ دورك بالتسديد (اسحب اللاعب)' : '⚽ Your Kick (Drag to shoot)')
                : (language === 'ar' ? '🧤 دورك بالتصدي (اسحب الحارس)' : '🧤 Your Save (Drag to dive)')}
            </span>

            {/* Away Dots */}
            <div className="flex items-center gap-1.5 flex-row-reverse">
              {[0, 1, 2, 3, 4].map(idx => {
                const res = awayKicks[idx];
                return (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full border border-white/20 transition ${
                      res === true
                        ? 'bg-[#0AA771] border-[#9ED47D] shadow-[0_0_8px_#0AA771]'
                        : res === false
                          ? 'bg-[#CE1126] border-red-400'
                          : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Penalty Pitch Canvas Area */}
      {isHoriz ? (
        <DesktopStadiumArena
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homeScore={homeScore}
          awayScore={awayScore}
          timeLeft={90}
          isGoalCelebration={turnState === 'celebration'}
        >
          <div className="relative flex items-center justify-center w-full max-h-[70vh] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={960}
              height={560}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="max-w-full h-auto max-h-[70vh] aspect-[960/560] rounded-2xl shadow-2xl border-2 border-[#04774D] cursor-crosshair touch-none bg-[#021A0A]"
            />

            {/* Kick Result Overlay Banner */}
            {kickResultBanner && (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="bg-[#032810]/90 border-2 border-[#F4B335] px-6 py-3 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in duration-200">
                  <span className={`text-2xl sm:text-3xl font-black font-['Kufam'] ${kickResultBanner.isGoal ? 'text-[#F4B335]' : 'text-red-400'}`}>
                    {kickResultBanner.text}
                  </span>
                </div>
              </div>
            )}

            {/* Game Over Modal */}
            {isGameOver && (
              <div className="absolute inset-0 bg-[#032810]/95 backdrop-blur-md flex flex-col items-center justify-center z-40 p-6 text-center animate-in fade-in duration-300">
                <KhaleejiLogo variant="emblem" size="md" className="mb-2" />
                <h2 className="text-2xl font-black font-['Kufam'] text-[#F4B335] mb-1">
                  {winner === 'home'
                    ? language === 'ar' ? 'فـوز تاريخي بركلات الترجيح!' : 'Historic Penalty Shootout Victory!'
                    : language === 'ar' ? 'خسارة بركلات الترجيح' : 'Shootout Defeat'}
                </h2>
                <div className="flex items-center gap-3 my-4">
                  <TeamFlag teamId={winner === 'home' ? homeTeam.id : awayTeam.id} size="lg" />
                  <span className="text-xl font-bold font-['Kufam'] text-[#FFFAF3]">
                    {winner === 'home'
                      ? language === 'ar' ? homeTeam.name_ar : homeTeam.name_en
                      : language === 'ar' ? awayTeam.name_ar : awayTeam.name_en}
                  </span>
                </div>
                <div className="text-2xl font-mono font-black text-[#9ED47D] mb-6">
                  {homeScore} - {awayScore}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetGame}
                    className="px-5 py-2.5 rounded-xl bg-[#04774D] hover:bg-[#0AA771] text-[#FFFAF3] font-bold font-['Kufam'] flex items-center gap-2 transition shadow-lg"
                  >
                    <RotateCcw size={16} />
                    <span>{language === 'ar' ? 'إعادة الركلات' : 'Rematch'}</span>
                  </button>
                  <button
                    onClick={() => setScreen('menu')}
                    className="px-5 py-2.5 rounded-xl bg-[#032810] border border-[#04774D] text-[#FFFAF3] font-bold font-['Kufam'] transition hover:bg-[#04774D]/50"
                  >
                    {language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </DesktopStadiumArena>
      ) : (
        <div className="relative flex-1 w-full max-w-3xl flex-row flex items-center justify-center gap-1 sm:gap-2 min-h-0 my-1 overflow-hidden">
          {/* Left Stadium Cheering Crowd (Vertical mode) */}
          <VerticalCrowdStands
            side="left"
            team={homeTeam}
            opponentTeam={awayTeam}
            className="w-7 xs:w-9 sm:w-12 h-full max-h-[calc(100vh-130px)] shrink-0"
          />

          <div className="relative flex items-center justify-center h-full max-h-[calc(100vh-130px)] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={540}
              height={960}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="w-auto h-full max-h-full aspect-[540/960] rounded-2xl shadow-2xl touch-none border-2 border-[#04774D] cursor-crosshair bg-[#021A0A]"
            />

            {/* Kick Result Overlay Banner */}
            {kickResultBanner && (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="bg-[#032810]/90 border-2 border-[#F4B335] px-6 py-3 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in duration-200">
                  <span className={`text-2xl sm:text-3xl font-black font-['Kufam'] ${kickResultBanner.isGoal ? 'text-[#F4B335]' : 'text-red-400'}`}>
                    {kickResultBanner.text}
                  </span>
                </div>
              </div>
            )}

            {/* Game Over Modal */}
            {isGameOver && (
              <div className="absolute inset-0 bg-[#032810]/95 backdrop-blur-md flex flex-col items-center justify-center z-40 p-6 text-center animate-in fade-in duration-300">
                <KhaleejiLogo variant="emblem" size="md" className="mb-2" />
                <h2 className="text-2xl font-black font-['Kufam'] text-[#F4B335] mb-1">
                  {winner === 'home'
                    ? language === 'ar' ? 'فـوز تاريخي بركلات الترجيح!' : 'Historic Penalty Shootout Victory!'
                    : language === 'ar' ? 'خسارة بركلات الترجيح' : 'Shootout Defeat'}
                </h2>
                <div className="flex items-center gap-3 my-4">
                  <TeamFlag teamId={winner === 'home' ? homeTeam.id : awayTeam.id} size="lg" />
                  <span className="text-xl font-bold font-['Kufam'] text-[#FFFAF3]">
                    {winner === 'home'
                      ? language === 'ar' ? homeTeam.name_ar : homeTeam.name_en
                      : language === 'ar' ? awayTeam.name_ar : awayTeam.name_en}
                  </span>
                </div>
                <div className="text-2xl font-mono font-black text-[#9ED47D] mb-6">
                  {homeScore} - {awayScore}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetGame}
                    className="px-5 py-2.5 rounded-xl bg-[#04774D] hover:bg-[#0AA771] text-[#FFFAF3] font-bold font-['Kufam'] flex items-center gap-2 transition shadow-lg"
                  >
                    <RotateCcw size={16} />
                    <span>{language === 'ar' ? 'إعادة الركلات' : 'Rematch'}</span>
                  </button>
                  <button
                    onClick={() => setScreen('menu')}
                    className="px-5 py-2.5 rounded-xl bg-[#032810] border border-[#04774D] text-[#FFFAF3] font-bold font-['Kufam'] transition hover:bg-[#04774D]/50"
                  >
                    {language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Stadium Cheering Crowd (Vertical mode) */}
          <VerticalCrowdStands
            side="right"
            team={awayTeam}
            opponentTeam={homeTeam}
            className="w-7 xs:w-9 sm:w-12 h-full max-h-[calc(100vh-130px)] shrink-0"
          />
        </div>
      )}

      {/* Bottom Tournament Status Bar */}
      <div className={`w-full ${isHoriz ? 'max-w-6xl' : 'max-w-md'} px-4 py-1.5 z-10 flex items-center justify-between text-[11px] text-[#9ED47D]/90 shrink-0 border-t border-[#04774D]/30`}>
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#F4B335] animate-ping" />
          <span>{language === 'ar' ? 'ركلات الترجيح الحاسمة - خليجي 27' : 'Decisive Penalties - Khaleeji 27'}</span>
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
