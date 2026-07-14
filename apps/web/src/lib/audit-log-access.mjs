export function isMockAuditLogEnabled(env = process.env) {
  return env.NODE_ENV !== 'production'
    && (env.USE_MOCK_SERVICES === 'true' || env.NEXT_PUBLIC_USE_MOCK === 'true');
}
