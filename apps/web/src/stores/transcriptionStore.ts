import { create } from 'zustand';

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
  isFinal: boolean;
}

interface TranscriptionState {
  segments: TranscriptSegment[];
  isActive: boolean;
  addSegment: (segment: TranscriptSegment) => void;
  setActive: (active: boolean) => void;
  clear: () => void;
  getFullText: () => string;
}

export const useTranscriptionStore = create<TranscriptionState>((set, get) => ({
  segments: [],
  isActive: false,
  addSegment: (segment) => set((s) => ({ segments: [...s.segments, segment] })),
  setActive: (active) => set({ isActive: active }),
  clear: () => set({ segments: [], isActive: false }),
  getFullText: () => get().segments.filter(s => s.isFinal).map(s => `${s.speaker}: ${s.text}`).join('\n'),
}));
