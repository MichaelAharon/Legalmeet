import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearMockUserData,
  deleteSupabaseUserData,
  type UserDeletionDb,
} from '../app/api/users/delete/delete-user-data';

test('clearMockUserData empties every provided mock store', () => {
  const stores = {
    projects: [{ id: 'proj-001' }],
    meetings: [{ id: 'meet-001' }],
    notifications: [{ id: 'notif-001' }],
  };

  clearMockUserData(stores);

  assert.deepEqual(stores, {
    projects: [],
    meetings: [],
    notifications: [],
  });
});

test('deleteSupabaseUserData resolves the profile by email and calls the GDPR delete RPC', async () => {
  const calls: unknown[] = [];
  const db = {
    from(table) {
      calls.push(['from', table]);
      return {
        select(columns) {
          calls.push(['select', columns]);
          return {
            eq(column, value) {
              calls.push(['eq', column, value]);
              return {
                async maybeSingle() {
                  calls.push(['maybeSingle']);
                  return { data: { id: '11111111-1111-1111-1111-111111111111' }, error: null };
                },
              };
            },
          };
        },
      };
    },
    async rpc(fn, args) {
      calls.push(['rpc', fn, args]);
      return { error: null };
    },
  } satisfies UserDeletionDb;

  const result = await deleteSupabaseUserData(db, ' user@example.com ');

  assert.deepEqual(result, { success: true, profileId: '11111111-1111-1111-1111-111111111111' });
  assert.deepEqual(calls, [
    ['from', 'profiles'],
    ['select', 'id'],
    ['eq', 'email', 'user@example.com'],
    ['maybeSingle'],
    ['rpc', 'delete_user_data', { target_user_id: '11111111-1111-1111-1111-111111111111' }],
  ]);
});

test('deleteSupabaseUserData returns 404 and skips the RPC when the profile is missing', async () => {
  let rpcCalled = false;
  const db = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                async maybeSingle() {
                  return { data: null, error: null };
                },
              };
            },
          };
        },
      };
    },
    async rpc() {
      rpcCalled = true;
      return { error: null };
    },
  } satisfies UserDeletionDb;

  const result = await deleteSupabaseUserData(db, 'missing@example.com');

  assert.deepEqual(result, { success: false, status: 404, message: 'User profile not found' });
  assert.equal(rpcCalled, false);
});
