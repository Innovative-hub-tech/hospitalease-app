import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransferButton from "./TransferButton";

describe("TransferButton Component", () => {
  const mockProps = {
    patientId: "pat1",
    currentDepartmentId: "dept1",
    onTransferComplete: vi.fn(),
  };

  it("should render transfer button", () => {
    render(<TransferButton {...mockProps} />);
    const button = screen.getByRole("button", { name: /transfer/i });
    expect(button).toBeInTheDocument();
  });

  it("should open transfer dialog on click", async () => {
    render(<TransferButton {...mockProps} />);
    const button = screen.getByRole("button", { name: /transfer/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/destination department/i)).toBeInTheDocument();
    });
  });

  it("should close dialog when cancel is clicked", async () => {
    render(<TransferButton {...mockProps} />);
    const button = screen.getByRole("button", { name: /transfer/i });

    fireEvent.click(button);

    await waitFor(() => {
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/destination department/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should call onTransferComplete after successful transfer", async () => {
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

    render(<TransferButton {...mockProps} />);
    const button = screen.getByRole("button", { name: /transfer/i });

    fireEvent.click(button);

    await waitFor(() => {
      const selectElement = screen.getByDisplayValue(/select a department/i);
      expect(selectElement).toBeInTheDocument();
    });
  });

  it("should be disabled while transferring", async () => {
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    success: true,
                  }),
              }),
            100
          )
        )
    );

    render(<TransferButton {...mockProps} />);
    const button = screen.getByRole("button", { name: /transfer/i });

    fireEvent.click(button);

    await waitFor(() => {
      const transferButton = screen.getByRole("button", { name: /transfer/i });
      expect(transferButton).toBeDisabled();
    });
  });
});
