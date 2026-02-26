import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.alert
window.alert = vi.fn();

// Mock window.confirm
window.confirm = vi.fn(() => true);

// Mock URL.createObjectURL
window.URL.createObjectURL = vi.fn(() => 'mock-url');
window.URL.revokeObjectURL = vi.fn();

// Mock fetch
global.fetch = vi.fn();

// Mock performance.now
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: vi.fn(() => Date.now()),
  };
}

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

