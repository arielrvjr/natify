/**
 * Configuración de Jest para el monorepo
 * Busca y ejecuta tests en todos los paquetes que tengan su propia configuración
 */
module.exports = {
  projects: [
    '<rootDir>/packages/core',
    '<rootDir>/packages/adapters/http-axios',
    '<rootDir>/packages/adapters/storage-mmkv',
    '<rootDir>/packages/adapters/storage-async',
    '<rootDir>/packages/adapters/file-system-rn',
    '<rootDir>/packages/adapters/graphql-apollo',
    '<rootDir>/packages/adapters/geolocation-rn',
    '<rootDir>/packages/adapters/analytics-mixpanel',
    '<rootDir>/packages/adapters/feature-flag-growthbook',
    '<rootDir>/packages/adapters/error-reporting-sentry',
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    'packages/**/src/**/*.tsx',
    '!packages/**/src/**/*.d.ts',
    '!packages/**/src/**/index.ts',
    '!packages/**/__tests__/**',
    '!packages/**/node_modules/**',
  ],
};

