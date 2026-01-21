import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Transfer patient to another department
export async function POST(request) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session || !session.user) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      patient_id,
      to_department_id,
      notes,
      is_emergency,
    } = body;

    if (!patient_id || !to_department_id) {
      return Response.json(
        {
          success: false,
          error: "Patient ID and destination department are required",
        },
        { status: 400 },
      );
    }

    // Get current patient and verify exists
    const [patient] =
      await sql`SELECT current_department_id, id FROM patients WHERE id = ${patient_id}`;

    if (!patient) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 },
      );
    }

    // Verify destination department exists
    const [destDept] = await sql`SELECT id FROM departments WHERE id = ${to_department_id}`;
    if (!destDept) {
      return Response.json(
        { success: false, error: "Department not found" },
        { status: 400 },
      );
    }

    // Check if patient is already in destination department
    if (patient.current_department_id === to_department_id) {
      return Response.json(
        { success: false, error: "Patient is already in this department" },
        { status: 400 },
      );
    }

    const from_department_id = patient.current_department_id;

    // Get staff member info from session
    const [staffMember] = await sql`
      SELECT id, name FROM auth_users WHERE email = ${session.user.email}
    `;

    if (!staffMember) {
      return Response.json(
        { success: false, error: "Staff member not found" },
        { status: 404 },
      );
    }

    // Update patient's current department
    await sql`
      UPDATE patients 
      SET current_department_id = ${to_department_id}
      WHERE id = ${patient_id}
    `;

    // Record the transfer in workflow table
    const [workflow] = await sql`
      INSERT INTO patient_workflow (
        patient_id, from_department_id, to_department_id, transferred_by, notes, action_type, is_emergency
      ) VALUES (
        ${patient_id}, ${from_department_id || null}, ${to_department_id}, 
        ${staffMember.name}, ${notes || null}, 'transfer', ${is_emergency || false}
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      workflow,
      message: "Patient transferred successfully",
    });
  } catch (error) {
    console.error("Error transferring patient:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
