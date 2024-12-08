import React from "react";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/UserContext";
import HomePage from "../../src/components/Home/Home";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/context/UserContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../src/components/Navigation/NavBar", () => () => <div data-testid="navbar" />);
jest.mock("../../src/components/PetOverview/PetOverview", () => () => (
  <div data-testid="pet-overview" />
));
jest.mock("@/components/Reminder/Reminders", () => () => (
  <div data-testid="reminders" />
));

describe("HomePage", () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the HomePage correctly when user is logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { FName: "John" },
    });

    render(<HomePage />);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("pet-overview")).toBeInTheDocument();
    expect(screen.getByTestId("reminders")).toBeInTheDocument();
    expect(screen.getByText("John's Pets")).toBeInTheDocument();
    expect(screen.getByText("Pawnder")).toBeInTheDocument();
  });

  it("should redirect to /login when user is not logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<HomePage />);

    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
