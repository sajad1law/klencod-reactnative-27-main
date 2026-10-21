import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { SplashScreen } from './components/ui/SplashScreen';
import { MainMenu } from './components/ui/MainMenu';
import { TeamSelection } from './components/ui/TeamSelection';
import { TournamentDashboard } from './components/tournament/TournamentDashboard';
import { MatchLobby } from './components/tournament/MatchLobby';
import { PitchCanvas } from './components/game/PitchCanvas';
import { PenaltyShootout } from './components/game/PenaltyShootout';
import { MatchResult } from './components/tournament/MatchResult';
import { ChampionScreen } from './components/tournament/ChampionScreen';
import { ScheduleScreen } from './components/ui/ScheduleScreen';
import { StandingsScreen } from './components/ui/StandingsScreen';
import { TournamentMusicPlayer } from './components/audio/TournamentMusicPlayer';
import { SettingsModal } from './components/ui/SettingsModal';
import { PlatformSelectorModal } from './components/ui/PlatformSelectorModal';

const AppContent: React.FC = () => {
  const { screen } = useGame();

  switch (screen) {
    case 'splash':
      return <SplashScreen />;
    case 'menu':
      return <MainMenu />;
    case 'team_select':
      return <TeamSelection />;
    case 'tournament_dashboard':
      return <TournamentDashboard />;
    case 'match_lobby':
      return <MatchLobby />;
    case 'match':
      return <PitchCanvas />;
    case 'penalties':
      return <PenaltyShootout />;
    case 'match_result':
      return <MatchResult />;
    case 'champion':
      return <ChampionScreen />;
    case 'schedule':
      return <ScheduleScreen />;
    case 'standings':
      return <StandingsScreen />;
    default:
      return <MainMenu />;
  }
};

const MainLayout: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    isDeviceModalOpen,
    setIsDeviceModalOpen,
    hasChosenPlatform,
    screen
  } = useGame();

  // If user hasn't explicitly chosen a platform yet and is entering past the splash screen, show platform selector
  const showInitialPlatformChoice = !hasChosenPlatform && screen !== 'splash';

  return (
    <main className="w-full min-h-screen bg-[#032810] text-[#FFFAF3] font-['Noto_Sans'] selection:bg-[#F4B335] selection:text-[#032810]">
      <AppContent />
      <TournamentMusicPlayer />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <PlatformSelectorModal
        isOpen={isDeviceModalOpen || showInitialPlatformChoice}
        onClose={() => setIsDeviceModalOpen(false)}
        canDismiss={hasChosenPlatform}
      />
    </main>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainLayout />
    </GameProvider>
  );
}