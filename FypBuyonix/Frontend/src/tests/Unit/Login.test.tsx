import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../components/Login';

// Mock the auth utility
vi.mock('../../utils/auth', () => ({
  GoogleAuth: vi.fn(),
  checkAuthStatus: vi.fn(),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────
  it('should render the login form title', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('should render the subtitle', () => {
    renderLogin();
    expect(screen.getByText('Sign in to continue shopping')).toBeInTheDocument();
  });

  it('should render email input field', () => {
    renderLogin();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('should render password input field', () => {
    renderLogin();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should render "Send Verification Code" button', () => {
    renderLogin();
    expect(screen.getByText('Send Verification Code')).toBeInTheDocument();
  });

  it('should render "Remember me" checkbox', () => {
    renderLogin();
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
  });

  it('should render "Forgot password?" link', () => {
    renderLogin();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('should render "Continue with Google" button', () => {
    renderLogin();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('should render "Sign up" link', () => {
    renderLogin();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('should render the BUYONIX logo', () => {
    renderLogin();
    expect(screen.getByAltText('BUYONIX Logo')).toBeInTheDocument();
  });

  // ─── Interaction ──────────────────────────────────────────────────────────
  it('should allow typing in email field', () => {
    renderLogin();
    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    expect(emailInput).toHaveValue('user@test.com');
  });

  it('should allow typing in password field', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } });
    expect(passwordInput).toHaveValue('mypassword');
  });

  it('should toggle password visibility', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the eye toggle button inside the password input's parent container
    const passwordContainer = passwordInput.closest('div');
    const eyeButton = passwordContainer?.querySelector('button[type="button"]');
    expect(eyeButton).not.toBeNull();

    fireEvent.click(eyeButton!);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('should toggle the remember me checkbox', () => {
    renderLogin();
    const checkbox = screen.getByLabelText('Remember me') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  // ─── API Interaction ──────────────────────────────────────────────────────
  it('should show "Sending OTP..." while submitting', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      () => new Promise(() => {}) // never resolves = stays loading
    );

    renderLogin();

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitBtn = screen.getByText('Send Verification Code');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Sending OTP...')).toBeInTheDocument();
    });
  });

  it('should show error message on failed login', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: 'Invalid credentials' }),
    } as Response);

    renderLogin();

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

    const submitBtn = screen.getByText('Send Verification Code');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show network error on fetch failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'));

    renderLogin();

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });

    const submitBtn = screen.getByText('Send Verification Code');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Network error. Please check your connection and try again.')
      ).toBeInTheDocument();
    });
  });

  it('should transition to OTP step on successful login', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    renderLogin();

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpass' } });

    const submitBtn = screen.getByText('Send Verification Code');
    fireEvent.click(submitBtn);

    // "Verify Your Email" appears in both Login heading and OTPVerification heading
    await waitFor(() => {
      expect(screen.getAllByText('Verify Your Email').length).toBeGreaterThanOrEqual(1);
    });
  });
});
