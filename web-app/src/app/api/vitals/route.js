import sql from "@/app/api/utils/sql";

// Get vitals records
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patient_id");
    const visitId = searchParams.get("visit_id");

    let query = `
      SELECT v.*, p.first_name, p.last_name, p.patient_id as patient_number
      FROM vitals v
      LEFT JOIN patients p ON v.patient_id = p.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (patientId) {
      paramCount++;
      query += ` AND v.patient_id = $${paramCount}`;
      values.push(patientId);
    }

    if (visitId) {
      paramCount++;
      query += ` AND v.visit_id = $${paramCount}`;
      values.push(visitId);
    }

    query += " ORDER BY v.recorded_at DESC";

    const vitals = await sql(query, values);
    return Response.json({ success: true, vitals });
  } catch (error) {
    console.error("Error fetching vitals:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// Record new vitals
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      patient_id,
      visit_id,
      temperature,
      blood_pressure,
      pulse,
      respiratory_rate,
      weight,
      height,
      oxygen_saturation,
      recorded_by,
    } = body;

    if (!patient_id) {
      return Response.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO vitals (
        patient_id, visit_id, temperature, blood_pressure, pulse, respiratory_rate,
        weight, height, oxygen_saturation, recorded_by
      ) VALUES (
        ${patient_id}, ${visit_id || null}, ${temperature || null}, ${blood_pressure || null},
        ${pulse || null}, ${respiratory_rate || null}, ${weight || null}, ${height || null},
        ${oxygen_saturation || null}, ${recorded_by || null}
      ) RETURNING *
    `;

    return Response.json({ success: true, vital: result[0] });
  } catch (error) {
    console.error("Error recording vitals:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
