export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**.test.ts'],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}', // Include all TS files
    '!src/**/*.d.ts', // Exclude declaration files
    '!src/index.ts', // Exclude entry file
  ],
  coveragePathIgnorePatterns: ['server.ts'],
}
