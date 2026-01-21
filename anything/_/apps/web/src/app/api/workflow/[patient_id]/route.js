import sql from "@/app/api/utils/sql";

// Get workflow history for a patient
export async function GET(request, { params }) {
  try {
    const { patient_id } = params;

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

    return Response.json({ success: true, workflow });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
