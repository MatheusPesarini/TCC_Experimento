import type { Config } from 'jest';

const common: Partial<Config> = {
  testEnvironment: 'node',
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }] },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testMatch: ['**/tasks/task_1_crud/tests/**/*.test.ts']
};

const config: Config = {
  projects: [
    {
      displayName: 'gpt5',
      rootDir: '.',
      setupFilesAfterEnv: [],
      testEnvironment: 'node',
      testMatch: ['**/tasks/task_1_crud/tests/**/*.test.ts'],
      transform: common.transform as any,
      moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/generated_code/gpt5/src/$1'
      },
      globals: {}
    },
    {
      displayName: 'claude4',
      rootDir: '.',
      setupFilesAfterEnv: [],
      testEnvironment: 'node',
      testMatch: ['**/tasks/task_1_crud/tests/**/*.test.ts'],
      transform: common.transform as any,
      moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/generated_code/claude4/src/$1'
      },
      globals: {}
    }
  ],
  collectCoverageFrom: ['generated_code/**/src/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary']
};

export default config;
