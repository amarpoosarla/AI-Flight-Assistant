import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    // Exclude files requiring external services or Next.js runtime
    // These are covered by integration/E2E tests, not unit tests
    '!lib/amadeus.ts',
    '!lib/llm.ts',
    '!lib/planner-agent.ts',
    '!lib/logger.ts',
    '!lib/supabase/**',
    '!app/**',           // Next.js pages/routes — E2E territory
    '!middleware.ts',
    '!hooks/**',         // All hooks depend on Supabase client
    '!components/auth/**', // Auth components depend on Supabase client
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

export default createJestConfig(config);
