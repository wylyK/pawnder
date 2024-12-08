import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import PetProfile from "../../src/components/PetOverview/PetProfile";
import api from "../../api";

jest.mock("axios");
jest.mock("../../api", () => ({
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
}));

describe("PetProfile Component", () => {
  const mockPetData = {
    id: "1",
    Name: "Buddy",
    Breed: "Golden Retriever",
    Avatar: "/buddy.png",
    Description: "Friendly and energetic",
    Age: "3 years",
    Tag: ["Playful", "Friendly"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { [mockPetData.id]: mockPetData },
    });
    (api.put as jest.Mock).mockResolvedValueOnce({});
    (api.post as jest.Mock).mockResolvedValueOnce({});
  });

  test("renders loading state initially", () => {
    render(<PetProfile petId="1" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders pet details after fetching data", async () => {
    render(<PetProfile petId="1" />);

    await waitFor(() => {
      expect(screen.getByText("Buddy")).toBeInTheDocument();
      expect(screen.getByText("Golden Retriever")).toBeInTheDocument();
      expect(screen.getByText("Friendly and energetic")).toBeInTheDocument();
      expect(screen.getByText("3 years")).toBeInTheDocument();
      expect(screen.getByText("Playful")).toBeInTheDocument();
      expect(screen.getByText("Friendly")).toBeInTheDocument();
    });

    expect(screen.getByAltText("Buddy")).toHaveAttribute("src", "/buddy.png");
  });

  test("allows editing and saving pet details", async () => {
    render(<PetProfile petId="1" />);

    await waitFor(() => {
      expect(screen.getByText("Buddy")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    const nameInput = screen.getByLabelText(/name:/i);
    const breedInput = screen.getByLabelText(/breed:/i);
    const ageInput = screen.getByLabelText(/age:/i);
    const descriptionInput = screen.getByLabelText(/description:/i);

    fireEvent.change(nameInput, { target: { value: "Max" } });
    fireEvent.change(breedInput, { target: { value: "Labrador" } });
    fireEvent.change(ageInput, { target: { value: "4 years" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Loyal and calm" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/pets/1", {
        id: "1",
        Name: "Max",
        Breed: "Labrador",
        Avatar: "/buddy.png",
        Description: "Loyal and calm",
        Age: "4 years",
        Tag: ["Playful", "Friendly"],
      });
      expect(screen.getByText("Max")).toBeInTheDocument();
      expect(screen.getByText("Labrador")).toBeInTheDocument();
      expect(screen.getByText("Loyal and calm")).toBeInTheDocument();
      expect(screen.getByText("4 years")).toBeInTheDocument();
    });
  });

  test("adds a new tag", async () => {
    render(<PetProfile petId="1" />);

    await waitFor(() => {
      expect(screen.getByText("Buddy")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    const addTagButton = screen.getByText("Add Tag");
    window.prompt = jest.fn(() => "Cuddly");
    fireEvent.click(addTagButton);

    expect(screen.getByText("Cuddly")).toBeInTheDocument();
  });

  test("removes an existing tag", async () => {
    render(<PetProfile petId="1" />);

    await waitFor(() => {
      expect(screen.getByText("Buddy")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    const removeTagButtons = screen.getAllByText("✖");
    fireEvent.click(removeTagButtons[0]);

    expect(screen.queryByText("Playful")).not.toBeInTheDocument();
  });
});
