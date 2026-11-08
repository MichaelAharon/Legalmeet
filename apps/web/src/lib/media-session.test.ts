import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { retainMediaStream, stopMediaStream } from './media-session.ts';

function fakeStream() {
  const stopped: string[] = [];
  return {
    stopped,
    stream: {
      getTracks: () => [
        { stop: () => stopped.push('video') },
        { stop: () => stopped.push('audio') },
      ],
    },
  };
}

describe('retainMediaStream', () => {
  it('stops every track when the caller has already unmounted', () => {
    const { stream, stopped } = fakeStream();
    const retained = retainMediaStream(stream, true);
    assert.equal(retained, null);
    assert.deepEqual(stopped, ['video', 'audio']);
  });

  it('keeps the stream when the caller is still mounted', () => {
    const { stream, stopped } = fakeStream();
    const retained = retainMediaStream(stream, false);
    assert.equal(retained, stream);
    assert.deepEqual(stopped, []);
  });
});

describe('stopMediaStream', () => {
  it('stops tracks and ignores a missing stream', () => {
    const { stream, stopped } = fakeStream();
    stopMediaStream(stream);
    stopMediaStream(null);
    stopMediaStream(undefined);
    assert.deepEqual(stopped, ['video', 'audio']);
  });
});
