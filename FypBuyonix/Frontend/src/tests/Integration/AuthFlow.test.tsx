import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../components/Login';
import SignUp from '../../components/SignUp';

// Mock auth utilities
vi.mock('../../utils/auth', () => ({
  GoogleAuth: vi.fn(),
  checkAuthStatus: vi.fn(),
}));

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Login Flow ───────────────────────────────────────────────────────────
  describe('Login Flow', () => {
    it('should complete full login OTP flow: credentials → OTP step', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      // Step 1: Fill credentials
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      });

      // Step 2: Submit
      fireEvent.click(screen.getByText('Send Verification Code'));

      // Step 3: Verify transition to OTP step
      // "Verify Your Email" appears in both Login heading and OTPVerification, so use getAllByText
      await waitFor(() => {
        expect(screen.getAllByText('Verify Your Email').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/We've sent a 6-digit verification code to/)).toBeInTheDocument();
      });
    });

    it('should display error and stay on credentials step when login fails', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'Invalid email or password',
        }),
      } as Response);

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'bad@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrongpass' },
      });
      fireEvent.click(screen.getByText('Send Verification Code'));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        // Should still show credentials form
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });
    });

    it('should handle network failure gracefully during login', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network Error'));

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'pass' },
      });
      fireEvent.click(screen.getByText('Send Verification Code'));

      await waitFor(() => {
        expect(
          screen.getByText('Network error. Please check your connection and try again.')
        ).toBeInTheDocument();
      });
    });
  });

  // ─── SignUp Flow ──────────────────────────────────────────────────────────
  describe('SignUp Flow', () => {
    it('should complete full signup OTP flow: form → OTP step', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(
        <MemoryRouter>
          <SignUp />
        </MemoryRouter>
      );

      // Step 1: Fill all fields
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Ali Khan' },
      });
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'ali@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Phone Number'), {
        target: { value: '+923001234567' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'securepass' },
      });

      // Step 2: Submit
      fireEvent.click(screen.getByText('Send Verification Code'));

      // Step 3: Verify transition to OTP step
      // SignUp heading shows "Verify Email" and OTPVerification shows "Verify Your Email", both match
      await waitFor(() => {
        expect(screen.getAllByText(/Verify.*Email/).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/We've sent a 6-digit verification code to/)).toBeInTheDocument();
      });
    });

    it('should show error when email is already registered', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'Email already registered',
        }),
      } as Response);

      render(
        <MemoryRouter>
          <SignUp />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Ali' },
      });
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Phone Number'), {
        target: { value: '123' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'pass' },
      });

      fireEvent.click(screen.getByText('Send Verification Code'));

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
        // Should still show signup form
        expect(screen.getByText('Create Account')).toBeInTheDocument();
      });
    });

    it('should handle network failure during signup', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Timeout'));

      render(
        <MemoryRouter>
          <SignUp />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'X' } });
      fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'x@x.com' } });
      fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'p' } });

      fireEvent.click(screen.getByText('Send Verification Code'));

      await waitFor(() => {
        expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
      });
    });
  });
});
