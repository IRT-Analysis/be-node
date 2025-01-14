export const testEnvironment = 'node'
export const transform = {
  '^.+\\.tsx?$': 'ts-jest',
}
export const moduleNameMapper = {
  '@/(.*)': '<rootDir>/src/$1',
}
export const setupFiles = ['dotenv/config']
export const testMatch = ['**/tests/**/*.test.ts']
export const collectCoverage = true
export const coverageDirectory = 'coverage'
export const collectCoverageFrom = [
  'src/**/*.{ts,tsx}', // Include all TypeScript files in src
  '!src/**/*.d.ts', // Exclude declaration files
  '!src/index.ts', // Exclude src/index.ts specifically
]
