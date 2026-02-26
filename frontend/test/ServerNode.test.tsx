import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServerNode } from '../components/ServerNode';
import { InvoiceFile } from '../types';

describe('ServerNode Component', () => {
  const createMockFile = (overrides: Partial<InvoiceFile> = {}): InvoiceFile => ({
    id: Math.random().toString(36).substr(2, 9),
    filename: 'test-file.xml',
    timestamp: new Date(),
    location: 'psb-source',
    content: '<xml>test</xml>',
    ...overrides,
  });

  const defaultProps = {
    title: 'Test Server',
    location: 'psb-source' as const,
    files: [],
    colorClass: 'text-blue-600',
    onSelectFile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the server node with title', () => {
      render(<ServerNode {...defaultProps} />);
      
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    it('renders custom icon when provided', () => {
      const CustomIcon = () => <span data-testid="custom-icon">Icon</span>;
      render(<ServerNode {...defaultProps} icon={<CustomIcon />} />);
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('shows file count badge', () => {
      const files = [
        createMockFile({ id: '1', location: 'psb-source' }),
        createMockFile({ id: '2', location: 'psb-source' }),
      ];
      
      render(<ServerNode {...defaultProps} files={files} />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('shows zero count when no files match location', () => {
      const files = [
        createMockFile({ location: 'h2h-input' }),
      ];
      
      render(<ServerNode {...defaultProps} files={files} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty folder message when no files', () => {
      render(<ServerNode {...defaultProps} files={[]} />);
      
      expect(screen.getByText(/Empty Folder/i)).toBeInTheDocument();
    });

    it('shows empty folder when files exist but none match location', () => {
      const files = [
        createMockFile({ location: 'h2h-output' }),
      ];
      
      render(<ServerNode {...defaultProps} location="psb-source" files={files} />);
      
      expect(screen.getByText(/Empty Folder/i)).toBeInTheDocument();
    });
  });

  describe('File Display', () => {
    it('displays files that match the location', () => {
      const files = [
        createMockFile({ filename: 'invoice-001.xml', location: 'psb-source' }),
        createMockFile({ filename: 'invoice-002.xml', location: 'psb-source' }),
      ];
      
      render(<ServerNode {...defaultProps} files={files} />);
      
      expect(screen.getByText('invoice-001.xml')).toBeInTheDocument();
      expect(screen.getByText('invoice-002.xml')).toBeInTheDocument();
    });

    it('filters out files from different locations', () => {
      const files = [
        createMockFile({ filename: 'local.xml', location: 'psb-source' }),
        createMockFile({ filename: 'remote.xml', location: 'h2h-input' }),
      ];
      
      render(<ServerNode {...defaultProps} location="psb-source" files={files} />);
      
      expect(screen.getByText('local.xml')).toBeInTheDocument();
      expect(screen.queryByText('remote.xml')).not.toBeInTheDocument();
    });

    it('displays file timestamp', () => {
      const testDate = new Date('2026-01-15T10:30:00');
      const files = [
        createMockFile({ timestamp: testDate, location: 'psb-source' }),
      ];
      
      render(<ServerNode {...defaultProps} files={files} />);
      
      // Timestamp should be displayed
      expect(screen.getByText(/10:30/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onSelectFile when a file is clicked', async () => {
      const mockFile = createMockFile({ filename: 'clickable.xml', location: 'psb-source' });
      const onSelectFile = vi.fn();
      
      render(<ServerNode {...defaultProps} files={[mockFile]} onSelectFile={onSelectFile} />);
      
      const fileElement = screen.getByText('clickable.xml');
      await userEvent.click(fileElement);
      
      expect(onSelectFile).toHaveBeenCalledTimes(1);
      expect(onSelectFile).toHaveBeenCalledWith(mockFile);
    });

    it('allows selecting different files', async () => {
      const file1 = createMockFile({ id: '1', filename: 'file1.xml', location: 'psb-source' });
      const file2 = createMockFile({ id: '2', filename: 'file2.xml', location: 'psb-source' });
      const onSelectFile = vi.fn();
      
      render(<ServerNode {...defaultProps} files={[file1, file2]} onSelectFile={onSelectFile} />);
      
      await userEvent.click(screen.getByText('file1.xml'));
      expect(onSelectFile).toHaveBeenLastCalledWith(file1);
      
      await userEvent.click(screen.getByText('file2.xml'));
      expect(onSelectFile).toHaveBeenLastCalledWith(file2);
    });
  });

  describe('Styling', () => {
    it('applies the provided colorClass', () => {
      render(<ServerNode {...defaultProps} colorClass="text-green-600" />);
      
      const header = screen.getByText('Test Server').closest('div');
      expect(header).toHaveClass('text-green-600');
    });

    it('applies highlight styling when files are present', () => {
      const files = [
        createMockFile({ location: 'psb-source' }),
      ];
      
      render(<ServerNode {...defaultProps} files={files} />);
      
      // Container should have highlight border when files exist
      const container = screen.getByText('Test Server').closest('.border');
      expect(container).toHaveClass('border-blue-300');
    });

    it('applies default styling when no files', () => {
      render(<ServerNode {...defaultProps} files={[]} />);
      
      const container = screen.getByText('Test Server').closest('.border');
      expect(container).toHaveClass('border-gray-200');
    });
  });

  describe('Different Server Locations', () => {
    it('renders correctly for h2h-input location', () => {
      const files = [
        createMockFile({ filename: 'h2h-file.xml', location: 'h2h-input' }),
      ];
      
      render(<ServerNode {...defaultProps} location="h2h-input" files={files} />);
      
      expect(screen.getByText('h2h-file.xml')).toBeInTheDocument();
    });

    it('renders correctly for h2h-output location', () => {
      const files = [
        createMockFile({ filename: 'output.xml', location: 'h2h-output' }),
      ];
      
      render(<ServerNode {...defaultProps} location="h2h-output" files={files} />);
      
      expect(screen.getByText('output.xml')).toBeInTheDocument();
    });

    it('renders correctly for psb-dest location', () => {
      const files = [
        createMockFile({ filename: 'dest.xml', location: 'psb-dest' }),
      ];
      
      render(<ServerNode {...defaultProps} location="psb-dest" files={files} />);
      
      expect(screen.getByText('dest.xml')).toBeInTheDocument();
    });
  });
});

