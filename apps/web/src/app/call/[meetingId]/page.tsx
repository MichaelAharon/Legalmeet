'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff,
  PhoneOff, MessageSquare, Users, Circle, Download, StopCircle,
  Maximize2, Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCallStore } from '@/stores/callStore';
import { useTranscriptionStore } from '@/stores/transcriptionStore';
import { useMeeting } from '@/hooks/useMeeting';

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  const { data: meeting } = useMeeting(meetingId);

  const {
    isMicOn, isCameraOn, isScreenSharing, isRecording,
    toggleMic, toggleCamera, toggleScreenShare, toggleRecording, reset,
  } = useCallStore();
  const { segments, isActive, addSegment, setActive, clear } = useTranscriptionStore();

  const [showTranscript, setShowTranscript] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs for media streams
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const joinTimeRef = useRef<number>(0);

  // Participants from meeting data (memoized to prevent infinite re-renders)
  const participants = useMemo(() => meeting?.participants || [], [meeting?.participants]);
  const remoteParticipants = useMemo(() => participants.filter((p: any) => p.role !== 'host'), [participants]);

  // ===== Initialize camera/mic =====
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsJoined(true);
        joinTimeRef.current = Date.now();
        setMediaError(null);
      } catch (err: any) {
        console.error('Media access error:', err);
        // Still allow joining without camera/mic
        setMediaError(err.name === 'NotAllowedError'
          ? 'Camera/mic access denied. You can still join without video.'
          : 'Could not access camera/mic. Joining in audio-only mode.'
        );
        setIsJoined(true);
        joinTimeRef.current = Date.now();
      }
    }

    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // ===== Timer =====
  useEffect(() => {
    if (!isJoined) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - joinTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isJoined]);

  // ===== Toggle mic =====
  useEffect(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = isMicOn; });
    }
  }, [isMicOn]);

  // ===== Toggle camera =====
  useEffect(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach(t => { t.enabled = isCameraOn; });
    }
  }, [isCameraOn]);

  // ===== Screen sharing =====
  useEffect(() => {
    if (!isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      return;
    }

    async function startScreenShare() {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        // Auto-stop when user clicks "Stop sharing" in browser
        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      } catch {
        // User cancelled — toggle back
        toggleScreenShare();
      }
    }

    startScreenShare();
  }, [isScreenSharing, toggleScreenShare]);

  // ===== Recording =====
  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  function startRecording() {
    recordedChunksRef.current = [];
    setRecordingBlob(null);

    // Combine local video + audio into one stream for recording
    const stream = localStreamRef.current;
    if (!stream) return;

    // If screen sharing, record screen + audio
    const tracksToRecord: MediaStreamTrack[] = [];

    if (screenStreamRef.current) {
      tracksToRecord.push(...screenStreamRef.current.getVideoTracks());
    } else {
      tracksToRecord.push(...stream.getVideoTracks());
    }
    tracksToRecord.push(...stream.getAudioTracks());

    const combinedStream = new MediaStream(tracksToRecord);

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        setRecordingBlob(blob);
      };

      recorder.start(1000); // Collect data every second
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error('Recording error:', err);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }

  function downloadRecording() {
    if (!recordingBlob) return;
    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${meetingId}-${new Date().toISOString().slice(0, 10)}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Mock transcription (simulated live captions) =====
  const remoteName = remoteParticipants[0]?.displayName || 'Participant';
  useEffect(() => {
    if (!isJoined) return;
    const store = useTranscriptionStore.getState();
    store.setActive(true);

    const phrases = [
      { speaker: 'You', text: 'Thank you for joining this meeting today.' },
      { speaker: remoteName, text: 'Happy to be here. Shall we discuss the terms?' },
      { speaker: 'You', text: "Let's go through the key deliverables first." },
      { speaker: remoteName, text: 'The timeline looks reasonable to me.' },
      { speaker: 'You', text: 'We should address the confidentiality clause next.' },
      { speaker: remoteName, text: 'Agreed. I have some suggestions on that section.' },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      const p = phrases[idx % phrases.length];
      useTranscriptionStore.getState().addSegment({
        id: `seg-${Date.now()}`,
        speaker: p.speaker,
        text: p.text,
        timestamp: new Date().toISOString(),
        confidence: 0.97,
        isFinal: true,
      });
      idx++;
    }, 8000);

    return () => { clearInterval(interval); useTranscriptionStore.getState().setActive(false); };
  }, [isJoined, remoteName]);

  // ===== Leave call =====
  const handleLeave = useCallback(() => {
    // Stop all streams
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    stopRecording();
    reset();
    clear();
    router.push(`/meetings/${meetingId}`);
  }, [reset, clear, router, meetingId]);

  // ===== Format time =====
  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  // ===== Loading state =====
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg font-medium">Starting camera & microphone...</p>
          <p className="text-sm text-slate-400 mt-1">Please allow access when prompted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative">
      {/* Top bar */}
      <div className="h-12 bg-slate-900/80 backdrop-blur flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium text-sm truncate max-w-[200px]">
            {meeting?.title || 'Meeting'}
          </span>
          <span className="text-slate-400 text-xs">{formatTime(elapsedTime)}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs px-2.5 py-1 rounded-full">
              <Circle className="h-2.5 w-2.5 fill-current animate-pulse" />
              REC
            </div>
          )}

          {/* Recording download */}
          {recordingBlob && !isRecording && (
            <button
              onClick={downloadRecording}
              className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full hover:bg-emerald-500/30 transition-colors"
            >
              <Download className="h-3 w-3" />
              Download Recording ({(recordingBlob.size / 1024 / 1024).toFixed(1)} MB)
            </button>
          )}

          {mediaError && (
            <span className="text-amber-400 text-xs">{mediaError}</span>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Video grid */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className={cn(
            'gap-3 w-full max-w-5xl',
            isScreenSharing ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-2',
          )}>
            {/* Screen share (if active, shown large) */}
            {isScreenSharing && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-white text-xs">
                  <Monitor className="h-3 w-3 text-indigo-400" />
                  <span>Screen Share</span>
                </div>
              </div>
            )}

            <div className={cn(
              'gap-3',
              isScreenSharing ? 'flex' : 'grid grid-cols-1 md:grid-cols-2 w-full',
            )}>
              {/* Local participant (your camera) */}
              <div className={cn(
                'relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700',
                isScreenSharing ? 'w-48 h-36 flex-shrink-0' : 'aspect-video',
              )}>
                {isCameraOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                      DU
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-white text-xs">
                  {!isMicOn && <MicOff className="h-3 w-3 text-red-400" />}
                  <span>You</span>
                </div>
              </div>

              {/* Remote participants */}
              {remoteParticipants.length > 0 ? (
                remoteParticipants.map((p: any) => (
                  <div
                    key={p.id}
                    className={cn(
                      'relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center',
                      isScreenSharing ? 'w-48 h-36 flex-shrink-0' : 'aspect-video',
                    )}
                  >
                    <div className={cn(
                      'rounded-full flex items-center justify-center text-white font-bold',
                      isScreenSharing ? 'h-12 w-12 text-lg' : 'h-16 w-16 text-xl',
                    )} style={{
                      backgroundColor: `hsl(${p.displayName.charCodeAt(0) * 37 % 360}, 50%, 40%)`,
                    }}>
                      {p.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-white text-xs">
                      <span>{p.displayName}</span>
                    </div>
                    {/* Simulated connection status */}
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
                    </div>
                  </div>
                ))
              ) : (
                <div className={cn(
                  'relative rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/50 border-dashed flex items-center justify-center',
                  isScreenSharing ? 'w-48 h-36 flex-shrink-0' : 'aspect-video',
                )}>
                  <div className="text-center text-slate-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Waiting for participants...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transcript panel */}
        {showTranscript && (
          <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
            <div className="flex items-center gap-2 p-4 border-b border-slate-700">
              <h3 className="text-white font-medium text-sm">Live Transcript</h3>
              {isActive && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {segments.length === 0 ? (
                <p className="text-xs text-slate-500">Transcript will appear here as the conversation progresses...</p>
              ) : (
                segments.map(seg => (
                  <div key={seg.id} className="group">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs text-indigo-400 font-medium">{seg.speaker}</p>
                      <p className="text-[10px] text-slate-600">{new Date(seg.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <p className="text-sm text-slate-300">{seg.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Participants panel */}
        {showParticipants && (
          <div className="w-72 bg-slate-900 border-l border-slate-700 flex flex-col">
            <div className="flex items-center gap-2 p-4 border-b border-slate-700">
              <h3 className="text-white font-medium text-sm">Participants ({participants.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* You */}
              <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  DU
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium truncate">Demo User (You)</p>
                  <p className="text-[10px] text-slate-400">Host</p>
                </div>
                <div className="flex items-center gap-1">
                  {isMicOn ? <Mic className="h-3 w-3 text-slate-400" /> : <MicOff className="h-3 w-3 text-red-400" />}
                  {isCameraOn ? <Camera className="h-3 w-3 text-slate-400" /> : <CameraOff className="h-3 w-3 text-red-400" />}
                </div>
              </div>
              {/* Remote participants */}
              {remoteParticipants.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{
                    backgroundColor: `hsl(${p.displayName.charCodeAt(0) * 37 % 360}, 50%, 40%)`,
                  }}>
                    {p.displayName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{p.displayName}</p>
                    <p className="text-[10px] text-slate-400">{p.role}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="h-16 bg-slate-900/90 backdrop-blur flex items-center justify-center gap-2 px-4 z-10">
        {/* Mic */}
        <button
          onClick={toggleMic}
          title={isMicOn ? 'Mute' : 'Unmute'}
          className={cn(
            'p-3 rounded-full transition-colors',
            isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
          )}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          className={cn(
            'p-3 rounded-full transition-colors',
            isCameraOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
          )}
        >
          {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </button>

        {/* Screen share */}
        <button
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          className={cn(
            'p-3 rounded-full transition-colors',
            isScreenSharing ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
          )}
        >
          {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </button>

        <div className="w-px h-8 bg-slate-700 mx-1" />

        {/* Record */}
        <button
          onClick={toggleRecording}
          title={isRecording ? 'Stop recording' : 'Start recording'}
          className={cn(
            'p-3 rounded-full transition-colors',
            isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
          )}
        >
          {isRecording ? <StopCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>

        {/* Transcript */}
        <button
          onClick={() => { setShowTranscript(!showTranscript); if (showParticipants) setShowParticipants(false); }}
          title="Toggle transcript"
          className={cn(
            'p-3 rounded-full transition-colors',
            showTranscript ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
          )}
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        {/* Participants */}
        <button
          onClick={() => { setShowParticipants(!showParticipants); if (showTranscript) setShowTranscript(false); }}
          title="Toggle participants"
          className={cn(
            'p-3 rounded-full transition-colors relative',
            showParticipants ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
          )}
        >
          <Users className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 text-[10px] flex items-center justify-center text-white font-bold">
            {participants.length}
          </span>
        </button>

        <div className="w-px h-8 bg-slate-700 mx-1" />

        {/* Leave */}
        <button
          onClick={handleLeave}
          title="Leave call"
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
