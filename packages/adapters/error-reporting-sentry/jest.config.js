const baseConfig = require('../../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'error-reporting-sentry',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageDirectory: '<rootDir>/../../../coverage/error-reporting-sentry',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^@natify/core$': '<rootDir>/../../core/src',
  },
  setupFilesAfterEnv: ['<rootDir>/../../../jest.setup.js'],
};
