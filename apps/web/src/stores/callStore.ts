import { create } from 'zustand';

interface CallState {
  meetingId: string | null;
  roomUrl: string | null;
  isJoined: boolean;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  participantCount: number;
  setMeetingId: (id: string | null) => void;
  setRoomUrl: (url: string | null) => void;
  setJoined: (joined: boolean) => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  toggleRecording: () => void;
  setParticipantCount: (count: number) => void;
  reset: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  meetingId: null, roomUrl: null, isJoined: false,
  isMicOn: true, isCameraOn: true, isScreenSharing: false,
  isRecording: false, participantCount: 0,
  setMeetingId: (id) => set({ meetingId: id }),
  setRoomUrl: (url) => set({ roomUrl: url }),
  setJoined: (joined) => set({ isJoined: joined }),
  toggleMic: () => set((s) => ({ isMicOn: !s.isMicOn })),
  toggleCamera: () => set((s) => ({ isCameraOn: !s.isCameraOn })),
  toggleScreenShare: () => set((s) => ({ isScreenSharing: !s.isScreenSharing })),
  toggleRecording: () => set((s) => ({ isRecording: !s.isRecording })),
  setParticipantCount: (count) => set({ participantCount: count }),
  reset: () => set({ meetingId: null, roomUrl: null, isJoined: false, isMicOn: true, isCameraOn: true, isScreenSharing: false, isRecording: false, participantCount: 0 }),
}));
