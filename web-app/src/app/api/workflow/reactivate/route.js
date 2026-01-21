import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Reactivate a discharged or inactive patient
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
      await sql`SELECT status, current_department_id FROM patients WHERE id = ${patient_id}`;

    if (!patient) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 },
      );
    }

    // Check if patient is already active
    if (patient.status === 'active') {
      return Response.json(
        { success: false, error: "Patient is already active" },
        { status: 400 },
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

    // Update patient status to active and assign to department
    await sql`
      UPDATE patients 
      SET status = 'active', current_department_id = ${to_department_id}
      WHERE id = ${patient_id}
    `;

    // Record the reactivation in workflow table
    const [workflow] = await sql`
      INSERT INTO patient_workflow (
        patient_id, from_department_id, to_department_id, transferred_by, notes, action_type
      ) VALUES (
        ${patient_id}, ${patient.current_department_id || null}, ${to_department_id}, 
        ${staffMember.name}, ${notes || null}, 'reactivation'
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      workflow,
      message: "Patient reactivated successfully",
    });
  } catch (error) {
    console.error("Error reactivating patient:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
