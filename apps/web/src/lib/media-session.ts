export interface StoppableTrack {
  stop: () => void;
}

export interface StoppableStream {
  getTracks: () => StoppableTrack[];
}

export function stopMediaStream(stream: StoppableStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}

/**
 * Keep a stream only while the caller is still mounted.
 * If the page unmounted while the permission prompt was open, stop every
 * track so camera, microphone, or display capture cannot stay live with no UI.
 */
export function retainMediaStream<T extends StoppableStream>(stream: T, cancelled: boolean): T | null {
  if (cancelled) {
    stopMediaStream(stream);
    return null;
  }
  return stream;
}
