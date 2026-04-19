import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);
process.argv = ['node', 'next', 'dev', '--port', '3000'];

const nextBin = join(__dirname, 'node_modules', '.bin', 'next');
import('next/dist/bin/next');
