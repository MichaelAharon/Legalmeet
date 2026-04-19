export interface IVideoService {
  createRoom(options: CreateRoomOptions): Promise<RoomResult>;
  getRoomToken(roomName: string, userId: string, isOwner: boolean): Promise<string>;
  deleteRoom(roomName: string): Promise<void>;
  getRecordings(roomName: string): Promise<Recording[]>;
  getRecordingLink(recordingId: string): Promise<string>;
}

export interface CreateRoomOptions {
  name: string;
  expiresAt: string;
  enableRecording: boolean;
  maxParticipants: number;
}

export interface RoomResult {
  name: string;
  url: string;
  createdAt: string;
}

export interface Recording {
  id: string;
  roomName: string;
  startedAt: string;
  duration: number;
  status: 'processing' | 'ready' | 'error';
}
