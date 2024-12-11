import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../src/components/AuthenticationForm/LoginForm'; // Adjust path if needed
import { useRouter } from 'next/navigation'; // For routing
import { useAuth } from '@/context/UserContext'; // For context
import '@testing-library/jest-dom'; // For jest-dom matchers

// Mock next/router and context
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/context/UserContext', () => ({
  useAuth: jest.fn(),
}));

describe('LoginForm', () => {
  const mockSetUser = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ setUser: mockSetUser });
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  it('renders the login form correctly', () => {
    render(<LoginForm />);

    // Check if the email, password inputs and submit button are rendered
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('calls setUser and redirects on successful login', async () => {
    const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ user: { name: 'John Doe' } }) };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    render(<LoginForm />);

    // Fill in the email and password
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for the mock fetch response
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({ name: 'John Doe' });
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error message if login fails', async () => {
    const mockResponse = { ok: false, json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' }) };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    render(<LoginForm />);

    // Fill in the email and password
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for the error message
    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());
  });

  it('navigates to the signup page when "Create an Account" is clicked', () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /create an account/i }));
    expect(mockRouterPush).toHaveBeenCalledWith('/signup');
  });
});
