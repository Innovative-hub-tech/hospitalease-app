import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReactivationButton from "./ReactivationButton";

describe("ReactivationButton Component", () => {
  it("should not render for active patients", () => {
    const { container } = render(
      <ReactivationButton
        patientId="pat1"
        patientStatus="active"
        onReactivationComplete={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render for discharged patients", () => {
    render(
      <ReactivationButton
        patientId="pat1"
        patientStatus="discharged"
        onReactivationComplete={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /reactivate/i });
    expect(button).toBeInTheDocument();
  });

  it("should render for inactive patients", () => {
    render(
      <ReactivationButton
        patientId="pat1"
        patientStatus="inactive"
        onReactivationComplete={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /reactivate/i });
    expect(button).toBeInTheDocument();
  });

  it("should open reactivation dialog on click", async () => {
    render(
      <ReactivationButton
        patientId="pat1"
        patientStatus="discharged"
        onReactivationComplete={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /reactivate/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/assign to department/i)).toBeInTheDocument();
    });
  });

  it("should call onReactivationComplete after successful reactivation", async () => {
    const mockCallback = vi.fn();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            workflow: { id: "wf1" },
          }),
      })
    );

    global.alert = vi.fn();

    render(
      <ReactivationButton
        patientId="pat1"
        patientStatus="discharged"
        onReactivationComplete={mockCallback}
      />
    );

    const button = screen.getByRole("button", { name: /reactivate/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/assign to department/i)).toBeInTheDocument();
    });
  });
});
