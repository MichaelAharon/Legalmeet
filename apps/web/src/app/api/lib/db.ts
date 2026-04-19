import { getSupabaseServer } from '@/lib/supabase/server';

export function useMock() {
  return process.env.USE_MOCK_SERVICES === 'true' || process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}

export function getDb() {
  return getSupabaseServer();
}

// Helper: transform snake_case DB row to camelCase for API response
export function toCamel<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

// Helper: transform camelCase input to snake_case for DB insert/update
export function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}
