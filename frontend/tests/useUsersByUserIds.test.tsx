import { render, screen, waitFor } from '@testing-library/react';
import { useUsersByUserIds } from '@/hooks/use-users-by-user-ids';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mocking global fetch
global.fetch = jest.fn();

describe('useUsersByUserIds', () => {
  const mockUserIds = ['user1', 'user2'];
  const mockUsers = {
    user1: { Id: 'user1', FName: 'John', LName: 'Doe' },
    user2: { Id: 'user2', FName: 'Jane', LName: 'Doe' },
  };

  // Create a QueryClient instance for testing
  const queryClient = new QueryClient();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper component to test the hook
  const TestComponent = ({ userIds }: { userIds: string[] }) => {
    const { users, status, error } = useUsersByUserIds(userIds);

    if (status === 'pending') return <div>Loading...</div>;
    if (status === 'error') return <div>{error?.message}</div>;

    return (
      <div>
        {Object.keys(users).map((userId) => (
          <div key={userId}>
            {users[userId].FName} {users[userId].LName}
          </div>
        ))}
      </div>
    );
  };

  it('should fetch users successfully', async () => {
    // Mock fetch to return successful data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent userIds={mockUserIds} />
      </QueryClientProvider>
    );

    // Wait for users to appear
    await waitFor(() => screen.getByText('John Doe'));
    await waitFor(() => screen.getByText('Jane Doe'));

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });


  it('should return empty users if no userIds are provided', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent userIds={[]} />
      </QueryClientProvider>
    );

    // Wait for loading state
    await waitFor(() => screen.getByText('Loading...'));

    expect(screen.queryByText('John Doe')).toBeNull();
    expect(screen.queryByText('Jane Doe')).toBeNull();
  });
});
