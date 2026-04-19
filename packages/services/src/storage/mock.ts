import type { IStorageService, StorageFile } from './interface';

export class MockStorageService implements IStorageService {
  private files = new Map<string, { data: any; contentType: string; createdAt: string }>();

  async upload(bucket: string, path: string, _data: Buffer | Blob, contentType: string): Promise<string> {
    const key = `${bucket}/${path}`;
    this.files.set(key, { data: _data, contentType, createdAt: new Date().toISOString() });
    return `https://mock-storage.local/${key}`;
  }

  async getSignedUrl(bucket: string, path: string, _expiresIn: number): Promise<string> {
    return `https://mock-storage.local/${bucket}/${path}?token=mock-signed-${Date.now()}`;
  }

  async delete(bucket: string, path: string): Promise<void> {
    this.files.delete(`${bucket}/${path}`);
  }

  async list(bucket: string, prefix: string): Promise<StorageFile[]> {
    const results: StorageFile[] = [];
    for (const [key, value] of this.files.entries()) {
      if (key.startsWith(`${bucket}/${prefix}`)) {
        results.push({ name: key.replace(`${bucket}/`, ''), size: 0, createdAt: value.createdAt });
      }
    }
    return results;
  }
}
