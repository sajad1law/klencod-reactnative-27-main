import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';

export interface TournamentTrack {
  id: string;
  videoId: string;
  title_ar: string;
  title_en: string;
  subtitle_ar: string;
  subtitle_en: string;
}

export const TOURNAMENT_PLAYLIST: TournamentTrack[] = [
  {
    id: 'anthem-1',
    videoId: 'NC3PaCfmr9w',
    title_ar: 'موسيقى خليجي 27 الرسمية',
    title_en: 'Official Khaleeji 27 Anthem',
    subtitle_ar: 'المقطوعة الرسمية للبطولة • جدة 2026',
    subtitle_en: 'Official Tournament Theme • Jeddah 2026'
  },
  {
    id: 'anthem-2',
    videoId: '2EYuhQNdmdk',
    title_ar: 'أغنية يا هلا بالخليج',
    title_en: 'Hala Bel Khaleej Celebration',
    subtitle_ar: 'أغنية الترحيب الخليجي الحماسية',
    subtitle_en: 'Gulf Welcome Celebration Song'
  },
  {
    id: 'anthem-3',
    videoId: '2GR2s5DDGX8',
    title_ar: 'أغنية الحماس والعزيمة',
    title_en: 'Gulf Spirit & Victory Song',
    subtitle_ar: 'إيقاع التحدي والبطولة الخليجية',
    subtitle_en: 'Gulf Football Passion & Rhythm'
  }
];

export const TournamentMusicPlayer: React.FC = () => {
  const { settings, updateSettings } = useGame();
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(() => settings.currentTrackIndex ?? 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const currentTrack = TOURNAMENT_PLAYLIST[currentTrackIndex] || TOURNAMENT_PLAYLIST[0];

  // Send command to YouTube iframe safely
  const sendYtCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current[func] === 'function') {
      try {
        ytPlayerRef.current[func](...args);
      } catch {
        // ignore
      }
    }
  };

  // Switch to next track in loop
  const playNextTrack = useCallback((autoPlay = true) => {
    setCurrentTrackIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % TOURNAMENT_PLAYLIST.length;
      const nextVideoId = TOURNAMENT_PLAYLIST[nextIndex].videoId;

      setTimeout(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          ytPlayerRef.current.loadVideoById(nextVideoId);
        } else {
          sendYtCommand('loadVideoById', [nextVideoId]);
        }
        if (autoPlay) {
          sendYtCommand('unMute');
          sendYtCommand('setVolume', [settings.musicVolume ?? 70]);
          sendYtCommand('playVideo');
          setIsPlaying(true);
        }
      }, 50);

      updateSettings({ currentTrackIndex: nextIndex });
      return nextIndex;
    });
  }, [settings.musicVolume, updateSettings]);

  // Switch to previous track
  const playPreviousTrack = () => {
    setCurrentTrackIndex((prevIndex) => {
      const prev = prevIndex === 0 ? TOURNAMENT_PLAYLIST.length - 1 : prevIndex - 1;
      const prevVideoId = TOURNAMENT_PLAYLIST[prev].videoId;

      setTimeout(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          ytPlayerRef.current.loadVideoById(prevVideoId);
        } else {
          sendYtCommand('loadVideoById', [prevVideoId]);
        }
        sendYtCommand('unMute');
        sendYtCommand('setVolume', [settings.musicVolume ?? 70]);
        sendYtCommand('playVideo');
        setIsPlaying(true);
      }, 50);

      updateSettings({ currentTrackIndex: prev });
      return prev;
    });
  };

  // Jump directly to specific track
  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    updateSettings({ currentTrackIndex: index, musicEnabled: true });
    const videoId = TOURNAMENT_PLAYLIST[index].videoId;

    setTimeout(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        ytPlayerRef.current.loadVideoById(videoId);
      } else {
        sendYtCommand('loadVideoById', [videoId]);
      }
      sendYtCommand('unMute');
      sendYtCommand('setVolume', [settings.musicVolume ?? 70]);
      sendYtCommand('playVideo');
      setIsPlaying(true);
    }, 50);
  };

  // Initialize YouTube Iframe Player API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initYt = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        try {
          ytPlayerRef.current = new (window as any).YT.Player('khaleeji-yt-iframe', {
            events: {
              onReady: () => {
                sendYtCommand('setVolume', [settings.musicVolume ?? 70]);
                if (settings.musicEnabled) {
                  sendYtCommand('playVideo');
                }
              },
              onStateChange: (event: any) => {
                // 1 = playing, 2 = paused, 0 = ended
                if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                } else if (event.data === 0) {
                  // Track finished! Automatically advance to the next track in loop
                  playNextTrack(true);
                }
              }
            }
          });
        } catch {
          // fallback to postMessage
        }
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initYt();
    } else {
      (window as any).onYouTubeIframeAPIReady = initYt;
    }

    const handlePostMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange' && data.info === 0) {
            playNextTrack(true);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, [playNextTrack, settings.musicEnabled, settings.musicVolume]);

  // Auto-play trigger: Automatically starts on first click/touch/keydown anywhere
  useEffect(() => {
    const handleGesture = () => {
      if (soundEngine.isMuted()) return;
      sendYtCommand('unMute');
      sendYtCommand('setVolume', [settings.musicVolume ?? 70]);
      sendYtCommand('playVideo');
      setIsPlaying(true);
      updateSettings({ musicEnabled: true });
    };

    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('touchstart', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });

    // Attempt autoplay immediately
    const timer = setTimeout(() => {
      if (settings.musicEnabled && !soundEngine.isMuted()) {
        sendYtCommand('playVideo');
      }
    }, 1200);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      clearTimeout(timer);
    };
  }, [settings.musicEnabled, settings.musicVolume, updateSettings]);

  // Listen to remote commands dispatched from SettingsModal or In-Game Mute Button
  useEffect(() => {
    const handleCommand = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { action, payload } = customEvent.detail || {};

      if (action === 'play') {
        sendYtCommand('unMute');
        sendYtCommand('setVolume', [settings.musicVolume ?? 70]);
        sendYtCommand('playVideo');
        setIsPlaying(true);
      } else if (action === 'pause') {
        sendYtCommand('pauseVideo');
        setIsPlaying(false);
      } else if (action === 'mute') {
        sendYtCommand('mute');
        sendYtCommand('pauseVideo');
        setIsPlaying(false);
      } else if (action === 'unmute') {
        sendYtCommand('unMute');
        const vol = (settings.musicVolume && settings.musicVolume > 0) ? settings.musicVolume : 70;
        sendYtCommand('setVolume', [vol]);
        sendYtCommand('playVideo');
        setIsPlaying(true);
      } else if (action === 'next') {
        playNextTrack(true);
      } else if (action === 'prev') {
        playPreviousTrack();
      } else if (action === 'select' && typeof payload === 'number') {
        selectTrack(payload);
      } else if (action === 'setVolume' && typeof payload === 'number') {
        sendYtCommand('setVolume', [payload]);
        if (payload > 0) {
          sendYtCommand('unMute');
          sendYtCommand('playVideo');
          setIsPlaying(true);
        } else {
          sendYtCommand('mute');
        }
      }
    };

    window.addEventListener('khaleeji_music_cmd', handleCommand);
    return () => {
      window.removeEventListener('khaleeji_music_cmd', handleCommand);
    };
  }, [playNextTrack, settings.musicVolume]);

  const playlistParam = TOURNAMENT_PLAYLIST.map(t => t.videoId).join(',');

  // The music player stays hidden in the background while audio plays seamlessly!
  return (
    <div className="fixed -left-[9999px] -top-[9999px] w-1 h-1 pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
      <iframe
        id="khaleeji-yt-iframe"
        ref={iframeRef}
        width="100%"
        height="100%"
        src={`https://www.youtube-nocookie.com/embed/${currentTrack.videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${playlistParam}&playsinline=1&modestbranding=1&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
        title="Official Khaleeji 27 Tournament Anthem"
        allow="autoplay; encrypted-media; picture-in-picture"
        className="w-full h-full border-0"
      />
    </div>
  );
};
