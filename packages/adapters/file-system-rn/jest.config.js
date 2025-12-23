const baseConfig = require('../../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'file-system-rn',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageDirectory: '<rootDir>/../../../coverage/file-system-rn',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^@nativefy/core$': '<rootDir>/../../core/src',
  },
  setupFilesAfterEnv: ['<rootDir>/../../../jest.setup.js'],
};
