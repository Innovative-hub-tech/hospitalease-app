import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Submit an issue report
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
      department_id,
      patient_id,
      description,
      severity,
    } = body;

    // Validate required fields
    if (!department_id || !description || !severity) {
      return Response.json(
        {
          success: false,
          error: "Department ID, description, and severity are required",
        },
        { status: 400 },
      );
    }

    // Validate severity
    if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
      return Response.json(
        { success: false, error: "Invalid severity level. Must be low, medium, high, or critical" },
        { status: 400 },
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

    // Verify patient exists if provided
    if (patient_id) {
      const [patient] = await sql`SELECT id FROM patients WHERE id = ${patient_id}`;
      if (!patient) {
        return Response.json(
          { success: false, error: "Patient not found" },
          { status: 404 },
        );
      }
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

    // Create issue report
    const [report] = await sql`
      INSERT INTO issue_reports (
        department_id, patient_id, reported_by, description, severity
      ) VALUES (
        ${department_id}, ${patient_id || null}, ${staffMember.id}, ${description}, ${severity}
      ) RETURNING *
    `;

    // Get department admin
    const [deptAdmin] = await sql`
      SELECT id FROM admin_accounts WHERE role = 'department' AND department_id = ${department_id} AND is_active = true
    `;

    // Get all global admins
    const globalAdmins = await sql`
      SELECT id FROM admin_accounts WHERE role = 'global' AND is_active = true
    `;

    // Create notification for department admin
    if (deptAdmin) {
      await sql`
        INSERT INTO notifications (
          type, recipient_id, department_id, title, message
        ) VALUES (
          'issue_report', ${deptAdmin.id}, ${department_id},
          'Issue Report - ' || ${severity} || ' Severity',
          'Issue reported by ' || ${staffMember.name} || ' in ' || ${dept.name} || ': ' || ${description}
        )
      `;
    }

    // Create notifications for all global admins
    for (const admin of globalAdmins) {
      await sql`
        INSERT INTO notifications (
          type, recipient_id, department_id, title, message
        ) VALUES (
          'issue_report', ${admin.id}, ${department_id},
          'Issue Report - ' || ${severity} || ' Severity',
          'Issue reported in ' || ${dept.name} || ': ' || ${description}
        )
      `;
    }

    // Create workflow record
    await sql`
      INSERT INTO patient_workflow (
        patient_id, to_department_id, transferred_by, notes, action_type
      ) VALUES (
        ${patient_id || null}, ${department_id}, ${staffMember.name}, ${description}, 'issue_report'
      )
    `;

    return Response.json({
      success: true,
      reportId: report.id,
      message: "Issue report submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting issue report:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
