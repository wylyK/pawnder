import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from '../src/components/AuthenticationForm/SignupForm'; // Adjust path if needed
import { useRouter } from 'next/navigation'; // For routing
import '@testing-library/jest-dom'; // For jest-dom matchers

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('SignupForm', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  it('renders the signup form correctly', () => {
    render(<SignupForm />);

    // Check if all form fields are rendered
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /already have an account\? login/i })).toBeInTheDocument();
  });

  it('submits the form and redirects on successful signup', async () => {
    const mockResponse = { ok: true };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    render(<SignupForm />);

    // Fill in the form with valid data
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for the successful response
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });
  });


  it('navigates to the login page when "Already Have an Account? Login" is clicked', () => {
    render(<SignupForm />);

    fireEvent.click(screen.getByRole('button', { name: /already have an account\? login/i }));
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });
});
