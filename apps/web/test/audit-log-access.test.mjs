import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isMockAuditLogEnabled } from '../src/lib/audit-log-access.mjs';

test('audit log mock access is disabled by default', () => {
  assert.equal(isMockAuditLogEnabled({}), false);
});

test('audit log mock access is enabled only by explicit mock flags', () => {
  assert.equal(isMockAuditLogEnabled({ USE_MOCK_SERVICES: 'true' }), true);
  assert.equal(isMockAuditLogEnabled({ NEXT_PUBLIC_USE_MOCK: 'true' }), true);
  assert.equal(isMockAuditLogEnabled({ USE_MOCK_SERVICES: 'false', NEXT_PUBLIC_USE_MOCK: 'false' }), false);
});
