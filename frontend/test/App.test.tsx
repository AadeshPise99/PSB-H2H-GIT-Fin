import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  describe('Rendering', () => {
    it('renders the main application', () => {
      render(<App />);
      expect(screen.getByText(/Step 1: Inbound Cron/i)).toBeInTheDocument();
    });

    it('renders all navigation buttons', () => {
      render(<App />);
      expect(screen.getByText(/Step 1: Inbound Cron/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 2: Create Response/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 3: H2H FTP/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 4: Outbound Cron/i)).toBeInTheDocument();
    });

    it('renders simulation mode toggle', () => {
      render(<App />);
      expect(screen.getByText(/Simulation Mode/i)).toBeInTheDocument();
    });

    it('initially shows cron1 screen', () => {
      render(<App />);
      expect(screen.getByText(/PSB .* H2H Transfer/i)).toBeInTheDocument();
      // Use getAllByRole to get button specifically
      const executeButtons = screen.getAllByRole('button', { name: /Execute Cron/i });
      expect(executeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('navigates to XML Generator screen when clicking Step 2', async () => {
      render(<App />);
      const step2Button = screen.getByText(/Step 2: Create Response/i);
      await userEvent.click(step2Button);
      expect(screen.getByText(/Response Parameters/i)).toBeInTheDocument();
    });

    it('navigates to FTP screen when clicking Step 3', async () => {
      render(<App />);
      const step3Button = screen.getByText(/Step 3: H2H FTP/i);
      await userEvent.click(step3Button);
      expect(screen.getByText(/Protocol/i)).toBeInTheDocument();
      expect(screen.getByText(/Host/i)).toBeInTheDocument();
    });

    it('navigates to Cron 2 screen when clicking Step 4', async () => {
      render(<App />);
      const step4Button = screen.getByText(/Step 4: Outbound Cron/i);
      await userEvent.click(step4Button);
      expect(screen.getByText(/H2H .* PSB Transfer/i)).toBeInTheDocument();
    });
  });

  describe('Simulation Mode Toggle', () => {
    it('toggles simulation mode when clicked', async () => {
      render(<App />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('XML Generator Screen', () => {
    it('renders form fields correctly', async () => {
      render(<App />);
      await userEvent.click(screen.getByText(/Step 2: Create Response/i));

      // Use getByText for labels since they may not have htmlFor
      expect(screen.getByText(/Header Datetime/i)).toBeInTheDocument();
      expect(screen.getByText(/^Action$/i)).toBeInTheDocument();
      expect(screen.getByText(/Amount/i)).toBeInTheDocument();
    });

    it('generates XML when Generate button is clicked', async () => {
      render(<App />);
      await userEvent.click(screen.getByText(/Step 2: Create Response/i));

      const generateButton = screen.getByText(/Generate XML from Data/i);
      await userEvent.click(generateButton);

      const previewArea = screen.getByPlaceholderText(/Fill the form/i);
      // Check that value contains xml content
      expect((previewArea as HTMLTextAreaElement).value).toContain('<?xml');
    });
  });

  describe('Cron Execution', () => {
    it('shows loading state when executing cron', async () => {
      render(<App />);

      // Enable simulation mode for predictable behavior
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);

      const executeButton = screen.getByRole('button', { name: /Execute Cron/i });
      fireEvent.click(executeButton);

      await waitFor(() => {
        expect(screen.getByText(/Waiting for server response/i)).toBeInTheDocument();
      });
    });
  });

  describe('Local Storage Integration', () => {
    it('loads files from localStorage on mount', () => {
      const mockFiles = JSON.stringify([
        { id: '1', name: 'test.xml', content: '<xml/>', size: '10 B', date: '12:00:00', type: 'file' }
      ]);
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(mockFiles);

      render(<App />);
      expect(window.localStorage.getItem).toHaveBeenCalledWith('localFiles');
    });

    it('saves files to localStorage when navigating to FTP', async () => {
      render(<App />);

      // Navigate to FTP screen to trigger localStorage save
      await userEvent.click(screen.getByText(/Step 3: H2H FTP/i));

      // LocalStorage should be set on mount with initial empty array
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });
  });
});

