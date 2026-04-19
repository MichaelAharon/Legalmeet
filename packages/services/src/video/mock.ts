import type { IVideoService, CreateRoomOptions, RoomResult, Recording } from './interface';

export class MockVideoService implements IVideoService {
  private rooms = new Map<string, RoomResult>();

  async createRoom(options: CreateRoomOptions): Promise<RoomResult> {
    const room: RoomResult = {
      name: options.name,
      url: `https://mock.daily.co/${options.name}`,
      createdAt: new Date().toISOString(),
    };
    this.rooms.set(options.name, room);
    return room;
  }

  async getRoomToken(roomName: string, userId: string, isOwner: boolean): Promise<string> {
    return `mock-token-${roomName}-${userId}-${isOwner ? 'owner' : 'participant'}`;
  }

  async deleteRoom(roomName: string): Promise<void> {
    this.rooms.delete(roomName);
  }

  async getRecordings(roomName: string): Promise<Recording[]> {
    return [{
      id: `mock-rec-${Date.now()}`,
      roomName,
      startedAt: new Date().toISOString(),
      duration: 300,
      status: 'ready',
    }];
  }

  async getRecordingLink(recordingId: string): Promise<string> {
    return `https://mock-storage.local/recordings/${recordingId}.mp4`;
  }
}
