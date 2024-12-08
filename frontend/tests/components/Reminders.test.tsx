import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Reminders from "../../src/components/Reminder/Reminders";

describe("Reminders Component", () => {
  test("renders all reminders", () => {
    render(<Reminders />);

    // Check all reminders are rendered
    expect(screen.getByText("Fionn")).toBeInTheDocument();
    expect(screen.getByText("Spike")).toBeInTheDocument();
    expect(screen.getByText("Bella")).toBeInTheDocument();
  });

  test("toggles reminder selection", () => {
    const { container } = render(<Reminders />);

    // Locate the check container for the first reminder
    const firstReminderCheck = container.querySelectorAll(
      ".check-container"
    )[0];

    // Click to toggle the first reminder
    fireEvent.click(firstReminderCheck!);

    // Verify the toggled class is applied
    expect(firstReminderCheck).toHaveClass("toggled");

    // Click to untoggle the first reminder
    fireEvent.click(firstReminderCheck!);

    // Verify the toggled class is removed
    expect(firstReminderCheck).not.toHaveClass("toggled");
  });

  test("deletes toggled reminders", () => {
    const { container } = render(<Reminders />);

    // Locate the check container for the first reminder
    const firstReminderCheck = container.querySelectorAll(
      ".check-container"
    )[0];

    // Toggle the first reminder
    fireEvent.click(firstReminderCheck!);

    // Locate the trash container and click to delete
    const trashButton = container.querySelectorAll(".add-delete-container")[1]; // Index 1 corresponds to the trash button
    fireEvent.click(trashButton!);

    // Verify the first reminder is deleted
    expect(screen.queryByText("Fionn")).not.toBeInTheDocument();
  });
});
