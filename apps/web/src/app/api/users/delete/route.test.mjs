import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mockBundles,
  mockMeetings,
  mockParticipants,
  mockProjects,
  mockRecordings,
  mockSignatures,
} from '../../lib/mock-store.ts';
import { POST } from './route.ts';

function storeLengths() {
  return {
    projects: mockProjects.length,
    meetings: mockMeetings.length,
    signatures: mockSignatures.length,
    recordings: mockRecordings.length,
    bundles: mockBundles.length,
    participants: mockParticipants.length,
  };
}

test('POST /api/users/delete fails closed without clearing shared mock data', async () => {
  const before = storeLengths();

  const response = await POST();

  assert.equal(response.status, 501);
  assert.equal(response.headers.get('content-type')?.includes('application/json'), true);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'Account deletion is unavailable until requests can be scoped to the authenticated user.',
  });
  assert.deepEqual(storeLengths(), before);
});
