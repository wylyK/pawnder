import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserProfile from "../src/components/UserProfile/UserProfile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // For React Query
import { useAuth } from "@/context/UserContext"; // Import context for mock
import { useRouter } from "next/navigation"; // Mock useRouter hook
import { useUser } from "@/hooks/use-user"; // Import useUser hook
import { Role } from "../src/share/type";

// Mocking the useAuth hook to return a mock user
jest.mock("@/context/UserContext", () => ({
  useAuth: jest.fn(),
}));

// Mocking useRouter to avoid router-related issues
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mocking the useUser hook
jest.mock("@/hooks/use-user", () => ({
  useUser: jest.fn(),
}));

describe("UserProfile Component", () => {
  const mockUser = {
    Id: "1",
    FName: "John",
    LName: "Doe",
    Email: "john.doe@example.com",
    Role: Role.Owner,
    Location: "New York",
  };

  beforeEach(() => {
    // Mock useAuth to return the mock user
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    // Mock the useRouter return value
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    // Mock the useUser hook
    (useUser as jest.Mock).mockReturnValue({
      updateUser: jest.fn(),
    });
  });

  test("renders user profile fields and edit button", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <UserProfile />
      </QueryClientProvider>
    );

    // Check that fields are rendered with user data
    expect(screen.getByText("Hi, John Doe")).toBeInTheDocument();

    // Use getByDisplayValue to find the input elements by their current value
    expect(screen.getByDisplayValue(mockUser.FName)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.LName)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.Email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.Location)).toBeInTheDocument();

    // Check if the edit button is present
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  test("toggles edit mode and enables fields", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <UserProfile />
      </QueryClientProvider>
    );

    const editButton = screen.getByText("Edit");

    // Check if fields are initially disabled
    expect(screen.getByDisplayValue(mockUser.FName)).toBeDisabled();
    expect(screen.getByDisplayValue(mockUser.LName)).toBeDisabled();
    expect(screen.getByDisplayValue(mockUser.Location)).toBeDisabled();

    // Click edit button to enable fields
    fireEvent.click(editButton);

    // Check if fields are now enabled
    expect(screen.getByDisplayValue(mockUser.FName)).not.toBeDisabled();
    expect(screen.getByDisplayValue(mockUser.LName)).not.toBeDisabled();
    expect(screen.getByDisplayValue(mockUser.Location)).not.toBeDisabled();
  });
});
