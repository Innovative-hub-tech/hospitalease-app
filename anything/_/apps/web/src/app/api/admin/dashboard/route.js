import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get admin dashboard data
export async function GET(request) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session || !session.user) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get admin info to check role
    const [admin] = await sql`
      SELECT role, department_id FROM admin_accounts WHERE email = ${session.user.email}
    `;

    if (!admin) {
      return Response.json(
        { success: false, error: "Admin account not found" },
        { status: 404 },
      );
    }

    // Build query filters
    let deptFilter = "";
    const params = [];

    if (admin.role === 'department' && admin.department_id) {
      // Department admin can only see their department
      deptFilter = "AND pw.to_department_id = $1";
      params.push(admin.department_id);
    } else if (departmentId) {
      // Global admin can filter by department
      deptFilter = "AND pw.to_department_id = $1";
      params.push(departmentId);
    }

    let dateFilter = "";
    if (startDate) {
      dateFilter += ` AND pw.transferred_at >= '${startDate}'`;
    }
    if (endDate) {
      dateFilter += ` AND pw.transferred_at <= '${endDate}'`;
    }

    // Get all transfers
    const allTransfers = await sql`
      SELECT 
        pw.*,
        d1.name as from_department_name,
        d2.name as to_department_name,
        p.first_name,
        p.last_name,
        p.patient_id
      FROM patient_workflow pw
      LEFT JOIN departments d1 ON pw.from_department_id = d1.id
      LEFT JOIN departments d2 ON pw.to_department_id = d2.id
      LEFT JOIN patients p ON pw.patient_id = p.id
      WHERE pw.action_type = 'transfer' ${deptFilter} ${dateFilter}
      ORDER BY pw.transferred_at DESC
    `;

    // Get emergency alerts
    const emergencyAlerts = await sql`
      SELECT 
        pw.*,
        d.name as department_name,
        p.first_name,
        p.last_name,
        p.patient_id
      FROM patient_workflow pw
      LEFT JOIN departments d ON pw.to_department_id = d.id
      LEFT JOIN patients p ON pw.patient_id = p.id
      WHERE pw.is_emergency = true ${deptFilter} ${dateFilter}
      ORDER BY pw.transferred_at DESC
    `;

    // Get issue reports
    const issueReports = await sql`
      SELECT 
        ir.*,
        d.name as department_name,
        u.name as reported_by_name,
        p.first_name,
        p.last_name,
        p.patient_id
      FROM issue_reports ir
      LEFT JOIN departments d ON ir.department_id = d.id
      LEFT JOIN auth_users u ON ir.reported_by = u.id
      LEFT JOIN patients p ON ir.patient_id = p.id
      WHERE 1=1 ${deptFilter}
      ORDER BY ir.created_at DESC
    `;

    // Get department durations
    const departmentDurations = await sql`
      SELECT 
        dv.department_id,
        d.name as department_name,
        COUNT(DISTINCT dv.patient_id) as patient_count,
        AVG(EXTRACT(EPOCH FROM (dv.exit_time - dv.entry_time)) / 60) as avg_duration_minutes,
        MAX(EXTRACT(EPOCH FROM (dv.exit_time - dv.entry_time)) / 60) as max_duration_minutes,
        MIN(EXTRACT(EPOCH FROM (dv.exit_time - dv.entry_time)) / 60) as min_duration_minutes
      FROM department_visits dv
      LEFT JOIN departments d ON dv.department_id = d.id
      WHERE dv.exit_time IS NOT NULL ${deptFilter}
      GROUP BY dv.department_id, d.name
      ORDER BY patient_count DESC
    `;

    return Response.json({
      success: true,
      adminRole: admin.role,
      allTransfers,
      emergencyAlerts,
      issueReports,
      departmentDurations,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
