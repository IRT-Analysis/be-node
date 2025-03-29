export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  setupFiles: ['dotenv/config'],
  testMatch: ['**.test.ts'],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}', // Include all TS files
    '!src/**/*.d.ts', // Exclude declaration files
    '!src/index.ts', // Exclude entry file
  ],
}
