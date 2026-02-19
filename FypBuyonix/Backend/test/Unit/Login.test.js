// Login.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../components/Login";
import { MemoryRouter } from "react-router-dom";

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

describe("Login Component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockedNavigate.mockClear();
    localStorage.clear();
  });

  test("renders email and password fields", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test("shows password when eye icon clicked", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    const toggleBtn = screen.getByRole("button", { name: "" });

    expect(passwordInput.type).toBe("password");
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");
  });

  test("successful login triggers navigation & stores user", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, user: { id: 1, name: "Test" } }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByText(/Sign In/i));

    await waitFor(() => {
      expect(localStorage.getItem("isLoggedIn")).toBe("true");
      expect(mockedNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("shows error on login failure", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: false, message: "Invalid login" }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByText(/Sign In/i));

    expect(await screen.findByText(/Invalid login/i)).toBeInTheDocument();
  });

  test("Google login button triggers GoogleAuth()", () => {
    const GoogleAuthMock = jest.fn();
    jest.mock("../utils/auth", () => ({
      GoogleAuth: GoogleAuthMock,
    }));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Continue with Google/i));
    expect(GoogleAuthMock).toHaveBeenCalled();
  });
});
