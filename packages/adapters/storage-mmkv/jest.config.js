const baseConfig = require('../../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'storage-mmkv',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageDirectory: '<rootDir>/../../../coverage/storage-mmkv',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^@natify/core$': '<rootDir>/../../core/src',
  },
  setupFilesAfterEnv: ['<rootDir>/../../../jest.setup.js'],
};
