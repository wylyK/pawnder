import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import UserContext from "../../src/context/UserContext";
import SignupForm from "../../src/components/AuthenticationForm/SignupForm";

// Mock `useRouter` from Next.js
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
  }));
  
  describe("SignupForm Component", () => {
    const mockPush = jest.fn();
  
    beforeEach(() => {
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  
      // Mock the environment variable
      process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:5000";
  
      // Mock alert
      window.alert = jest.fn();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test("renders all input fields and buttons", () => {
      render(<SignupForm />);
  
      expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("New Password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /already have an account\? login/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Select Role")).toBeInTheDocument();
    });
  
    test("updates state on user input", () => {
      render(<SignupForm />);
  
      fireEvent.change(screen.getByPlaceholderText("First Name"), {
        target: { value: "John" },
      });
      fireEvent.change(screen.getByPlaceholderText("Last Name"), {
        target: { value: "Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "john@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("New Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByText("Select Role"), {
        target: { value: "Owner" },
      });
  
      expect(screen.getByPlaceholderText("First Name")).toHaveValue("John");
      expect(screen.getByPlaceholderText("Last Name")).toHaveValue("Doe");
      expect(screen.getByPlaceholderText("Email")).toHaveValue(
        "john@example.com"
      );
      expect(screen.getByPlaceholderText("New Password")).toHaveValue(
        "password123"
      );
      expect(screen.getByPlaceholderText("Confirm Password")).toHaveValue(
        "password123"
      );
      expect(screen.getByText("Select Role")).toHaveValue("Owner");
    });
  
    test("shows alert if passwords do not match", () => {
      render(<SignupForm />);
  
      fireEvent.change(screen.getByPlaceholderText("New Password"), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
        target: { value: "password456" },
      });
  
      fireEvent.click(screen.getByRole("button", { name: /submit/i }));
  
      expect(window.alert).toHaveBeenCalledWith("Passwords do not match");
    });
  
    test("calls handleSubmit on valid form submission", async () => {
        global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
          })
        ) as jest.Mock;
      
        render(<SignupForm />);
      
        fireEvent.change(screen.getByPlaceholderText("First Name"), {
          target: { value: "John" },
        });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), {
          target: { value: "Doe" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
          target: { value: "john@example.com" },
        });
      
        // Simulate selecting a role
        fireEvent.change(screen.getByRole("combobox"), {
          target: { value: "Owner" },
        });
      
        fireEvent.change(screen.getByPlaceholderText("New Password"), {
          target: { value: "password123" },
        });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
          target: { value: "password123" },
        });
      
        fireEvent.click(screen.getByRole("button", { name: /submit/i }));
      
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledTimes(1);
      
          // Extract and parse the body from the fetch call
          const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
          const body = JSON.parse(fetchCall[1].body);
      
          expect(fetchCall[0]).toBe("http://localhost:5000/users"); // Verify URL
          expect(body).toEqual({
            FName: "John",
            LName: "Doe",
            Email: "john@example.com",
            Password: "password123",
            Role: "Owner",
          }); // Verify parsed body matches the expected object
          expect(window.alert).toHaveBeenCalledWith("Create account successful!");
          expect(mockPush).toHaveBeenCalledWith("/login");
        });
      });
      
      
  
    test("redirects to login page on button click", () => {
      render(<SignupForm />);
  
      fireEvent.click(
        screen.getByRole("button", { name: /already have an account\? login/i })
      );
  
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });