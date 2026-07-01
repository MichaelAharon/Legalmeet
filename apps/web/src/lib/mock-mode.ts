export function isMockModeEnabled() {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return process.env.USE_MOCK_SERVICES === 'true' || process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}
