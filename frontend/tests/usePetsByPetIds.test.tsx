import { render, screen, waitFor } from '@testing-library/react';
import { usePetsByPetIds } from '@/hooks/use-pets-by-pet-ids';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mocking global fetch
global.fetch = jest.fn();

describe('usePetsByPetIds', () => {
  const mockPetIds = ['pet1', 'pet2'];
  const mockPets = {
    pet1: { Id: 'pet1', Name: 'Buddy' },
    pet2: { Id: 'pet2', Name: 'Bella' },
  };

  // Create a QueryClient instance for testing
  const queryClient = new QueryClient();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper component to test the hook
  const TestComponent = ({ petIds }: { petIds: string[] }) => {
    const { pets, status, error } = usePetsByPetIds(petIds);

    if (status === 'pending') return <div>Loading...</div>;
    if (status === 'error') return <div>{error?.message}</div>;

    return (
      <div>
        {Object.keys(pets).map((petId) => (
          <div key={petId}>{pets[petId].Name}</div>
        ))}
      </div>
    );
  };

  it('should fetch pets successfully', async () => {
    // Mock fetch to return successful data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPets),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent petIds={mockPetIds} />
      </QueryClientProvider>
    );

    // Wait for pets to appear
    await waitFor(() => screen.getByText('Buddy'));
    await waitFor(() => screen.getByText('Bella'));

    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText('Bella')).toBeInTheDocument();
  });


  it('should return empty pets if no petIds are provided', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent petIds={[]} />
      </QueryClientProvider>
    );

    // Wait for loading state
    await waitFor(() => screen.getByText('Loading...'));

    expect(screen.queryByText('Buddy')).toBeNull();
    expect(screen.queryByText('Bella')).toBeNull();
  });
});
