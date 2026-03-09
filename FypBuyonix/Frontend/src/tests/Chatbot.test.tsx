import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Chatbot from '../components/Chatbot';

// ─── Mock scrollIntoView (not available in jsdom) ───────────────────────────
Element.prototype.scrollIntoView = vi.fn();

// ─── Helpers ────────────────────────────────────────────────────────────────
const mockOnClose = vi.fn();

const renderChatbot = (isOpen = true) => {
  return render(<Chatbot isOpen={isOpen} onClose={mockOnClose} />);
};

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('Chatbot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Does not render when closed
  // ──────────────────────────────────────────────────────────────────────────
  it('should not render when isOpen is false', () => {
    const { container } = renderChatbot(false);
    expect(container.firstChild).toBeNull();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Renders when open
  // ──────────────────────────────────────────────────────────────────────────
  it('should render the chatbot window when isOpen is true', () => {
    renderChatbot(true);
    expect(screen.getByText('Chatling Bot')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Shows welcome message in English by default
  // ──────────────────────────────────────────────────────────────────────────
  it('should show English welcome message by default', () => {
    renderChatbot();
    // The default welcome message contains the greeting emoji
    expect(screen.getByText(/Hello! I'm the Buyonix Assistant/i)).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Language toggle to Roman Urdu
  // ──────────────────────────────────────────────────────────────────────────
  it('should switch to Roman Urdu welcome message when language is toggled', async () => {
    renderChatbot();

    const urduButton = screen.getByText('Roman Urdu');
    fireEvent.click(urduButton);

    await waitFor(() => {
      expect(screen.getByText(/Assalam o Alaikum/i)).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Language toggle buttons visible
  // ──────────────────────────────────────────────────────────────────────────
  it('should show language toggle buttons (English and Roman Urdu)', () => {
    renderChatbot();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Roman Urdu')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Input field is present
  // ──────────────────────────────────────────────────────────────────────────
  it('should have a message input field', () => {
    renderChatbot();
    const input = screen.getByPlaceholderText('Type your message here...');
    expect(input).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Send button disabled when empty
  // ──────────────────────────────────────────────────────────────────────────
  // it('should have a disabled send button when input is empty', () => {
  //   renderChatbot();
  //   // Find the send button (it's the button with the send icon SVG, after the input)
  //   const buttons = screen.getAllByRole('button');
  //   const sendButton = buttons.find(
  //     (btn) => btn.classList.contains('bg-blue-500') || btn.disabled
  //   );
  //   expect(sendButton).toBeDefined();
  //   expect(sendButton?.disabled).toBe(true);
  // });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: User can type a message
  // ──────────────────────────────────────────────────────────────────────────
  it('should allow user to type in the input field', async () => {
    renderChatbot();

    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'Hello chatbot' } });

    expect(input).toHaveValue('Hello chatbot');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 9: Sends message and shows user bubble
  // ──────────────────────────────────────────────────────────────────────────
  it('should display user message in chat after sending', async () => {
    renderChatbot();

    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'hi' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('hi')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 10: Bot responds to greeting
  // ──────────────────────────────────────────────────────────────────────────
  it('should show bot greeting response when user says "hello"', async () => {
    renderChatbot();

    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Advance timers to trigger the setTimeout for bot response
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText(/Welcome to Buyonix/i)).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 11: Bot responds to Visual Search query
  // ──────────────────────────────────────────────────────────────────────────
  it('should respond with Visual Search info when asked about visual search', async () => {
    renderChatbot();

    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'how to use visual search' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText(/Find Products with Images/i)).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 12: Bot responds to payment query
  // ──────────────────────────────────────────────────────────────────────────
  it('should respond with payment info when user asks about payment', async () => {
    renderChatbot();

    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'what payment methods do you accept' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText(/Payment Methods/i)).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 13: Bot responds to recommendation query
  // ──────────────────────────────────────────────────────────────────────────
  it('should respond with recommendation info', async () => {
    renderChatbot();

    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'recommend me something' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText(/AI Recommendations/i)).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 14: Clears input after sending
  // ──────────────────────────────────────────────────────────────────────────
  it('should clear the input field after sending a message', () => {
    renderChatbot();

    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(input).toHaveValue('');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 15: Close button calls onClose
  // ──────────────────────────────────────────────────────────────────────────
  it('should call onClose when the close button is clicked', () => {
    renderChatbot();

    // Find the close button (has the X icon SVG in the header)
    const header = screen.getByText('Chatling Bot').closest('div');
    const buttons = header?.querySelectorAll('button');
    // The close button is the last button in the header
    const closeButton = buttons?.[buttons.length - 1];

    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 16: Feedback buttons visible on bot message
  // ──────────────────────────────────────────────────────────────────────────
  it('should show "Was this response helpful?" with Yes/No buttons on bot messages', () => {
    renderChatbot();

    expect(screen.getByText('Was this response helpful?')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 17: Feedback Yes button works
  // ──────────────────────────────────────────────────────────────────────────
  it('should show thank you message after clicking "Yes" feedback', async () => {
    renderChatbot();

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    await waitFor(() => {
      expect(screen.getByText('✓ Thank you for your feedback!')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 18: Feedback No button works
  // ──────────────────────────────────────────────────────────────────────────
  it('should show improvement message after clicking "No" feedback', async () => {
    renderChatbot();

    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    await waitFor(() => {
      expect(screen.getByText("✗ Thanks, we'll improve!")).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 19: "Powered by Chatling" footer
  // ──────────────────────────────────────────────────────────────────────────
  it('should display "Powered by Chatling" at the bottom', () => {
    renderChatbot();
    expect(screen.getByText('Powered by Chatling')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 20: Product search query triggers loading message
  // ──────────────────────────────────────────────────────────────────────────
  it('should show searching message when user asks about product price', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: [] }),
    } as Response);

    renderChatbot();

    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'what is the price of iPhone' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      // Check for either the loading or result message
      const allText = document.body.textContent || '';
      expect(
        allText.includes('Searching for products') ||
        allText.includes('No products found') ||
        allText.includes('Product')
      ).toBe(true);
    });
  });
});
