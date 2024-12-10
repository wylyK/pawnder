import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PetSelectField from '../src/components/calendar/PetSelectField'; // Adjust path as needed
import { usePetsByPetIds } from '@/hooks/use-pets-by-pet-ids';
import { useAuth } from '@/context/UserContext';
import '@testing-library/jest-dom'; // For jest-dom matchers
import { Role } from "../src/share/type";

// Mock the necessary hooks
jest.mock('@/hooks/use-pets-by-pet-ids', () => ({
  usePetsByPetIds: jest.fn(),
}));

jest.mock('@/context/UserContext', () => ({
  useAuth: jest.fn(),
}));

const mockUser = {
    Id: "1",
    FName: "John",
    LName: "Doe",
    Email: "john.doe@example.com",
    Location: "New York",
    Role: Role.Owner,
  };

describe('PetSelectField', () => {
  const mockSetNewEventPetAssigned = jest.fn();

  // Helper to mock useAuth and user context
  const mockUseAuth = (user: any) => {
    (useAuth as jest.Mock).mockReturnValue({ user });
  };

  it('does not render if no user or no petIds are provided', () => {
    mockUseAuth(null); // No user
    render(
      <PetSelectField
        newEventPetAssigned=""
        setNewEventPetAssigned={mockSetNewEventPetAssigned}
        petIds={[]}
      />
    );

    // Ensure that no form is rendered
    expect(screen.queryByLabelText('Pet Name:')).not.toBeInTheDocument();
  });

  it('renders pet select field with pets', async () => {
    const mockPets = {
      '1': { Name: 'Fido' },
      '2': { Name: 'Buddy' },
    };

    mockUseAuth({ PetId: '1', id: 'user1' });
    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: mockPets,
      status: 'success',
    });

    render(
      <PetSelectField
        newEventPetAssigned="1"
        setNewEventPetAssigned={mockSetNewEventPetAssigned}
        petIds={['1', '2']}
      />
    );

    // Check that the pet select field is rendered
    const petSelect = screen.getByLabelText('Pet Name:');
    expect(petSelect).toBeInTheDocument();

    // Check if the options for pets are rendered
    expect(screen.getByText('Fido')).toBeInTheDocument();
    expect(screen.getByText('Buddy')).toBeInTheDocument();
  });

  it('does not render pet options while loading', () => {
    mockUseAuth({ PetId: '1', id: 'user1' });
    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: {},
      status: 'loading',
    });

    render(
      <PetSelectField
        newEventPetAssigned=""
        setNewEventPetAssigned={mockSetNewEventPetAssigned}
        petIds={['1']}
      />
    );

    // Check that loading behavior is handled
    const petSelect = screen.getByLabelText('Pet Name:');
    expect(petSelect).toBeInTheDocument();
    expect(screen.queryByText('Fido')).not.toBeInTheDocument();
  });

  it('calls setNewEventPetAssigned when a pet is selected', () => {
    const mockPets = {
      '1': { Name: 'Fido' },
      '2': { Name: 'Buddy' },
    };

    mockUseAuth({ PetId: '1', id: 'user1' });
    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: mockPets,
      status: 'success',
    });

    render(
      <PetSelectField
        newEventPetAssigned=""
        setNewEventPetAssigned={mockSetNewEventPetAssigned}
        petIds={['1', '2']}
      />
    );

    // Select a pet
    const petSelect = screen.getByLabelText('Pet Name:');
    fireEvent.change(petSelect, { target: { value: '2' } });

    // Check if setNewEventPetAssigned was called with the pet ID
    expect(mockSetNewEventPetAssigned).toHaveBeenCalledWith('2');
  });
});
