import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import UserContext from "../../src/context/UserContext";
import NavBar from "../../src/components/Navigation/NavBar";
import { Role } from "../../src/share/type";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("NavBar", () => {
  let setUserMock: jest.Mock;
  let pushMock: jest.Mock;

  const mockUser = {
    Id: "1",
    FName: "John",
    LName: "Doe",
    Email: "john.doe@example.com",
    Location: "New York",
    Role: Role.Owner,
  };

  beforeEach(() => {
    setUserMock = jest.fn();
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render all navigation icons correctly", () => {
    render(
      <UserContext.Provider value={{ user: mockUser, setUser: setUserMock }}>
        <NavBar />
      </UserContext.Provider>
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4); // Ensure all 4 links are present

    // Check if each link has the correct `href`
    expect(links.some((link) => link.getAttribute("href") === "/")).toBe(true);
    expect(links.some((link) => link.getAttribute("href") === "/pets")).toBe(true);
    expect(links.some((link) => link.getAttribute("href") === "/calendar")).toBe(true);
    expect(links.some((link) => link.getAttribute("href") === "/profile")).toBe(true);

    // Check the logout button
    expect(screen.getByRole("button")).toBeInTheDocument();
  });


  it("should log out and navigate to the login page when logout is clicked", () => {
    render(
      <UserContext.Provider value={{ user: mockUser, setUser: setUserMock }}>
        <NavBar />
      </UserContext.Provider>
    );

    const logoutButton = screen.getByRole("button");
    fireEvent.click(logoutButton);
    expect(setUserMock).toHaveBeenCalledWith(null);
    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
