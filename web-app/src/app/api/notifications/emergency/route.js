import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Send emergency notification
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
      description,
    } = body;

    if (!patient_id || !department_id || !description) {
      return Response.json(
        {
          success: false,
          error: "Patient ID, department ID, and description are required",
        },
        { status: 400 },
      );
    }

    // Verify patient exists
    const [patient] = await sql`
      SELECT id, first_name, last_name FROM patients WHERE id = ${patient_id}
    `;

    if (!patient) {
      return Response.json(
        { success: false, error: "Patient not found" },
        { status: 404 },
      );
    }

    // Verify department exists
    const [dept] = await sql`SELECT id, name FROM departments WHERE id = ${department_id}`;
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

    // Get all global admins
    const globalAdmins = await sql`
      SELECT id FROM admin_accounts WHERE role = 'global' AND is_active = true
    `;

    // Get department admin
    const [deptAdmin] = await sql`
      SELECT id FROM admin_accounts WHERE role = 'department' AND department_id = ${department_id} AND is_active = true
    `;

    // Create notifications for all global admins
    for (const admin of globalAdmins) {
      await sql`
        INSERT INTO notifications (
          type, recipient_id, patient_id, department_id, title, message
        ) VALUES (
          'emergency_alert', ${admin.id}, ${patient_id}, ${department_id},
          'EMERGENCY: ' || ${patient.first_name} || ' ' || ${patient.last_name},
          'Emergency alert from ' || ${staffMember.name} || ' in ' || ${dept.name} || ': ' || ${description}
        )
      `;
    }

    // Create notification for department admin if exists
    if (deptAdmin) {
      await sql`
        INSERT INTO notifications (
          type, recipient_id, patient_id, department_id, title, message
        ) VALUES (
          'emergency_alert', ${deptAdmin.id}, ${patient_id}, ${department_id},
          'EMERGENCY: ' || ${patient.first_name} || ' ' || ${patient.last_name},
          'Emergency alert from ' || ${staffMember.name} || ': ' || ${description}
        )
      `;
    }

    // Create workflow record
    const [workflow] = await sql`
      INSERT INTO patient_workflow (
        patient_id, to_department_id, transferred_by, notes, action_type, is_emergency
      ) VALUES (
        ${patient_id}, ${department_id}, ${staffMember.name}, ${description}, 'emergency_alert', true
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      notificationId: workflow.id,
      message: "Emergency notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending emergency notification:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
