import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import UserContext from "../../src/context/UserContext";
import LoginForm from "../../src/components/AuthenticationForm/LoginForm";

// Mock `useRouter` from Next.js
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LoginForm Component", () => {
  const mockPush = jest.fn();
  const mockSetUser = jest.fn();
  const mockUser = null; // Mock initial user state (null)

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the form with email and password inputs", () => {
    render(
      <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
        <LoginForm />
      </UserContext.Provider>
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("updates email and password state on user input", () => {
    render(
      <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
        <LoginForm />
      </UserContext.Provider>
    );

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("calls handleSubmit on form submission", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { id: 1, name: "John Doe" }, // Ensure "user" is included in the mock response
          }),
      })
    ) as jest.Mock;
  
    render(
      <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
        <LoginForm />
      </UserContext.Provider>
    );
  
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /submit/i });
  
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Email: "test@example.com", Password: "password123" }),
        }
      );
      expect(mockSetUser).toHaveBeenCalledWith({ id: 1, name: "John Doe" }); // Verify setUser is called with correct user data
      expect(mockPush).toHaveBeenCalledWith("/"); // Verify navigation occurs
    });
  });

  test("redirects to signup page on button click", () => {
    render(
      <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
        <LoginForm />
      </UserContext.Provider>
    );

    const signupButton = screen.getByRole("button", { name: /create an account/i });
    fireEvent.click(signupButton);

    expect(mockPush).toHaveBeenCalledWith("/signup");
  });
});
