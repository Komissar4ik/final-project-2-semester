/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  roots: ['<rootDir>/src', '<rootDir>/backend/src'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'backend/src/posts/**/*.service.ts',
    'backend/src/comments/**/*.service.ts',
    'backend/src/auth/**/*.service.ts',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/types/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};
