type MockModeEnv = {
  NODE_ENV?: string;
  USE_MOCK_SERVICES?: string;
};

export function shouldUseMockServices(env: MockModeEnv = process.env) {
  return env.NODE_ENV !== 'production' && env.USE_MOCK_SERVICES === 'true';
}
