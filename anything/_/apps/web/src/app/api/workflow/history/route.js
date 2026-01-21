import sql from "@/app/api/utils/sql";

// Get complete workflow history for a patient
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patient_id = searchParams.get("patient_id");

    if (!patient_id) {
      return Response.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 },
      );
    }

    // Get all workflow records for patient
    const workflow = await sql`
      SELECT 
        pw.*,
        d1.name as from_department_name,
        d2.name as to_department_name
      FROM patient_workflow pw
      LEFT JOIN departments d1 ON pw.from_department_id = d1.id
      LEFT JOIN departments d2 ON pw.to_department_id = d2.id
      WHERE pw.patient_id = ${patient_id}
      ORDER BY pw.transferred_at DESC
    `;

    // Get all department visits for patient
    const departmentVisits = await sql`
      SELECT 
        dv.*,
        d.name as department_name,
        u.name as staff_name,
        EXTRACT(EPOCH FROM (dv.exit_time - dv.entry_time)) / 60 as duration_minutes
      FROM department_visits dv
      LEFT JOIN departments d ON dv.department_id = d.id
      LEFT JOIN auth_users u ON dv.staff_id = u.id
      WHERE dv.patient_id = ${patient_id}
      ORDER BY dv.entry_time DESC
    `;

    // Get all medical information for patient
    const medicalInfo = await sql`
      SELECT 
        mi.*,
        d.name as department_name
      FROM medical_info mi
      LEFT JOIN departments d ON mi.department_id = d.id
      WHERE mi.patient_id = ${patient_id}
      ORDER BY mi.created_at DESC
    `;

    return Response.json({
      success: true,
      workflow,
      departmentVisits,
      medicalInfo,
    });
  } catch (error) {
    console.error("Error fetching workflow history:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
