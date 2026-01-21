import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../reactivate/route";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/app/api/utils/sql", () => ({
  default: vi.fn(),
}));

describe("POST /api/workflow/reactivate", () => {
  let mockRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {
      json: vi.fn(),
    };
  });

  it("should return 401 if not authenticated", async () => {
    const { auth } = await import("@/auth");
    auth.mockResolvedValue(null);

    mockRequest.json.mockResolvedValue({
      patient_id: "123",
      to_department_id: "456",
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should return 400 if patient already active", async () => {
    const { auth } = await import("@/auth");
    const sql = await import("@/app/api/utils/sql");

    auth.mockResolvedValue({
      user: { email: "staff@hospital.com" },
    });

    sql.default.mockResolvedValueOnce([
      { status: "active", current_department_id: "dept1" },
    ]);

    mockRequest.json.mockResolvedValue({
      patient_id: "pat1",
      to_department_id: "dept2",
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Patient is already active");
  });

  it("should successfully reactivate discharged patient", async () => {
    const { auth } = await import("@/auth");
    const sql = await import("@/app/api/utils/sql");

    auth.mockResolvedValue({
      user: { email: "staff@hospital.com" },
    });

    sql.default
      .mockResolvedValueOnce([
        { status: "discharged", current_department_id: "dept1" },
      ]) // patient query
      .mockResolvedValueOnce([{ id: "dept2" }]) // destination dept query
      .mockResolvedValueOnce([{ id: "staff1", name: "John Doe" }]) // staff query
      .mockResolvedValueOnce(undefined) // update patient
      .mockResolvedValueOnce([
        {
          id: "workflow1",
          patient_id: "pat1",
          transferred_by: "John Doe",
          action_type: "reactivation",
        },
      ]); // insert workflow

    mockRequest.json.mockResolvedValue({
      patient_id: "pat1",
      to_department_id: "dept2",
      notes: "Patient requested reactivation",
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.workflow.action_type).toBe("reactivation");
  });

  it("should reactivate inactive patient", async () => {
    const { auth } = await import("@/auth");
    const sql = await import("@/app/api/utils/sql");

    auth.mockResolvedValue({
      user: { email: "staff@hospital.com" },
    });

    sql.default
      .mockResolvedValueOnce([
        { status: "inactive", current_department_id: "dept1" },
      ])
      .mockResolvedValueOnce([{ id: "dept2" }])
      .mockResolvedValueOnce([{ id: "staff1", name: "Jane Smith" }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        {
          id: "workflow1",
          action_type: "reactivation",
        },
      ]);

    mockRequest.json.mockResolvedValue({
      patient_id: "pat1",
      to_department_id: "dept2",
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.workflow.action_type).toBe("reactivation");
  });
});
