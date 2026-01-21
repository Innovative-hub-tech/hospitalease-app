import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TransferHistory from "./TransferHistory";

describe("TransferHistory Component", () => {
  it("should display loading state initially", () => {
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
                    workflow: [],
                  }),
              }),
            100
          )
        )
    );

    render(<TransferHistory patientId="pat1" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should display empty state when no transfers", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            workflow: [],
          }),
      })
    );

    render(<TransferHistory patientId="pat1" />);

    await waitFor(() => {
      expect(screen.getByText(/no transfers yet/i)).toBeInTheDocument();
    });
  });

  it("should display transfer records", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            workflow: [
              {
                id: "wf1",
                from_department_name: "Reception",
                to_department_name: "Vitals",
                transferred_by: "John Doe",
                transferred_at: new Date().toISOString(),
                notes: "Routine transfer",
                action_type: "transfer",
                is_emergency: false,
              },
            ],
          }),
      })
    );

    render(<TransferHistory patientId="pat1" />);

    await waitFor(() => {
      expect(screen.getByText(/reception/i)).toBeInTheDocument();
      expect(screen.getByText(/vitals/i)).toBeInTheDocument();
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });

  it("should display emergency badge for emergency transfers", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            workflow: [
              {
                id: "wf1",
                from_department_name: "Reception",
                to_department_name: "Emergency",
                transferred_by: "Jane Smith",
                transferred_at: new Date().toISOString(),
                notes: "Emergency transfer",
                action_type: "transfer",
                is_emergency: true,
              },
            ],
          }),
      })
    );

    render(<TransferHistory patientId="pat1" />);

    await waitFor(() => {
      expect(screen.getByText(/emergency transfer/i)).toBeInTheDocument();
    });
  });

  it("should display transfer notes", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            workflow: [
              {
                id: "wf1",
                from_department_name: "Reception",
                to_department_name: "Vitals",
                transferred_by: "John Doe",
                transferred_at: new Date().toISOString(),
                notes: "Patient requires urgent vitals check",
                action_type: "transfer",
                is_emergency: false,
              },
            ],
          }),
      })
    );

    render(<TransferHistory patientId="pat1" />);

    await waitFor(() => {
      expect(
        screen.getByText(/patient requires urgent vitals check/i)
      ).toBeInTheDocument();
    });
  });

  it("should display error state on fetch failure", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Failed to fetch",
          }),
      })
    );

    render(<TransferHistory patientId="pat1" />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });
});
