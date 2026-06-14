import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const initialSchema = new URL('../migrations/001_initial_schema.sql', import.meta.url);
const preserveSignatures = new URL('../migrations/003_preserve_nda_signature_records.sql', import.meta.url);

test('signed NDA records are protected from destructive cascades', async () => {
  const [schemaSql, migrationSql] = await Promise.all([
    readFile(initialSchema, 'utf8'),
    readFile(preserveSignatures, 'utf8'),
  ]);

  const signatureTable = schemaSql.match(
    /CREATE TABLE public\.nda_signatures \((?<definition>[\s\S]*?)\n\);/,
  )?.groups?.definition;

  assert.ok(signatureTable, 'expected nda_signatures table in initial schema');
  assert.match(
    signatureTable,
    /meeting_id\s+UUID NOT NULL REFERENCES public\.meetings\(id\) ON DELETE RESTRICT/,
  );
  assert.match(
    signatureTable,
    /participant_id\s+UUID NOT NULL REFERENCES public\.meeting_participants\(id\) ON DELETE RESTRICT/,
  );
  assert.doesNotMatch(signatureTable, /ON DELETE CASCADE/);

  assert.match(
    migrationSql,
    /FOREIGN KEY \(meeting_id\) REFERENCES public\.meetings\(id\) ON DELETE RESTRICT/,
  );
  assert.match(
    migrationSql,
    /FOREIGN KEY \(participant_id\) REFERENCES public\.meeting_participants\(id\) ON DELETE RESTRICT/,
  );
});
