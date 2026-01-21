import sql from "@/app/api/utils/sql";

// Get all visits
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patient_id");
    const departmentId = searchParams.get("department_id");
    const status = searchParams.get("status");

    let query = `
      SELECT pv.*, p.first_name, p.last_name, p.patient_id as patient_number, d.name as department_name
      FROM patient_visits pv
      LEFT JOIN patients p ON pv.patient_id = p.id
      LEFT JOIN departments d ON pv.department_id = d.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (patientId) {
      paramCount++;
      query += ` AND pv.patient_id = $${paramCount}`;
      values.push(patientId);
    }

    if (departmentId) {
      paramCount++;
      query += ` AND pv.department_id = $${paramCount}`;
      values.push(departmentId);
    }

    if (status) {
      paramCount++;
      query += ` AND pv.status = $${paramCount}`;
      values.push(status);
    }

    query += " ORDER BY pv.visit_date DESC";

    const visits = await sql(query, values);
    return Response.json({ success: true, visits });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// Create a new visit
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patient_id,
      department_id,
      reason,
      diagnosis,
      prescription,
      notes,
      doctor_name,
      status,
    } = body;

    if (!patient_id) {
      return Response.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO patient_visits (
        patient_id, department_id, reason, diagnosis, prescription, notes, doctor_name, status
      ) VALUES (
        ${patient_id}, ${department_id || null}, ${reason || null}, ${diagnosis || null},
        ${prescription || null}, ${notes || null}, ${doctor_name || null}, ${status || "pending"}
      ) RETURNING *
    `;

    return Response.json({ success: true, visit: result[0] });
  } catch (error) {
    console.error("Error creating visit:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
