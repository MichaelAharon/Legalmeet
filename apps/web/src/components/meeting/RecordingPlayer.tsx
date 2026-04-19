'use client';

import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download } from 'lucide-react';

interface RecordingPlayerProps {
  recordingUrl: string | null;
  durationSeconds: number | null;
  transcript?: Array<{ speaker: string; text: string; timestamp: string }>;
}

export function RecordingPlayer({ recordingUrl, durationSeconds, transcript }: RecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  if (!recordingUrl) {
    return (
      <div className="text-center py-8">
        <Play className="h-10 w-10 mx-auto text-slate-400 mb-3" />
        <p className="text-slate-500 dark:text-slate-400">No recording available</p>
      </div>
    );
  }

  const duration = durationSeconds || 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="space-y-4">
      {/* Player Controls */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentTime(Math.floor(pct * duration));
            }}
          >
            <div className="absolute h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            <div className="absolute h-4 w-4 bg-indigo-600 rounded-full -top-1 shadow" style={{ left: `calc(${progress}% - 8px)` }} />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setCurrentTime(Math.max(0, currentTime - 15))} className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 15))} className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <SkipForward className="h-5 w-5" />
          </button>
          <Volume2 className="h-4 w-4 text-slate-400 ml-4" />
          <a href={recordingUrl} download className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ml-auto">
            <Download className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Transcript with timestamps */}
      {transcript && transcript.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Transcript</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {transcript.map((seg, i) => (
              <div
                key={i}
                className="flex gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                onClick={() => {
                  const parts = seg.timestamp.split(':').map(Number);
                  const secs = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
                  setCurrentTime(secs);
                }}
              >
                <span className="text-xs text-indigo-500 font-mono mt-0.5 shrink-0">{seg.timestamp}</span>
                <div>
                  <span className="text-xs font-medium text-slate-500">{seg.speaker}</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{seg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
