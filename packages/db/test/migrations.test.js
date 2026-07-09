const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const migrationsDir = join(__dirname, '..', 'migrations');

function readMigration(fileName) {
  return readFileSync(join(migrationsDir, fileName), 'utf8');
}

test('delete_user_data only permits self-service or service-role deletion', () => {
  const initialSchema = readMigration('001_initial_schema.sql');
  const secureMigration = readMigration('003_secure_delete_user_data.sql');

  for (const sql of [initialSchema, secureMigration]) {
    assert.match(sql, /auth\.uid\(\)\s+IS\s+DISTINCT\s+FROM\s+target_user_id/i);
    assert.match(sql, /auth\.role\(\)\s+<>\s+'service_role'/i);
    assert.match(sql, /RAISE\s+EXCEPTION\s+'Not authorized to delete user data'/i);
    assert.match(sql, /SECURITY\s+DEFINER\s+SET\s+search_path\s*=\s*public/i);
  }
});

test('delete_user_data execution is not granted to public or anon roles', () => {
  const secureMigration = readMigration('003_secure_delete_user_data.sql');

  assert.match(
    secureMigration,
    /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.delete_user_data\(UUID\)\s+FROM\s+PUBLIC,\s+anon/i,
  );
  assert.match(
    secureMigration,
    /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.delete_user_data\(UUID\)\s+TO\s+authenticated,\s+service_role/i,
  );
});
