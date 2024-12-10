import { render, screen, fireEvent } from '@testing-library/react';
import CalendarPage from '../src/components/calendar/CalendarPage'; // Adjust path if needed
import { useRouter } from 'next/navigation'; // Mock useRouter hook
import UserContext from '@/context/UserContext'; // Import UserContext
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // For React Query
import '@testing-library/jest-dom'; // For jest-dom matchers
import { Role } from "../src/share/type";

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUser = {
    Id: "1",
    FName: "John",
    LName: "Doe",
    Email: "john.doe@example.com",
    Location: "New York",
    Role: Role.Owner,
  };

describe('CalendarPage', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    // Mock useRouter to simulate routing behavior
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  it('renders CalendarPage correctly', () => {
    // Create a new QueryClient instance for the test
    const queryClient = new QueryClient();

    // Mock user context with a sample user
    const mockSetUser = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
          <CalendarPage />
        </UserContext.Provider>
      </QueryClientProvider>
    );

    // Check if the header "My Calendar" is rendered
    expect(screen.getByText(/my calendar/i)).toBeInTheDocument();

    // Check if the "Pets" section is rendered
    expect(screen.getByText(/pets/i)).toBeInTheDocument();

    // Check if the "Monthly Checklist" section is rendered
    expect(screen.getByText(/monthly checklist/i)).toBeInTheDocument();
  });

  it('redirects to login if user is not logged in', () => {
    // Mock user context with null user (not logged in)
    const mockSetUser = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <UserContext.Provider value={{ user: null, setUser: mockSetUser }}>
          <CalendarPage />
        </UserContext.Provider>
      </QueryClientProvider>
    );

    // Ensure the router redirects to the login page
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });
});
