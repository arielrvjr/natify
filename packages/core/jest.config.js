const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'core',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  coverageDirectory: '<rootDir>/../../coverage/core',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^@nativefy/core$': '<rootDir>/src',
  },
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
};

