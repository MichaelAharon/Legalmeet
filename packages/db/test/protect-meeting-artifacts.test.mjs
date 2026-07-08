import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

const migrationPath = path.resolve('migrations/003_protect_meeting_artifacts.sql');

test('meeting artifact foreign keys restrict meeting deletion', async () => {
  const migration = await readFile(migrationPath, 'utf8');

  for (const table of ['nda_signatures', 'recordings', 'transcripts', 'document_bundles']) {
    assert.match(
      migration,
      new RegExp(
        `ALTER TABLE public\\.${table}[\\s\\S]*FOREIGN KEY \\(meeting_id\\) REFERENCES public\\.meetings\\(id\\) ON DELETE RESTRICT`,
        'm'
      ),
      `${table}.meeting_id must restrict meeting deletion`
    );
  }
});
