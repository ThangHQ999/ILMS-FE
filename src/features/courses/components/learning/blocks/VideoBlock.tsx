'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface VideoChapterMarker {
  timeSec: number;
  title: string;
}

interface VideoBlockProps {
  content: Record<string, unknown>;
  isEditorMode: boolean;
  onChange: (nextContent: Record<string, unknown>) => void;
  onVideoProgress?: (watchedSeconds: number, durationSeconds: number) => void;
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      return id || null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return v;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' && parts[1]) return parts[1];
      if (parts[0] === 'shorts' && parts[1]) return parts[1];
    }
  } catch {
    return null;
  }
  return null;
}

function toDrivePreview(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match?.[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
}

function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function VideoBlock({
  content,
  isEditorMode,
  onChange,
  onVideoProgress,
}: VideoBlockProps) {
  const url = String(content.url ?? '');
  const sourceType = String(content.sourceType || 'YOUTUBE') as
    | 'YOUTUBE'
    | 'DRIVE'
    | 'MP4';
  const durationSeconds = Number(content.durationSeconds ?? 0);
  const caption = String(content.caption ?? '');
  const chapters: VideoChapterMarker[] = Array.isArray(content.chapters)
    ? (content.chapters as VideoChapterMarker[])
    : [];

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastReportedRef = useRef<number>(0);

  // Playback state for unified YouTube/Video control bar
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [totalDurationSec, setTotalDurationSec] = useState(durationSeconds);

  const safeUrl = /^https?:\/\//i.test(url) ? url : '';
  const youtubeId = useMemo(() => {
    if (!safeUrl) return null;
    if (
      sourceType === 'YOUTUBE' ||
      safeUrl.includes('youtube.com') ||
      safeUrl.includes('youtu.be')
    ) {
      return extractYouTubeId(safeUrl);
    }
    return null;
  }, [safeUrl, sourceType]);

  const isYouTube = Boolean(youtubeId);

  const embedSrc = useMemo(() => {
    if (!safeUrl) return null;
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&controls=1&rel=0&modestbranding=1&playsinline=1`;
    }
    if (sourceType === 'DRIVE' || safeUrl.includes('drive.google.com')) {
      return toDrivePreview(safeUrl) || safeUrl;
    }
    return null;
  }, [safeUrl, youtubeId, sourceType]);

  const sendYouTubeCommand = (func: string, args: unknown[] = []) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*'
    );
  };

  // Listen to YouTube IFrame API telemetry
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (event: MessageEvent) => {
      if (
        typeof event.origin !== 'string' ||
        !event.origin.includes('youtube.com')
      ) {
        return;
      }
      if (typeof event.data !== 'string') return;
      try {
        const parsed = JSON.parse(event.data) as {
          event?: string;
          info?: {
            playerState?: number;
            currentTime?: number;
            duration?: number;
            muted?: boolean;
            volume?: number;
          };
        };
        if (parsed.event === 'infoDelivery' && parsed.info) {
          const info = parsed.info;
          if (typeof info.playerState === 'number') {
            setIsPlaying(info.playerState === 1);
          }
          if (typeof info.muted === 'boolean') {
            setIsMuted(info.muted);
          }
          if (typeof info.volume === 'number') {
            setVolume(Math.round(info.volume));
          }
          if (typeof info.duration === 'number' && info.duration > 0) {
            setTotalDurationSec(Math.floor(info.duration));
          }
          if (typeof info.currentTime === 'number') {
            const cur = Math.floor(info.currentTime);
            setCurrentTimeSec(cur);
            const dur = Math.floor(info.duration || totalDurationSec || 0);
            if (
              onVideoProgress &&
              dur > 0 &&
              Math.abs(cur - lastReportedRef.current) >= 15
            ) {
              lastReportedRef.current = cur;
              onVideoProgress(cur, dur);
            }
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube, onVideoProgress, totalDurationSec]);

  const handleTogglePlay = () => {
    if (isYouTube) {
      if (isPlaying) {
        sendYouTubeCommand('pauseVideo');
        setIsPlaying(false);
      } else {
        sendYouTubeCommand('playVideo');
        setIsPlaying(true);
      }
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    if (isYouTube) {
      if (isMuted) {
        sendYouTubeCommand('unMute');
        setIsMuted(false);
      } else {
        sendYouTubeCommand('mute');
        setIsMuted(true);
      }
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  const handleVolumeChange = (nextVol: number) => {
    setVolume(nextVol);
    if (isYouTube) {
      if (nextVol === 0) {
        sendYouTubeCommand('mute');
        setIsMuted(true);
      } else {
        if (isMuted) sendYouTubeCommand('unMute');
        sendYouTubeCommand('setVolume', [nextVol]);
        setIsMuted(false);
      }
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    el.volume = nextVol / 100;
    el.muted = nextVol === 0;
    setIsMuted(el.muted);
  };

  const handleSeekTo = (targetSec: number) => {
    const clamped = Math.max(
      0,
      totalDurationSec > 0 ? Math.min(targetSec, totalDurationSec) : targetSec
    );
    setCurrentTimeSec(clamped);
    if (isYouTube) {
      sendYouTubeCommand('seekTo', [clamped, true]);
      return;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  const handleCycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextRate = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextRate);
    if (isYouTube) {
      sendYouTubeCommand('setPlaybackRate', [nextRate]);
      return;
    }
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const handleFullscreen = () => {
    const target = containerRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void target.requestFullscreen();
    }
  };

  const handleMp4TimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    const nowSec = Math.floor(el.currentTime);
    const totalSec = Math.floor(el.duration || durationSeconds || 0);
    setCurrentTimeSec(nowSec);
    if (totalSec > 0) setTotalDurationSec(totalSec);
    if (onVideoProgress && totalSec > 0 && Math.abs(nowSec - lastReportedRef.current) >= 15) {
      lastReportedRef.current = nowSec;
      onVideoProgress(nowSec, totalSec);
    }
  };

  if (isEditorMode) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
            <span className="material-symbols-outlined text-[18px] text-blue-600">
              play_circle
            </span>
            <span>Khối Video bài giảng</span>
          </div>
          <div className="flex items-center gap-1">
            {(['YOUTUBE', 'DRIVE', 'MP4'] as const).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => onChange({ ...content, sourceType: src })}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border-none cursor-pointer ${
                  sourceType === src
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => onChange({ ...content, url: e.target.value })}
            placeholder="Dán link YouTube, Google Drive hoặc MP4 (https://...)..."
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border-none outline-none"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => onChange({ ...content, caption: e.target.value })}
            placeholder="Mô tả / Chú thích video..."
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border-none outline-none"
          />
        </div>

        {safeUrl && (
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-950">
            {embedSrc ? (
              <iframe
                src={embedSrc}
                title={caption || 'Video preview'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={safeUrl} controls className="w-full h-full object-contain" />
            )}
          </div>
        )}
      </div>
    );
  }

  if (!safeUrl) {
    return (
      <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500">
        Chưa cấu hình URL cho khối video này.
      </div>
    );
  }

  const showCustomControls = isYouTube || !embedSrc;
  const progressRatio =
    totalDurationSec > 0
      ? Math.min(100, Math.round((currentTimeSec / totalDurationSec) * 100))
      : 0;

  return (
    <div
      ref={containerRef}
      className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
    >
      <div className="aspect-video w-full bg-black">
        {embedSrc ? (
          <iframe
            ref={iframeRef}
            src={embedSrc}
            title={caption || 'Video bài giảng'}
            onLoad={() => {
              if (isYouTube) {
                iframeRef.current?.contentWindow?.postMessage(
                  JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
                  '*'
                );
              }
            }}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={safeUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleMp4TimeUpdate}
            onEnded={() => {
              setIsPlaying(false);
              if (onVideoProgress && totalDurationSec > 0) {
                onVideoProgress(totalDurationSec, totalDurationSec);
              }
            }}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* YouTube / MP4 Quick Control Bar */}
      {showCustomControls && (
        <div className="bg-slate-900 text-slate-100 px-3 sm:px-4 py-2 flex flex-col gap-1.5 border-t border-slate-800">
          {/* Seekable Progress Rail */}
          {totalDurationSec > 0 && (
            <input
              type="range"
              min={0}
              max={totalDurationSec}
              value={currentTimeSec}
              onChange={(e) => handleSeekTo(Number(e.target.value))}
              aria-label="Tua thời gian video"
              className="w-full h-1 accent-blue-500 cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${progressRatio}%, #334155 ${progressRatio}%)`,
              }}
            />
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Left Controls: Play/Pause, -10s, +10s, Mute & Volume, Time */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                title={isPlaying ? 'Tạm dừng' : 'Phát'}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSeekTo(currentTimeSec - 10)}
                title="Tua lùi 10 giây"
                className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-200 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">replay_10</span>
              </button>

              <button
                type="button"
                onClick={() => handleSeekTo(currentTimeSec + 10)}
                title="Tua tới 10 giây"
                className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-200 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">forward_10</span>
              </button>

              <div className="flex items-center gap-1.5 pl-1">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-200 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[19px]">
                    {isMuted || volume === 0 ? 'volume_off' : 'volume_up'}
                  </span>
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  aria-label="Âm lượng"
                  className="w-16 h-1 accent-blue-500 cursor-pointer hidden sm:block"
                />
              </div>

              {(currentTimeSec > 0 || totalDurationSec > 0) && (
                <span className="text-[11px] font-mono text-slate-300 pl-1">
                  {formatSeconds(currentTimeSec)}
                  {totalDurationSec > 0 ? ` / ${formatSeconds(totalDurationSec)}` : ''}
                </span>
              )}
            </div>

            {/* Right Controls: Speed, Open on YouTube, Fullscreen */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCycleSpeed}
                title="Đổi tốc độ phát"
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-100 text-[11px] font-mono font-bold border-none cursor-pointer transition-colors"
              >
                {playbackRate}x
              </button>

              {isYouTube && (
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở trên YouTube"
                  className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-200 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleFullscreen}
                title="Toàn màn hình"
                className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-200 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">fullscreen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {(caption || chapters.length > 0) && (
        <div className="bg-white dark:bg-slate-900 px-4 py-3 flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800">
          {caption && (
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {caption}
            </p>
          )}
          {chapters.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                Mốc bài:
              </span>
              {chapters.map((ch, idx) => (
                <button
                  key={`${ch.timeSec}-${idx}`}
                  type="button"
                  onClick={() => handleSeekTo(ch.timeSec)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[11px] font-medium text-slate-700 dark:text-slate-200 border-none cursor-pointer"
                >
                  {formatSeconds(ch.timeSec)} • {ch.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
