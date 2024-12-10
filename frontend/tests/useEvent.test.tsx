import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/context/UserContext'; // Adjust the import path
import { useEvent } from '@/hooks/use-event'; // Adjust the import path
import React, { useState } from 'react'; // Added import for useState

// Mock the necessary hooks and functions
jest.mock('@/context/UserContext', () => ({
  useAuth: jest.fn(),
}));

// Global fetch mock
beforeAll(() => {
  // Mock global fetch API
  globalThis.fetch = jest.fn() as unknown as jest.Mock;
});

// Mocking the useEvent hook to simulate different cases
jest.mock('@/hooks/use-event', () => ({
  useEvent: () => ({
    createEvent: jest.fn(),
    createEventStatus: 'success',
    updateEvent: jest.fn(),
    updateEventStatus: 'success',
    deleteEvent: jest.fn(),
    deleteEventStatus: 'success',
  }),
}));

describe('useEvent hook', () => {
  const mockUser = { id: 'user1', Role: 'Owner' };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser }); // Mocking useAuth with mockUser
  });

  it('should successfully create an event', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    // Mock the fetch response to simulate a successful event creation
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ Id: 'event1', Name: 'Test Event' }),
    });

    render(
      <TestWrapper>
        <MyComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      const createEventButton = screen.getByText('Create Event Button');
      fireEvent.click(createEventButton);
    });

    // Check if the success message "Event created" is displayed
    expect(await screen.findByText(/Event created/i)).toBeInTheDocument();
  });
});

// Helper to wrap components for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

// Example of a component that uses the useEvent hook
const MyComponent: React.FC = () => {
  const { createEvent } = useEvent();
  const [statusMessage, setStatusMessage] = useState<string | null>(null); // useState import added here

  const handleCreateEvent = async () => {
    try {
      const response = await createEvent({
        petId: 'pet1',
        newEvent: {
          Id: '1',
          Name: 'Checkup',
          DateTime: '2024-12-10T10:00:00',
          Duration: 30,
          Location: 'Vet Clinic',
          CreatedBy: 'user1',
          VetAssigned: 'vet1',
          Type: 'Routine Checkup',
          Description: 'Routine checkup for the pet',
          FollowUp: 'Next checkup in 6 months',
          CreatedAt: new Date().toISOString(),
        },
      });
      setStatusMessage('Event created');
    } catch (e: any) {
      setStatusMessage(e.message); // Show the error message
    }
  };

  return (
    <div>
      <button onClick={handleCreateEvent}>Create Event Button</button>
      {statusMessage && <p>{statusMessage}</p>} {/* Show status message */}
    </div>
  );
};
