export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/controllers/**/*.ts',
    'src/service/**/*.ts',
    'src/repositories/**/*.ts',
    'src/models/**/*.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/integration/'],
  moduleNameMapper: {
    '.*/redis$': '<rootDir>/__tests__/__mocks__/redis.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
};
