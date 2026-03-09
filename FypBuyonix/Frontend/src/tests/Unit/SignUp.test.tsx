import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SignUp from '../../components/SignUp';

// Mock the OTPVerification component to simplify test
vi.mock('../../utils/auth', () => ({
  GoogleAuth: vi.fn(),
  checkAuthStatus: vi.fn(),
}));

const renderSignUp = () =>
  render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );

describe('SignUp Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────
  it('should render "Create Account" title', () => {
    renderSignUp();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('should render "Join Buyonix today" subtitle', () => {
    renderSignUp();
    expect(screen.getByText('Join Buyonix today')).toBeInTheDocument();
  });

  it('should render Full Name input', () => {
    renderSignUp();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
  });

  it('should render Email Address input', () => {
    renderSignUp();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('should render Phone Number input', () => {
    renderSignUp();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  it('should render Password input', () => {
    renderSignUp();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should render "Send Verification Code" button', () => {
    renderSignUp();
    expect(screen.getByText('Send Verification Code')).toBeInTheDocument();
  });

  it('should render "Continue with Google" button', () => {
    renderSignUp();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('should render Terms of Service link', () => {
    renderSignUp();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('should render Privacy Policy link', () => {
    renderSignUp();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('should render "Sign In" link for existing users', () => {
    renderSignUp();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should render the BUYONIX logo', () => {
    renderSignUp();
    expect(screen.getByAltText('BUYONIX Logo')).toBeInTheDocument();
  });

  // ─── Interaction ──────────────────────────────────────────────────────────
  it('should allow typing in all form fields', () => {
    renderSignUp();

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const phoneInput = screen.getByLabelText('Phone Number');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.change(phoneInput, { target: { value: '+923001234567' } });
    fireEvent.change(passwordInput, { target: { value: 'secure123' } });

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@test.com');
    expect(phoneInput).toHaveValue('+923001234567');
    expect(passwordInput).toHaveValue('secure123');
  });

  it('should toggle password visibility', () => {
    renderSignUp();
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the eye toggle button: it's the sibling button inside the same parent div as the password input
    const passwordContainer = passwordInput.closest('div');
    const eyeButton = passwordContainer?.querySelector('button[type="button"]');
    expect(eyeButton).not.toBeNull();

    fireEvent.click(eyeButton!);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  // ─── API Interaction ──────────────────────────────────────────────────────
  it('should show "Sending OTP..." while submitting', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    renderSignUp();

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'j@t.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass' } });

    fireEvent.click(screen.getByText('Send Verification Code'));

    await waitFor(() => {
      expect(screen.getByText('Sending OTP...')).toBeInTheDocument();
    });
  });

  it('should show error on failed OTP send', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: 'Email already registered' }),
    } as Response);

    renderSignUp();

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'j@t.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass' } });

    fireEvent.click(screen.getByText('Send Verification Code'));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('should show network error on fetch failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Connection refused'));

    renderSignUp();

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'j@t.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass' } });

    fireEvent.click(screen.getByText('Send Verification Code'));

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });
  });

  it('should transition to OTP step on successful submit', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    renderSignUp();

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'j@t.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass' } });

    fireEvent.click(screen.getByText('Send Verification Code'));

    await waitFor(() => {
      expect(screen.getByText('Verify Email')).toBeInTheDocument();
    });
  });
});
