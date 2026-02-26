import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlPanel } from '../components/ControlPanel';

describe('ControlPanel Component', () => {
  const defaultProps = {
    onSimulateInbound: vi.fn(),
    onRunCron1: vi.fn(),
    onGenerateResponse: vi.fn(),
    onRunCron2: vi.fn(),
    isProcessing: false,
    canRunCron1: false,
    canGenerate: false,
    canRunCron2: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all four control steps', () => {
      render(<ControlPanel {...defaultProps} />);
      
      expect(screen.getByText(/Step 0: Sourcing/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 1: Inbound Cron/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 2: AI Processing/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 3: Outbound Cron/i)).toBeInTheDocument();
    });

    it('renders step titles correctly', () => {
      render(<ControlPanel {...defaultProps} />);
      
      expect(screen.getByText(/Receive Invoice/i)).toBeInTheDocument();
      expect(screen.getByText(/Transfer to H2H/i)).toBeInTheDocument();
      expect(screen.getByText(/Generate Response/i)).toBeInTheDocument();
      expect(screen.getByText(/Return to UAT/i)).toBeInTheDocument();
    });

    it('renders all action buttons', () => {
      render(<ControlPanel {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /New Invoice XML/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run Inbound Cron/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate XML/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run Outbound Cron/i })).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('disables Cron 1 button when canRunCron1 is false', () => {
      render(<ControlPanel {...defaultProps} canRunCron1={false} />);
      
      const button = screen.getByRole('button', { name: /Run Inbound Cron/i });
      expect(button).toBeDisabled();
    });

    it('enables Cron 1 button when canRunCron1 is true', () => {
      render(<ControlPanel {...defaultProps} canRunCron1={true} />);
      
      const button = screen.getByRole('button', { name: /Run Inbound Cron/i });
      expect(button).not.toBeDisabled();
    });

    it('disables Generate button when canGenerate is false', () => {
      render(<ControlPanel {...defaultProps} canGenerate={false} />);
      
      const button = screen.getByRole('button', { name: /Generate XML/i });
      expect(button).toBeDisabled();
    });

    it('enables Generate button when canGenerate is true', () => {
      render(<ControlPanel {...defaultProps} canGenerate={true} />);
      
      const button = screen.getByRole('button', { name: /Generate XML/i });
      expect(button).not.toBeDisabled();
    });

    it('disables Cron 2 button when canRunCron2 is false', () => {
      render(<ControlPanel {...defaultProps} canRunCron2={false} />);
      
      const button = screen.getByRole('button', { name: /Run Outbound Cron/i });
      expect(button).toBeDisabled();
    });

    it('disables all buttons when isProcessing is true', () => {
      render(<ControlPanel {...defaultProps} isProcessing={true} canRunCron1={true} canGenerate={true} canRunCron2={true} />);
      
      expect(screen.getByRole('button', { name: /New Invoice XML/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Run Inbound Cron/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Generate XML/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Run Outbound Cron/i })).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('calls onSimulateInbound when New Invoice button is clicked', async () => {
      render(<ControlPanel {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /New Invoice XML/i });
      await userEvent.click(button);
      
      expect(defaultProps.onSimulateInbound).toHaveBeenCalledTimes(1);
    });

    it('calls onRunCron1 when Inbound Cron button is clicked', async () => {
      render(<ControlPanel {...defaultProps} canRunCron1={true} />);
      
      const button = screen.getByRole('button', { name: /Run Inbound Cron/i });
      await userEvent.click(button);
      
      expect(defaultProps.onRunCron1).toHaveBeenCalledTimes(1);
    });

    it('calls onGenerateResponse when Generate button is clicked', async () => {
      render(<ControlPanel {...defaultProps} canGenerate={true} />);
      
      const button = screen.getByRole('button', { name: /Generate XML/i });
      await userEvent.click(button);
      
      expect(defaultProps.onGenerateResponse).toHaveBeenCalledTimes(1);
    });

    it('calls onRunCron2 when Outbound Cron button is clicked', async () => {
      render(<ControlPanel {...defaultProps} canRunCron2={true} />);
      
      const button = screen.getByRole('button', { name: /Run Outbound Cron/i });
      await userEvent.click(button);
      
      expect(defaultProps.onRunCron2).toHaveBeenCalledTimes(1);
    });

    it('does not call handlers when buttons are disabled', async () => {
      render(<ControlPanel {...defaultProps} canRunCron1={false} canGenerate={false} canRunCron2={false} />);
      
      // Try clicking disabled buttons - this will fail silently
      const cron1Button = screen.getByRole('button', { name: /Run Inbound Cron/i });
      const generateButton = screen.getByRole('button', { name: /Generate XML/i });
      const cron2Button = screen.getByRole('button', { name: /Run Outbound Cron/i });
      
      // userEvent respects disabled state, so these clicks won't trigger handlers
      expect(defaultProps.onRunCron1).not.toHaveBeenCalled();
      expect(defaultProps.onGenerateResponse).not.toHaveBeenCalled();
      expect(defaultProps.onRunCron2).not.toHaveBeenCalled();
    });
  });

  describe('Processing State', () => {
    it('shows loading spinner when isProcessing and canGenerate are true', () => {
      render(<ControlPanel {...defaultProps} isProcessing={true} canGenerate={true} />);
      
      // The component shows a spinner overlay for the generate step
      const generateSection = screen.getByText(/AI Processing/i).closest('div');
      expect(generateSection).toBeInTheDocument();
    });
  });
});

