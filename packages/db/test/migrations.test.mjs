import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationsDir = join(packageDir, 'migrations');

async function migrationSql() {
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();
  const contents = await Promise.all(
    files.map((file) => readFile(join(migrationsDir, file), 'utf8')),
  );
  return contents.join('\n');
}

function expectPattern(sql, pattern, message) {
  assert.match(sql, pattern, message);
}

test('migrations include tables required by committed database types', async () => {
  const sql = await migrationSql();

  for (const table of [
    'sub_projects',
    'document_versions',
    'guest_tokens',
    'meeting_summaries',
    'nda_analyses',
    'notifications',
    'resource_tags',
    'subscriptions',
    'tags',
  ]) {
    expectPattern(
      sql,
      new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`, 'i'),
      `expected migrations to create public.${table}`,
    );
  }
});

test('migrations include columns and statuses used by meeting and NDA APIs', async () => {
  const sql = await migrationSql();

  for (const column of [
    'sub_project_id',
    'nda_customized_content',
    'host_signed_at',
    'invites_sent_at',
    'nda_signed_at',
    'category',
  ]) {
    expectPattern(sql, new RegExp(`\\b${column}\\b`, 'i'), `expected ${column} to be migrated`);
  }

  expectPattern(
    sql,
    /status IN \('scheduled', 'awaiting_signatures', 'ready', 'in_progress', 'completed', 'cancelled'\)/i,
    'expected meetings.status constraint to allow application workflow states',
  );
});

test('signed NDA records are protected from destructive cascades', async () => {
  const sql = await migrationSql();

  expectPattern(
    sql,
    /FOREIGN KEY \(meeting_id\) REFERENCES public\.meetings\(id\) ON DELETE RESTRICT/i,
    'expected signed NDAs to survive attempted meeting deletion',
  );
  expectPattern(
    sql,
    /FOREIGN KEY \(participant_id\) REFERENCES public\.meeting_participants\(id\) ON DELETE RESTRICT/i,
    'expected signed NDAs to survive attempted participant deletion',
  );
});

