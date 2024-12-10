import { render, screen, waitFor } from '@testing-library/react';
import { useGetAllEventsOfAPetByPetId } from '@/hooks/use-get-all-events-of-a-pet-by-pet-id'; // Adjust the import path
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mocking global fetch
global.fetch = jest.fn();

describe('useGetAllEventsOfAPetByPetId', () => {
  const mockPetId = 'pet1';
  const mockEvents = [
    { Id: 'event1', Name: 'Vet Checkup', DateTime: '2024-12-10T10:00:00', Duration: 30, Location: 'Vet Clinic', CreatedBy: 'user1' },
    { Id: 'event2', Name: 'Vaccination', DateTime: '2024-12-15T10:00:00', Duration: 30, Location: 'Vet Clinic', CreatedBy: 'user1' },
  ];

  // Create a QueryClient instance for testing
  const queryClient = new QueryClient();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper component to test the hook
  const TestComponent = ({ petId }: { petId: string }) => {
    const { eventsOfPet, status, error } = useGetAllEventsOfAPetByPetId(petId);

    if (status === 'pending') return <div>Loading...</div>;
    if (status === 'error') return <div>{error?.message}</div>;

    // Check if eventsOfPet is defined and render the list of events
    if (!eventsOfPet || eventsOfPet.length === 0) {
      return <div>No events found.</div>;
    }

    return (
      <div>
        {eventsOfPet.map((event) => (
          <div key={event.Id}>
            {event.Name} - {event.DateTime}
          </div>
        ))}
      </div>
    );
  };

  it('should fetch events successfully', async () => {
    // Mock fetch to return successful data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEvents),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent petId={mockPetId} />
      </QueryClientProvider>
    );

    // Wait for events to appear using a flexible matcher for event name
    await waitFor(() => screen.getByText(/Vet Checkup/i)); // Using regular expression to match event name
    await waitFor(() => screen.getByText(/Vaccination/i)); // Using regular expression to match event name

    expect(screen.getByText(/Vet Checkup/i)).toBeInTheDocument();  // No need to use the exact text
    expect(screen.getByText(/Vaccination/i)).toBeInTheDocument();  // Same here
  });

  it('should not fetch events if no petId is provided', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent petId={''} />
      </QueryClientProvider>
    );

    // Wait for loading state
    await waitFor(() => screen.getByText('Loading...'));

    expect(screen.queryByText('Vet Checkup')).toBeNull();
    expect(screen.queryByText('Vaccination')).toBeNull();
  });

  it('should display no events found if eventsOfPet is empty', async () => {
    // Mock fetch to return an empty array
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent petId={mockPetId} />
      </QueryClientProvider>
    );

    // Wait for "No events found" message
    await waitFor(() => screen.getByText('No events found.'));

    expect(screen.getByText('No events found.')).toBeInTheDocument();
  });
});
