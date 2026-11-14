'use client';

import React, { useState } from 'react';

interface VideoChapter {
  id: string;
  time: string;
  seconds: number;
  percent: number;
  title: string;
}

const chaptersList: VideoChapter[] = [
  { id: 'c1', time: '02:15', seconds: 135, percent: 8, title: 'Giới thiệu RDT' },
  { id: 'c2', time: '08:40', seconds: 520, percent: 30, title: 'Cờ SYN, ACK, FIN' },
  { id: 'c3', time: '14:20', seconds: 860, percent: 54, title: 'Bắt tay 3 bước Wireshark' },
  { id: 'c4', time: '22:10', seconds: 1330, percent: 77, title: 'Tấn công SYN Flood & Phòng vệ' },
];

interface LessonVideoPlayerProps {
  instructorName?: string;
  onToast: (msg: string) => void;
}

export function LessonVideoPlayer({
  instructorName = 'TS. Lê Hoàng Nam',
  onToast,
}: LessonVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('14:20');
  const [currentPercent, setCurrentPercent] = useState(50);
  const [activeChapterId, setActiveChapterId] = useState('c3');
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1.25x');
  const [isMuted, setIsMuted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubtitlesOn, setIsSubtitlesOn] = useState(true);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
    onToast(isPlaying ? 'Đã tạm dừng video bài giảng' : 'Đang phát video bài giảng');
  };

  const handleSeekChapter = (ch: VideoChapter) => {
    setActiveChapterId(ch.id);
    setCurrentPercent(ch.percent);
    setCurrentTime(ch.time);
    onToast(`Đã chuyển tới mốc [${ch.time}]: "${ch.title}"`);
  };

  const handleCycleSpeed = () => {
    const speeds = ['1.0x', '1.25x', '1.5x', '2.0x'];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
    onToast(`Tốc độ phát: ${speeds[nextIdx]}`);
  };

  const handleToggleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    onToast(isBookmarked ? 'Đã gỡ bookmark khoảnh khắc' : 'Đã lưu khoảnh khắc vào danh sách ôn tập!');
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onToast('Đã sao chép liên kết mốc thời gian bài giảng vào clipboard!');
    } else {
      onToast('Đã chia sẻ mốc bài giảng!');
    }
  };

  return (
    <section className="w-full rounded-2xl bg-slate-900 text-white shadow-xl overflow-hidden relative group border-[3px] border-slate-300 dark:border-slate-700">
      {/* ======================================================== */}
      {/* 1. Main Video Screen (16:9 Aspect Ratio)                */}
      {/* ======================================================== */}
      <div className="relative w-full aspect-video bg-[#0A192F] flex flex-col justify-between p-4 overflow-hidden select-none">
        {/* Background Network Topology Vector Animation */}
        <div className="absolute inset-0 opacity-25 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full text-blue-500" viewBox="0 0 800 450">
            <path
              d="M 100 100 Q 400 200 700 150"
              fill="transparent"
              stroke="currentColor"
              strokeDasharray="6 6"
              strokeWidth="2"
            />
            <path
              d="M 700 200 Q 400 250 100 300"
              fill="transparent"
              stroke="#6C5CE7"
              strokeWidth="2"
            />
            <path
              d="M 100 350 Q 400 370 700 400"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="100" cy="100" fill="#0070ea" r="12" />
            <circle cx="700" cy="150" fill="#6C5CE7" r="12" />
            <circle cx="100" cy="300" fill="#0070ea" r="12" />
            <circle cx="700" cy="400" fill="#6C5CE7" r="12" />
          </svg>
        </div>

        {/* Video Top Overlay Bar */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>HD 1080p</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold border border-white/10">
              {instructorName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`p-1.5 rounded-xl bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer ${
                isBookmarked ? 'text-amber-400' : ''
              }`}
              title="Bookmark khoảnh khắc bài giảng"
            >
              <span className="material-symbols-outlined text-[19px]">
                {isBookmarked ? 'bookmark' : 'bookmark_add'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-xl bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
              title="Chia sẻ liên kết bài học"
            >
              <span className="material-symbols-outlined text-[19px]">share</span>
            </button>
          </div>
        </div>

        {/* Center Play/Pause Button Overlay */}
        <div className="relative z-10 self-center flex items-center justify-center">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[36px] ml-1">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>

        {/* Video Bottom Controls Dock */}
        <div className="relative z-10 flex flex-col gap-2 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 -mx-4 -mb-4">
          {/* Progress Bar with Chapter Markers */}
          <div
            className="w-full relative h-2.5 bg-white/20 rounded-full cursor-pointer group/bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const p = Math.round((clickX / rect.width) * 100);
              setCurrentPercent(p);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
              style={{ width: `${currentPercent}%` }}
            />

            {/* Timestamp Markers */}
            {chaptersList.map((ch) => (
              <span
                key={ch.id}
                className="absolute top-0 w-1.5 h-full bg-amber-400 rounded-xs shadow-xs"
                style={{ left: `${ch.percent}%` }}
                title={`${ch.time} ${ch.title}`}
              />
            ))}

            {/* Scrubber Knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-blue-600 hidden group-hover/bar:block"
              style={{ left: `${currentPercent}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white text-xs pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToast('Đã tua lại 10 giây')}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title="Tua lùi 10 giây"
              >
                <span className="material-symbols-outlined text-[20px]">replay_10</span>
              </button>

              <button
                type="button"
                onClick={() => onToast('Đã tua tới 10 giây')}
                className="hover:text-blue-400 transition-colors cursor-pointer"
                title="Tua tới 10 giây"
              >
                <span className="material-symbols-outlined text-[20px]">forward_10</span>
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isMuted ? 'volume_off' : 'volume_up'}
                  </span>
                </button>
                <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className={`h-full bg-white ${isMuted ? 'w-0' : 'w-3/4'}`} />
                </div>
              </div>

              {/* Time display */}
              <span className="font-mono text-xs opacity-90 text-slate-200">
                {currentTime} / 28:45
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Playback speed */}
              <button
                type="button"
                onClick={handleCycleSpeed}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
                title="Tốc độ phát"
              >
                {playbackSpeed}
              </button>

              {/* Subtitles */}
              <button
                type="button"
                onClick={() => {
                  setIsSubtitlesOn((prev) => !prev);
                  onToast(isSubtitlesOn ? 'Đã tắt phụ đề' : 'Đã bật phụ đề Tiếng Việt');
                }}
                className={`transition-colors cursor-pointer ${
                  isSubtitlesOn ? 'text-blue-400' : 'hover:text-blue-300'
                }`}
                title="Phụ đề Tiếng Việt"
              >
                <span className="material-symbols-outlined text-[20px]">subtitles</span>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => onToast('Độ phân giải: 1080p 60fps (Mặc định)')}
                className="hover:text-blue-300 transition-colors cursor-pointer"
                title="Cài đặt chất lượng"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={() => onToast('Kích hoạt chế độ xem toàn màn hình (F11)')}
                className="hover:text-blue-300 transition-colors cursor-pointer"
                title="Toàn màn hình"
              >
                <span className="material-symbols-outlined text-[20px]">fullscreen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Video Chapters Strip (Mốc bài)                       */}
      {/* ======================================================== */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-[16px]">schedule</span> Mốc bài:
        </span>

        {chaptersList.map((ch) => {
          const isActive = activeChapterId === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => handleSeekChapter(ch)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-xs shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600 hover:text-blue-600'
              }`}
            >
              {ch.time} • {ch.title}
            </button>
          );
        })}
      </div>
    </section>
  );
}

