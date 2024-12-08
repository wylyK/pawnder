import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserProfile from "../../src/components/UserProfile/UserProfile";
import ProfileTextBox from "../../src/components/ProfileTexBox";
import CountrySelect from "../../src/components/CountrySelect";

// Mock child components
jest.mock("../../src/components/ProfileTexBox", () => {
  return jest.fn(({ label, type, value, onChange, disabled }) => (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        data-testid={`textbox-${label}`}
      />
    </div>
  ));
});

jest.mock("../../src/components/CountrySelect", () => {
  return jest.fn(({ value, onChange, disabled }) => (
    <select
      value={value ? value.value : ""}
      onChange={(e) =>
        onChange({ value: e.target.value, label: e.target.value })
      }
      disabled={disabled}
      data-testid="country-select"
    >
      <option value="">Select a country</option>
      <option value="US">United States</option>
      <option value="CA">Canada</option>
    </select>
  ));
});

describe("UserProfile Component", () => {
  test("renders all profile fields", () => {
    render(<UserProfile />);

    // Check that headings are rendered
    expect(screen.getByText("Pet")).toBeInTheDocument();
    expect(screen.getByText("life")).toBeInTheDocument();
    expect(screen.getByText("Hi name!")).toBeInTheDocument();
    expect(screen.getByText("Updated date: April 6, 2023")).toBeInTheDocument();

    // Check textboxes
    expect(screen.getByTestId("textbox-Name")).toBeInTheDocument();
    expect(screen.getByTestId("textbox-Email")).toBeInTheDocument();
    expect(screen.getByTestId("textbox-Password")).toBeInTheDocument();
    expect(screen.getByTestId("textbox-Date of birth")).toBeInTheDocument();

    // Check country select
    expect(screen.getByTestId("country-select")).toBeInTheDocument();

    // Check edit button
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  test("toggles edit mode and enables fields", () => {
    render(<UserProfile />);

    const editButton = screen.getByText("Edit");

    // Check that fields are initially disabled
    expect(screen.getByTestId("textbox-Name")).toBeDisabled();
    expect(screen.getByTestId("textbox-Email")).toBeDisabled();
    expect(screen.getByTestId("textbox-Password")).toBeDisabled();
    expect(screen.getByTestId("textbox-Date of birth")).toBeDisabled();
    expect(screen.getByTestId("country-select")).toBeDisabled();

    // Click the edit button to enable editing
    fireEvent.click(editButton);

    // Check that fields are now enabled
    expect(screen.getByTestId("textbox-Name")).toBeEnabled();
    expect(screen.getByTestId("textbox-Email")).toBeEnabled();
    expect(screen.getByTestId("textbox-Password")).toBeEnabled();
    expect(screen.getByTestId("textbox-Date of birth")).toBeEnabled();
    expect(screen.getByTestId("country-select")).toBeEnabled();

    // Check that the button text changes to "Save"
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  test("updates state on user input", () => {
    render(<UserProfile />);

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    // Simulate user input
    const nameInput = screen.getByTestId("textbox-Name");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    expect(nameInput).toHaveValue("John Doe");

    const emailInput = screen.getByTestId("textbox-Email");
    fireEvent.change(emailInput, { target: { value: "john.doe@example.com" } });
    expect(emailInput).toHaveValue("john.doe@example.com");

    const passwordInput = screen.getByTestId("textbox-Password");
    fireEvent.change(passwordInput, { target: { value: "newpassword" } });
    expect(passwordInput).toHaveValue("newpassword");

    const dateInput = screen.getByTestId("textbox-Date of birth");
    fireEvent.change(dateInput, { target: { value: "2000-01-01" } });
    expect(dateInput).toHaveValue("2000-01-01");

    const countrySelect = screen.getByTestId("country-select");
    fireEvent.change(countrySelect, { target: { value: "US" } });
    expect(countrySelect).toHaveValue("US");
  });
});
