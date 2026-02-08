import baseConfig from './jest.config';

export default {
  ...baseConfig,
  testMatch: ['**/__tests__/integration/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 30000,
};
