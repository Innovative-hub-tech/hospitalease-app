import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";

// Mock the auth module
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock the sql module
vi.mock("@/app/api/utils/sql", () => ({
  default: vi.fn(),
}));

describe("POST /api/workflow/transfer", () => {
  let mockRequest;
  let mockAuth;
  let mockSql;

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
    expect(data.success).toBe(false);
    expect(data.error).toBe("Authentication required");
  });

  it("should return 400 if patient_id or to_department_id is missing", async () => {
    const { auth } = await import("@/auth");
    auth.mockResolvedValue({
      user: { email: "staff@hospital.com" },
    });

    mockRequest.json.mockResolvedValue({
      patient_id: "123",
      // missing to_department_id
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should return 404 if patient not found", async () => {
    const { auth } = await import("@/auth");
    const sql = await import("@/app/api/utils/sql");

    auth.mockResolvedValue({
      user: { email: "staff@hospital.com" },
    });

    sql.default.mockResolvedValue([]);

    mockRequest.json.mockResolvedValue({
      patient_id: "123",
      to_department_id: "456",
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Patient not found");
  });

  it("should successfully transfer patient", async () => {
    const { auth } = await import("@/auth");
    const sql = await import("@/app/api/utils/sql");

    auth.mockResolvedValue({
      user: { email: "staff@hospital.com" },
    });

    // Mock patient query
    sql.default
      .mockResolvedValueOnce([{ current_department_id: "dept1", id: "pat1" }]) // patient query
      .mockResolvedValueOnce([{ id: "dept2" }]) // destination dept query
      .mockResolvedValueOnce([{ id: "staff1", name: "John Doe" }]) // staff query
      .mockResolvedValueOnce(undefined) // update patient
      .mockResolvedValueOnce([
        {
          id: "workflow1",
          patient_id: "pat1",
          transferred_by: "John Doe",
          action_type: "transfer",
        },
      ]); // insert workflow

    mockRequest.json.mockResolvedValue({
      patient_id: "pat1",
      to_department_id: "dept2",
      notes: "Routine transfer",
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.workflow.transferred_by).toBe("John Doe");
  });

  it("should capture staff name from session", async () => {
    const { auth } = await import("@/auth");
    const sql = await import("@/app/api/utils/sql");

    auth.mockResolvedValue({
      user: { email: "jane@hospital.com" },
    });

    sql.default
      .mockResolvedValueOnce([{ current_department_id: "dept1", id: "pat1" }])
      .mockResolvedValueOnce([{ id: "dept2" }])
      .mockResolvedValueOnce([{ id: "staff1", name: "Jane Smith" }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        {
          id: "workflow1",
          transferred_by: "Jane Smith",
        },
      ]);

    mockRequest.json.mockResolvedValue({
      patient_id: "pat1",
      to_department_id: "dept2",
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.workflow.transferred_by).toBe("Jane Smith");
  });

  it("should mark transfer as emergency if specified", async () => {
    const { auth } = await import("@/auth");
    const sql = await import("@/app/api/utils/sql");

    auth.mockResolvedValue({
      user: { email: "staff@hospital.com" },
    });

    sql.default
      .mockResolvedValueOnce([{ current_department_id: "dept1", id: "pat1" }])
      .mockResolvedValueOnce([{ id: "dept2" }])
      .mockResolvedValueOnce([{ id: "staff1", name: "John Doe" }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        {
          id: "workflow1",
          is_emergency: true,
        },
      ]);

    mockRequest.json.mockResolvedValue({
      patient_id: "pat1",
      to_department_id: "dept2",
      is_emergency: true,
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.workflow.is_emergency).toBe(true);
  });
});
