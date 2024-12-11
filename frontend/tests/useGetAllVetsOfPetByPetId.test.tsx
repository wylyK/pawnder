import { render, screen, waitFor } from '@testing-library/react';
import { useGetAllVetsOfAPetByPetId } from '@/hooks/use-get-all-vets-of-a-pet-by-pet-id'; // Adjust the import path
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mocking global fetch
global.fetch = jest.fn();

describe('useGetAllVetsOfAPetByPetId', () => {
  const mockPetId = 'pet1';

  // Create a QueryClient instance for testing
  const queryClient = new QueryClient();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper component to test the hook
  const TestComponent = ({ petId }: { petId: string }) => {
    const { vetAssigneds, status, error } = useGetAllVetsOfAPetByPetId(petId);

    if (status === 'pending') return <div>Loading...</div>;
    if (status === 'error') return <div>{error?.message}</div>;

    return (
      <div>
        {Object.keys(vetAssigneds).length > 0
          ? Object.entries(vetAssigneds).map(([vetId, vet]) => (
              <div key={vetId}>{vet.FName} {vet.LName}</div>
            ))
          : 'No vets assigned'}
      </div>
    );
  };


  it('should display no vets assigned if no vets are found', async () => {
    // Mock fetch to return a successful response with no vets
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent petId={mockPetId} />
      </QueryClientProvider>
    );

    // Expect to find text 'No vets assigned'
    const noVetsElement = await screen.findByText(/No vets assigned/i);
    expect(noVetsElement).toBeInTheDocument();
  });

  it('should fetch and display vets successfully', async () => {
    // Mock fetch to return a successful response with vets
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        'vet1': { FName: 'John', LName: 'Doe' },
        'vet2': { FName: 'Jane', LName: 'Smith' },
      }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent petId={mockPetId} />
      </QueryClientProvider>
    );

    // Wait for the vet names to appear
    await waitFor(() => screen.getByText('John Doe'));
    await waitFor(() => screen.getByText('Jane Smith'));

    // Check if the vet names are displayed in the document
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});
