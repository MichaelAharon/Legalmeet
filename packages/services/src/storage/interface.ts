export interface IStorageService {
  upload(bucket: string, path: string, data: Buffer | Blob, contentType: string): Promise<string>;
  getSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string>;
  delete(bucket: string, path: string): Promise<void>;
  list(bucket: string, prefix: string): Promise<StorageFile[]>;
}

export interface StorageFile {
  name: string;
  size: number;
  createdAt: string;
}
