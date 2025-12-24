const baseConfig = require('../../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'graphql-apollo',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageDirectory: '<rootDir>/../../../coverage/graphql-apollo',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^@natify/core$': '<rootDir>/../../core/src',
  },
  setupFilesAfterEnv: ['<rootDir>/../../../jest.setup.js'],
};
