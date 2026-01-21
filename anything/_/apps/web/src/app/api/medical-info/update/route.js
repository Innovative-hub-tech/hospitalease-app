import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Update medical information for a department visit
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
      department_id,
      drugs_prescribed,
      diagnostic_tests,
      health_complaints,
      referrals,
      notes,
    } = body;

    if (!patient_id || !department_id) {
      return Response.json(
        {
          success: false,
          error: "Patient ID and department ID are required",
        },
        { status: 400 },
      );
    }

    // Verify patient exists
    const [patient] = await sql`SELECT id FROM patients WHERE id = ${patient_id}`;
    if (!patient) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 },
      );
    }

    // Verify department exists
    const [dept] = await sql`SELECT id FROM departments WHERE id = ${department_id}`;
    if (!dept) {
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

    // Get current department visit for patient
    const [currentVisit] = await sql`
      SELECT id, exit_time FROM department_visits 
      WHERE patient_id = ${patient_id} AND department_id = ${department_id}
      ORDER BY entry_time DESC
      LIMIT 1
    `;

    if (!currentVisit) {
      return Response.json(
        { success: false, error: "No active department visit found for this patient" },
        { status: 404 },
      );
    }

    // Check if patient has already left the department
    if (currentVisit.exit_time) {
      return Response.json(
        { success: false, error: "Cannot update medical information after patient has left the department" },
        { status: 400 },
      );
    }

    // Check if medical info already exists for this visit
    const [existingMedicalInfo] = await sql`
      SELECT id FROM medical_info 
      WHERE department_visit_id = ${currentVisit.id}
    `;

    let medicalInfo;

    if (existingMedicalInfo) {
      // Update existing medical info
      [medicalInfo] = await sql`
        UPDATE medical_info 
        SET 
          drugs_prescribed = ${drugs_prescribed || null},
          diagnostic_tests = ${diagnostic_tests || null},
          health_complaints = ${health_complaints || null},
          referrals = ${referrals || null},
          notes = ${notes || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingMedicalInfo.id}
        RETURNING *
      `;
    } else {
      // Create new medical info record
      [medicalInfo] = await sql`
        INSERT INTO medical_info (
          patient_id, department_id, department_visit_id, 
          drugs_prescribed, diagnostic_tests, health_complaints, referrals, notes,
          created_by
        ) VALUES (
          ${patient_id}, ${department_id}, ${currentVisit.id},
          ${drugs_prescribed || null}, ${diagnostic_tests || null}, 
          ${health_complaints || null}, ${referrals || null}, ${notes || null},
          ${staffMember.id}
        ) RETURNING *
      `;
    }

    return Response.json({
      success: true,
      medicalInfoId: medicalInfo.id,
      medicalInfo,
      message: "Medical information updated successfully",
    });
  } catch (error) {
    console.error("Error updating medical information:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
