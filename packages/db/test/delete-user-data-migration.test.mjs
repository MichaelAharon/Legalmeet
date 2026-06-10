import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const migrationPaths = [
  'migrations/001_initial_schema.sql',
  'migrations/003_harden_delete_user_data.sql',
];

for (const migrationPath of migrationPaths) {
  test(`${migrationPath} hardens delete_user_data`, async () => {
    const sql = await readFile(join(packageDir, migrationPath), 'utf8');
    const functionStart = sql.indexOf('CREATE OR REPLACE FUNCTION public.delete_user_data');
    assert.notEqual(functionStart, -1, 'delete_user_data function is present');

    const relevantSql = sql.slice(functionStart);
    assert.match(relevantSql, /SECURITY DEFINER/);
    assert.match(relevantSql, /SET search_path = public, pg_temp/);
    assert.match(relevantSql, /auth\.uid\(\)\) IS NULL/);
    assert.match(relevantSql, /auth\.uid\(\)\) <> target_user_id/);
    assert.match(relevantSql, /RAISE EXCEPTION 'unauthorized'/);
    assert.match(relevantSql, /DELETE FROM public\.profiles WHERE id = target_user_id/);
    assert.match(relevantSql, /REVOKE ALL ON FUNCTION public\.delete_user_data\(UUID\) FROM PUBLIC/);
    assert.match(relevantSql, /REVOKE ALL ON FUNCTION public\.delete_user_data\(UUID\) FROM anon/);
    assert.match(relevantSql, /GRANT EXECUTE ON FUNCTION public\.delete_user_data\(UUID\) TO authenticated/);
  });
}
