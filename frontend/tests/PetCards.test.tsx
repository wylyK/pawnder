import { render, screen, fireEvent } from '@testing-library/react';
import { PetCards } from '../src/components/calendar/PetCards'; // Adjust path as needed
import { usePetsByPetIds } from '@/hooks/use-pets-by-pet-ids'; // Import the hook
import '@testing-library/jest-dom'; // For jest-dom matchers
import { Role } from "../src/share/type";

// Mock the usePetsByPetIds hook directly
jest.mock('@/hooks/use-pets-by-pet-ids', () => ({
  usePetsByPetIds: jest.fn(),
}));


describe('PetCards', () => {
  const mockSetSelectedPet = jest.fn();

  it('renders "All Pets" button', () => {
    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: {},
      status: 'success',
    });

    render(
      <PetCards petIds={[]} selectedPet="" setSelectedPet={mockSetSelectedPet} />
    );

    // Check if the "All Pets" button is rendered
    expect(screen.getByText('All Pets')).toBeInTheDocument();
  });

  it('renders pet cards correctly when pets are available', () => {
    const mockPets = {
      '1': { Name: 'Fido' },
      '2': { Name: 'Buddy' },
    };

    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: mockPets,
      status: 'success',
    });

    render(
      <PetCards
        petIds={['1', '2']}
        selectedPet="1"
        setSelectedPet={mockSetSelectedPet}
      />
    );

    // Check if pet cards are rendered for each pet
    expect(screen.getByText('Fido')).toBeInTheDocument();
    expect(screen.getByText('Buddy')).toBeInTheDocument();
  });

  it('sets selected pet correctly when a pet card is clicked', () => {
    const mockPets = {
      '1': { Name: 'Fido' },
      '2': { Name: 'Buddy' },
    };

    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: mockPets,
      status: 'success',
    });

    render(
      <PetCards
        petIds={['1', '2']}
        selectedPet=""
        setSelectedPet={mockSetSelectedPet}
      />
    );

    // Click on the pet card for "Fido"
    fireEvent.click(screen.getByText('Fido'));

    // Check if setSelectedPet was called with "1" (petId of Fido)
    expect(mockSetSelectedPet).toHaveBeenCalledWith('1');
  });

  it('sets selected pet to empty string when "All Pets" button is clicked', () => {
    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: {},
      status: 'success',
    });

    render(
      <PetCards petIds={[]} selectedPet="1" setSelectedPet={mockSetSelectedPet} />
    );

    // Click on the "All Pets" button
    fireEvent.click(screen.getByText('All Pets'));

    // Check if setSelectedPet was called with an empty string
    expect(mockSetSelectedPet).toHaveBeenCalledWith('');
  });

  it('does not render pet cards if pets list is empty', () => {
    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: {},
      status: 'success',
    });

    render(
      <PetCards petIds={[]} selectedPet="" setSelectedPet={mockSetSelectedPet} />
    );

    // Ensure no pet cards are rendered
    expect(screen.queryByText('Fido')).not.toBeInTheDocument();
    expect(screen.queryByText('Buddy')).not.toBeInTheDocument();
  });

  it('handles loading state correctly', () => {
    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: {},
      status: 'loading',
    });

    render(
      <PetCards petIds={[]} selectedPet="" setSelectedPet={mockSetSelectedPet} />
    );

    // Check if some loading message or indication is shown
    expect(screen.queryByText('All Pets')).not.toBeNull(); // Ensure it doesn't break UI
  });

  it('handles error state correctly', () => {
    (usePetsByPetIds as jest.Mock).mockReturnValue({
      pets: {},
      status: 'error',
      error: new Error('Failed to fetch pets'),
    });

    render(
      <PetCards petIds={[]} selectedPet="" setSelectedPet={mockSetSelectedPet} />
    );

    // Check if error message or fallback UI is shown
    expect(screen.queryByText('All Pets')).not.toBeNull(); // Ensure it doesn't break UI
  });
});
