import type { IVideoService, CreateRoomOptions, RoomResult, Recording } from './interface';

export class DailyVideoService implements IVideoService {
  constructor(private apiKey: string) {}

  private async request(path: string, options: RequestInit = {}) {
    const res = await fetch(`https://api.daily.co/v1${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error(`Daily API error: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async createRoom(options: CreateRoomOptions): Promise<RoomResult> {
    const data = await this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: options.name,
        properties: {
          exp: Math.floor(new Date(options.expiresAt).getTime() / 1000),
          enable_recording: options.enableRecording ? 'cloud' : undefined,
          max_participants: options.maxParticipants,
        },
      }),
    });
    return { name: data.name, url: data.url, createdAt: data.created_at };
  }

  async getRoomToken(roomName: string, userId: string, isOwner: boolean): Promise<string> {
    const data = await this.request('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: userId,
          is_owner: isOwner,
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      }),
    });
    return data.token;
  }

  async deleteRoom(roomName: string): Promise<void> {
    await this.request(`/rooms/${roomName}`, { method: 'DELETE' });
  }

  async getRecordings(roomName: string): Promise<Recording[]> {
    const data = await this.request(`/recordings?room_name=${roomName}`);
    return data.data.map((r: any) => ({
      id: r.id,
      roomName: r.room_name,
      startedAt: r.started_at,
      duration: r.duration,
      status: r.status === 'finished' ? 'ready' : r.status,
    }));
  }

  async getRecordingLink(recordingId: string): Promise<string> {
    const data = await this.request(`/recordings/${recordingId}/access-link`);
    return data.download_link;
  }
}
