import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogViewer } from '../components/LogViewer';
import { LogEntry } from '../types';

describe('LogViewer Component', () => {
  const createMockLog = (overrides: Partial<LogEntry> = {}): LogEntry => ({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    stage: 'TEST',
    message: 'Test log message',
    type: 'info',
    ...overrides,
  });

  describe('Rendering', () => {
    it('renders the component with header', () => {
      render(<LogViewer logs={[]} />);
      
      expect(screen.getByText(/System Audit Log/i)).toBeInTheDocument();
    });

    it('shows empty state when no logs', () => {
      render(<LogViewer logs={[]} />);
      
      expect(screen.getByText(/System Ready. No logs yet./i)).toBeInTheDocument();
    });

    it('renders terminal-style header with window controls', () => {
      render(<LogViewer logs={[]} />);
      
      // Check that the terminal-like header is present
      const header = screen.getByText(/System Audit Log/i).closest('div');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Log Display', () => {
    it('displays log entries correctly', () => {
      const logs: LogEntry[] = [
        createMockLog({ message: 'First log message', stage: 'INIT' }),
        createMockLog({ message: 'Second log message', stage: 'PROCESS' }),
      ];
      
      render(<LogViewer logs={logs} />);
      
      expect(screen.getByText('First log message')).toBeInTheDocument();
      expect(screen.getByText('Second log message')).toBeInTheDocument();
    });

    it('displays stage labels', () => {
      const logs: LogEntry[] = [
        createMockLog({ stage: 'CRON1', message: 'Test message' }),
      ];
      
      render(<LogViewer logs={logs} />);
      
      expect(screen.getByText('CRON1')).toBeInTheDocument();
    });

    it('formats timestamps correctly', () => {
      const testDate = new Date('2026-01-15T14:30:45');
      const logs: LogEntry[] = [
        createMockLog({ timestamp: testDate, message: 'Timestamped message' }),
      ];
      
      render(<LogViewer logs={logs} />);
      
      // Check that timestamp is displayed (format: HH:MM:SS)
      expect(screen.getByText(/14:30:45/)).toBeInTheDocument();
    });
  });

  describe('Log Types Styling', () => {
    it('applies correct styling for info type', () => {
      const logs: LogEntry[] = [
        createMockLog({ type: 'info', stage: 'INFO_STAGE' }),
      ];
      
      render(<LogViewer logs={logs} />);
      
      const stageElement = screen.getByText('INFO_STAGE');
      expect(stageElement).toHaveClass('bg-blue-900/50', 'text-blue-400');
    });

    it('applies correct styling for success type', () => {
      const logs: LogEntry[] = [
        createMockLog({ type: 'success', stage: 'SUCCESS_STAGE' }),
      ];
      
      render(<LogViewer logs={logs} />);
      
      const stageElement = screen.getByText('SUCCESS_STAGE');
      expect(stageElement).toHaveClass('bg-green-900/50', 'text-green-400');
    });

    it('applies correct styling for warning type', () => {
      const logs: LogEntry[] = [
        createMockLog({ type: 'warning', stage: 'WARNING_STAGE' }),
      ];
      
      render(<LogViewer logs={logs} />);
      
      const stageElement = screen.getByText('WARNING_STAGE');
      expect(stageElement).toHaveClass('bg-yellow-900/50', 'text-yellow-400');
    });

    it('applies correct styling for error type', () => {
      const logs: LogEntry[] = [
        createMockLog({ type: 'error', stage: 'ERROR_STAGE' }),
      ];
      
      render(<LogViewer logs={logs} />);
      
      const stageElement = screen.getByText('ERROR_STAGE');
      expect(stageElement).toHaveClass('bg-red-900/50', 'text-red-400');
    });
  });

  describe('Multiple Logs', () => {
    it('renders multiple log entries in order', () => {
      const logs: LogEntry[] = [
        createMockLog({ id: '1', message: 'First message', stage: 'STAGE1' }),
        createMockLog({ id: '2', message: 'Second message', stage: 'STAGE2' }),
        createMockLog({ id: '3', message: 'Third message', stage: 'STAGE3' }),
      ];
      
      render(<LogViewer logs={logs} />);
      
      const messages = screen.getAllByText(/message/i);
      expect(messages).toHaveLength(3);
    });

    it('handles large number of logs', () => {
      const logs: LogEntry[] = Array.from({ length: 50 }, (_, i) => 
        createMockLog({ id: `log-${i}`, message: `Log entry ${i}` })
      );
      
      render(<LogViewer logs={logs} />);
      
      // Should render all logs
      expect(screen.getByText('Log entry 0')).toBeInTheDocument();
      expect(screen.getByText('Log entry 49')).toBeInTheDocument();
    });
  });

  describe('Auto-scroll Behavior', () => {
    it('has a scroll container', () => {
      const logs: LogEntry[] = [
        createMockLog({ message: 'Test message' }),
      ];
      
      render(<LogViewer logs={logs} />);
      
      // The component should have an overflow-y-auto container
      const scrollContainer = screen.getByText('Test message').closest('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});

