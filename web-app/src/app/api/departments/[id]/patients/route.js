import sql from "@/app/api/utils/sql";

// Get all patients currently in a specific department
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const patients = await sql`
      SELECT 
        p.*,
        d.name as current_department_name,
        pv.reason,
        pv.status as visit_status,
        pv.test_required,
        pv.admission_required,
        pv.visit_date
      FROM patients p
      LEFT JOIN departments d ON p.current_department_id = d.id
      LEFT JOIN LATERAL (
        SELECT * FROM patient_visits 
        WHERE patient_id = p.id 
        ORDER BY visit_date DESC 
        LIMIT 1
      ) pv ON true
      WHERE p.current_department_id = ${id}
      AND p.status = 'active'
      ORDER BY pv.visit_date ASC
    `;

    return Response.json({ success: true, patients });
  } catch (error) {
    console.error("Error fetching department patients:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
