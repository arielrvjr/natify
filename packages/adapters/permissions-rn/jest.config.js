const baseConfig = require('../../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'permissions-rn',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageDirectory: '<rootDir>/../../../coverage/permissions-rn',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^@natify/core$': '<rootDir>/../../core/src',
    '^@natify/core/(.*)$': '<rootDir>/../../core/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/../../../jest.setup.js'],
};

