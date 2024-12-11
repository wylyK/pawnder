import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../src/components/Home/Home'; // Adjust path if needed
import { useRouter } from 'next/navigation'; // Mock useRouter hook
import UserContext from '@/context/UserContext'; // Import UserContext
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // For React Query
import '@testing-library/jest-dom'; // For jest-dom matchers
import { FaPaw } from 'react-icons/fa'; // Ensure you import the icon if needed
import Reminders from '@/components/Reminder/Reminders'; // For the Reminders component
import PetOverview from '@/components/PetOverview/PetOverview'; // For the PetOverview component
import { Role } from "../src/share/type";

// Mocking necessary components and hooks
jest.mock('@/components/Reminder/Reminders', () => jest.fn(() => <div>Reminders Component</div>));
jest.mock('@/components/PetOverview/PetOverview', () => jest.fn(() => <div>PetOverview Component</div>));

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

describe('HomePage', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    // Mock useRouter to simulate routing behavior
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  it('renders HomePage correctly when user is logged in', () => {
    const mockSetUser = jest.fn();

    // Create a new QueryClient instance for the test
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
          <HomePage />
        </UserContext.Provider>
      </QueryClientProvider>
    );

    // Check if the title with the user's name is rendered
    expect(screen.getByText(`${mockUser.FName}'s Pets`)).toBeInTheDocument();

    // Check if the icon and title are rendered
    expect(screen.getByText(/Pawnder/i)).toBeInTheDocument();
    // expect(screen.getByTestId('paw-icon')).toBeInTheDocument();

    // Check if the PetOverview component is rendered
    expect(screen.getByText('PetOverview Component')).toBeInTheDocument();

    // Check if the Reminders component is rendered for Owner role
    expect(screen.getByText('Reminders Component')).toBeInTheDocument();
  });

  it('redirects to login if user is not logged in', () => {
    const mockSetUser = jest.fn();

    // Mock user context with null user (not logged in)
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <UserContext.Provider value={{ user: null, setUser: mockSetUser }}>
          <HomePage />
        </UserContext.Provider>
      </QueryClientProvider>
    );

    // Ensure the router redirects to the login page
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });

  it('displays user name and role correctly in header', () => {
    const mockSetUser = jest.fn();
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={{ user: mockUser, setUser: mockSetUser }}>
          <HomePage />
        </UserContext.Provider>
      </QueryClientProvider>
    );

    // Check if the user's name is displayed correctly
    expect(screen.getByText(`${mockUser.FName}'s Pets`)).toBeInTheDocument();

    // Check if the user's role is correctly handled in the conditional rendering
    if (mockUser.Role === 'Owner') {
      expect(screen.getByText('Reminders Component')).toBeInTheDocument();
    }
  });

  it('should not display the Reminders component if user is not an Owner', () => {
    const mockSetUser = jest.fn();
    const queryClient = new QueryClient();

    const nonOwnerUser = {
        Id: "1",
        FName: "John",
        LName: "Doe",
        Email: "john.doe@example.com",
        Location: "New York",
        Role: Role.Vet,
      };

    render(
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={{ user: nonOwnerUser, setUser: mockSetUser }}>
          <HomePage />
        </UserContext.Provider>
      </QueryClientProvider>
    );

    // Reminders should not be rendered for non-owners
    expect(screen.queryByText('Reminders Component')).not.toBeInTheDocument();
  });
});
