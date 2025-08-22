// Configuração global para os testes
import { jest } from '@jest/globals';

// Configurar timeout global
jest.setTimeout(10000);

// Mock para console para testes mais limpos
const originalConsole = console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});
